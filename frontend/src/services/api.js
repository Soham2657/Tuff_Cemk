import axios from 'axios';

const rawBackendUrl = import.meta.env.VITE_BACKEND_URL || '';
const trimmedBackendUrl = rawBackendUrl.replace(/\/+$/, '');
const resolvedBaseUrl = trimmedBackendUrl
  ? (trimmedBackendUrl.endsWith('/api') ? trimmedBackendUrl : `${trimmedBackendUrl}/api`)
  : '/api';

const api = axios.create({
  baseURL: resolvedBaseUrl,
});

// Add a request interceptor to inject the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
