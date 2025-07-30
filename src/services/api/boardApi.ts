import { supabase } from '../supabase/config';
import { v4 as uuidv4 } from 'uuid';

export interface MoodBoard {
  mood_board_id: string;
  wedding_id: string;
  name: string;
  visibility?: string;
  owner_party?: string;
  created_at: string;
  updated_at: string;
}

export interface MoodBoardItem {
  item_id: string;
  mood_board_id: string;
  image_url: string;
  note: string;
  category: string;
  created_at: string;
  visibility: string; // Make visibility required for MoodBoardItem
  owner_party: string; // Make owner_party required for MoodBoardItem
}

export const getUserMoodBoards = async (wedding_id: string): Promise<MoodBoard[]> => {
  const { data, error } = await supabase
    .from('mood_boards')
    .select('*')
    .eq('wedding_id', wedding_id);
  if (error) throw error;
  return data || [];
};

export const updateMoodBoard = async (mood_board_id: string, updates: Partial<MoodBoard>) => {
  const { data, error } = await supabase
    .from('mood_boards')
    .update(updates)
    .eq('mood_board_id', mood_board_id)
    .select();
  if (error) throw error;
  return data ? data[0] : null;
};

export const deleteMoodBoard = async (mood_board_id: string) => {
  const { error } = await supabase
    .from('mood_boards')
    .delete()
    .eq('mood_board_id', mood_board_id);
  if (error) throw error;
  return true;
};

export const createMoodBoard = async (wedding_id: string, name: string, visibility?: string, owner_party?: string) => {
  const { data, error } = await supabase
    .from('mood_boards')
    .insert([{ wedding_id, name, visibility, owner_party }])
    .select();
  if (error) throw error;
  return data ? data[0] : null;
};
