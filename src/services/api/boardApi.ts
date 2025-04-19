import { supabase } from '../supabase/config';
import { v4 as uuidv4 } from 'uuid';

export interface MoodBoard {
  mood_board_id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export const getUserMoodBoards = async (user_id: string): Promise<MoodBoard[]> => {
  const { data, error } = await supabase
    .from('mood_boards')
    .select('*')
    .eq('user_id', user_id);
  if (error) throw error;
  return data || [];
};

export const createMoodBoard = async (user_id: string, name: string) => {
  const { data, error } = await supabase
    .from('mood_boards')
    .insert([{ mood_board_id: uuidv4(), user_id, name }])
    .select();
  if (error) throw error;
  return data ? data[0] : null;
};
