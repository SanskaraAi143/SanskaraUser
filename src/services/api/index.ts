
// Export all API services
export * from './chatApi';
export * from './ritualApi';
export * from './vendorApi';
export * from './taskApi';
export * from './moodboardApi';
export * from './budgetApi';
export * from './guestApi';
export * from './timelineApi';

// Define API base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Reexport the supabase client for convenience
export { supabase } from '../supabase/config';
