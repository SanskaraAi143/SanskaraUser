
import { supabase } from '../supabase/config';
import { auth } from '../firebase/config';

export interface Guest {
  id: string;
  guestName: string;
  contactInfo?: string;
  relation?: string;
  side: 'Groom' | 'Bride' | 'Both';
  status: 'Pending' | 'Invited' | 'Confirmed' | 'Declined';
  dietaryRequirements?: string;
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
export const getGuests = async (): Promise<Guest[]> => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    
    // Get the Firebase ID token
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    const idToken = await user.getIdToken();
    
    const response = await fetch(`${API_BASE_URL}/guests`, {
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
    console.error('Error fetching guests:', error);
    
    // For development without backend, return mock data
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock data for development');
      return [
        {
          id: '1',
          guestName: 'Rahul Sharma',
          contactInfo: 'rahul.sharma@example.com',
          relation: 'Brother',
          side: 'Groom',
          status: 'Confirmed',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '2',
          guestName: 'Priya Patel',
          contactInfo: 'priya.patel@example.com',
          relation: 'Cousin',
          side: 'Bride',
          status: 'Invited',
          dietaryRequirements: 'Vegetarian',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
    }
    
    throw error;
  }
};

export const createGuest = async (guest: Omit<Guest, 'id' | 'created_at' | 'updated_at'>): Promise<Guest> => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    
    // Get the Firebase ID token
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    const idToken = await user.getIdToken();
    
    const response = await fetch(`${API_BASE_URL}/guests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(guest),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating guest:', error);
    throw error;
  }
};

export const updateGuest = async (id: string, updates: Partial<Omit<Guest, 'id' | 'created_at' | 'updated_at'>>): Promise<Guest> => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    
    // Get the Firebase ID token
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    const idToken = await user.getIdToken();
    
    const response = await fetch(`${API_BASE_URL}/guests/${id}`, {
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
    console.error('Error updating guest:', error);
    throw error;
  }
};

export const deleteGuest = async (id: string): Promise<boolean> => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    
    // Get the Firebase ID token
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    const idToken = await user.getIdToken();
    
    const response = await fetch(`${API_BASE_URL}/guests/${id}`, {
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
    console.error('Error deleting guest:', error);
    return false;
  }
};
