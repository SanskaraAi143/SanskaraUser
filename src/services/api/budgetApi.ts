
import { supabase } from '../supabase/config';
import { auth } from '../firebase/config';

export interface BudgetItem {
  id: string;
  itemName: string;
  category: string;
  amount: number;
  vendorName?: string;
  status: 'Pending' | 'Paid';
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
export const getBudgetItems = async (): Promise<BudgetItem[]> => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    
    // Get the Firebase ID token
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    const idToken = await user.getIdToken();
    
    const response = await fetch(`${API_BASE_URL}/budget`, {
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
    console.error('Error fetching budget items:', error);
    
    // For development without backend, return mock data
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock data for development');
      return [
        {
          id: '1',
          itemName: 'Venue Deposit',
          category: 'Venue',
          amount: 50000,
          vendorName: 'Royal Palace',
          status: 'Paid',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: '2',
          itemName: 'Catering Advance',
          category: 'Catering',
          amount: 25000,
          vendorName: 'Divine Caterers',
          status: 'Pending',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
    }
    
    throw error;
  }
};

export const createBudgetItem = async (item: Omit<BudgetItem, 'id' | 'created_at' | 'updated_at'>): Promise<BudgetItem> => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    
    // Get the Firebase ID token
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    const idToken = await user.getIdToken();
    
    const response = await fetch(`${API_BASE_URL}/budget`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating budget item:', error);
    throw error;
  }
};

export const updateBudgetItem = async (id: string, updates: Partial<Omit<BudgetItem, 'id' | 'created_at' | 'updated_at'>>): Promise<BudgetItem> => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    
    // Get the Firebase ID token
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    const idToken = await user.getIdToken();
    
    const response = await fetch(`${API_BASE_URL}/budget/${id}`, {
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
    console.error('Error updating budget item:', error);
    throw error;
  }
};

export const deleteBudgetItem = async (id: string): Promise<boolean> => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
    
    // Get the Firebase ID token
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    const idToken = await user.getIdToken();
    
    const response = await fetch(`${API_BASE_URL}/budget/${id}`, {
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
    console.error('Error deleting budget item:', error);
    return false;
  }
};
