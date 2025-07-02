import { supabase } from '../supabase/config';

// --- START: Types for User-Vendor Chat ---
export type ChatParticipant = {
  id: string; // internal user_id or vendor_id
  name: string;
  type: 'user' | 'vendor';
};

export type ChatMessageContent =
  | { type: 'text'; text: string; }
  | { type: 'image'; imageUrl: string; altText?: string; };

export type UserChatMessage = {
  messageId: string; // maps to message_id in DB
  sessionId: string; // maps to session_id in DB
  sender: ChatParticipant; // Constructed based on sender_type and sender_name from DB
  content: ChatMessageContent; // maps to content in DB
  timestamp: string; // ISO string format
};

export type UserChatSession = {
  sessionId: string; // maps to session_id in DB
  lastMessage: UserChatMessage | null; // Needs to be constructed
  otherParticipant: ChatParticipant; // The other person in the chat
  unreadCount?: number; // Optional, for future use
  lastUpdatedAt: string; // ISO string format, maps to last_updated_at
};
// --- END: Types for User-Vendor Chat ---


// --- START: API Functions for User-Vendor Chat ---

export const initiateChat = async (
  currentUserId: string, // internal user_id of the initiator (customer)
  vendorId: string
): Promise<{ sessionId: string }> => {
  // First, check if a session already exists
  let { data: existingSession, error: existingError } = await supabase
    .from('chat_sessions')
    .select('session_id')
    .eq('user_id', currentUserId)
    .eq('vendor_id', vendorId)
    .single();

  if (existingError && existingError.code !== 'PGRST116') { // PGRST116: no rows found
    console.error('Error checking for existing chat session:', existingError);
    throw existingError;
  }

  if (existingSession) {
    return { sessionId: existingSession.session_id };
  }

  // If not, create a new session
  const { data: newSession, error: newSessionError } = await supabase
    .from('chat_sessions')
    .insert({ user_id: currentUserId, vendor_id: vendorId })
    .select('session_id')
    .single();

  if (newSessionError) {
    console.error('Error creating new chat session:', newSessionError);
    throw newSessionError;
  }
  if (!newSession) {
    throw new Error('Failed to create or retrieve chat session.');
  }
  return { sessionId: newSession.session_id };
};

export const getChatSessions = async (
  userId: string, // internal user_id of the logged-in user
  isUserVendor: boolean, // is the logged-in user a vendor?
  loggedInEntityId: string // if isUserVendor, this is vendor_id, else it's user_id
): Promise<UserChatSession[]> => {
  try {
    let query = supabase
      .from('chat_sessions')
      .select(`
        session_id,
        last_updated_at,
        user:users!chat_sessions_user_id_fkey(user_id, display_name),
        vendor:vendors!chat_sessions_vendor_id_fkey(vendor_id, vendor_name),
        chat_messages(
          message_id,
          sender_type,
          sender_name,
          content,
          timestamp
        )
      `)
      .order('timestamp', { foreignTable: 'chat_messages', ascending: false }) // Get latest message first
      // .limit(1, { foreignTable: 'chat_messages' }); // This is tricky with Supabase, might need post-processing

    if (isUserVendor) {
      query = query.eq('vendor_id', loggedInEntityId);
    } else {
      query = query.eq('user_id', loggedInEntityId);
    }

    query = query.order('last_updated_at', { ascending: false });


    const { data: sessionsData, error } = await query;

    if (error) throw error;

    return sessionsData.map(s => {
      const lastDbMessage = s.chat_messages && s.chat_messages.length > 0 ? s.chat_messages[0] : null;
      let lastUserChatMessage: UserChatMessage | null = null;
      if (lastDbMessage && lastDbMessage.content) {
        lastUserChatMessage = {
          messageId: lastDbMessage.message_id,
          sessionId: s.session_id,
          // Determine sender for last message
          sender: lastDbMessage.sender_type === 'user'
            ? { id: s.user.user_id, name: s.user.display_name || 'User', type: 'user' }
            : { id: s.vendor.vendor_id, name: s.vendor.vendor_name || 'Vendor', type: 'vendor' },
          content: lastDbMessage.content as ChatMessageContent, // Assuming content structure matches
          timestamp: new Date(lastDbMessage.timestamp).toISOString(),
        };
      }

      const otherParticipant: ChatParticipant = isUserVendor
        ? { id: s.user.user_id, name: s.user.display_name || 'Customer', type: 'user' }
        : { id: s.vendor.vendor_id, name: s.vendor.vendor_name || 'Vendor', type: 'vendor' };

      return {
        sessionId: s.session_id,
        lastMessage: lastUserChatMessage,
        otherParticipant,
        lastUpdatedAt: new Date(s.last_updated_at).toISOString(),
      };
    });

  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    throw error;
  }
};


