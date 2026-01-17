import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

console.log('[APP] Starting app.js initialization');

import { transformResponseMiddleware } from './utils/transform.js';
console.log('[APP] Imported transformResponseMiddleware');

import authRoutes from './routes/auth.js';
console.log('[APP] Imported authRoutes:', authRoutes ? 'SUCCESS' : 'FAILED');

import mfaRoutes from './routes/mfa.js';
console.log('[APP] Imported mfaRoutes:', mfaRoutes ? 'SUCCESS' : 'FAILED');

import tripRoutes from './routes/trips.js';
console.log('[APP] Imported tripRoutes:', tripRoutes ? 'SUCCESS' : 'FAILED');

import classesRoutes from './routes/classes.js';
console.log('[APP] Imported classesRoutes:', classesRoutes ? 'SUCCESS' : 'FAILED');

import usersRoutes from './routes/users.js';
console.log('[APP] Imported usersRoutes:', usersRoutes ? 'SUCCESS' : 'FAILED');

import manifestRoutes from './routes/manifest.js';
console.log('[APP] Imported manifestRoutes:', manifestRoutes ? 'SUCCESS' : 'FAILED');

import uploadRoutes from './routes/upload.js';
console.log('[APP] Imported uploadRoutes:', uploadRoutes ? 'SUCCESS' : 'FAILED');

import statsRoutes from './routes/stats.js';
console.log('[APP] Imported statsRoutes:', statsRoutes ? 'SUCCESS' : 'FAILED');

import syncRoutes from './routes/sync.js';
console.log('[APP] Imported syncRoutes:', syncRoutes ? 'SUCCESS' : 'FAILED');

const app = express();
console.log('[APP] Express app created');

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

app.use(transformResponseMiddleware);

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
console.log('[APP] Registering routes...');
app.use('/api/auth', authRoutes);
console.log('[APP] Registered /api/auth');
app.use('/api/mfa', mfaRoutes);
console.log('[APP] Registered /api/mfa');
app.use('/api/trips', tripRoutes);
console.log('[APP] Registered /api/trips');
app.use('/api/classes', classesRoutes);
console.log('[APP] Registered /api/classes');
app.use('/api/users', usersRoutes);
console.log('[APP] Registered /api/users');
app.use('/api/manifest', manifestRoutes);
console.log('[APP] Registered /api/manifest');
app.use('/api/upload', uploadRoutes);
console.log('[APP] Registered /api/upload');
app.use('/api/stats', statsRoutes);
console.log('[APP] Registered /api/stats');
app.use('/api/sync', syncRoutes);
console.log('[APP] Registered /api/sync');
console.log('[APP] All routes registered successfully');

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

export default app;
