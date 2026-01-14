import express from 'express';
import { getDashboardStats, getTripProgressReport } from '../models/db.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /api/stats/dashboard
router.get('/dashboard', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

// GET /api/stats/trips/:tripId/progress - Get progress report for a trip
router.get('/trips/:tripId/progress', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const progressReport = await getTripProgressReport(req.params.tripId);
    res.json(progressReport);
  } catch (error) {
    console.error('Get trip progress error:', error);
    res.status(500).json({ error: 'Failed to fetch progress report' });
  }
});

export default router;
