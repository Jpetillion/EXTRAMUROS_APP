import express from 'express';
import { getDashboardStats } from '../models/db.js';
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

export default router;
