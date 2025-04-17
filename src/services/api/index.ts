
import axios from 'axios';
import { supabase } from '../supabase/config';

// Define API communication functions for the Python backend
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Create an axios instance with base URL
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the Supabase JWT to every request
api.interceptors.request.use(async (config) => {
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      config.headers.Authorization = `Bearer ${data.session.access_token}`;
    }
  } catch (error) {
    console.error('Failed to get Supabase session:', error);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Export all API services
export * from './chatApi';
export * from './ritualApi';
export * from './vendorApi';

// Reexport the supabase client for convenience
export { supabase } from '../supabase/config';
