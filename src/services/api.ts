
import axios from 'axios';

// Set the API base URL to your Python backend
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.sanskara-ai.com/api'  // Replace with your actual production API URL
  : 'http://localhost:5000/api';       // Replace with your actual development API URL

// Create an axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Chat API
export const getSanskaraAIResponse = async (message: string, category: string = 'general') => {
  try {
    const response = await api.post('/chat', { message, category });
    return response.data;
  } catch (error) {
    console.error('Error fetching AI response:', error);
    throw error;
  }
};

// Ritual information API
export const getRitualInformation = async (ritualName: string) => {
  try {
    const response = await api.get(`/rituals/${ritualName}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ritual information:', error);
    throw error;
  }
};

// Calendar and date recommendation API
export const getAuspiciousDates = async (startDate: string, endDate: string) => {
  try {
    const response = await api.get('/dates/auspicious', {
      params: { start_date: startDate, end_date: endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching auspicious dates:', error);
    throw error;
  }
};

// Vendor recommendation API
export const getVendorRecommendations = async (
  category: string,
  location: string,
  budget?: number
) => {
  try {
    const response = await api.get('/vendors/recommend', {
      params: { category, location, budget }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching vendor recommendations:', error);
    throw error;
  }
};

// Guest list analysis
export const analyzeGuestList = async (guests: any[]) => {
  try {
    const response = await api.post('/guests/analyze', { guests });
    return response.data;
  } catch (error) {
    console.error('Error analyzing guest list:', error);
    throw error;
  }
};

// Budget optimization
export const optimizeBudget = async (
  totalBudget: number,
  expenses: any[],
  priorities: string[]
) => {
  try {
    const response = await api.post('/budget/optimize', {
      total_budget: totalBudget,
      expenses,
      priorities
    });
    return response.data;
  } catch (error) {
    console.error('Error optimizing budget:', error);
    throw error;
  }
};

// General text processing/generation (for invitations, vows, etc.)
export const generateText = async (
  type: 'invitation' | 'vow' | 'speech',
  parameters: Record<string, any>
) => {
  try {
    const response = await api.post('/generate/text', {
      type,
      parameters
    });
    return response.data;
  } catch (error) {
    console.error('Error generating text:', error);
    throw error;
  }
};

// Sentiment analysis for guest comments
export const analyzeSentiment = async (text: string) => {
  try {
    const response = await api.post('/analyze/sentiment', { text });
    return response.data;
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    throw error;
  }
};

// Image analysis for mood board suggestions
export const analyzeImage = async (imageUrl: string) => {
  try {
    const response = await api.post('/analyze/image', { image_url: imageUrl });
    return response.data;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
};

// Generate color palette from image
export const generateColorPalette = async (imageUrl: string) => {
  try {
    const response = await api.post('/generate/color-palette', { image_url: imageUrl });
    return response.data;
  } catch (error) {
    console.error('Error generating color palette:', error);
    throw error;
  }
};

export default api;
