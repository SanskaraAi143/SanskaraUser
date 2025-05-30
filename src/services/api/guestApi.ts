// Guests API for Supabase
import { supabase } from '../supabase/config';
import { v4 as uuidv4 } from 'uuid';

export type Guest = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  relation: string;
  side: 'bride' | 'groom' | 'both';
  status: 'invited' | 'confirmed' | 'declined' | 'pending';
  diet?: string;
  plus_one: boolean;
  notes?: string;
  created_at?: string;
};

export const getGuests = async (userId: string): Promise<Guest[]> => {
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data || [];
};

export const addGuest = async (guest: Omit<Guest, 'id'|'created_at'>) => {
  const { data, error } = await supabase
    .from('guests')
    .insert([{ ...guest, id: uuidv4(), created_at: new Date().toISOString() }]);
  if (error) throw error;
  return data;
};

export const updateGuest = async (guest: Guest) => {
  const { data, error } = await supabase
    .from('guests')
    .update(guest)
    .eq('id', guest.id);
  if (error) throw error;
  return data;
};

export const deleteGuest = async (id: string) => {
  const { error } = await supabase
    .from('guests')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};
