import { supabase } from '../supabase/config';

export interface UserProfile {
  user_id: string;
  supabase_auth_uid: string;
  email: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
  wedding_date: string | null;
  wedding_location: string | null;
  wedding_tradition: string | null;
  preferences: any;
}

// Fetch current user's profile (by supabase_auth_uid)
export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw new Error('User not authenticated');
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('supabase_auth_uid', authData.user.id)
    .single();
  if (error) throw error;
  return data || null;
};

// Update current user's profile (by supabase_auth_uid)
export const updateCurrentUserProfile = async (updates: Partial<UserProfile>) => {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw new Error('User not authenticated');
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('supabase_auth_uid', authData.user.id);
  if (error) throw error;
};
