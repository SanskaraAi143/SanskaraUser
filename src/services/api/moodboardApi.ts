
import { supabase } from '../supabase/config';
import { auth } from '../firebase/config';

export interface MoodboardImage {
  id: string;
  url: string;
  caption: string;
  category: string;
  created_at: Date;
}

export interface Moodboard {
  id: string;
  name: string;
  description: string;
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
export const getMoodboards = async (): Promise<Moodboard[]> => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    
    // Get the Firebase ID token
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    const idToken = await user.getIdToken();
    
    const response = await fetch(`${API_BASE_URL}/moodboards`, {
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
    console.error('Error fetching moodboards:', error);
    
    // For development without backend, return mock data
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock data for development');
      return [{
        id: '1',
        name: 'Wedding Mood Board',
        description: 'Ideas for my dream wedding',
        created_at: new Date(),
        updated_at: new Date()
      }];
    }
    
    throw error;
  }
};

export const getMoodboardImages = async (
  category?: string
): Promise<MoodboardImage[]> => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    
    // Get the Firebase ID token
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    const idToken = await user.getIdToken();
    
    const url = category
      ? `${API_BASE_URL}/moodboards/images?category=${encodeURIComponent(category)}`
      : `${API_BASE_URL}/moodboards/images`;
    
    const response = await fetch(url, {
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
    console.error('Error fetching moodboard images:', error);
    
    // For development without backend, return mock data
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock data for development');
      return [
        { 
          id: '1', 
          url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a', 
          caption: 'Elegant mandap with floral decor', 
          category: 'decorations',
          created_at: new Date()
        },
        { 
          id: '2', 
          url: 'https://images.unsplash.com/photo-1600578248539-48bdb9db48f2', 
          caption: 'Traditional ceremony setup',
          category: 'decorations',
          created_at: new Date()
        },
        { 
          id: '3', 
          url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8', 
          caption: 'Elegant reception table settings',
          category: 'decorations',
          created_at: new Date()
        },
        { 
          id: '4', 
          url: 'https://images.unsplash.com/photo-1599033769078-74a669fb4710', 
          caption: 'Intricate mehndi design',
          category: 'bride',
          created_at: new Date()
        },
        { 
          id: '5', 
          url: 'https://images.unsplash.com/photo-1622556498246-755f44ca76f3', 
          caption: 'Colorful bridal lehenga',
          category: 'bride',
          created_at: new Date()
        }
      ].filter(img => !category || img.category === category);
    }
    
    throw error;
  }
};

export const uploadMoodboardImage = async (
  file: File,
  category: string,
  caption: string
): Promise<MoodboardImage> => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    
    // Get the Firebase ID token
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    const idToken = await user.getIdToken();
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('caption', caption);
    
    const response = await fetch(`${API_BASE_URL}/moodboards/images/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading moodboard image:', error);
    throw error;
  }
};

export const deleteMoodboardImage = async (imageId: string): Promise<boolean> => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    
    // Get the Firebase ID token
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    const idToken = await user.getIdToken();
    
    const response = await fetch(`${API_BASE_URL}/moodboards/images/${imageId}`, {
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
    console.error('Error deleting moodboard image:', error);
    return false;
  }
};
