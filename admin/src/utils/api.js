import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden:', data.message);
          break;
        case 404:
          // Not found
          console.error('Resource not found:', data.message);
          break;
        case 422:
          // Validation error
          console.error('Validation error:', data.errors || data.message);
          break;
        case 500:
          // Server error
          console.error('Server error:', data.message);
          break;
        default:
          console.error('API error:', data.message || error.message);
      }

      return Promise.reject(error.response);
    } else if (error.request) {
      // Request made but no response
      console.error('No response from server');
      return Promise.reject(new Error('Network error - no response from server'));
    } else {
      // Error setting up request
      console.error('Request setup error:', error.message);
      return Promise.reject(error);
    }
  }
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  loginMfa: (data) => api.post('/auth/login/mfa', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
};

export const mfaAPI = {
  generateSetup: () => api.post('/mfa/setup/generate'),
  verifySetup: (token) => api.post('/mfa/setup/verify', { token }),
  disable: (password) => api.post('/mfa/disable', { password }),
  getStatus: () => api.get('/mfa/status'),
  regenerateBackupCodes: (token) => api.post('/mfa/backup-codes/regenerate', { token }),
};

export const tripsAPI = {
  getAll: (params) => api.get('/trips', { params }),
  getById: (id) => api.get(`/trips/${id}`),
  create: (data) => api.post('/trips', data),
  update: (id, data) => api.put(`/trips/${id}`, data),
  delete: (id) => api.delete(`/trips/${id}`),
  publish: (id) => api.post(`/trips/${id}/publish`),
  unpublish: (id) => api.post(`/trips/${id}/unpublish`),
  getEvents: (id) => api.get(`/trips/${id}/events`),
  createEvent: (id, data) => api.post(`/trips/${id}/events`, data),
  updateEvent: (id, eventId, data) => api.put(`/trips/${id}/events/${eventId}`, data),
  deleteEvent: (id, eventId) => api.delete(`/trips/${id}/events/${eventId}`),
  getClasses: (id) => api.get(`/trips/${id}/classes`),
  assignClass: (id, classId) => api.post(`/trips/${id}/classes/${classId}`),
  removeClass: (id, classId) => api.delete(`/trips/${id}/classes/${classId}`),
  getProgress: (id) => api.get(`/stats/trips/${id}/progress`),
  getTeachers: (id) => api.get(`/trips/${id}/teachers`),
  assignTeacher: (id, userId, data) => api.post(`/trips/${id}/teachers/${userId}`, data),
  updateTeacher: (id, userId, data) => api.put(`/trips/${id}/teachers/${userId}`, data),
  removeTeacher: (id, userId) => api.delete(`/trips/${id}/teachers/${userId}`),
};

export const stopsAPI = {
  getAll: (tripId) => api.get(`/trips/${tripId}/stops`),
  getById: (tripId, stopId) => api.get(`/trips/${tripId}/stops/${stopId}`),
  create: (tripId, data) => api.post(`/trips/${tripId}/stops`, data),
  update: (tripId, stopId, data) => api.put(`/trips/${tripId}/stops/${stopId}`, data),
  delete: (tripId, stopId) => api.delete(`/trips/${tripId}/stops/${stopId}`),
};

export const modulesAPI = {
  getAll: (tripId) => api.get(`/trips/${tripId}/modules`),
  getById: (tripId, moduleId) => api.get(`/trips/${tripId}/modules/${moduleId}`),
  create: (tripId, data) => api.post(`/trips/${tripId}/modules`, data),
  update: (tripId, moduleId, data) => api.put(`/trips/${tripId}/modules/${moduleId}`, data),
  delete: (tripId, moduleId) => api.delete(`/trips/${tripId}/modules/${moduleId}`),
  reorder: (tripId, moduleIds) => api.post(`/trips/${tripId}/modules/reorder`, { moduleIds }),
};

export const contentAPI = {
  getAll: (tripId, moduleId) => api.get(`/trips/${tripId}/modules/${moduleId}/content`),
  getById: (tripId, moduleId, contentId) =>
    api.get(`/trips/${tripId}/modules/${moduleId}/content/${contentId}`),
  create: (tripId, moduleId, data) =>
    api.post(`/trips/${tripId}/modules/${moduleId}/content`, data),
  update: (tripId, moduleId, contentId, data) =>
    api.put(`/trips/${tripId}/modules/${moduleId}/content/${contentId}`, data),
  delete: (tripId, moduleId, contentId) =>
    api.delete(`/trips/${tripId}/modules/${moduleId}/content/${contentId}`),
  reorder: (tripId, moduleId, contentIds) =>
    api.post(`/trips/${tripId}/modules/${moduleId}/content/reorder`, { contentIds }),
};

export const uploadsAPI = {
  uploadImage: (file, onProgress) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/uploads/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
  },
  uploadAudio: (file, onProgress) => {
    const formData = new FormData();
    formData.append('audio', file);
    return api.post('/uploads/audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
  },
  delete: (fileUrl) => api.delete('/uploads', { data: { fileUrl } }),
};

export const statsAPI = {
  getDashboard: () => api.get('/stats/dashboard'),
  getTripStats: (tripId) => api.get(`/stats/trips/${tripId}`),
};

export const classesAPI = {
  getAll: () => api.get('/classes'),
  getById: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`),
  getTrips: (id) => api.get(`/classes/${id}/trips`),
  assignTrip: (classId, tripId) => api.post(`/classes/${classId}/trips/${tripId}`),
  removeTrip: (classId, tripId) => api.delete(`/classes/${classId}/trips/${tripId}`),
};

export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getAllTeachers: () => api.get('/users?role=teacher'),
};

export default api;
