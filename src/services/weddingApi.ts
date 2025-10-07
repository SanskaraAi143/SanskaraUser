import { supabase } from './supabase/config';
import { useAuth } from '@/context/AuthContext';

export const inviteCollaborator = async (weddingId: string, email: string) => {
  if (!weddingId || !email) {
    throw new Error('Wedding ID and email are required.');
  }

  const { data, error } = await supabase.rpc('invite_wedding_collaborator', {
    p_wedding_id: weddingId,
    p_invitee_email: email,
    p_role: 'collaborator' // Or another default role
  });

  if (error) {
    console.error('Error inviting collaborator:', error);
    throw new Error(error.message || 'An unexpected error occurred.');
  }

  return data;
};