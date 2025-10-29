import React, { useState, useEffect } from 'react';
import { Mic, MicOff, PhoneOff, Video, ScreenShare, ChevronLeft, ChevronRight, Paperclip, Send, MessageSquare } from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';
import { Message } from '@/hooks/useMultimodalClient';
import EnhancedChatHistory from '@/components/chat/EnhancedChatHistory';
import ChatErrorBoundary from '@/components/chat/ChatErrorBoundary';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface FuturisticChatProps {
  isAgentReady: boolean;
  connectionState: 'idle' | 'connecting' | 'connected' | 'initializing' | 'reconnecting' | 'failed';
  isRecording: boolean;
  isAssistantSpeaking: boolean;
  onTalkClick: () => void;
  onEndClick: () => void;
  onCameraToggle: () => void;
  onScreenShareToggle: () => void;
  isMuted: boolean;
  onMuteToggle: () => void;
  isVideoActive: boolean;
  activeVideoMode: 'webcam' | 'screen' | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoadingHistory: boolean;
  hasMoreHistory: boolean;
  loadMoreHistory: () => void;
}

const FuturisticChat: React.FC<FuturisticChatProps> = ({
  isAgentReady,
  connectionState,
  isRecording,
  isAssistantSpeaking,
  onTalkClick,
  onEndClick,
  onCameraToggle,
  onScreenShareToggle,
  isMuted,
  onMuteToggle,
  isVideoActive,
  activeVideoMode,
  videoRef,
  localVideoRef,
  messages,
  onSendMessage,
  isLoadingHistory,
  hasMoreHistory,
  loadMoreHistory,
}) => {
  const [isChatOpen, setChatOpen] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const isMobile = useIsMobile();
  const [isChatVisible, setChatVisible] = useState(!isMobile);

  useEffect(() => {
    setChatVisible(!isMobile);
  }, [isMobile]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const statusText = connectionState === 'initializing'
    ? "Initializing Agent..."
    : isAssistantSpeaking
    ? "Assistant is speaking..."
    : isRecording
    ? "Listening..."
    : isAgentReady
    ? "Ready"
    : "Connecting...";

  return (
    // Root container: Use h-dvh for dynamic viewport height and flex-col to structure page vertically
    <div className="flex h-dvh w-full flex-col overflow-hidden font-display text-text-dark bg-background-light">
      {/* Main content wrapper: flex-1 makes this row take all available vertical space */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Chat Toggle Button */}
        {isMobile && (
          <button
            className="absolute top-4 right-4 z-50 bg-primary text-white p-2 rounded-full shadow-lg"
            onClick={() => setChatVisible(!isChatVisible)}
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        )}

        {/* Main Content Area: Visualizer, Video, and Controls */}
        <main className={cn(
          "flex flex-1 flex-col transition-all duration-300 ease-in-out",
          {
            'w-full': !isMobile && !isChatOpen,
            'md:w-2/3': !isMobile && isChatOpen,
            'hidden sm:flex': isMobile && isChatVisible,
            'flex': !isMobile || !isChatVisible,
          }
        )}>
          {/* Central area: flex-1 makes it fill space, pushing controls down. min-h-0 is crucial for flex shrinking. */}
          <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden p-4 md:p-6 min-h-0">
            {/* Video Feed (Webcam or Screen Share) */}
            <div
              className={cn(
                "absolute inset-0 z-0 transition-opacity duration-300",
                isVideoActive ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="h-full w-full object-contain"
              />
            </div>

            {/* Audio Visualizer */}
            <div className={cn("z-10 transition-transform duration-500", isVideoActive ? 'scale-75' : 'scale-100')}>
                <AudioVisualizer isSpeaking={isAssistantSpeaking} isListening={isRecording} />
            </div>

            {/* AI Status Text */}
            <p className="absolute bottom-6 text-center text-xl font-medium text-text-dark/80 z-20">
              {statusText}
            </p>

             {/* User's Local Video Preview */}
            <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={cn(
                  "absolute bottom-4 right-4 z-20 w-32 h-24 rounded-lg object-cover shadow-lg transition-all duration-300 md:w-48 md:h-36",
                  isVideoActive && activeVideoMode === 'webcam' ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
                )}
            />
          </div>

          {/* Bottom Control Bar: flex-shrink-0 prevents it from shrinking */}
          <div className="flex-shrink-0 p-4 bg-background-light/80 backdrop-blur-sm z-30">
            <div className="mx-auto flex w-full max-w-lg items-center justify-center gap-3 md:gap-4">
               <button onClick={onMuteToggle} className="flex items-center justify-center p-3 rounded-full bg-white/50 hover:bg-white/70 transition-colors text-text-dark">
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              <button onClick={onCameraToggle} className={cn("flex items-center justify-center p-3 rounded-full transition-colors", isVideoActive && activeVideoMode === 'webcam' ? 'bg-primary text-background-dark' : 'bg-white/50 hover:bg-primary/20 text-text-dark')}>
                <Video className="w-6 h-6" />
              </button>
              <button
                onClick={onTalkClick}
                disabled={!isAgentReady}
                className={cn(
                  "flex items-center justify-center p-4 rounded-full transition-all duration-300 text-white transform hover:scale-105",
                  isRecording ? 'bg-red-500' : 'bg-primary hover:bg-secondary',
                  !isAgentReady && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Mic className="w-8 h-8" />
              </button>
              <button onClick={onScreenShareToggle} className={cn("flex items-center justify-center p-3 rounded-full transition-colors", isVideoActive && activeVideoMode === 'screen' ? 'bg-primary text-background-dark' : 'bg-white/50 hover:bg-primary/20 text-text-dark')}>
                <ScreenShare className="w-6 h-6" />
              </button>
              <button onClick={onEndClick} className="flex items-center justify-center p-3 rounded-full bg-accent hover:opacity-90 transition-opacity text-white">
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </div>
        </main>

        {/* Chat Panel: Itself a flex-col to manage its own header/content/footer */}
        <aside className={cn(
          "border-l border-secondary/30 flex-col bg-white/40 backdrop-blur-md transition-all duration-300 ease-in-out",
          {
            'w-0 hidden': !isChatOpen && !isMobile,
            'w-full md:w-1/3 flex': isChatOpen && !isMobile,
            'absolute inset-0 z-40 flex': isMobile && isChatVisible,
            'hidden': isMobile && !isChatVisible,
          }
        )}>
          <div className="flex-shrink-0 items-center justify-between p-4 border-b border-secondary/30 flex">
            <h3 className="text-lg font-semibold text-text-dark">Chat History</h3>
            <button className="p-2 text-text-dark/70 hover:text-primary" onClick={() => setChatOpen(false)}>
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
          {/* Chat History: flex-1 and min-h-0 allows it to take space and scroll internally */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <ChatErrorBoundary>
              <EnhancedChatHistory
                transcript={messages}
                isLoadingHistory={isLoadingHistory}
                hasMoreHistory={hasMoreHistory}
                loadMoreHistory={loadMoreHistory}
                virtualized={messages.length > 50}
              />
            </ChatErrorBoundary>
          </div>
          {/* Message Input Area */}
          <div className="flex-shrink-0 p-4 border-t border-secondary/30">
            <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-1 w-full shadow-sm">
              <button className="p-2 text-text-dark/70 hover:text-primary">
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                className="flex-1 bg-transparent border-none text-text-dark placeholder-text-dark/50 focus:ring-0 text-sm"
                placeholder="Type a message..."
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                className="p-2 text-text-dark/70 hover:text-primary disabled:opacity-50"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </aside>

        {/* Floating Button to Open Chat */}
        {!isChatOpen && !isMobile && (
            <button
                className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-primary text-white p-2 rounded-l-lg z-40 shadow-lg"
                onClick={() => setChatOpen(true)}
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
        )}
      </div>
    </div>
  );
};

export default FuturisticChat;