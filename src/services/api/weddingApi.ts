import { supabase } from '../supabase/config';
import { useQuery } from '@tanstack/react-query';

export interface WeddingDetails {
  wedding_id: string;
  wedding_date: string;
  wedding_location: string;
  wedding_tradition: string;
  wedding_name?: string;
  wedding_style?: string;
  status?: string;
  details?: Record<string, any> | null;
}

export const getWeddingDetails = async (weddingId: string): Promise<WeddingDetails | null> => {
  const { data, error } = await supabase
    .from('weddings')
  .select('wedding_id, wedding_name, wedding_date, wedding_location, wedding_tradition, wedding_style, status, details')
    .eq('wedding_id', weddingId)
    .single();
  if (error) throw error;
  return data || null;
};

export const useWeddingDetails = (weddingId: string) => {
  return useQuery<WeddingDetails | null, Error>({
    queryKey: ['weddingDetails', weddingId],
    queryFn: () => getWeddingDetails(weddingId),
    enabled: !!weddingId,
  });
};