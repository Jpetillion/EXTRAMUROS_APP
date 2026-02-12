import express from 'express';
import {
  createTripDay,
  getTripDaysByTripId,
  getTripDayById,
  updateTripDay,
  deleteTripDay,
  reorderTripDays,
  getTripEventsByTripId
} from '../models/db.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validateRequired } from '../utils/validators.js';

const router = express.Router();

// ============= TRIP DAYS ROUTES =============

// Get all days for a trip
router.get('/trips/:tripId/days', async (req, res) => {
  try {
    const days = await getTripDaysByTripId(req.params.tripId);

    // For each day, get the events
    const daysWithEvents = await Promise.all(
      days.map(async (day) => {
        const events = await getTripEventsByTripId(day.trip_id);
        // Filter events that belong to this day
        const dayEvents = events.filter(e => e.day_id === day.id);
        return {
          ...day,
          events: dayEvents
        };
      })
    );

    res.json(daysWithEvents);
  } catch (error) {
    console.error('Get trip days error:', error);
    res.status(500).json({ error: 'Failed to fetch trip days' });
  }
});

// Get single day
router.get('/trips/:tripId/days/:dayId', async (req, res) => {
  try {
    const day = await getTripDayById(req.params.dayId);

    if (!day) {
      return res.status(404).json({ error: 'Day not found' });
    }

    // Verify day belongs to trip
    if (day.trip_id !== req.params.tripId) {
      return res.status(404).json({ error: 'Day not found in this trip' });
    }

    // Get events for this day
    const events = await getTripEventsByTripId(req.params.tripId);
    const dayEvents = events.filter(e => e.day_id === day.id);

    res.json({
      ...day,
      events: dayEvents
    });
  } catch (error) {
    console.error('Get day error:', error);
    res.status(500).json({ error: 'Failed to fetch day' });
  }
});

// Create new day (teachers/admins only)
router.post('/trips/:tripId/days', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { tripId } = req.params;
    const { title, description, dayNumber, orderIndex } = req.body;

    // Validate required fields
    const validationErrors = validateRequired(['title', 'dayNumber'], req.body);
    if (validationErrors) {
      return res.status(400).json({ error: 'Title and dayNumber are required', details: validationErrors });
    }

    const dayId = await createTripDay(tripId, {
      title,
      description,
      dayNumber: parseInt(dayNumber),
      orderIndex: orderIndex !== undefined ? parseInt(orderIndex) : 0
    });

    const day = await getTripDayById(dayId);
    res.status(201).json(day);
  } catch (error) {
    console.error('Create day error:', error);
    res.status(500).json({ error: 'Failed to create day', message: error.message });
  }
});

// Update day (teachers/admins only)
router.put('/trips/:tripId/days/:dayId', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { dayId, tripId } = req.params;
    const updates = {};

    // Only allow certain fields to be updated
    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.dayNumber !== undefined) updates.day_number = parseInt(req.body.dayNumber);
    if (req.body.orderIndex !== undefined) updates.order_index = parseInt(req.body.orderIndex);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Verify day exists and belongs to trip
    const day = await getTripDayById(dayId);
    if (!day || day.trip_id !== tripId) {
      return res.status(404).json({ error: 'Day not found' });
    }

    await updateTripDay(dayId, updates);

    const updatedDay = await getTripDayById(dayId);
    res.json(updatedDay);
  } catch (error) {
    console.error('Update day error:', error);
    res.status(500).json({ error: 'Failed to update day' });
  }
});

// Delete day (teachers/admins only)
router.delete('/trips/:tripId/days/:dayId', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { dayId, tripId } = req.params;

    // Verify day exists and belongs to trip
    const day = await getTripDayById(dayId);
    if (!day || day.trip_id !== tripId) {
      return res.status(404).json({ error: 'Day not found' });
    }

    await deleteTripDay(dayId);
    res.json({ success: true, message: 'Day deleted successfully' });
  } catch (error) {
    console.error('Delete day error:', error);
    res.status(500).json({ error: 'Failed to delete day' });
  }
});

// Reorder days (teachers/admins only)
router.put('/trips/:tripId/days/reorder', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { tripId } = req.params;
    const { dayIds } = req.body;

    if (!Array.isArray(dayIds) || dayIds.length === 0) {
      return res.status(400).json({ error: 'dayIds must be a non-empty array' });
    }

    await reorderTripDays(tripId, dayIds);

    const days = await getTripDaysByTripId(tripId);
    res.json(days);
  } catch (error) {
    console.error('Reorder days error:', error);
    res.status(500).json({ error: 'Failed to reorder days' });
  }
});

export default router;
