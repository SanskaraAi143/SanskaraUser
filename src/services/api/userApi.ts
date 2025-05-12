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

// Fetch current user's profile (by internal user_id from AuthContext)
export const getCurrentUserProfile = async (user_id: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', user_id)
    .single();
  if (error) throw error;
  return data || null;
};

// Update current user's profile (by internal user_id from AuthContext)
export const updateCurrentUserProfile = async (user_id: string, updates: Partial<UserProfile>) => {
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('user_id', user_id);
  if (error) throw error;
};
