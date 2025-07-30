import { supabase } from "../supabase/config";
import { useQuery } from "@tanstack/react-query";

export interface Guest {
  guest_id: string;
  wedding_id: string;
  guest_name: string;
  contact_info?: string;
  relation?: string;
  side?: 'Groom' | 'Bride' | 'Both' | string;
  status?: 'Pending' | 'Invited' | 'Confirmed' | 'Declined' | string;
  dietary_requirements?: string;
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
