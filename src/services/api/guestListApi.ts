import { supabase } from "../supabase/config";
import { useQuery } from "@tanstack/react-query";

export interface Household {
  household_id: string;
  wedding_id: string;
  household_name: string;
  address?: string;
  contact_info?: string; // e.g., for primary contact of the household
  created_at?: string;
  updated_at?: string;
}

export interface Guest {
  guest_id: string;
  wedding_id: string;
  household_id?: string; // Link to a household
  guest_name: string;
  contact_info?: string;
  relation?: string;
  side?: 'Groom' | 'Bride' | 'Both' | string;
  // rsvp_status will be an object mapping event names to their status
  rsvp_status?: Record<string, 'Pending' | 'Invited' | 'Confirmed' | 'Declined' | string>;
  dietary_requirements?: string;
  tags?: string[]; // New field for advanced filtering
  created_at?: string;
  updated_at?: string;
}

export async function fetchGuestList(weddingId: string): Promise<Guest[]> {
  const { data, error } = await supabase
    .from('guest_list')
    .select('*')
    .eq('wedding_id', weddingId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export const useGuestList = (weddingId: string) => {
  return useQuery<Guest[], Error>({
    queryKey: ['guestList', weddingId],
    queryFn: () => fetchGuestList(weddingId),
    enabled: !!weddingId,
  });
};

// Household API functions
export async function fetchHouseholds(weddingId: string): Promise<Household[]> {
  const { data, error } = await supabase
    .from('households')
    .select('*')
    .eq('wedding_id', weddingId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addHousehold(household: Omit<Household, 'household_id' | 'created_at' | 'updated_at'>): Promise<Household> {
  const { data, error } = await supabase
    .from('households')
    .insert([household])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateHousehold(household_id: string, updates: Partial<Household>): Promise<Household> {
  const { data, error } = await supabase
    .from('households')
    .update(updates)
    .eq('household_id', household_id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeHousehold(household_id: string): Promise<void> {
  const { error } = await supabase
    .from('households')
    .delete()
    .eq('household_id', household_id);
  if (error) throw error;
}

// Guest API functions
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
};
