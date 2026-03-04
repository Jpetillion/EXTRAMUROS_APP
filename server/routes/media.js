import express from 'express';
import multer from 'multer';
import {
  addTripPhoto,
  getTripPhotos,
  getTripPhotoById,
  updateTripPhoto,
  deleteTripPhoto,
  addTripAudio,
  getTripAudio,
  getTripAudioById,
  updateTripAudio,
  deleteTripAudio,
  addTripVideo,
  getTripVideos,
  getTripVideoById,
  updateTripVideo,
  deleteTripVideo,
  getTripEventById
} from '../models/db.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for media uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/wav', 'audio/x-m4a', 'audio/ogg'];

    if (file.fieldname === 'photo' && allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else if (file.fieldname === 'audio' && allowedAudioTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type for ${file.fieldname}: ${file.mimetype}`));
    }
  }
});

// ============= PHOTOS ROUTES =============

// Get all photos for an event
router.get('/events/:eventId/photos', async (req, res) => {
  try {
    const photos = await getTripPhotos(req.params.eventId);
    res.json(photos);
  } catch (error) {
    console.error('Get photos error:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// Get single photo blob
router.get('/events/:eventId/photos/:photoId', async (req, res) => {
  try {
    const photo = await getTripPhotoById(req.params.photoId);

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Verify photo belongs to event
    if (photo.event_id !== req.params.eventId) {
      return res.status(404).json({ error: 'Photo not found in this event' });
    }

    res.set('Content-Type', photo.image_mime_type);
    res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.send(Buffer.from(photo.image_blob));
  } catch (error) {
    console.error('Get photo error:', error);
    res.status(500).json({ error: 'Failed to fetch photo' });
  }
});

// Upload photo (teachers/admins only)
router.post('/events/:eventId/photos', authMiddleware, requireRole('teacher', 'admin'), upload.single('photo'), async (req, res) => {
  try {
    const { eventId } = req.params;
    const { title, orderIndex } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Photo file is required' });
    }

    if (!title?.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Verify event exists
    const event = await getTripEventById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const photoId = await addTripPhoto(eventId, {
      title,
      imageBlob: req.file.buffer,
      mimeType: req.file.mimetype,
      orderIndex: orderIndex !== undefined ? parseInt(orderIndex) : 0
    });

    const photo = await getTripPhotoById(photoId);
    // Return photo info without the blob
    const { image_blob, ...photoInfo } = photo;
    res.status(201).json(photoInfo);
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

// Update photo metadata (teachers/admins only)
router.put('/events/:eventId/photos/:photoId', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { photoId, eventId } = req.params;
    const updates = {};

    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.orderIndex !== undefined) updates.order_index = parseInt(req.body.orderIndex);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Verify photo exists and belongs to event
    const photo = await getTripPhotoById(photoId);
    if (!photo || photo.event_id !== eventId) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    await updateTripPhoto(photoId, updates);

    const updatedPhoto = await getTripPhotoById(photoId);
    const { image_blob, ...photoInfo } = updatedPhoto;
    res.json(photoInfo);
  } catch (error) {
    console.error('Update photo error:', error);
    res.status(500).json({ error: 'Failed to update photo' });
  }
});

// Delete photo (teachers/admins only)
router.delete('/events/:eventId/photos/:photoId', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { photoId, eventId } = req.params;

    // Verify photo exists and belongs to event
    const photo = await getTripPhotoById(photoId);
    if (!photo || photo.event_id !== eventId) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    await deleteTripPhoto(photoId);
    res.json({ success: true, message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

// ============= AUDIO ROUTES =============

// Get all audio for an event
router.get('/events/:eventId/audio', async (req, res) => {
  try {
    const audio = await getTripAudio(req.params.eventId);
    res.json(audio);
  } catch (error) {
    console.error('Get audio error:', error);
    res.status(500).json({ error: 'Failed to fetch audio' });
  }
});

// Get single audio blob
router.get('/events/:eventId/audio/:audioId', async (req, res) => {
  try {
    const audio = await getTripAudioById(req.params.audioId);

    if (!audio) {
      return res.status(404).json({ error: 'Audio not found' });
    }

    // Verify audio belongs to event
    if (audio.event_id !== req.params.eventId) {
      return res.status(404).json({ error: 'Audio not found in this event' });
    }

    res.set('Content-Type', audio.audio_mime_type);
    res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.set('Accept-Ranges', 'bytes'); // Enable streaming
    res.send(Buffer.from(audio.audio_blob));
  } catch (error) {
    console.error('Get audio error:', error);
    res.status(500).json({ error: 'Failed to fetch audio' });
  }
});

// Upload audio (teachers/admins only)
router.post('/events/:eventId/audio', authMiddleware, requireRole('teacher', 'admin'), upload.single('audio'), async (req, res) => {
  try {
    const { eventId } = req.params;
    const { title, duration, orderIndex } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    if (!title?.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Verify event exists
    const event = await getTripEventById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const audioId = await addTripAudio(eventId, {
      title,
      audioBlob: req.file.buffer,
      mimeType: req.file.mimetype,
      duration: duration ? parseFloat(duration) : null,
      orderIndex: orderIndex !== undefined ? parseInt(orderIndex) : 0
    });

    const audio = await getTripAudioById(audioId);
    // Return audio info without the blob
    const { audio_blob, ...audioInfo } = audio;
    res.status(201).json(audioInfo);
  } catch (error) {
    console.error('Upload audio error:', error);
    res.status(500).json({ error: 'Failed to upload audio' });
  }
});

// Update audio metadata (teachers/admins only)
router.put('/events/:eventId/audio/:audioId', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { audioId, eventId } = req.params;
    const updates = {};

    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.duration !== undefined) updates.duration_seconds = parseFloat(req.body.duration);
    if (req.body.orderIndex !== undefined) updates.order_index = parseInt(req.body.orderIndex);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Verify audio exists and belongs to event
    const audio = await getTripAudioById(audioId);
    if (!audio || audio.event_id !== eventId) {
      return res.status(404).json({ error: 'Audio not found' });
    }

    await updateTripAudio(audioId, updates);

    const updatedAudio = await getTripAudioById(audioId);
    const { audio_blob, ...audioInfo } = updatedAudio;
    res.json(audioInfo);
  } catch (error) {
    console.error('Update audio error:', error);
    res.status(500).json({ error: 'Failed to update audio' });
  }
});

// Delete audio (teachers/admins only)
router.delete('/events/:eventId/audio/:audioId', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { audioId, eventId } = req.params;

    // Verify audio exists and belongs to event
    const audio = await getTripAudioById(audioId);
    if (!audio || audio.event_id !== eventId) {
      return res.status(404).json({ error: 'Audio not found' });
    }

    await deleteTripAudio(audioId);
    res.json({ success: true, message: 'Audio deleted successfully' });
  } catch (error) {
    console.error('Delete audio error:', error);
    res.status(500).json({ error: 'Failed to delete audio' });
  }
});

// ============= VIDEOS ROUTES =============

// Get all videos for an event
router.get('/events/:eventId/videos', async (req, res) => {
  try {
    const videos = await getTripVideos(req.params.eventId);
    res.json(videos);
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Get single video
router.get('/events/:eventId/videos/:videoId', async (req, res) => {
  try {
    const video = await getTripVideoById(req.params.videoId);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Verify video belongs to event
    if (video.event_id !== req.params.eventId) {
      return res.status(404).json({ error: 'Video not found in this event' });
    }

    res.json(video);
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

// Add video (teachers/admins only)
router.post('/events/:eventId/videos', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { eventId } = req.params;
    const { title, videoUrl, thumbnailUrl, orderIndex } = req.body;

    if (!title?.trim() || !videoUrl?.trim()) {
      return res.status(400).json({ error: 'Title and videoUrl are required' });
    }

    // Verify event exists
    const event = await getTripEventById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const videoId = await addTripVideo(eventId, {
      title,
      videoUrl,
      thumbnailUrl: thumbnailUrl || null,
      orderIndex: orderIndex !== undefined ? parseInt(orderIndex) : 0
    });

    const video = await getTripVideoById(videoId);
    res.status(201).json(video);
  } catch (error) {
    console.error('Add video error:', error);
    res.status(500).json({ error: 'Failed to add video' });
  }
});

// Update video (teachers/admins only)
router.put('/events/:eventId/videos/:videoId', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { videoId, eventId } = req.params;
    const updates = {};

    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.videoUrl !== undefined) updates.video_url = req.body.videoUrl;
    if (req.body.thumbnailUrl !== undefined) updates.thumbnail_url = req.body.thumbnailUrl;
    if (req.body.orderIndex !== undefined) updates.order_index = parseInt(req.body.orderIndex);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Verify video exists and belongs to event
    const video = await getTripVideoById(videoId);
    if (!video || video.event_id !== eventId) {
      return res.status(404).json({ error: 'Video not found' });
    }

    await updateTripVideo(videoId, updates);

    const updatedVideo = await getTripVideoById(videoId);
    res.json(updatedVideo);
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({ error: 'Failed to update video' });
  }
});

// Delete video (teachers/admins only)
router.delete('/events/:eventId/videos/:videoId', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { videoId, eventId } = req.params;

    // Verify video exists and belongs to event
    const video = await getTripVideoById(videoId);
    if (!video || video.event_id !== eventId) {
      return res.status(404).json({ error: 'Video not found' });
    }

    await deleteTripVideo(videoId);
    res.json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

export default router;
