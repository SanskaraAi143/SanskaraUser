
import { supabase } from '../supabase/config';


// Define types
export interface ChatMessage {
  id: string;
  message: string;
  sender_type: 'user' | 'assistant' | 'system' | 'tool';
  sender_name: string;
  content: {
    type: string;
    text?: string;
    data?: unknown;
  };
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  wedding_id: string;
  summary: ChatSessionSummary; // Use a specific type for summary
  created_at: Date;
  last_updated_at: Date;
}

// Define the expected structure for summary
export interface ChatSessionSummary {
  // Add fields as per your summary JSONB structure, for example:
  topic?: string;
  participants?: string[];
  lastMessagePreview?: string;
  [key: string]: any; // Remove or refine as needed for stricter typing
}

// Get user ID from current auth
const getCurrentUserId = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  
  // Get internal user_id from Supabase based on supabase user id
  const { data, error } = await supabase
    .from('users')
    .select('user_id')
    .eq('supabase_auth_uid', user.id)
    .single();
    
  if (error) throw error;
  return data.user_id;
};

// API functions
export const sendChatMessage = async (
  message: string,
  weddingId: string,
  sessionId?: string,
  category?: string
): Promise<{ messages: ChatMessage[], session_id: string }> => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    if (!API_BASE_URL) {
      throw new Error('API_BASE_URL environment variable is not set');
    }
    
    // Get the Supabase access token if needed
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    const idToken = await user.getIdToken();
    
    // Prepare request to AutoGen-powered backend
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        wedding_id: weddingId,
        session_id: sessionId,
        category
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Error sending chat message:', error);
    
    // For development without backend, return mock data
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock data for development');
      return {
        messages: [
          {
            id: crypto.randomUUID(),
            sender_type: 'assistant',
            sender_name: 'PlannerAgent',
            content: {
              type: 'text',
              text: `I understand you're asking about "${message}". Let me help you with that!`,
            },
            timestamp: new Date(),
            message: `I understand you're asking about "${message}". Let me help you with that!`,
          },
        ],
        session_id: sessionId || crypto.randomUUID(),
      };
    }
    
    throw error;
  }
};

export const getChatSessions = async (weddingId: string): Promise<ChatSession[]> => {
  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('session_id, summary, created_at, last_updated_at')
      .eq('wedding_id', weddingId)
      .order('last_updated_at', { ascending: false });
      
    if (error) throw error;
    
    return data.map(session => ({
      id: session.session_id,
      wedding_id: session.wedding_id,
      summary: session.summary,
      created_at: new Date(session.created_at),
      last_updated_at: new Date(session.last_updated_at),
    }));
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    throw error;
  }
};

export const getChatMessages = async (sessionId: string): Promise<ChatMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('message_id, sender_type, sender_name, content, timestamp')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true });
      
    if (error) throw error;
    
    return data.map(message => ({
      id: message.message_id,
      sender_type: message.sender_type,
      sender_name: message.sender_name,
      content: message.content,
      timestamp: new Date(message.timestamp),
      message: message.content.text || '', // For backward compatibility
    }));
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    throw error;
  }
};
