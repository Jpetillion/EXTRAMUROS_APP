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
// import moduleRoutes from './routes/modules.js'; // Removed - using events instead
// import contentRoutes from './routes/content.js'; // Removed - using events instead
import manifestRoutes from './routes/manifest.js';
import uploadRoutes from './routes/upload.js';
import statsRoutes from './routes/stats.js';
import syncRoutes from './routes/sync.js';


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Transform API responses from snake_case to camelCase
app.use(transformResponseMiddleware);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/mfa', mfaRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/users', usersRoutes);
// app.use('/api/modules', moduleRoutes); // Removed - using events instead
// app.use('/api/content', contentRoutes); // Removed - using events instead
app.use('/api/manifest', manifestRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/sync', syncRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 API docs: http://localhost:${PORT}/api`);
});

export default app;
