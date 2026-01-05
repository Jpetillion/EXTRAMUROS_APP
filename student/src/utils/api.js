import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!navigator.onLine) {
      error.isOffline = true;
      error.message = 'You are offline. Please check your connection.';
    }
    return Promise.reject(error);
  }
);

// API Methods
export const api = {
  // Authentication
  login: (credentials) => apiClient.post('/auth/login', credentials),
  logout: () => apiClient.post('/auth/logout'),

  // Trips
  getTrips: () => apiClient.get('/trips'),
  getTrip: (tripId) => apiClient.get(`/trips/${tripId}`),
  getTripWithContent: (tripId) => apiClient.get(`/trips/${tripId}/full`),

  // Modules
  getModules: (tripId) => apiClient.get(`/trips/${tripId}/modules`),
  getModule: (moduleId) => apiClient.get(`/modules/${moduleId}`),

  // Content
  getContent: (contentId) => apiClient.get(`/content/${contentId}`),
  getContentsByModule: (moduleId) => apiClient.get(`/modules/${moduleId}/contents`),

  // Assets
  downloadAsset: async (url) => {
    try {
      const response = await apiClient.get(url, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to download asset:', error);
      throw error;
    }
  },

  // Sync
  syncProgress: (data) => apiClient.post('/sync/progress', data),
  getProgress: () => apiClient.get('/sync/progress')
};

export default apiClient;
