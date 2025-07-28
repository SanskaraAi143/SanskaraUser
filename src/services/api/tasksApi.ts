import { supabase } from '../supabase/config';
import { v4 as uuidv4 } from 'uuid';

export interface Task {
  task_id: string;
  wedding_id: string;
  title: string;
  description?: string;
  is_complete: boolean;
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  status: 'No Status' | 'To Do' | 'Doing' | 'Done';
  lead_party?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BulkTaskUpdate {
  ids: string[];
  updates: Partial<Omit<Task, 'task_id' | 'wedding_id'>>;
}

export const getUserTasks = async (wedding_id: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('wedding_id', wedding_id);
  if (error) throw error;
  return data || [];
};

/**
 * Adds a new user task to the database.
 * @param wedding_id - The wedding ID
 * @param title - Task title
 * @param description - Task description
 * @param due_date - Due date
 * @param priority - Task priority
 * @param category - Task category
 * @param status - Kanban status ('No Status', 'To Do', 'Doing', 'Done')
 * @param lead_party - The party responsible for the task
 */
export const addUserTask = async (
  wedding_id: string,
  title: string,
  description: string,
  due_date: string,
  priority: 'low' | 'medium' | 'high',
  category?: string,
  status: 'No Status' | 'To Do' | 'Doing' | 'Done' = 'No Status',
  lead_party?: string
) => {
  const { error } = await supabase
    .from('tasks')
    .insert([
      {
        wedding_id,
        title,
        description,
        is_complete: false,
        due_date,
        priority,
        category,
        status,
        lead_party,
      },
    ]);
  if (error) throw error;
};

export const updateUserTask = async (
  task_id: string,
  updates: Partial<Omit<Task, 'task_id' | 'wedding_id'>>
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
