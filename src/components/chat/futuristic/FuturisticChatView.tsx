import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext'; // Assuming this context provides user info and JWT
import { runAgent, createSession, listSessions } from '@/services/api'; // Using existing API services

import DynamicBackground from './DynamicBackground';
import AIStateVisualizer, { AIState } from './AIStateVisualizer';
import FuturisticMessageDisplay, { Message as DisplayMessage } from './MessageItem';
import MultimodalInput from './MultimodalInput';

import './FuturisticChatView.css';

// Mapping the Message interface from ChatWithAI.tsx (or a new shared one)
// For now, let's redefine a similar one for clarity within this component.
interface ChatMessage extends DisplayMessage {
  // role: 'user' | 'bot'; // Already in DisplayMessage
  // content: string; // Already in DisplayMessage
  // id: string | number; // Already in DisplayMessage
  // timestamp: string; // Already in DisplayMessage
}

const APP_NAME = 'sanskara'; // From ChatWithAI.tsx

const FuturisticChatView: React.FC = () => {
  const { user } = useAuth();
  // const [jwt, setJwt] = useState<string | null>(null); // If needed directly, else Supabase client handles it

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const savedMessagesString = sessionStorage.getItem('futuristicChatMessages');
    let parsedMessages: ChatMessage[] | null = null;
    if (savedMessagesString) {
      try {
        const potentiallyParsed = JSON.parse(savedMessagesString);
        // Ensure it's an array and filter out any null/undefined items from bad storage
        if (Array.isArray(potentiallyParsed)) {
          parsedMessages = potentiallyParsed.filter(Boolean) as ChatMessage[];
        }
      } catch (error) {
        console.error("Error parsing messages from sessionStorage:", error);
        // Fallback to default if parsing fails
      }
    }
    return parsedMessages || [
      {
        id: 'initial-bot-msg',
        role: 'bot',
        content: "Welcome to the futuristic chat experience! How can I assist you today?",
        timestamp: new Date().toISOString(),
      }
    ];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => {
    const sessionId = sessionStorage.getItem('futuristicChatSessionId');
    // Ensure it's not "null" or "undefined" as a string
    return (sessionId && sessionId !== "null" && sessionId !== "undefined") ? sessionId : null;
  });
  const [aiState, setAiState] = useState<AIState>('idle');
  const [isSending, setIsSending] = useState(false);

  // Example proactive suggestions
  const [proactiveSuggestions, setProactiveSuggestions] = useState([
    { id: 'sugg1', text: 'Tell me a joke' },
    { id: 'sugg2', text: 'What is the weather?' },
    { id: 'sugg3', text: 'Explain quantum physics' },
  ]);

  // Get JWT and initialize session (similar to ChatWithAI.tsx)
  useEffect(() => {
    // const getJwtToken = async () => {
    //   const { data } = await import('@/services/supabase/config').then(mod => mod.supabase.auth.getSession());
    //   setJwt(data?.session?.access_token || null);
    // };
    // getJwtToken(); // Assuming Supabase client used by `runAgent` handles auth internally

    const setupSession = async () => {
      if (!user || currentSessionId) return;
      try {
        setAiState('processing');
        const userId = user.id;
        // Check for existing sessions first (optional, or always create new for this view)
        const existingSessions = await listSessions(APP_NAME, userId);
        if (existingSessions && existingSessions.length > 0 && existingSessions[0].session_id) {
           // Option: reuse latest session or specific one
           // setCurrentSessionId(existingSessions[0].session_id);
           // For now, let's create a new one each time this view loads if not in session storage
           const newSession = await createSession(APP_NAME, userId);
           const sessionId = newSession.session_id || newSession.id || newSession;
           setCurrentSessionId(sessionId);
           sessionStorage.setItem('futuristicChatSessionId', sessionId);
        } else {
          const newSession = await createSession(APP_NAME, userId);
          const sessionId = newSession.session_id || newSession.id || newSession;
          setCurrentSessionId(sessionId);
          sessionStorage.setItem('futuristicChatSessionId', sessionId);
        }
      } catch (error) {
        console.error("Error setting up session:", error);
        setMessages(prev => [...prev, {
          id: `err-${Date.now()}`, role: 'system', content: 'Error setting up session. Please try refreshing.', timestamp: new Date().toISOString()
        }]);
      } finally {
        setAiState('idle');
      }
    };

    if (!currentSessionId) {
      setupSession();
    }
  }, [user, currentSessionId]);

  useEffect(() => {
    sessionStorage.setItem('futuristicChatMessages', JSON.stringify(messages));
  }, [messages]);


  const handleSendMessage = useCallback(async (inputText: string) => {
    if (!inputText.trim() || !user || !currentSessionId) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setAiState('processing');
    setIsSending(true);
    // Hide suggestions when user sends a message
    setProactiveSuggestions([]);


    try {
      const apiMessage = {
        role: 'user', // API expects 'user'
        parts: [{ text: userMessage.content }],
      };
      // NB: runAgent might return a list of events, not a single message object.
      // This logic is adapted from ChatWithAI.tsx
      const responseEvents = await runAgent(APP_NAME, user.id, currentSessionId, apiMessage);

      let aiTextResponse = 'Sorry, I could not extract a response.';
      if (Array.isArray(responseEvents)) {
        const aiEvent = [...responseEvents].reverse().find(
          ev => ev.content && ev.content.parts && ev.content.parts[0]?.text && ev.author && ev.author !== 'user'
        );
        aiTextResponse = aiEvent?.content?.parts?.map((p: any) => p.text).filter(Boolean).join(' ') || aiTextResponse;
      } else if (responseEvents && responseEvents.reply) { // Fallback for different possible API response structures
        aiTextResponse = responseEvents.reply;
      } else if (responseEvents && responseEvents.message) {
        aiTextResponse = responseEvents.message;
      }


      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'bot',
        content: aiTextResponse,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, botMessage]);
      // Example: Show new suggestions after AI response
      // This is just a placeholder, actual suggestions would come from AI or context
      setTimeout(() => { // Simulate delay for suggestions
        setProactiveSuggestions([
          { id: 'sugg_new_1', text: 'Tell me more' },
          { id: 'sugg_new_2', text: 'Ask something else' },
        ]);
      }, 500);

    } catch (error) {
      console.error("Error sending message to AI:", error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'bot', // Or 'system'
        content: 'Sorry, there was an issue connecting to the AI. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setAiState('idle');
      setIsSending(false);
    }
  }, [user, currentSessionId]);


  // Placeholder for voice input handling
  // const handleVoiceInputStart = () => setAiState('listening');
  // const handleVoiceInputStop = () => setAiState('idle'); // Or 'processing' if STT is quick

  return (
    <DynamicBackground>
      <div className="futuristic-chat-view">
        <div className="ai-visualizer-section">
          <AIStateVisualizer state={aiState} />
        </div>

        <div className="messages-section">
          <FuturisticMessageDisplay messages={messages} />
        </div>

        <div className="input-section">
          <MultimodalInput
            onSendMessage={handleSendMessage}
            isSending={isSending}
            suggestions={proactiveSuggestions}
            // onVoiceInputStart={handleVoiceInputStart}
            // onVoiceInputStop={handleVoiceInputStop}
          />
        </div>
      </div>
    </DynamicBackground>
  );
};

export default FuturisticChatView;
