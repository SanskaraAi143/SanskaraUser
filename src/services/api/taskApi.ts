
import { supabase } from '../supabase/config';
import { auth } from '../firebase/config';

export interface Task {
  id: string;
  description: string;
  isComplete: boolean;
  dueDate?: string;
  category?: string;
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
export const getTasks = async (): Promise<Task[]> => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    
    // Get the Firebase ID token
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    const idToken = await user.getIdToken();
    
    const response = await fetch(`${API_BASE_URL}/tasks`, {
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
    console.error('Error fetching tasks:', error);
    
    // For development without backend, return mock data
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock data for development');
      return [
        {
          id: '1',
          description: 'Book venue for reception',
          isComplete: false,
          dueDate: '2025-05-01',
          category: 'Venue',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '2',
          description: 'Finalize guest list',
          isComplete: true,
          dueDate: '2025-04-15',
          category: 'General',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '3',
          description: 'Book photographer',
          isComplete: false,
          dueDate: '2025-05-15',
          category: 'Vendor',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
    }
    
    throw error;
  }
};

export const createTask = async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    
    // Get the Firebase ID token
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    const idToken = await user.getIdToken();
    
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const updateTask = async (id: string, updates: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>): Promise<Task> => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    
    // Get the Firebase ID token
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    const idToken = await user.getIdToken();
    
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
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
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (id: string): Promise<boolean> => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    
    // Get the Firebase ID token
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    const idToken = await user.getIdToken();
    
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
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
    console.error('Error deleting task:', error);
    return false;
  }
};
