import express from 'express';
import {
  createContentItem,
  getContentItemsByModuleId,
  getContentItemById,
  updateContentItem,
  deleteContentItem,
  publishContentItem
} from '../models/db.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validateRequired } from '../utils/validators.js';

const router = express.Router();

// Get content items for a module
router.get('/module/:moduleId', async (req, res) => {
  try {
    const publishedOnly = req.query.published === 'true';
    const items = await getContentItemsByModuleId(req.params.moduleId, publishedOnly);
    res.json(items);
  } catch (error) {
    console.error('Get content items error:', error);
    res.status(500).json({ error: 'Failed to fetch content items' });
  }
});

// Get single content item
router.get('/:id', async (req, res) => {
  try {
    const item = await getContentItemById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Content item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Get content item error:', error);
    res.status(500).json({ error: 'Failed to fetch content item' });
  }
});

// Create content item (teachers/admins only)
router.post('/', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const {
      tripId,
      moduleId,
      type,
      title,
      body,
      mediaUrl,
      thumbnailUrl,
      metadata,
      orderIndex
    } = req.body;

    const errors = validateRequired(['tripId', 'moduleId', 'type', 'title'], req.body);
    if (errors) {
      return res.status(400).json({ errors });
    }

    const validTypes = ['text', 'image', 'audio', 'video', 'location', 'activity', 'schedule'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}` });
    }

    const metadataString = metadata ? JSON.stringify(metadata) : null;

    const id = await createContentItem(
      tripId,
      moduleId,
      type,
      title,
      body,
      mediaUrl,
      thumbnailUrl,
      metadataString,
      orderIndex || 0
    );

    const item = await getContentItemById(id);
    res.status(201).json(item);
  } catch (error) {
    console.error('Create content item error:', error);
    res.status(500).json({ error: 'Failed to create content item' });
  }
});

// Update content item (teachers/admins only)
router.put('/:id', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const item = await getContentItemById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Content item not found' });
    }

    const allowedFields = [
      'type',
      'title',
      'body',
      'media_url',
      'thumbnail_url',
      'metadata',
      'order_index'
    ];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'metadata' && typeof req.body[field] === 'object') {
          updates[field] = JSON.stringify(req.body[field]);
        } else {
          updates[field] = req.body[field];
        }
      }
    }

    await updateContentItem(req.params.id, updates);

    const updatedItem = await getContentItemById(req.params.id);
    res.json(updatedItem);
  } catch (error) {
    console.error('Update content item error:', error);
    res.status(500).json({ error: 'Failed to update content item' });
  }
});

// Delete content item (admins only)
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const item = await getContentItemById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Content item not found' });
    }

    await deleteContentItem(req.params.id);
    res.json({ message: 'Content item deleted successfully' });
  } catch (error) {
    console.error('Delete content item error:', error);
    res.status(500).json({ error: 'Failed to delete content item' });
  }
});

// Publish content item (teachers/admins only)
router.post('/:id/publish', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const item = await getContentItemById(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Content item not found' });
    }

    await publishContentItem(req.params.id);

    const updatedItem = await getContentItemById(req.params.id);
    res.json(updatedItem);
  } catch (error) {
    console.error('Publish content item error:', error);
    res.status(500).json({ error: 'Failed to publish content item' });
  }
});

export default router;
