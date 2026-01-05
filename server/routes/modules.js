import express from 'express';
import {
  createModule,
  getModulesByTripId,
  getModuleById,
  updateModule,
  deleteModule
} from '../models/db.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validateRequired } from '../utils/validators.js';

const router = express.Router();

// Get modules for a trip
router.get('/trip/:tripId', async (req, res) => {
  try {
    const modules = await getModulesByTripId(req.params.tripId);
    res.json(modules);
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
});

// Get single module
router.get('/:id', async (req, res) => {
  try {
    const module = await getModuleById(req.params.id);

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    res.json(module);
  } catch (error) {
    console.error('Get module error:', error);
    res.status(500).json({ error: 'Failed to fetch module' });
  }
});

// Create module (teachers/admins only)
router.post('/', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { tripId, title, description, orderIndex, icon } = req.body;

    const errors = validateRequired(['tripId', 'title'], req.body);
    if (errors) {
      return res.status(400).json({ errors });
    }

    const id = await createModule(tripId, title, description, orderIndex || 0, icon);

    const module = await getModuleById(id);
    res.status(201).json(module);
  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({ error: 'Failed to create module' });
  }
});

// Update module (teachers/admins only)
router.put('/:id', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const module = await getModuleById(req.params.id);

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    const allowedFields = ['title', 'description', 'order_index', 'icon'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    await updateModule(req.params.id, updates);

    const updatedModule = await getModuleById(req.params.id);
    res.json(updatedModule);
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({ error: 'Failed to update module' });
  }
});

// Delete module (admins only)
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const module = await getModuleById(req.params.id);

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    await deleteModule(req.params.id);
    res.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({ error: 'Failed to delete module' });
  }
});

export default router;
