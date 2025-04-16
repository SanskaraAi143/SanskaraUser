
import { supabase } from '../supabase/config';
import { auth } from '../firebase/config';

export interface RitualInfo {
  id: string;
  name: string;
  tradition: string;
  description: string;
  steps: string[];
  significance: string;
  duration: string;
  category: string;
}

// Get API base URL
const getApiBaseUrl = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  return apiBaseUrl;
};

export const getRitualInformation = async (ritualName: string): Promise<RitualInfo> => {
  try {
    const apiBaseUrl = getApiBaseUrl();
    
    // If API_BASE_URL is set, try to use the backend API first
    if (apiBaseUrl) {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');
        const idToken = await user.getIdToken();
        
        const response = await fetch(`${apiBaseUrl}/rituals/${encodeURIComponent(ritualName)}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          return data;
        }
      } catch (apiError) {
        console.error('Error calling backend API, falling back to Supabase:', apiError);
      }
    }
    
    // Fallback to direct Supabase query
    const { data, error } = await supabase
      .from('rituals')
      .select('*')
      .ilike('name', `%${ritualName}%`)
      .single();
      
    if (error) throw error;
    
    return {
      id: data.ritual_id,
      name: data.name,
      tradition: data.tradition,
      description: data.description,
      steps: data.steps,
      significance: data.significance,
      duration: data.duration,
      category: data.category,
    };
  } catch (error) {
    console.error('Error fetching ritual information:', error);
    throw error;
  }
};

export const getSuggestedRituals = async (tradition: string): Promise<RitualInfo[]> => {
  try {
    const apiBaseUrl = getApiBaseUrl();
    
    // If API_BASE_URL is set, try to use the backend API first
    if (apiBaseUrl) {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');
        const idToken = await user.getIdToken();
        
        const response = await fetch(`${apiBaseUrl}/rituals/suggested?tradition=${encodeURIComponent(tradition)}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          return data;
        }
      } catch (apiError) {
        console.error('Error calling backend API, falling back to Supabase:', apiError);
      }
    }
    
    // Fallback to direct Supabase query
    const { data, error } = await supabase
      .from('rituals')
      .select('*')
      .eq('tradition', tradition)
      .limit(5);
      
    if (error) throw error;
    
    return data.map(ritual => ({
      id: ritual.ritual_id,
      name: ritual.name,
      tradition: ritual.tradition,
      description: ritual.description,
      steps: ritual.steps,
      significance: ritual.significance,
      duration: ritual.duration,
      category: ritual.category,
    }));
  } catch (error) {
    console.error('Error fetching suggested rituals:', error);
    throw error;
  }
};

export const searchRituals = async (query: string): Promise<RitualInfo[]> => {
  try {
    const apiBaseUrl = getApiBaseUrl();
    
    // If API_BASE_URL is set, try to use the backend API first
    if (apiBaseUrl) {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');
        const idToken = await user.getIdToken();
        
        const response = await fetch(`${apiBaseUrl}/rituals/search?query=${encodeURIComponent(query)}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          return data;
        }
      } catch (apiError) {
        console.error('Error calling backend API, falling back to Supabase:', apiError);
      }
    }
    
    // Fallback to direct Supabase query
    const { data, error } = await supabase
      .from('rituals')
      .select('*')
      .or(`name.ilike.%${query}%, description.ilike.%${query}%`)
      .limit(10);
      
    if (error) throw error;
    
    return data.map(ritual => ({
      id: ritual.ritual_id,
      name: ritual.name,
      tradition: ritual.tradition,
      description: ritual.description,
      steps: ritual.steps,
      significance: ritual.significance,
      duration: ritual.duration,
      category: ritual.category,
    }));
  } catch (error) {
    console.error('Error searching rituals:', error);
    throw error;
  }
};
