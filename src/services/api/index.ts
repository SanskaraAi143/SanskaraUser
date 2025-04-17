
// Export all API services
export * from './chatApi';
export * from './ritualApi';
export * from './vendorApi';

// Define API communication functions for the Python backend
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Reexport the supabase client for convenience
export { supabase } from '@/services/supabase/config';
