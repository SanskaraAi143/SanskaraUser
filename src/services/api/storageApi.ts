import { supabase } from '../supabase/config';

export const uploadMoodboardImage = async (userId: string, file: File) => {
  if (!file.type || !file.type.startsWith('image/')) {
    console.error('Rejected file type:', file.type);
    throw new Error('Only image files are allowed');
  }
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;
  const { data, error } = await supabase.storage
    .from('moodboard-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });
  if (error) {
    console.error('Supabase upload error:', error.message, error);
    throw new Error(`Supabase upload failed: ${error.message}`);
  }
  // Get the public URL
  const { publicUrl } = supabase.storage.from('moodboard-images').getPublicUrl(fileName).data;
  return publicUrl;
};
