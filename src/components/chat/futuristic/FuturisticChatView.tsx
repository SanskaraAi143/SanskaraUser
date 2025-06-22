import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { runAgent, createSession, listSessions } from '@/services/api';

// import DynamicBackground from './DynamicBackground'; // Commented out for new design
// import AIStateVisualizer, { AIState } from './AIStateVisualizer'; // Commented out for new design
import FuturisticMessageDisplay, { Message as DisplayMessage } from './MessageItem';
import MultimodalInput from './MultimodalInput';

import './FuturisticChatView.css';

interface ChatMessage extends DisplayMessage {
  // Inherits from DisplayMessage which includes id, role, content, timestamp
}

const APP_NAME = 'sanskara'; // From ChatWithAI.tsx, ensure this is correct for your agent

const FuturisticChatView: React.FC = () => {
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Simplified initial message for now, session storage logic can be re-added if stable
    return [
      {
        id: 'initial-bot-msg',
        role: 'bot',
        content: "Hello! How can I assist you today?", // From new HTML
        timestamp: new Date().toISOString(),
      }
    ];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  // const [aiState, setAiState] = useState<AIState>('idle'); // Original AIState, may change with canvas visualizer
  const [isAISpeaking, setIsAISpeaking] = useState(false); // For TTS and canvas visualizer state
  const [isUserSpeaking, setIsUserSpeaking] = useState(false); // For STT and canvas visualizer state
  const [isAIProcessing, setIsAIProcessing] = useState(false); // For thinking state
  const [isSending, setIsSending] = useState(false); // For disabling input during send

  // Proactive suggestions will be handled by MultimodalInput or a dedicated component later
  // const [proactiveSuggestions, setProactiveSuggestions] = useState([]);


  useEffect(() => {
    const setupSession = async () => {
      if (!user || currentSessionId) return;
      setIsAIProcessing(true);
      try {
        const userId = user.id;
        const newSession = await createSession(APP_NAME, userId);
        const sessionId = newSession.session_id || newSession.id || newSession;
        setCurrentSessionId(sessionId);
        // sessionStorage.setItem('futuristicChatSessionId', sessionId); // Re-add if needed
      } catch (error) {
        console.error("Error setting up session:", error);
        setMessages(prev => [...prev, {
          id: `err-session-${Date.now()}`, role: 'system', content: 'Error setting up session. Please try refreshing.', timestamp: new Date().toISOString()
        }]);
      } finally {
        setIsAIProcessing(false);
      }
    };
    if (!currentSessionId && user) {
      setupSession();
    }
  }, [user, currentSessionId]);

  // useEffect(() => {
  //   sessionStorage.setItem('futuristicChatMessages', JSON.stringify(messages)); // Re-add if needed
  // }, [messages]);

  const handleSendMessage = useCallback(async (inputText: string) => {
    if (!inputText.trim() || !user || !currentSessionId) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsAIProcessing(true);
    setIsSending(true);
    setIsUserSpeaking(false); // User has finished speaking/typing

    try {
      const apiMessage = { role: 'user', parts: [{ text: userMessage.content }] };
      const responseEvents = await runAgent(APP_NAME, user.id, currentSessionId, apiMessage);

      let aiTextResponse = 'Sorry, I could not extract a response.';
      if (Array.isArray(responseEvents)) {
        const aiEvent = [...responseEvents].reverse().find(
          (ev: any) => ev.content && ev.content.parts && ev.content.parts[0]?.text && ev.author && ev.author !== 'user'
        );
        aiTextResponse = aiEvent?.content?.parts?.map((p: any) => p.text).filter(Boolean).join(' ') || aiTextResponse;
      } else if (responseEvents && (responseEvents as any).reply) {
        aiTextResponse = (responseEvents as any).reply;
      } else if (responseEvents && (responseEvents as any).message) {
        aiTextResponse = (responseEvents as any).message;
      }

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'bot',
        content: aiTextResponse,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, botMessage]);
      // TTS will be triggered here later
      // speak(aiTextResponse); // Example call
    } catch (error) {
      console.error("Error sending message to AI:", error);
      const errorContent = error instanceof Error ? error.message : 'An unknown error occurred.';
      setMessages(prev => [...prev, {
        id: `error-send-${Date.now()}`,
        role: 'system', // Using 'system' for error messages
        content: `Sorry, there was an issue connecting to the AI: ${errorContent}`,
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setIsAIProcessing(false);
      setIsSending(false);
    }
  }, [user, currentSessionId]);

  // Placeholder for STT active state
  const handleUserSpeakingChange = (speaking: boolean) => {
    setIsUserSpeaking(speaking);
  };

  // Placeholder for TTS active state
  const handleAISpeakingChange = (speaking: boolean) => {
    setIsAISpeaking(speaking);
  };

  return (
    // <DynamicBackground> // Commented out
      <div className="futuristic-chat-container"> {/* Changed class name to match new structure */}
        <div className="futuristic-header"> {/* New header class */}
          <div className="header-glow"></div>
          <h1 /* className="text-xl font-bold text-white" - will be in CSS */>AI Assistant</h1>
          <div className="header-glow"></div>
        </div>

        {/* MainAIVisualizerCanvas will be added here later */}
        {/* <canvas id="aiVisualizerCanvas"></canvas> */}

        {/* messages-section maps to conversationalCanvas div */}
        <FuturisticMessageDisplay
          messages={messages}
          isUserSpeaking={isUserSpeaking}
          isAISpeaking={isAISpeaking}
        />

        {/* input-section maps to input-area div */}
        <MultimodalInput
          onSendMessage={handleSendMessage}
          isSending={isSending || isAIProcessing}
          // suggestions={proactiveSuggestions} // To be re-added
          onUserSpeakingChange={handleUserSpeakingChange} // For STT
        />
        {/* ImmersiveModeView and MessageBox will be added here later */}
      </div>
    // </DynamicBackground> // Commented out
  );
};

export default FuturisticChatView;