export const getChatMessages = async (
  sessionId: string,
  // TODO: Add pagination if needed (page?: number, limit?: number)
): Promise<UserChatMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        message_id,
        session_id,
        sender_type,
        sender_name,
        content,
        timestamp,
        chat_sessions (
          user:users!chat_sessions_user_id_fkey(user_id, display_name),
          vendor:vendors!chat_sessions_vendor_id_fkey(vendor_id, vendor_name)
        )
      `)
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    if (!data) return [];

    return data.map(msg => {
      let sender: ChatParticipant;
      if (msg.sender_type === 'user') {
        sender = { id: msg.chat_sessions.user.user_id, name: msg.sender_name || msg.chat_sessions.user.display_name || 'User', type: 'user' };
      } else if (msg.sender_type === 'vendor') {
        sender = { id: msg.chat_sessions.vendor.vendor_id, name: msg.sender_name || msg.chat_sessions.vendor.vendor_name || 'Vendor', type: 'vendor' };
      } else {
        // Fallback for unknown sender types, though ideally this shouldn't happen for user-vendor chat
        sender = { id: 'unknown', name: msg.sender_name || 'Unknown', type: msg.sender_type as 'user' | 'vendor' };
      }

      return {
        messageId: msg.message_id,
        sessionId: msg.session_id,
        sender,
        content: msg.content as ChatMessageContent, // Assuming content structure matches
        timestamp: new Date(msg.timestamp).toISOString(),
      };
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    throw error;
  }
};

export const sendTextMessage = async (
  sessionId: string,
  text: string,
  sender: ChatParticipant
): Promise<UserChatMessage> => {
  try {
    const messageContent: ChatMessageContent = { type: 'text', text };
    const { data: newMessage, error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        sender_type: sender.type,
        sender_name: sender.name, // Store sender's name for quick display
        content: messageContent,
      })
      .select(`
        message_id,
        session_id,
        sender_type,
        sender_name,
        content,
        timestamp,
        chat_sessions (
          user:users!chat_sessions_user_id_fkey(user_id, display_name),
          vendor:vendors!chat_sessions_vendor_id_fkey(vendor_id, vendor_name)
        )
      `)
      .single();

    if (error) throw error;
    if (!newMessage) throw new Error("Failed to send message");

    // Construct the sender for the returned message based on the inserted sender_type
    // This ensures consistency if sender_name isn't perfectly matching user/vendor table names
    let confirmedSender: ChatParticipant;
    if (newMessage.sender_type === 'user') {
      confirmedSender = { id: newMessage.chat_sessions.user.user_id, name: newMessage.sender_name || newMessage.chat_sessions.user.display_name || 'User', type: 'user' };
    } else { // 'vendor'
      confirmedSender = { id: newMessage.chat_sessions.vendor.vendor_id, name: newMessage.sender_name || newMessage.chat_sessions.vendor.vendor_name || 'Vendor', type: 'vendor' };
    }

    return {
      messageId: newMessage.message_id,
      sessionId: newMessage.session_id,
      sender: confirmedSender,
      content: newMessage.content as ChatMessageContent,
      timestamp: new Date(newMessage.timestamp).toISOString(),
    };
  } catch (error) {
    console.error('Error sending text message:', error);
    throw error;
  }
};

const CHAT_ATTACHMENTS_BUCKET = 'chat_attachments'; // Define your bucket name

export const uploadChatImage = async (file: File, sessionId: string): Promise<{ publicUrl: string; path: string; }> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${sessionId}/${Date.now()}.${fileExt}`; // Organize by session_id

    const { data, error } = await supabase.storage
      .from(CHAT_ATTACHMENTS_BUCKET)
      .upload(fileName, file);

    if (error) throw error;
    if (!data) throw new Error("File upload failed, no data returned.");

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(CHAT_ATTACHMENTS_BUCKET)
      .getPublicUrl(data.path);

    if (!urlData) throw new Error("Could not get public URL for uploaded file.");

    return { publicUrl: urlData.publicUrl, path: data.path };
  } catch (error) {
    console.error('Error uploading chat image:', error);
    throw error;
  }
};

export const sendImageMessage = async (
  sessionId: string,
  imageUrl: string,
  altText: string | undefined,
  sender: ChatParticipant
): Promise<UserChatMessage> => {
  try {
    const messageContent: ChatMessageContent = { type: 'image', imageUrl, altText: altText || 'image' };
    const { data: newMessage, error } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        sender_type: sender.type,
        sender_name: sender.name,
        content: messageContent,
      })
      .select(`
        message_id,
        session_id,
        sender_type,
        sender_name,
        content,
        timestamp,
        chat_sessions (
          user:users!chat_sessions_user_id_fkey(user_id, display_name),
          vendor:vendors!chat_sessions_vendor_id_fkey(vendor_id, vendor_name)
        )
      `)
      .single();

    if (error) throw error;
    if (!newMessage) throw new Error("Failed to send image message");

    let confirmedSender: ChatParticipant;
     if (newMessage.sender_type === 'user') {
      confirmedSender = { id: newMessage.chat_sessions.user.user_id, name: newMessage.sender_name || newMessage.chat_sessions.user.display_name || 'User', type: 'user' };
    } else { // 'vendor'
      confirmedSender = { id: newMessage.chat_sessions.vendor.vendor_id, name: newMessage.sender_name || newMessage.chat_sessions.vendor.vendor_name || 'Vendor', type: 'vendor' };
    }

    return {
      messageId: newMessage.message_id,
      sessionId: newMessage.session_id,
      sender: confirmedSender,
      content: newMessage.content as ChatMessageContent,
      timestamp: new Date(newMessage.timestamp).toISOString(),
    };
  } catch (error) {
    console.error('Error sending image message:', error);
    throw error;
  }
};

