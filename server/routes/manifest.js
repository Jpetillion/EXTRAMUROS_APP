import express from 'express';
import {
  getTripById,
  getModulesByTripId,
  getPublishedContentByTripId,
  getTripStopsByTripId,
  createManifest,
  getManifestByTripId
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

    // Get all modules for the trip
    const modules = await getModulesByTripId(trip.id);

    // Get all published content for the trip
    const contentItems = await getPublishedContentByTripId(trip.id);

    // Get all trip stops
    const tripStops = await getTripStopsByTripId(trip.id);

    // Group content by module
    const moduleMap = {};
    for (const module of modules) {
      moduleMap[module.id] = {
        ...module,
        content: []
      };
    }

    // Add content to modules
    for (const item of contentItems) {
      if (moduleMap[item.module_id]) {
        // Parse metadata if it exists
        const metadata = item.metadata ? JSON.parse(item.metadata) : null;

        moduleMap[item.module_id].content.push({
          id: item.id,
          type: item.type,
          title: item.title,
          body: item.body,
          mediaUrl: item.media_url,
          thumbnailUrl: item.thumbnail_url,
          metadata,
          orderIndex: item.order_index
        });
      }
    }

    // Build manifest
    const manifest = {
      tripId: trip.id,
      version: trip.manifest_version,
      trip: {
        id: trip.id,
        title: trip.title,
        description: trip.description,
        destination: trip.destination,
        startDate: trip.start_date,
        endDate: trip.end_date,
        coverImageUrl: trip.cover_image_url
      },
      modules: Object.values(moduleMap),
      stops: tripStops.map(stop => ({
        id: stop.id,
        title: stop.title,
        durationMinutes: stop.duration_minutes,
        difficulty: stop.difficulty,
        category: stop.category,
        lat: stop.lat,
        lng: stop.lng,
        address: stop.address,
        pictureUrl: stop.picture_url,
        audioUrl: stop.audio_url,
        videoUrl: stop.video_url,
        orderIndex: stop.order_index,
        metadata: stop.metadata ? JSON.parse(stop.metadata) : null
      })),
      generatedAt: new Date().toISOString()
    };

    // Count assets (images, audio, video from content items)
    let assetsCount = contentItems.filter(item =>
      ['image', 'audio', 'video'].includes(item.type) && item.media_url
    ).length;

    // Count assets from trip stops
    for (const stop of tripStops) {
      if (stop.picture_url) assetsCount++;
      if (stop.audio_url) assetsCount++;
      if (stop.video_url) assetsCount++;
    }

    // Count cover image if exists
    if (trip.cover_image_url) assetsCount++;

    // Save manifest to database
    await createManifest(
      trip.id,
      trip.manifest_version,
      JSON.stringify(manifest),
      assetsCount
    );

    res.json({
      message: 'Manifest generated successfully',
      manifest
    });
  } catch (error) {
    console.error('Generate manifest error:', error);
    res.status(500).json({ error: 'Failed to generate manifest' });
  }
});

// Get manifest for a trip (public endpoint for students)
router.get('/:tripId', async (req, res) => {
  try {
    const manifestRecord = await getManifestByTripId(req.params.tripId);

    if (!manifestRecord) {
      return res.status(404).json({ error: 'Manifest not found' });
    }

    const manifest = JSON.parse(manifestRecord.content);

    res.json(manifest);
  } catch (error) {
    console.error('Get manifest error:', error);
    res.status(500).json({ error: 'Failed to fetch manifest' });
  }
});

export default router;
