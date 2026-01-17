import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { transformResponseMiddleware } from './utils/transform.js';
import authRoutes from './routes/auth.js';
import mfaRoutes from './routes/mfa.js';
import tripRoutes from './routes/trips.js';
import classesRoutes from './routes/classes.js';
import usersRoutes from './routes/users.js';
import manifestRoutes from './routes/manifest.js';
import uploadRoutes from './routes/upload.js';
import statsRoutes from './routes/stats.js';
import syncRoutes from './routes/sync.js';

const app = express();

// ---- CORS (FIRST) ----
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // allow no-origin (curl, mobile, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    console.log('CORS blocked origin:', origin);
    console.log('CORS allowed origins:', allowedOrigins);
    return callback(new Error('CORS not allowed for origin: ' + origin));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // IMPORTANT: same options!

// ---- rest middleware ----
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// app.use(transformResponseMiddleware);

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/mfa', mfaRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/manifest', manifestRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/sync', syncRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

export default app;