// --- END: API Functions for User-Vendor Chat ---


// --- START: Existing AI Chat Functions (Potentially for deprecation or separation) ---
// Define types for AI Chat (might differ from User-Vendor Chat types)
export interface AIChatMessage { // Renamed to avoid conflict
  id: string;
  message: string; // Keeping this for the AI part if it's still used directly
  sender_type: 'user' | 'assistant' | 'system' | 'tool';
  sender_name: string;
  content: { // This content structure might be specific to AI
    type: string;
    text?: string;
    data?: any;
  };
  timestamp: Date;
}

export interface AIChatSession { // Renamed to avoid conflict
  id: string;
  summary: string | null;
  created_at: Date;
  last_updated_at: Date;
}

// This function seems to target a different backend and has a mock.
// It's distinct from the Supabase direct user-vendor chat.
export const sendAIMessage = async ( // Renamed to avoid conflict
  message: string,
  sessionId?: string,
  category?: string,
  authToken?: string // Added authToken parameter
): Promise<{ messages: AIChatMessage[], session_id: string }> => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    if (!API_BASE_URL) {
      throw new Error('API_BASE_URL environment variable is not set for AI chat');
    }
    
    if (!authToken) throw new Error('Auth token not provided for AI chat');
    
    const response = await fetch(`${API_BASE_URL}/chat`, { // This is the AI backend endpoint
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        session_id: sessionId,
        category
      }),
    });
    
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API error: ${response.status} - ${errorBody}`);
    }
    
    const responseData = await response.json();
    // Ensure responseData.messages conform to AIChatMessage structure, especially timestamp
    responseData.messages = responseData.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp || Date.now())
    }));
    return responseData;
  } catch (error) {
    console.error('Error sending AI chat message:', error);
    
    if (import.meta.env.DEV) { // Changed from process.env.NODE_ENV
      console.warn('Using mock data for AI chat in development');
      const mockAssistantMessage: AIChatMessage = {
        id: crypto.randomUUID(),
        sender_type: 'assistant',
        sender_name: 'PlannerAgent',
        content: {
          type: 'text',
          text: `Mock response: You asked about "${message}". This is a simulated AI reply.`,
        },
        timestamp: new Date(),
        message: `Mock response: You asked about "${message}". This is a simulated AI reply.`,
      };
      return {
        messages: [mockAssistantMessage],
        session_id: sessionId || crypto.randomUUID(),
      };
    }
    throw error;
  }
};

// These functions interact directly with Supabase tables that might be shared or specific to AI chat
// Depending on your schema, they might need adjustment if chat_sessions and chat_messages are now primarily for user-vendor.
// For now, assuming they refer to the same tables but might be used by the AI part.

export const getAIChatSessions = async (userId: string): Promise<AIChatSession[]> => { // Renamed, takes userId
  try {
    // This assumes AI chat sessions are stored in `chat_sessions` linked by `user_id`
    // and are NOT vendor chats. So we might need a filter like `vendor_id IS NULL`.
    const { data, error } = await supabase
      .from('chat_sessions')
      .select('session_id, summary, created_at, last_updated_at')
      .eq('user_id', userId)
      .is('vendor_id', null) // Assuming AI chats don't have a vendor_id
      .order('last_updated_at', { ascending: false });
      
    if (error) throw error;
    
    return data.map(session => ({
      id: session.session_id,
      summary: session.summary,
      created_at: new Date(session.created_at),
      last_updated_at: new Date(session.last_updated_at),
    }));
  } catch (error) {
    console.error('Error fetching AI chat sessions:', error);
    throw error;
  }
};

export const getAIChatMessages = async (sessionId: string): Promise<AIChatMessage[]> => { // Renamed
  try {
    const { data, error } = await supabase
      .from('chat_messages') // Assuming AI messages are in the same table
      .select('message_id, sender_type, sender_name, content, timestamp')
      .eq('session_id', sessionId)
      // Add a filter if AI messages have a specific sender_type like 'assistant'
      // or if the session_id implies it's an AI chat session.
      .order('timestamp', { ascending: true });
      
    if (error) throw error;
    
    return data.map(message => ({
      id: message.message_id,
      sender_type: message.sender_type as 'user' | 'assistant' | 'system' | 'tool',
      sender_name: message.sender_name,
      content: message.content, // This content structure might be specific to AI
      timestamp: new Date(message.timestamp),
      message: typeof message.content === 'string' ? message.content : (message.content as any)?.text || '', // Example of handling content
    }));
  } catch (error) {
    console.error('Error fetching AI chat messages:', error);
    throw error;
  }
};
// --- END: Existing AI Chat Functions ---
