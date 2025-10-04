import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatLayout from '@/components/futuristic-chat/ChatLayout';
import AudioVisualizer from '@/components/futuristic-chat/AudioVisualizer';
import ChatHistory from '@/components/futuristic-chat/ChatHistory';
import ChatInput from '@/components/futuristic-chat/ChatInput';
import Controls from '@/components/futuristic-chat/Controls';
import { useAuth } from '@/context/AuthContext';
import { useMultimodalClient } from '@/hooks/useMultimodalClient';
import { ArrowLeft } from 'lucide-react';

const FuturisticChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    isRecording,
    isAssistantSpeaking,
    isAssistantTyping,
    transcript,
    startRecording,
    stopRecording,
    sendTextMessage,
    connectionState,
    sessionId,
  } = useMultimodalClient(
    user?.internal_user_id,
    user?.wedding_id
  );
  const [aiStatus, setAiStatus] = useState('Tap to begin conversation');

  useEffect(() => {
    if (connectionState === 'reconnecting') {
      setAiStatus('Reconnecting...');
    } else if (connectionState === 'failed') {
      setAiStatus('Connection failed');
    } else if (!sessionId) {
      setAiStatus('Establishing session...');
    } else if (isAssistantSpeaking) {
      setAiStatus('Speaking...');
    } else if (isAssistantTyping) {
      setAiStatus('Thinking...');
    } else if (isRecording) {
      setAiStatus('Listening...');
    } else {
      setAiStatus('Tap to speak again');
    }
  }, [connectionState, sessionId, isAssistantSpeaking, isAssistantTyping, isRecording]);

  const handleTalkClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <ChatLayout>
      {/* Main View */}
      <div className="flex-[3] relative flex flex-col border-r border-futuristic-border">
        <main className="flex-grow flex flex-col justify-center items-center text-center p-8 pb-44 relative">
          <AudioVisualizer isSpeaking={isAssistantSpeaking} isListening={isRecording} />
          <h1 className="text-3xl font-medium text-futuristic-text-primary mb-2">Sanskara</h1>
          <p className="text-base text-futuristic-text-secondary min-h-[24px] transition-opacity duration-300">
            {aiStatus}
          </p>
        </main>
        <Controls isRecording={isRecording} onTalkClick={handleTalkClick} />
      </div>

      {/* Chat Panel */}
      <div className="flex-[2] flex flex-col bg-futuristic-container-bg">
        <div className="flex justify-between items-center p-4 border-b border-futuristic-border shrink-0">
          <h2 className="font-semibold">Conversation History</h2>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-futuristic-text-secondary hover:text-futuristic-primary-accent"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
        <ChatHistory transcript={transcript} />
        <ChatInput onSendMessage={sendTextMessage} />
      </div>
    </ChatLayout>
  );
};

export default FuturisticChatPage;