import express from 'express';
import { uploadMiddleware } from '../middleware/upload.js';
import { uploadToBlob, deleteFromBlob } from '../config/storage.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Upload single file (teachers/admins only)
router.post(
  '/',
  authMiddleware,
  requireRole('teacher', 'admin'),
  uploadMiddleware.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const folder = req.body.folder || 'uploads';
      const url = await uploadToBlob(req.file, folder);

      res.json({
        url,
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  }
);

// Upload image (teachers/admins only)
router.post(
  '/image',
  authMiddleware,
  requireRole('teacher', 'admin'),
  uploadMiddleware.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
      }

      if (!req.file.mimetype.startsWith('image/')) {
        return res.status(400).json({ error: 'File must be an image' });
      }

      const url = await uploadToBlob(req.file, 'images');

      res.json({
        url,
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  }
);

// Upload audio (teachers/admins only)
router.post(
  '/audio',
  authMiddleware,
  requireRole('teacher', 'admin'),
  uploadMiddleware.single('audio'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No audio file uploaded' });
      }

      if (!req.file.mimetype.startsWith('audio/')) {
        return res.status(400).json({ error: 'File must be an audio file' });
      }

      const url = await uploadToBlob(req.file, 'audio');

      res.json({
        url,
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });
    } catch (error) {
      console.error('Audio upload error:', error);
      res.status(500).json({ error: 'Failed to upload audio' });
    }
  }
);

// Upload video (teachers/admins only)
router.post(
  '/video',
  authMiddleware,
  requireRole('teacher', 'admin'),
  uploadMiddleware.single('video'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No video file uploaded' });
      }

      if (!req.file.mimetype.startsWith('video/')) {
        return res.status(400).json({ error: 'File must be a video file' });
      }

      const url = await uploadToBlob(req.file, 'videos');

      res.json({
        url,
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });
    } catch (error) {
      console.error('Video upload error:', error);
      res.status(500).json({ error: 'Failed to upload video' });
    }
  }
);

// Delete file from blob storage (teachers/admins only)
router.delete('/', authMiddleware, requireRole('teacher', 'admin'), async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'File URL is required' });
    }

    // Validate that the URL is from Vercel Blob
    if (!url.includes('blob.vercel-storage.com')) {
      return res.status(400).json({ error: 'Invalid blob URL' });
    }

    await deleteFromBlob(url);

    res.json({
      message: 'File deleted successfully',
      url
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

export default router;
