
import { supabase } from '../supabase/config';
import { auth } from '../firebase/config';
import { API_BASE_URL } from './index';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
}

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

export const getTasks = async (): Promise<Task[]> => {
  try {
    const API_URL = API_BASE_URL;
    
    // If API_BASE_URL is set, try to use the backend API
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      const idToken = await user.getIdToken();
      
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (apiError) {
      console.error('Error calling backend API, falling back to Supabase:', apiError);
    }
    
    // Fallback to direct Supabase query
    const userId = await getCurrentUserId();
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });
      
    if (error) throw error;
    
    return data.map(task => ({
      id: task.task_id,
      title: task.description,
      completed: task.is_complete,
      dueDate: task.due_date,
      priority: task.category?.includes('high') ? 'high' : 
                task.category?.includes('medium') ? 'medium' : 'low',
      category: task.category,
    }));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

export const createTask = async (task: Omit<Task, 'id'>): Promise<Task> => {
  try {
    const API_URL = API_BASE_URL;
    
    // If API_BASE_URL is set, try to use the backend API
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      const idToken = await user.getIdToken();
      
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (apiError) {
      console.error('Error calling backend API, falling back to Supabase:', apiError);
    }
    
    // Fallback to direct Supabase query
    const userId = await getCurrentUserId();
    
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        description: task.title,
        is_complete: task.completed,
        due_date: task.dueDate,
        category: task.category || task.priority,
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.task_id,
      title: data.description,
      completed: data.is_complete,
      dueDate: data.due_date,
      priority: data.category?.includes('high') ? 'high' : 
                data.category?.includes('medium') ? 'medium' : 'low',
      category: data.category,
    };
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const updateTask = async (task: Task): Promise<Task> => {
  try {
    const API_URL = API_BASE_URL;
    
    // If API_BASE_URL is set, try to use the backend API
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      const idToken = await user.getIdToken();
      
      const response = await fetch(`${API_URL}/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (apiError) {
      console.error('Error calling backend API, falling back to Supabase:', apiError);
    }
    
    // Fallback to direct Supabase query
    const { data, error } = await supabase
      .from('tasks')
      .update({
        description: task.title,
        is_complete: task.completed,
        due_date: task.dueDate,
        category: task.category || task.priority,
      })
      .eq('task_id', task.id)
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      id: data.task_id,
      title: data.description,
      completed: data.is_complete,
      dueDate: data.due_date,
      priority: data.category?.includes('high') ? 'high' : 
                data.category?.includes('medium') ? 'medium' : 'low',
      category: data.category,
    };
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    const API_URL = API_BASE_URL;
    
    // If API_BASE_URL is set, try to use the backend API
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');
      const idToken = await user.getIdToken();
      
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        return;
      }
    } catch (apiError) {
      console.error('Error calling backend API, falling back to Supabase:', apiError);
    }
    
    // Fallback to direct Supabase query
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('task_id', taskId);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};
