import apiClient from './apiClient';

class apiService {
  constructor(baseEndpoint) {
    this.baseEndpoint = baseEndpoint;
  }

  // GET request
  async get(endpoint = '', params = {}) {
    try {
      const url = endpoint ? `${this.baseEndpoint}/${endpoint}` : this.baseEndpoint;
      const response = await apiClient.get(url, { params });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // POST request
  async post(data, endpoint = '') {
    try {
      const url = endpoint ? `${this.baseEndpoint}/${endpoint}` : this.baseEndpoint;
      const response = await apiClient.post(url, data);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // PUT request
  async put(data, endpoint = '') {
    try {
      const url = endpoint ? `${this.baseEndpoint}/${endpoint}` : this.baseEndpoint;
      const response = await apiClient.put(url, data);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // DELETE request
  async delete(endpoint = '') {
    try {
      const url = endpoint ? `${this.baseEndpoint}/${endpoint}` : this.baseEndpoint;
      const response = await apiClient.delete(url);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // PATCH request
  async patch(data, endpoint = '') {
    try {
      const url = endpoint ? `${this.baseEndpoint}/${endpoint}` : this.baseEndpoint;
      const response = await apiClient.patch(url, data);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Generic request method
  async request(method, endpoint = '', data = null, config = {}) {
    try {
      const url = endpoint ? `${this.baseEndpoint}/${endpoint}` : this.baseEndpoint;
      const response = await apiClient.request({
        method,
        url,
        data,
        ...config
      });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handler
  handleError(error) {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    const status = error.response?.status;
    const data = error.response?.data;
    
    return {
      message,
      status,
      data,
      originalError: error
    };
  }
}

export default apiService;