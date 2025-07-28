import { supabase } from '../supabase/config';
import { v4 as uuidv4 } from 'uuid';

export interface MoodBoardItem {
  item_id: string;
  mood_board_id: string;
  image_url: string;
  note: string;
  category: string;
  visibility?: string;
  owner_party?: string;
  created_at: string;
}

export const getMoodBoardItems = async (mood_board_id: string, category?: string): Promise<MoodBoardItem[]> => {
  let query = supabase
    .from('mood_board_items')
    .select('*')
    .eq('mood_board_id', mood_board_id);
  if (category) {
    query = query.eq('category', category);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export interface AddMoodBoardItemOptions {
  mood_board_id: string;
  image_url: string;
  note: string;
  category: string;
  visibility?: string;
  owner_party?: string;
}

export const addMoodBoardItem = async (options: AddMoodBoardItemOptions) => {
  const { mood_board_id, image_url, note, category, visibility, owner_party } = options;
  const { error } = await supabase
    .from('mood_board_items')
    .insert([{ item_id: uuidv4(), mood_board_id, image_url, note, category, visibility, owner_party }]);
  if (error) throw error;
};

export const deleteMoodBoard = async (mood_board_id: string) => {
  // Delete all items in the mood board
  const { error: itemsError } = await supabase
    .from('mood_board_items')
    .delete()
    .eq('mood_board_id', mood_board_id);
  if (itemsError) throw itemsError;

  // Delete the mood board itself
  const { error: boardError } = await supabase
    .from('mood_boards')
    .delete()
    .eq('mood_board_id', mood_board_id);
  if (boardError) throw boardError;
};

export const removeMoodBoardItem = async (item_id: string) => {

  const { error } = await supabase
    .from('mood_board_items')
    .delete()
    .eq('item_id', item_id);
  if (error) throw error;
};
