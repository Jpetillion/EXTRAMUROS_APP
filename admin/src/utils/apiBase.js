export const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const apiUrl = (path) => {
  // path must start with '/'
  return `${API_BASE}${path}`;
};
