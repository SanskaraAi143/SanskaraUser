
// Export all API services
export * from './chatApi';
export * from './ritualApi';
export * from './vendorApi';
export * from './taskApi';

// Define API communication functions for the Python backend
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Reexport the supabase client for convenience
export { supabase } from '../supabase/config';
