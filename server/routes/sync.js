import express from 'express';
import { randomUUID } from 'crypto';
import db from '../config/database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Sync student progress (student only - authenticated)
router.post('/progress', authMiddleware, async (req, res) => {
  try {
    const { tripId, progress } = req.body;
    const userId = req.user.id;

    if (!tripId || !progress) {
      return res.status(400).json({
        error: 'Missing required fields: tripId and progress'
      });
    }

    // Check if progress record exists
    const existing = await db.execute({
      sql: 'SELECT id FROM student_progress WHERE user_id = ? AND trip_id = ?',
      args: [userId, tripId]
    });

    if (existing.rows.length > 0) {
      // Update existing progress
      await db.execute({
        sql: `UPDATE student_progress
              SET progress_data = ?,
                  last_synced_at = strftime('%s', 'now')
              WHERE user_id = ? AND trip_id = ?`,
        args: [JSON.stringify(progress), userId, tripId]
      });
    } else {
      // Create new progress record
      const id = randomUUID();
      await db.execute({
        sql: `INSERT INTO student_progress (id, user_id, trip_id, progress_data)
              VALUES (?, ?, ?, ?)`,
        args: [id, userId, tripId, JSON.stringify(progress)]
      });
    }

    res.json({
      message: 'Progress synced successfully',
      syncedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Sync progress error:', error);
    res.status(500).json({ error: 'Failed to sync progress' });
  }
});

// Get student progress for a specific trip
router.get('/progress/:tripId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { tripId } = req.params;

    const result = await db.execute({
      sql: 'SELECT * FROM student_progress WHERE user_id = ? AND trip_id = ?',
      args: [userId, tripId]
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No progress found for this trip' });
    }

    const record = result.rows[0];
    const progress = JSON.parse(record.progress_data);

    res.json({
      tripId: record.trip_id,
      progress,
      lastSyncedAt: record.last_synced_at,
      createdAt: record.created_at
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Get all progress for current user
router.get('/progress', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.execute({
      sql: 'SELECT * FROM student_progress WHERE user_id = ? ORDER BY last_synced_at DESC',
      args: [userId]
    });

    const progressRecords = result.rows.map(record => ({
      tripId: record.trip_id,
      progress: JSON.parse(record.progress_data),
      lastSyncedAt: record.last_synced_at,
      createdAt: record.created_at
    }));

    res.json(progressRecords);
  } catch (error) {
    console.error('Get all progress error:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Delete progress for a trip (student only)
router.delete('/progress/:tripId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { tripId } = req.params;

    const result = await db.execute({
      sql: 'DELETE FROM student_progress WHERE user_id = ? AND trip_id = ?',
      args: [userId, tripId]
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'No progress found for this trip' });
    }

    res.json({ message: 'Progress deleted successfully' });
  } catch (error) {
    console.error('Delete progress error:', error);
    res.status(500).json({ error: 'Failed to delete progress' });
  }
});

export default router;
