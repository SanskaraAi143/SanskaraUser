import { supabase } from '../supabase/config';
import { v4 as uuidv4 } from 'uuid';

export interface Task {
  task_id: string;
  user_id: string;
  title: string;
  description?: string;
  is_complete: boolean;
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  status: 'No Status' | 'To Do' | 'Doing' | 'Done';
  created_at?: string;
  updated_at?: string;
}

export interface BulkTaskUpdate {
  ids: string[];
  updates: Partial<Omit<Task, 'id' | 'user_id'>>;
}

export const getUserTasks = async (user_id: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user_id);
  if (error) throw error;
  return data || [];
};

/**
 * Adds a new user task to the database.
 * @param user_id - The user ID
 * @param title - Task title
 * @param description - Task description
 * @param due_date - Due date
 * @param priority - Task priority
 * @param category - Task category
 * @param status - Kanban status ('No Status', 'To Do', 'Doing', 'Done')
 */
export const addUserTask = async (
  user_id: string,
  title: string,
  description: string,
  due_date: string,
  priority: 'low' | 'medium' | 'high',
  category?: string,
  status: 'No Status' | 'To Do' | 'Doing' | 'Done' = 'No Status'
) => {
  const { error } = await supabase
    .from('tasks')
    .insert([
      {
        task_id: uuidv4(),
        user_id,
        title,
        description,
        is_complete: false,
        due_date,
        priority,
        category,
        status,
      },
    ]);
  if (error) throw error;
};

export const updateUserTask = async (
  task_id: string,
  updates: Partial<Omit<Task, 'task_id' | 'user_id'>>
) => {
  const { error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('task_id', task_id);
  if (error) throw error;
};

export const bulkUpdateTasks = async ({ ids, updates }: BulkTaskUpdate) => {
  const { error } = await supabase
    .from('tasks')
    .update(updates)
    .in('task_id', ids);
  if (error) throw error;
};

export const bulkDeleteTasks = async (ids: string[]) => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .in('task_id', ids);
  if (error) throw error;
};

export const removeUserTask = async (task_id: string) => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('task_id', task_id);
  if (error) throw error;
};
