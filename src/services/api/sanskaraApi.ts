
import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Configure axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API interfaces
export interface ChatMessage {
  message: string;
  sender: 'user' | 'ai';
  category?: string;
  timestamp?: Date;
}

export interface RitualInfo {
  name: string;
  description: string;
  steps: string[];
  significance: string;
  duration: string;
  category: string;
}

// API functions
export const sendChatMessage = async (message: string, userId: string, category?: string): Promise<ChatMessage> => {
  try {
    const response = await api.post('/chat', { 
      message, 
      userId,
      category: category || 'general'
    });
    return response.data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

export const getRitualInformation = async (ritualName: string): Promise<RitualInfo> => {
  try {
    const response = await api.get(`/rituals/${encodeURIComponent(ritualName)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ritual information:', error);
    throw error;
  }
};

export const getSuggestedRituals = async (weddingType: string): Promise<RitualInfo[]> => {
  try {
    const response = await api.get('/rituals/suggested', {
      params: { weddingType }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching suggested rituals:', error);
    throw error;
  }
};

// Export default API instance for custom requests
export default api;
