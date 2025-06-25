import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import 'react-native-url-polyfill/auto'; // Required for Supabase to work in React Native, handles URL polyfills
import AsyncStorage from '@react-native-async-storage/async-storage'; // Required for session persistence

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl as string;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing. Check app.config.js and expo-constants setup.");
  // Potentially throw an error or handle this state appropriately
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, // Use AsyncStorage for session persistence in React Native
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Important for React Native, as URL-based session detection is for web
  },
});

// Log Supabase initialization status (optional, for debugging)
if (supabase) {
  console.log("Supabase client initialized successfully.");
} else {
  console.error("Supabase client initialization failed.");
}
