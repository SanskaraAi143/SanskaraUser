
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lylsxoupakajkuisjdfl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5bHN4b3VwYWthamJreWthdXNqZGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODIwNzEwMDIsImV4cCI6MTk5NzY0NzAwMn0.n93-AvlXlK1y7L3vLu0OLo6axV91Jk3Xc2Xak4T91qs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  name?: string;
  email?: string;
  avatar_url?: string;
};

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error || !data) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return data;
}

export async function updateProfile(profile: Partial<Profile> & { id: string }): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      name: profile.name,
      avatar_url: profile.avatar_url,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id);
  
  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}
