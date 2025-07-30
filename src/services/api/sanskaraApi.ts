
import axios from 'axios';
import { BASE_API_URL } from '../../config/api';
import { logError, ApiError } from '../../utils/errorLogger';
import { toast } from '../../hooks/use-toast';

// Configure axios instance
const api = axios.create({
  baseURL: BASE_API_URL,
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
  } catch (error: any) {
    logError(error, { context: 'sanskaraApi:sendChatMessage', message, userId, category });
    toast({
      title: "Error sending chat message",
      description: error instanceof ApiError ? error.message : "An unexpected error occurred.",
      variant: "destructive",
    });
    throw error;
  }
};

export const getRitualInformation = async (ritualName: string): Promise<RitualInfo> => {
  try {
    const response = await api.get(`/rituals/${encodeURIComponent(ritualName)}`);
    return response.data;
  } catch (error: any) {
    logError(error, { context: 'sanskaraApi:getRitualInformation', ritualName });
    toast({
      title: "Error fetching ritual information",
      description: error instanceof ApiError ? error.message : "An unexpected error occurred.",
      variant: "destructive",
    });
    throw error;
  }
};

export const getSuggestedRituals = async (weddingType: string): Promise<RitualInfo[]> => {
  try {
    const response = await api.get('/rituals/suggested', {
      params: { weddingType }
    });
    return response.data;
  } catch (error: any) {
    logError(error, { context: 'sanskaraApi:getSuggestedRituals', weddingType });
    toast({
      title: "Error fetching suggested rituals",
      description: error instanceof ApiError ? error.message : "An unexpected error occurred.",
      variant: "destructive",
    });
    throw error;
  }
};



// Export default API instance for custom requests
export default api;
