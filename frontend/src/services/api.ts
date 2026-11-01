import axios from 'axios';

// Create central Axios instance. Base URL defaults to empty string so Vite proxy handles /api,
// or can be overridden via VITE_API_URL environment variable.
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000, // 45 seconds for ML model execution
});

// Response interceptor for clear, clean error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = 'An unexpected server error occurred.';
    if (error.response) {
      errorMessage = error.response.data?.error || error.response.data?.message || `Server Error (${error.response.status})`;
    } else if (error.request) {
      errorMessage = 'Unable to connect to the backend server. Please verify the Flask server is running at http://127.0.0.1:5001.';
    } else {
      errorMessage = error.message;
    }
    return Promise.reject(new Error(errorMessage));
  }
);

