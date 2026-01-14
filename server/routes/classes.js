import express from 'express';
import {
  createClass,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
  getTripsByClassId
} from '../models/db.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validateRequired } from '../utils/validators.js';

const router = express.Router();

// Get all classes (public - needed for student login)
router.get('/', async (req, res) => {
  try {
    const classes = await getAllClasses();
    res.json(classes);
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// Get single class (teachers/admins only)
router.get('/:id', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const classData = await getClassById(req.params.id);

    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json(classData);
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({ error: 'Failed to fetch class' });
  }
});

// Create class (teachers/admins only)
router.post('/', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { name, schoolYear } = req.body;

    const errors = validateRequired(['name'], req.body);
    if (errors) return res.status(400).json({ errors });

    const classId = await createClass(name, schoolYear || null, req.user.id);
    const classData = await getClassById(classId);

    res.status(201).json(classData);
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ error: 'Failed to create class' });
  }
});

// Update class (teachers/admins only)
router.put('/:id', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const classData = await getClassById(req.params.id);

    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const allowedFields = ['name', 'schoolYear'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    await updateClass(req.params.id, updates);

    const updatedClass = await getClassById(req.params.id);
    res.json(updatedClass);
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({ error: 'Failed to update class' });
  }
});

// Delete class (teachers/admins only)
router.delete('/:id', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const classData = await getClassById(req.params.id);

    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    await deleteClass(req.params.id);
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({ error: 'Failed to delete class' });
  }
});

// Get trips assigned to a class
router.get('/:id/trips', async (req, res) => {
  try {
    const classData = await getClassById(req.params.id);

    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const publishedOnly = req.query.published === 'true';
    const trips = await getTripsByClassId(req.params.id, publishedOnly);

    res.json(trips);
  } catch (error) {
    console.error('Get class trips error:', error);
    res.status(500).json({ error: 'Failed to fetch class trips' });
  }
});

export default router;
