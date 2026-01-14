import express from 'express';
import {
  getTripById,
  getTripEventsByTripId,
  createManifest,
  getManifestByTripId,
  getClassesByTripId
} from '../models/db.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Generate manifest for a trip (teachers/admins only)
router.post('/:tripId/generate', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const trip = await getTripById(req.params.tripId);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Get all events for the trip
    const events = await getTripEventsByTripId(trip.id);

    // Get assigned classes
    const classes = await getClassesByTripId(trip.id);

    // Count assets (images and audio files)
    let assetsCount = 0;
    for (const event of events) {
      if (event.image_blob) assetsCount++;
      if (event.audio_blob) assetsCount++;
      if (event.video_url) assetsCount++; // Video URLs count as assets
    }
    if (trip.cover_image_blob) assetsCount++;

    // Create manifest object
    const manifest = {
      version: trip.manifest_version,
      trip: {
        id: trip.id,
        title: trip.title,
        description: trip.description,
        published: trip.published,
        createdAt: trip.created_at,
        updatedAt: trip.updated_at,
        hasCoverImage: !!trip.cover_image_blob
      },
      events: events.map(event => ({
        id: event.id,
        title: event.title,
        category: event.category,
        durationMinutes: event.duration_minutes,
        textContent: event.text_content,
        lat: event.lat,
        lng: event.lng,
        address: event.address,
        hasImage: !!event.image_blob,
        imageMimeType: event.image_mime_type,
        hasAudio: !!event.audio_blob,
        audioMimeType: event.audio_mime_type,
        videoUrl: event.video_url,
        orderIndex: event.order_index,
        metadata: event.metadata ? JSON.parse(event.metadata) : null
      })),
      classes: classes.map(c => ({
        id: c.id,
        name: c.name,
        schoolYear: c.school_year
      })),
      assetsCount,
      generatedAt: new Date().toISOString()
    };

    // Save manifest to database
    const manifestId = await createManifest(
      trip.id,
      trip.manifest_version,
      JSON.stringify(manifest),
      assetsCount
    );

    res.json({
      manifestId,
      manifest,
      message: 'Manifest generated successfully'
    });

  } catch (error) {
    console.error('Generate manifest error:', error);
    res.status(500).json({ error: 'Failed to generate manifest' });
  }
});

// Get manifest for a trip (public)
router.get('/:tripId', async (req, res) => {
  try {
    const manifest = await getManifestByTripId(req.params.tripId);

    if (!manifest) {
      return res.status(404).json({ error: 'Manifest not found' });
    }

    // Parse content JSON
    const content = JSON.parse(manifest.content);

    res.json({
      id: manifest.id,
      tripId: manifest.trip_id,
      version: manifest.version,
      assetsCount: manifest.assets_count,
      publishedAt: manifest.published_at,
      manifest: content
    });

  } catch (error) {
    console.error('Get manifest error:', error);
    res.status(500).json({ error: 'Failed to fetch manifest' });
  }
});

export default router;
