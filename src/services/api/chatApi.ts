
import { supabase } from '../supabase/config';
import { auth } from '../firebase/config';

// Define types
export interface ChatMessage {
  id: string;
  message: string;
  sender_type: 'user' | 'assistant' | 'system' | 'tool';
  sender_name: string;
  content: {
    type: string;
    text?: string;
    data?: any;
  };
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  summary: string | null;
  created_at: Date;
  last_updated_at: Date;
}

// Get user ID from current auth
const getCurrentUserId = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  
  // Get internal user_id from Supabase based on firebase_uid
  const { data, error } = await supabase
    .from('users')
    .select('user_id')
    .eq('firebase_uid', user.uid)
    .single();
    
  if (error) throw error;
  return data.user_id;
};

// API functions
export const sendChatMessage = async (
  message: string,
  sessionId?: string,
  category?: string
): Promise<{ messages: ChatMessage[], session_id: string }> => {
  try {
    // Get the Firebase ID token
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    const idToken = await user.getIdToken();
    
    // For now, we're simulating the backend API call that would use AutoGen
    // In production, this would be a real API call to your Python backend
    
    // Create mock response (this would come from your Python backend)
    const mockResponse = {
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
        },
      ],
      session_id: sessionId || crypto.randomUUID(),
    };
    
    // In a real implementation, you would:
    // 1. Call your Python backend API with the message, sessionId, and idToken
    // 2. The backend would use AutoGen to process the message
    // 3. Return structured response data
    
    return mockResponse as { messages: ChatMessage[], session_id: string };
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

export const getChatSessions = async (): Promise<ChatSession[]> => {
  try {
    const userId = await getCurrentUserId();
    
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('session_id, summary, created_at, last_updated_at')
      .eq('user_id', userId)
      .order('last_updated_at', { ascending: false });
      
    if (error) throw error;
    
    return data.map(session => ({
      id: session.session_id,
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
