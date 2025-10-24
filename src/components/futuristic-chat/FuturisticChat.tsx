import React, { useState, useRef } from 'react';
import AudioVisualizer from './AudioVisualizer';
import { Message } from '@/hooks/useMultimodalClient';
import EnhancedChatHistory from '@/components/chat/EnhancedChatHistory';
import ChatErrorBoundary from '@/components/chat/ChatErrorBoundary';

interface FuturisticChatProps {
  isRecording: boolean;
  isAssistantSpeaking: boolean;
  transcript: Message[];
  onTalkClick: () => void;
  onEndClick: () => void;
  onCameraToggle: () => void;
  onScreenShareToggle: () => void;
  isMuted: boolean;
  onMuteToggle: () => void;
  isVideoActive: boolean;
  activeVideoMode: 'webcam' | 'screen' | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  messages: Message[];
  onSendMessage: (message: string) => void;
  user: any;
  isLoadingHistory: boolean;
  hasMoreHistory: boolean;
  loadMoreHistory: () => void;
}

const FuturisticChat: React.FC<FuturisticChatProps> = ({
  isRecording,
  isAssistantSpeaking,
  transcript,
  onTalkClick,
  onEndClick,
  onCameraToggle,
  onScreenShareToggle,
  isMuted,
  onMuteToggle,
  isVideoActive,
  activeVideoMode,
  videoRef,
  messages,
  onSendMessage,
  user,
  isLoadingHistory,
  hasMoreHistory,
  loadMoreHistory,
}) => {
  const [isChatOpen, setChatOpen] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const assistant = {
    name: 'AI Assistant',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmW1blIGPkeW_f_qe3qv2A9Jc5bERKvjdzs2jmLhUIKOVz0dGBTQPrVbS_s7J6t1yqe_szoZbxy0UWEo2u3_Y5JP2ap8IjHa2T4-1vJUmUr4Zmw7hu6JPuLNEPqy0dt8_Ju-6jkZ4u5RdL5q5aCI0dhzXohgu0ANrnisRuPuXtHdHmwF4xMtmJldX4Bc7pg_tgcbfvlnD_YBpuwqAefWhtYwdkiEvVWn-7K9GKjPg6hFisTt-uMJm74V3qD_DkWMRomHJbZVjB_c3O',
  };

  return (
    <div className="relative flex h-screen w-full flex-col font-display text-text-dark bg-background-light">
      <div className="flex flex-1 overflow-hidden">
        <main className={`flex flex-col p-4 md:p-6 transition-all duration-300 ease-in-out ${isChatOpen ? 'w-full md:w-2/3' : 'w-full'} flex-1`}>
          <div className="flex flex-col items-center flex-1 overflow-auto">
            <div className="flex-grow w-full max-w-2xl flex items-center justify-center min-h-0 h-48 md:h-64 mb-auto">
              <AudioVisualizer isSpeaking={isAssistantSpeaking} isListening={isRecording} />
            </div>
            <div className="text-center mt-auto">
              {isRecording && !isAssistantSpeaking ? (
                <p className="text-text-dark/80 text-xl md:text-2xl font-medium">AI is listening...</p>
              ) : null}
              {/* Removed the transcript display that was showing assistant's last message */}
            </div>
          </div>
          <div className="w-full max-w-md flex items-center justify-center gap-2 md:gap-4 mt-auto">
            <button onClick={onTalkClick} className={`flex items-center justify-center p-3 rounded-full transition-colors text-background-dark ${isRecording ? 'bg-red-500' : 'bg-primary hover:bg-secondary'}`}>
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"></path>
              </svg>
            </button>
            <button onClick={onEndClick} className="flex items-center justify-center p-3 rounded-full bg-accent hover:opacity-90 transition-opacity text-white">
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4-4H8v-2h8v2z"></path>
              </svg>
            </button>
            <button onClick={onCameraToggle} className={`flex items-center justify-center p-3 rounded-full transition-colors ${isVideoActive && activeVideoMode === 'webcam' ? 'bg-primary text-background-dark' : 'bg-white/50 hover:bg-primary/20 text-text-dark'}`}>
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </button>
            <button onClick={onScreenShareToggle} className={`flex items-center justify-center p-3 rounded-full transition-colors ${isVideoActive && activeVideoMode === 'screen' ? 'bg-primary text-background-dark' : 'bg-white/50 hover:bg-primary/20 text-text-dark'}`}>
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </button>
          </div>
        </main>
        <aside className={`border-l border-secondary/30 flex-col bg-white/40 transition-all duration-300 ease-in-out ${isChatOpen ? 'w-full md:w-1/3' : 'w-0'} ${isChatOpen ? 'flex' : 'hidden'}`}>
          <div className="flex items-center justify-between p-4 border-b border-secondary/30">
            <h3 className="text-lg font-semibold text-text-dark">Chat</h3>
            <button className="p-2 text-text-dark/70 hover:text-primary" onClick={() => setChatOpen(!isChatOpen)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isChatOpen ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
              </svg>
            </button>
          </div>
          <ChatErrorBoundary>
            <EnhancedChatHistory
              transcript={messages}
              isLoadingHistory={isLoadingHistory}
              hasMoreHistory={hasMoreHistory}
              loadMoreHistory={loadMoreHistory}
              virtualized={messages.length > 50}
            />
          </ChatErrorBoundary>
          <div className="p-4 border-t border-secondary/30">
            <div className="flex items-center gap-2 bg-white rounded-xl px-3 w-full">
              <button className="p-2 text-text-dark/70 hover:text-primary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              <input
                className="flex-1 bg-transparent border-none text-text-dark placeholder-text-dark/50 focus:ring-0 text-sm"
                placeholder="Type a message..."
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSendMessage(newMessage);
                    setNewMessage('');
                  }
                }}
              />
              <button
                className="p-2 text-text-dark/70 hover:text-primary"
                onClick={() => {
                  onSendMessage(newMessage);
                  setNewMessage('');
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </div>
        </aside>
        {!isChatOpen && (
            <button
                className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-primary text-white p-2 rounded-l-lg"
                onClick={() => setChatOpen(true)}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        )}
      </div>
    </div>
  );
};

export default FuturisticChat;