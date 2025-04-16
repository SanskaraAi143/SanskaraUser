
import { supabase } from '../supabase/config';
import { auth } from '../firebase/config';

export interface TimelineEvent {
  id: string;
  eventName: string;
  eventDateTime: string; // ISO date string
  location?: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

// Get user ID from current auth
const getCurrentUserId = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  
  // Get internal user_id from Supabase based on firebase_uid
  const { data, error } = await supabase
    .from('users')
    .select('user_id')
    .eq('firebase_uid', user.uid)
    .single();
    
  if (error) throw error;
  return data.user_id;
};

// API functions
export const getTimelineEvents = async (): Promise<TimelineEvent[]> => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    
    // Get the Firebase ID token
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    const idToken = await user.getIdToken();
    
    const response = await fetch(`${API_BASE_URL}/timeline`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching timeline events:', error);
    
    // For development without backend, return mock data
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock data for development');
      return [
        {
          id: '1',
          eventName: 'Mehndi Ceremony',
          eventDateTime: new Date(2025, 6, 10, 14, 0).toISOString(),
          location: 'Family Home',
          description: 'Traditional mehndi application with close family and friends',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '2',
          eventName: 'Wedding Ceremony',
          eventDateTime: new Date(2025, 6, 12, 10, 0).toISOString(),
          location: 'Royal Palace Hotel',
          description: 'Main wedding ceremony with all guests',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '3',
          eventName: 'Reception',
          eventDateTime: new Date(2025, 6, 12, 18, 0).toISOString(),
          location: 'Royal Palace Hotel',
          description: 'Dinner and celebrations',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
    }
    
    throw error;
  }
};

export const createTimelineEvent = async (event: Omit<TimelineEvent, 'id' | 'created_at' | 'updated_at'>): Promise<TimelineEvent> => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    
    // Get the Firebase ID token
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    const idToken = await user.getIdToken();
    
    const response = await fetch(`${API_BASE_URL}/timeline`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating timeline event:', error);
    throw error;
  }
};

export const updateTimelineEvent = async (id: string, updates: Partial<Omit<TimelineEvent, 'id' | 'created_at' | 'updated_at'>>): Promise<TimelineEvent> => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    
    // Get the Firebase ID token
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    const idToken = await user.getIdToken();
    
    const response = await fetch(`${API_BASE_URL}/timeline/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating timeline event:', error);
    throw error;
  }
};

export const deleteTimelineEvent = async (id: string): Promise<boolean> => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    
    // Get the Firebase ID token
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    const idToken = await user.getIdToken();
    
    const response = await fetch(`${API_BASE_URL}/timeline/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting timeline event:', error);
    return false;
  }
};
