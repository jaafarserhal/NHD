import axios from 'axios';
import { storage } from '../base/storage';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 60000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = storage.get('authToken');

    const isLoginRequest = config.url?.includes('/users/login');

    // ➤ allow login without token
    if (isLoginRequest) return config;

    // ➤ attach token if present
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    }

    // ➤ no token: DO NOT reject the request
    // let backend return 401; response interceptor will redirect
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/users/login');

    if (error.response?.status === 401 && !isLoginRequest) {
      storage.remove('authToken');
      storage.remove('user');
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
