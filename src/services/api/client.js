// src/services/api/client.js
import axios from 'axios';
import { API_ENDPOINTS } from './endpoints';

// Create axios instance with default configuration
export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000',
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Create separate client for chat/NLP operations
export const chatApiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000',
  timeout: 45000, // Longer timeout for NLP processing
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});