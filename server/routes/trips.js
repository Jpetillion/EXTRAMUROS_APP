import express from 'express';
import multer from 'multer';
import {
  createTrip,
  getAllTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  publishTrip,
  unpublishTrip,
  getTripWithFullContent,
  createTripEvent,
  getTripEventsByTripId,
  getTripEventById,
  updateTripEvent,
  deleteTripEvent,
  getClassesByTripId,
  assignTripToClass,
  removeTripFromClass,
  assignTeacherToTrip,
  removeTeacherFromTrip,
  updateTripTeacherVisibility,
  getTripTeachers,
  getTripTeachersForStudent
} from '../models/db.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { validateRequired } from '../utils/validators.js';

const router = express.Router();

// Configure multer for file uploads (store in memory as buffers)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/wav', 'audio/x-m4a'];

    if (file.fieldname === 'image' && allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else if (file.fieldname === 'audio' && allowedAudioTypes.includes(file.mimetype)) {
      cb(null, true);
    } else if (file.fieldname === 'coverImage' && allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type for ${file.fieldname}: ${file.mimetype}`));
    }
  }
});

// ============= TRIP ROUTES =============

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

// Get trip with full nested content (events, classes)
router.get('/:id/full', async (req, res) => {
  try {
    const tripData = await getTripWithFullContent(req.params.id);

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
router.post('/', authMiddleware, requireRole('teacher', 'admin'), upload.single('coverImage'), async (req, res) => {
  try {
    const { title, description } = req.body;

    const errors = validateRequired(['title'], req.body);
    if (errors) return res.status(400).json({ errors });

    const coverImageBlob = req.file ? req.file.buffer : null;
    const coverImageMimeType = req.file ? req.file.mimetype : null;

    const tripId = await createTrip(
      title,
      description,
      req.user.id,
      coverImageBlob,
      coverImageMimeType
    );

    const trip = await getTripById(tripId);
    res.status(201).json(trip);

  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({ error: 'Failed to create trip' });
  }
});

// Update trip (teachers/admins only)
router.put('/:id', authMiddleware, requireRole('teacher', 'admin'), upload.single('coverImage'), async (req, res) => {
  try {
    const trip = await getTripById(req.params.id);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const allowedFields = ['title', 'description'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Handle cover image upload
    if (req.file) {
      updates.cover_image_blob = req.file.buffer;
      updates.cover_image_mime_type = req.file.mimetype;
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

// Unpublish trip (teachers/admins only)
router.post('/:id/unpublish', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const trip = await getTripById(req.params.id);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    await unpublishTrip(req.params.id);

    const updatedTrip = await getTripById(req.params.id);
    res.json(updatedTrip);
  } catch (error) {
    console.error('Unpublish trip error:', error);
    res.status(500).json({ error: 'Failed to unpublish trip' });
  }
});

// ============= TRIP EVENTS ROUTES =============

// Get all events for a trip
router.get('/:tripId/events', async (req, res) => {
  try {
    const trip = await getTripById(req.params.tripId);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const events = await getTripEventsByTripId(req.params.tripId);

    // Convert events to safe format (no blobs in list view)
    const safeEvents = events.map(event => ({
      ...event,
      hasImage: !!event.image_blob,
      hasAudio: !!event.audio_blob,
      image_blob: undefined,
      audio_blob: undefined
    }));

    res.json(safeEvents);
  } catch (error) {
    console.error('Get trip events error:', error);
    res.status(500).json({ error: 'Failed to fetch trip events' });
  }
});

// Get single event
router.get('/:tripId/events/:eventId', async (req, res) => {
  try {
    const event = await getTripEventById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Verify event belongs to trip
    if (event.trip_id !== req.params.tripId) {
      return res.status(400).json({ error: 'Event does not belong to this trip' });
    }

    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Serve event image blob
router.get('/:tripId/events/:eventId/image', async (req, res) => {
  try {
    const event = await getTripEventById(req.params.eventId);

    if (!event || !event.image_blob) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Convert ArrayBuffer to Buffer
    const buffer = Buffer.from(event.image_blob);

    res.set('Content-Type', event.image_mime_type || 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.send(buffer);
  } catch (error) {
    console.error('Serve image error:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
});

// Serve event audio blob
router.get('/:tripId/events/:eventId/audio', async (req, res) => {
  try {
    const event = await getTripEventById(req.params.eventId);

    if (!event || !event.audio_blob) {
      return res.status(404).json({ error: 'Audio not found' });
    }

    // Convert ArrayBuffer to Buffer
    const buffer = Buffer.from(event.audio_blob);

    res.set('Content-Type', event.audio_mime_type || 'audio/mpeg');
    res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.send(buffer);
  } catch (error) {
    console.error('Serve audio error:', error);
    res.status(500).json({ error: 'Failed to serve audio' });
  }
});

// Create event with file uploads (teachers/admins only)
router.post(
  '/:tripId/events',
  authMiddleware,
  requireRole('teacher', 'admin'),
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const trip = await getTripById(req.params.tripId);

      if (!trip) {
        return res.status(404).json({ error: 'Trip not found' });
      }

      const { title } = req.body;
      const errors = validateRequired(['title'], req.body);
      if (errors) return res.status(400).json({ errors });

      const eventData = {
        title,
        category: req.body.category,
        durationMinutes: req.body.durationMinutes ? parseInt(req.body.durationMinutes) : null,
        textContent: req.body.textContent,
        lat: req.body.lat ? parseFloat(req.body.lat) : null,
        lng: req.body.lng ? parseFloat(req.body.lng) : null,
        address: req.body.address,
        videoUrl: req.body.videoUrl,
        orderIndex: req.body.orderIndex ? parseInt(req.body.orderIndex) : 0,
        metadata: req.body.metadata,
      };

      // Handle file uploads
      if (req.files?.image?.[0]) {
        eventData.imageBlob = req.files.image[0].buffer;
        eventData.imageMimeType = req.files.image[0].mimetype;
      }

      if (req.files?.audio?.[0]) {
        eventData.audioBlob = req.files.audio[0].buffer;
        eventData.audioMimeType = req.files.audio[0].mimetype;
      }

      const eventId = await createTripEvent(req.params.tripId, eventData);
      const event = await getTripEventById(eventId);

      res.status(201).json(event);
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({ error: 'Failed to create event' });
    }
  }
);

// Update event (teachers/admins only)
router.put(
  '/:tripId/events/:eventId',
  authMiddleware,
  requireRole('teacher', 'admin'),
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const event = await getTripEventById(req.params.eventId);

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      // Verify event belongs to trip
      if (event.trip_id !== req.params.tripId) {
        return res.status(400).json({ error: 'Event does not belong to this trip' });
      }

      const updates = {};

      // Text fields
      if (req.body.title !== undefined) updates.title = req.body.title;
      if (req.body.category !== undefined) updates.category = req.body.category;
      if (req.body.durationMinutes !== undefined) updates.durationMinutes = parseInt(req.body.durationMinutes);
      if (req.body.textContent !== undefined) updates.textContent = req.body.textContent;
      if (req.body.lat !== undefined) updates.lat = parseFloat(req.body.lat);
      if (req.body.lng !== undefined) updates.lng = parseFloat(req.body.lng);
      if (req.body.address !== undefined) updates.address = req.body.address;
      if (req.body.videoUrl !== undefined) updates.videoUrl = req.body.videoUrl;
      if (req.body.orderIndex !== undefined) updates.orderIndex = parseInt(req.body.orderIndex);
      if (req.body.metadata !== undefined) updates.metadata = req.body.metadata;

      // Handle file uploads
      if (req.files?.image?.[0]) {
        updates.imageBlob = req.files.image[0].buffer;
        updates.imageMimeType = req.files.image[0].mimetype;
      }

      if (req.files?.audio?.[0]) {
        updates.audioBlob = req.files.audio[0].buffer;
        updates.audioMimeType = req.files.audio[0].mimetype;
      }

      await updateTripEvent(req.params.eventId, updates);

      const updatedEvent = await getTripEventById(req.params.eventId);
      res.json(updatedEvent);
    } catch (error) {
      console.error('Update event error:', error);
      res.status(500).json({ error: 'Failed to update event' });
    }
  }
);

// Delete event (teachers/admins only)
router.delete('/:tripId/events/:eventId', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const event = await getTripEventById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Verify event belongs to trip
    if (event.trip_id !== req.params.tripId) {
      return res.status(400).json({ error: 'Event does not belong to this trip' });
    }

    await deleteTripEvent(req.params.eventId);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// ============= TRIP-CLASS ASSIGNMENT ROUTES =============

// Get classes assigned to a trip
router.get('/:tripId/classes', async (req, res) => {
  try {
    const trip = await getTripById(req.params.tripId);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const classes = await getClassesByTripId(req.params.tripId);
    res.json(classes);
  } catch (error) {
    console.error('Get trip classes error:', error);
    res.status(500).json({ error: 'Failed to fetch trip classes' });
  }
});

// Assign trip to class (teachers/admins only)
router.post('/:tripId/classes/:classId', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const trip = await getTripById(req.params.tripId);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const id = await assignTripToClass(req.params.tripId, req.params.classId);

    if (!id) {
      return res.status(400).json({ error: 'Trip already assigned to this class' });
    }

    res.status(201).json({ message: 'Trip assigned to class successfully' });
  } catch (error) {
    console.error('Assign trip to class error:', error);
    res.status(500).json({ error: 'Failed to assign trip to class' });
  }
});

// Remove trip from class (teachers/admins only)
router.delete('/:tripId/classes/:classId', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    await removeTripFromClass(req.params.tripId, req.params.classId);
    res.json({ message: 'Trip removed from class successfully' });
  } catch (error) {
    console.error('Remove trip from class error:', error);
    res.status(500).json({ error: 'Failed to remove trip from class' });
  }
});

// ============= TRIP TEACHER ROUTES =============

// Get all teachers assigned to a trip (admins only)
router.get('/:tripId/teachers', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const teachers = await getTripTeachers(req.params.tripId);
    res.json(teachers);
  } catch (error) {
    console.error('Get trip teachers error:', error);
    res.status(500).json({ error: 'Failed to fetch trip teachers' });
  }
});

// Get teachers for student view (includes only visible contact info)
router.get('/:tripId/teachers/public', async (req, res) => {
  try {
    const teachers = await getTripTeachersForStudent(req.params.tripId);
    res.json(teachers);
  } catch (error) {
    console.error('Get public trip teachers error:', error);
    res.status(500).json({ error: 'Failed to fetch trip teachers' });
  }
});

// Assign a teacher to a trip (admins only)
router.post('/:tripId/teachers/:userId', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { showPhone, showEmail, orderIndex } = req.body;
    const id = await assignTeacherToTrip(
      req.params.tripId,
      req.params.userId,
      showPhone || false,
      showEmail || false,
      orderIndex || 0
    );
    res.status(201).json({ id, message: 'Teacher assigned to trip successfully' });
  } catch (error) {
    console.error('Assign teacher to trip error:', error);
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Teacher is already assigned to this trip' });
    } else {
      res.status(500).json({ error: 'Failed to assign teacher to trip' });
    }
  }
});

// Update teacher visibility settings (admins only)
router.put('/:tripId/teachers/:userId', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    const { showPhone, showEmail } = req.body;
    await updateTripTeacherVisibility(
      req.params.tripId,
      req.params.userId,
      showPhone || false,
      showEmail || false
    );
    res.json({ message: 'Teacher visibility updated successfully' });
  } catch (error) {
    console.error('Update teacher visibility error:', error);
    res.status(500).json({ error: 'Failed to update teacher visibility' });
  }
});

// Remove a teacher from a trip (admins only)
router.delete('/:tripId/teachers/:userId', authMiddleware, requireRole('admin'), async (req, res) => {
  try {
    await removeTeacherFromTrip(req.params.tripId, req.params.userId);
    res.json({ message: 'Teacher removed from trip successfully' });
  } catch (error) {
    console.error('Remove teacher from trip error:', error);
    res.status(500).json({ error: 'Failed to remove teacher from trip' });
  }
});

export default router;
