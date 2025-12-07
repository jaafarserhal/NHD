import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 60000,
});

// Request interceptor: add token if it exists
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');

    // Add Authorization header only if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', config.method?.toUpperCase(), config.url);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: do not redirect
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Optional: log but do NOT redirect or remove token
      console.warn("Unauthorized (401): token missing/expired");
    }

    if (error.response?.status === 403) {
      console.warn("Forbidden (403)");
    }

    if (!error.response) {
      console.error("Network error or server unreachable");
    }

    return Promise.reject(error);
  }
);

export default apiClient;
