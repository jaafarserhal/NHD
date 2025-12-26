import axios from "axios";
import { routeUrls } from "./routeUrls";
import { apiUrls } from "./apiUrls";
import { storage } from "./storage";

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 60000,
});

const publicApiEndpoints = [
  apiUrls.loginCustomer,
  apiUrls.registerCustomer,
  apiUrls.verifyCustomerEmail
];

const isPublicApiCall = (url) =>
  publicApiEndpoints.some((endpoint) => url?.includes(endpoint));

// Attach token to every request if available
apiClient.interceptors.request.use(
  (config) => {
    const token = storage.get("webAuthToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401/403 globally
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401 && !isPublicApiCall(error.config.url)) {
      storage.remove("webAuthToken");
      // trigger a page reload to let React redirect
      window.location.href = routeUrls.login;
    }

    if (error.response?.status === 403) {
      console.error("Access forbidden");
    }

    if (!error.response) {
      console.error("Network error or server down");
    }

    return Promise.reject(error);
  }
);

export default apiClient;
