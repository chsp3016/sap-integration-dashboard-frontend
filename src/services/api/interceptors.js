// src/services/api/interceptors.js
import { apiClient, chatApiClient } from './client';

// Request interceptor for authentication
const addAuthInterceptor = (client) => {
  client.interceptors.request.use(
    (config) => {
      // Add authentication token if available
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add request timestamp for tracking
      config.metadata = { startTime: new Date() };
      
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );
};

// Response interceptor for error handling and logging
const addResponseInterceptor = (client) => {
  client.interceptors.response.use(
    (response) => {
      // Calculate request duration
      const duration = new Date() - response.config.metadata.startTime;
      console.log(`API Response: ${response.status} in ${duration}ms`);
      
      return response;
    },
    (error) => {
      console.error('API Error:', error);
      
      if (error.response) {
        // Server responded with error status
        const { status, data } = error.response;
        
        switch (status) {
          case 401:
            // Unauthorized - redirect to login
            localStorage.removeItem('authToken');
            window.location.href = '/login';
            break;
          case 403:
            // Forbidden
            throw new Error('Access denied. You do not have permission to perform this action.');
          case 404:
            throw new Error('The requested resource was not found.');
          case 500:
            throw new Error('Internal server error. Please try again later.');
          default:
            throw new Error(data?.message || data?.error || `Server error (${status})`);
        }
      } else if (error.request) {
        // Network error
        throw new Error('Network error: Unable to connect to server. Please check your connection.');
      } else {
        // Request configuration error
        throw new Error('Request failed: ' + error.message);
      }
    }
  );
};

// Apply interceptors
addAuthInterceptor(apiClient);
addAuthInterceptor(chatApiClient);
addResponseInterceptor(apiClient);
addResponseInterceptor(chatApiClient);