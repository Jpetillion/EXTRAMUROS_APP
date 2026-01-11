import express from 'express';
import {
  createTrip,
  getAllTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  publishTrip,
  getTripWithFullContent,
  createTripStop,
  getTripStopsByTripId,
  getTripStopById,
  updateTripStop,
  deleteTripStop
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

// Get trip with full nested content (modules, content, stops)
router.get('/:id/full', async (req, res) => {
  try {
    const publishedOnly = req.query.published !== 'false'; // Default to published content only
    const tripData = await getTripWithFullContent(req.params.id, publishedOnly);

    if (!tripData) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json(tripData);
  } catch (error) {
    console.error('Get trip with content error:', error);
    res.status(500).json({ error: 'Failed to fetch trip with content' });
  }
});

// Create trip (teachers/admins only)
router.post('/', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { title, description, coverImageUrl, stops = [] } = req.body;

    const errors = validateRequired(['title'], req.body);
    if (errors) return res.status(400).json({ errors });

    // voorlopig: keep legacy fields nullable/default
    const destination = req.body.destination ?? null;
    const startDate = req.body.startDate ?? null;
    const endDate = req.body.endDate ?? null;

    const tripId = await createTrip(
      title,
      description,
      destination,
      startDate,
      endDate,
      req.user.id,
      coverImageUrl ?? null
    );

    // stops opslaan
    for (let i = 0; i < stops.length; i++) {
      const stop = { ...stops[i], orderIndex: stops[i].orderIndex ?? i };
      if (!stop.title) continue; // of validator errors opbouwen
      await createTripStop(tripId, stop);
    }

    const trip = await getTripById(tripId);
    const tripStops = await getTripStopsByTripId(tripId);
    res.status(201).json({ ...trip, stops: tripStops });

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

// ============= TRIP STOPS ROUTES =============

// Get all stops for a trip
router.get('/:tripId/stops', async (req, res) => {
  try {
    const trip = await getTripById(req.params.tripId);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const stops = await getTripStopsByTripId(req.params.tripId);
    res.json(stops);
  } catch (error) {
    console.error('Get trip stops error:', error);
    res.status(500).json({ error: 'Failed to fetch trip stops' });
  }
});

// Create a new stop for a trip (teachers/admins only)
router.post('/:tripId/stops', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const trip = await getTripById(req.params.tripId);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const { title } = req.body;
    const errors = validateRequired(['title'], req.body);
    if (errors) return res.status(400).json({ errors });

    const stopData = {
      title,
      durationMinutes: req.body.durationMinutes || req.body.duration_minutes,
      difficulty: req.body.difficulty,
      category: req.body.category,
      lat: req.body.lat,
      lng: req.body.lng,
      address: req.body.address,
      pictureUrl: req.body.pictureUrl || req.body.picture_url,
      audioUrl: req.body.audioUrl || req.body.audio_url,
      videoUrl: req.body.videoUrl || req.body.video_url,
      orderIndex: req.body.orderIndex ?? req.body.order_index ?? 0,
      metadata: req.body.metadata
    };

    const stopId = await createTripStop(req.params.tripId, stopData);
    const stop = await getTripStopById(stopId);

    res.status(201).json(stop);
  } catch (error) {
    console.error('Create trip stop error:', error);
    res.status(500).json({ error: 'Failed to create trip stop' });
  }
});

// Update a trip stop (teachers/admins only)
router.put('/:tripId/stops/:stopId', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const stop = await getTripStopById(req.params.stopId);

    if (!stop) {
      return res.status(404).json({ error: 'Trip stop not found' });
    }

    // Verify stop belongs to the trip
    if (stop.trip_id !== req.params.tripId) {
      return res.status(400).json({ error: 'Stop does not belong to this trip' });
    }

    const allowedFields = [
      'title', 'duration_minutes', 'difficulty', 'category',
      'lat', 'lng', 'address', 'picture_url', 'audio_url',
      'video_url', 'order_index', 'metadata'
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Support camelCase field names
    if (req.body.durationMinutes !== undefined) updates.duration_minutes = req.body.durationMinutes;
    if (req.body.pictureUrl !== undefined) updates.picture_url = req.body.pictureUrl;
    if (req.body.audioUrl !== undefined) updates.audio_url = req.body.audioUrl;
    if (req.body.videoUrl !== undefined) updates.video_url = req.body.videoUrl;
    if (req.body.orderIndex !== undefined) updates.order_index = req.body.orderIndex;

    await updateTripStop(req.params.stopId, updates);

    const updatedStop = await getTripStopById(req.params.stopId);
    res.json(updatedStop);
  } catch (error) {
    console.error('Update trip stop error:', error);
    res.status(500).json({ error: 'Failed to update trip stop' });
  }
});

// Delete a trip stop (teachers/admins only)
router.delete('/:tripId/stops/:stopId', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const stop = await getTripStopById(req.params.stopId);

    if (!stop) {
      return res.status(404).json({ error: 'Trip stop not found' });
    }

    // Verify stop belongs to the trip
    if (stop.trip_id !== req.params.tripId) {
      return res.status(400).json({ error: 'Stop does not belong to this trip' });
    }

    await deleteTripStop(req.params.stopId);
    res.json({ message: 'Trip stop deleted successfully' });
  } catch (error) {
    console.error('Delete trip stop error:', error);
    res.status(500).json({ error: 'Failed to delete trip stop' });
  }
});

export default router;
