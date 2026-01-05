// Content types
export const CONTENT_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  AUDIO: 'audio',
  VIDEO: 'video',
  LOCATION: 'location',
  ACTIVITY: 'activity',
  SCHEDULE: 'schedule'
};

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student'
};

// API base URL
export const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? '/api'
  : 'http://localhost:3000/api';

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  IMAGE: 10 * 1024 * 1024, // 10MB
  AUDIO: 50 * 1024 * 1024, // 50MB
  VIDEO: 100 * 1024 * 1024  // 100MB
};

// Accepted file types
export const ACCEPTED_FILE_TYPES = {
  IMAGE: 'image/jpeg,image/jpg,image/png,image/gif,image/webp',
  AUDIO: 'audio/mpeg,audio/mp3,audio/wav,audio/ogg',
  VIDEO: 'video/mp4,video/mpeg,video/quicktime'
};
