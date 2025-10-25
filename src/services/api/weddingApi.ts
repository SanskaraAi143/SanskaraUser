import { supabase } from '../supabase/config';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface WeddingDetails {
  wedding_id: string;
  wedding_date: string;
  wedding_location: string;
  wedding_tradition: string;
  wedding_name?: string;
  wedding_style?: string;
  status?: string;
  details?: Record<string, any> | null;
  total_budget?: number; // Added total_budget property
}

export const getWeddingDetails = async (weddingId: string): Promise<WeddingDetails | null> => {
  const { data, error } = await supabase
    .from('weddings')
  .select('wedding_id, wedding_name, wedding_date, wedding_location, wedding_tradition, wedding_style, status, details, total_budget')
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

export const updateWeddingBudget = async (weddingId: string, totalBudget: number) => {
  const { data, error } = await supabase
    .from('weddings')
    .update({ total_budget: totalBudget })
    .eq('wedding_id', weddingId);

  if (error) {
    throw error;
  }

  return data;
};

export const useUpdateWeddingBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ weddingId, totalBudget }: { weddingId: string, totalBudget: number }) => updateWeddingBudget(weddingId, totalBudget),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weddingDetails'] });
    },
  });
};