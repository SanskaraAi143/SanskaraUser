
import { supabase } from '../supabase/config';
import { logError, ApiError } from '../../utils/errorLogger';
import { toast } from '../../hooks/use-toast';


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
  // TODO: Refine or remove the index signature for stricter typing if possible
  [key: string]: unknown;
}

// Get user ID from current auth

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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('User not authenticated');
    const idToken = session.access_token;
    
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
  } catch (error: any) {
    logError(error, { context: 'sendChatMessage', message: message, weddingId: weddingId, sessionId: sessionId });
    toast({
      title: "Error sending message",
      description: error instanceof ApiError ? error.message : "An unexpected error occurred.",
      variant: "destructive",
    });

    // For development without backend, return mock data
    if (process.env.NODE_ENV === 'development' && !(error instanceof ApiError)) {
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
    
    throw new ApiError(`Failed to send chat message: ${error.message || 'Unknown error'}`, (error as { response?: { status: number } }).response?.status || 500, error);
  }
};

export const getChatSessions = async (weddingId: string): Promise<ChatSession[]> => {
  try {
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('session_id, wedding_id, summary, created_at, last_updated_at')
      .eq('wedding_id', weddingId)
      .order('last_updated_at', { ascending: false });
      
    if (error) throw new ApiError(`Failed to fetch chat sessions: ${error.message}`, 500, error);
    
    return data.map((session: { session_id: string; summary: ChatSessionSummary; created_at: string; last_updated_at: string; wedding_id: string; }) => ({
      id: session.session_id,
      wedding_id: session.wedding_id,
      summary: session.summary,
      created_at: new Date(session.created_at),
      last_updated_at: new Date(session.last_updated_at),
    }));
  } catch (error: any) {
    logError(error, { context: 'getChatSessions', weddingId: weddingId });
    toast({
      title: "Error fetching chat sessions",
      description: error instanceof ApiError ? error.message : "Could not load chat history.",
      variant: "destructive",
    });
    throw error; // Re-throw to propagate error for further handling if needed
  }
};

export const getChatMessages = async (sessionId: string): Promise<ChatMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('message_id, sender_type, sender_name, content, timestamp')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true });
      
    if (error) throw new ApiError(`Failed to fetch chat messages: ${error.message}`, 500, error);
    
    return data.map(message => ({
      id: message.message_id,
      sender_type: message.sender_type,
      sender_name: message.sender_name,
      content: message.content,
      timestamp: new Date(message.timestamp),
      message: message.content.text || '', // For backward compatibility
    }));
  } catch (error: any) {
    logError(error, { context: 'getChatMessages', sessionId: sessionId });
    toast({
      title: "Error fetching messages",
      description: error instanceof ApiError ? error.message : "Could not load messages.",
      variant: "destructive",
    });
    throw error; // Re-throw to propagate error for further handling if needed
  }
};
