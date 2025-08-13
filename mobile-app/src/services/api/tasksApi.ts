import { supabase } from '../supabase/config';
import { v4 as uuidv4 } from 'uuid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
  lead_party?: 'bride_side' | 'groom_side' | 'couple' | 'shared' | null;
  created_at?: string;
  updated_at?: string;
}

export interface BulkTaskUpdate {
  ids: string[];
  updates: Partial<Omit<Task, 'task_id' | 'wedding_id'>>;
}

export const useUserTasks = (wedding_id: string) => {
  return useQuery<Task[], Error>({
    queryKey: ['tasks', wedding_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('wedding_id', wedding_id);
      if (error) throw error;
      return data || [];
    },
  });
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
export const useAddUserTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      wedding_id,
      title,
      description,
      due_date,
      priority,
      category,
      status = 'No Status',
      lead_party,
    }: {
      wedding_id: string;
      title: string;
      description: string;
      due_date: string;
      priority: 'low' | 'medium' | 'high';
      category?: string;
      status?: 'No Status' | 'To Do' | 'Doing' | 'Done';
      lead_party?: 'bride_side' | 'groom_side' | 'couple' | 'shared' | string;
    }) => {
      const { error } = await supabase.from('tasks').insert([
        {
          wedding_id,
          title,
          description,
          is_complete: false,
          due_date,
          priority,
          category,
          status,
          lead_party: lead_party === "" ? null : lead_party, // Handle empty string for lead_party
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateUserTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      task_id,
      updates,
    }: {
      task_id: string;
      updates: Partial<Omit<Task, 'task_id' | 'wedding_id'>>;
    }) => {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('task_id', task_id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useBulkUpdateTasks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids, updates }: BulkTaskUpdate) => {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .in('task_id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useBulkDeleteTasks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .in('task_id', ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useRemoveUserTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (task_id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('task_id', task_id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
