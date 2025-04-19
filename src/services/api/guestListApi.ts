import { supabase } from './supabaseClient';

export interface Guest {
  guest_id: string;
  user_id: string;
  guest_name: string;
  contact_info?: string;
  relation?: string;
  side?: 'Groom' | 'Bride' | 'Both' | string;
  status?: 'Pending' | 'Invited' | 'Confirmed' | 'Declined' | string;
  dietary_requirements?: string;
  created_at?: string;
  updated_at?: string;
}

export async function fetchGuestList(userId: string): Promise<Guest[]> {
  const { data, error } = await supabase
    .from('guest_list')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addGuest(guest: Omit<Guest, 'guest_id' | 'created_at' | 'updated_at'>): Promise<Guest> {
  const { data, error } = await supabase
    .from('guest_list')
    .insert([guest])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateGuest(guest_id: string, updates: Partial<Guest>): Promise<Guest> {
  const { data, error } = await supabase
    .from('guest_list')
    .update(updates)
    .eq('guest_id', guest_id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeGuest(guest_id: string): Promise<void> {
  const { error } = await supabase
    .from('guest_list')
    .delete()
    .eq('guest_id', guest_id);
  if (error) throw error;
}
