// Budget and Expenses API for Supabase
import { supabase } from '../supabase/config';
import { v4 as uuidv4 } from 'uuid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export type Budget = {
  id: string;
  user_id: string;
  total_budget: number;
  created_at?: string;
};

export type ExpenseStatus = 'Quote Received' | 'Deposit Paid' | 'Paid in Full';

export type Expense = {
  item_id: string;
  wedding_id: string;
  item_name: string;
  category: string;
  estimated_cost?: number;
  actual_cost?: number;
  amount_paid: number; // This will be the main amount field
  vendor_name: string;
  status: ExpenseStatus; // Updated: 'Quote Received', 'Deposit Paid', or 'Paid in Full'
  paid_by?: string; // e.g., 'Bride\'s Father', 'Groom', 'Couple\'s Joint Account'
  attachments?: string[]; // URLs to invoices or receipts
  contribution_by?: string; // 'bride_side', 'groom_side', 'shared'
  created_at?: string;
  updated_at?: string;
};

// Fetch the user's budget_max from the preferences JSONB column in users table
export const getUserBudgetMax = async (userId: string): Promise<number | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('preferences')
    .eq('user_id', userId)
    .single();
  if (error || !data) return null;
  try {
    const prefs = data.preferences || {};
    return typeof prefs.budget_max === 'number' ? prefs.budget_max : prefs.budget_max ? parseFloat(prefs.budget_max) : null;
  } catch {
    return null;
  }
};

export const useUserBudgetMax = (userId: string) => {
  return useQuery<number | null, Error>({
    queryKey: ['userBudgetMax', userId],
    queryFn: () => getUserBudgetMax(userId),
    enabled: !!userId,
  });
};

// Update the user's budget_max in the preferences JSONB column in users table
export const updateUserBudgetMax = async (userId: string, budgetMax: number) => {
  // Fetch current preferences
  const { data, error } = await supabase
    .from('users')
    .select('preferences')
    .eq('user_id', userId)
    .single();
  if (error || !data) throw error || new Error('User not found');
  const preferences = data.preferences || {};
  preferences.budget_max = budgetMax;
  const { error: updateError } = await supabase
    .from('users')
    .update({ preferences })
    .eq('user_id', userId);
  if (updateError) throw updateError;
  return true;
};

export const useUpdateUserBudgetMax = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, budgetMax }: { userId: string, budgetMax: number }) => updateUserBudgetMax(userId, budgetMax),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBudgetMax'] });
    },
  });
};

export const getExpenses = async (weddingId: string): Promise<Expense[]> => {
  const { data, error } = await supabase
    .from('budget_items')
    .select('*')
    .eq('wedding_id', weddingId);
  if (error) throw error;
  return data || [];
};

export const useExpenses = (weddingId: string) => {
  return useQuery<Expense[], Error>({
    queryKey: ['expenses', weddingId],
    queryFn: () => getExpenses(weddingId),
    enabled: !!weddingId,
  });
};

export const addExpense = async (expense: Omit<Expense, 'item_id'|'created_at'|'updated_at'>) => {
  const { data, error } = await supabase
    .from('budget_items')
    .insert([{ ...expense, item_id: uuidv4(), created_at: new Date().toISOString() }]);
  if (error) throw error;
  return data;
};

export const useAddExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (expense: Omit<Expense, 'item_id'|'created_at'|'updated_at'>) => addExpense(expense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
};

export const updateExpense = async (expense: Expense) => {
  const { data, error } = await supabase
    .from('budget_items')
    .update(expense)
    .eq('item_id', expense.item_id);
  if (error) throw error;
  return data;
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (expense: Expense) => updateExpense(expense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
};

export const deleteExpense = async (id: string) => {
  const { error } = await supabase
    .from('budget_items')
    .delete()
    .eq('item_id', id);
  if (error) throw error;
  return true;
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
};
