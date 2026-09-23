import axios, { AxiosError } from 'axios';
import { getAuthToken } from '../store/useAuthStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create configured axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      // Token might be invalid or expired
      console.warn('Session expired or unauthorized request.');
    }
    return Promise.reject(error);
  }
);

// Helper function to build headers for fetch requests
export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export default api;