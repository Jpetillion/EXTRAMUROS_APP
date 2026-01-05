import express from 'express';
import {
  createTrip,
  getAllTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  publishTrip
} from '../models/db.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validateRequired } from '../utils/validators.js';

const router = express.Router();

// Get all trips
router.get('/', async (req, res) => {
  try {
    const publishedOnly = req.query.published === 'true';
    const trips = await getAllTrips(publishedOnly);
    res.json(trips);
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

// Get single trip
router.get('/:id', async (req, res) => {
  try {
    const trip = await getTripById(req.params.id);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json(trip);
  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({ error: 'Failed to fetch trip' });
  }
});

// Create trip (teachers/admins only)
router.post('/', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { title, description, destination, startDate, endDate, coverImageUrl } = req.body;

    const errors = validateRequired(['title', 'destination', 'startDate', 'endDate'], req.body);
    if (errors) {
      return res.status(400).json({ errors });
    }

    const id = await createTrip(
      title,
      description,
      destination,
      startDate,
      endDate,
      req.user.id,
      coverImageUrl
    );

    const trip = await getTripById(id);
    res.status(201).json(trip);
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({ error: 'Failed to create trip' });
  }
});

// Update trip (teachers/admins only)
router.put('/:id', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const trip = await getTripById(req.params.id);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const allowedFields = ['title', 'description', 'destination', 'start_date', 'end_date', 'cover_image_url'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    await updateTrip(req.params.id, updates);

    const updatedTrip = await getTripById(req.params.id);
    res.json(updatedTrip);
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({ error: 'Failed to update trip' });
  }
});

// Delete trip (admins only)
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const trip = await getTripById(req.params.id);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    await deleteTrip(req.params.id);
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ error: 'Failed to delete trip' });
  }
});

// Publish trip (teachers/admins only)
router.post('/:id/publish', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const trip = await getTripById(req.params.id);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    await publishTrip(req.params.id);

    const updatedTrip = await getTripById(req.params.id);
    res.json(updatedTrip);
  } catch (error) {
    console.error('Publish trip error:', error);
    res.status(500).json({ error: 'Failed to publish trip' });
  }
});

export default router;
