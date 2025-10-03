import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 60000,
});

// Request interceptor: Add auth token or redirect if missing
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');

    // ✅ Allow login request without token
    const isLoginRequest = config.url?.includes('/users/login');
    const isAuthRoute = window.location.pathname.includes('/auth/login');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (!isLoginRequest) {
      // No token and not a login request → redirect
      if (!isAuthRoute) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }

      // ❌ Do NOT reject login requests here — only reject protected ones
      return Promise.reject(new Error('No auth token found'));
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', config.method?.toUpperCase(), config.url);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle common errors
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401 && !error.config.url?.includes('/users/login')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }

    if (error.response?.status === 403) {
      console.error('Access forbidden');
    }

    if (!error.response) {
      console.error('Network error or server is down');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
