import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ChatLayout from '@/components/futuristic-chat/ChatLayout';
import AudioVisualizer from '@/components/futuristic-chat/AudioVisualizer';
import ChatHistory from '@/components/futuristic-chat/ChatHistory';
import ChatInput from '@/components/futuristic-chat/ChatInput';
import Controls from '@/components/futuristic-chat/Controls';
import { useAuth } from '@/context/AuthContext';
import { useMultimodalClient } from '@/hooks/useMultimodalClient';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const FuturisticChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);

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
    isVideoActive,
    initializeWebcam,
    stopVideo,
    isLoadingHistory,
    historyError,
    hasMoreHistory,
    loadMoreHistory,
  } = useMultimodalClient(
    user?.internal_user_id,
    user?.wedding_id
  );

  const [aiStatus, setAiStatus] = useState('Tap to begin conversation');
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (historyError) {
      toast({
        title: 'Error loading history',
        description: historyError,
        variant: 'destructive',
      });
    }
  }, [historyError, toast]);

  useEffect(() => {
    if (connectionState === 'reconnecting') {
      setAiStatus('Reconnecting...');
    } else if (connectionState === 'failed') {
      setAiStatus('Connection failed');
    } else if (!sessionId && !isLoadingHistory) {
      setAiStatus('Establishing session...');
    } else if (isAssistantSpeaking) {
      setAiStatus('Speaking...');
    } else if (isAssistantTyping) {
      setAiStatus('Thinking...');
    } else if (isRecording) {
      setAiStatus('Listening...');
    } else if (isVideoActive) {
      setAiStatus('Video call active');
    } else {
      setAiStatus('Tap to speak or type');
    }
  }, [connectionState, sessionId, isAssistantSpeaking, isAssistantTyping, isRecording, isLoadingHistory, isVideoActive]);

  const handleTalkClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleCameraToggle = async () => {
    if (isVideoActive) {
      stopVideo();
    } else {
      try {
        await initializeWebcam(videoRef.current);
      } catch (err) {
        console.error("Error accessing camera:", err);
        toast({
          title: "Camera Error",
          description: "Could not access camera. Please check permissions.",
          variant: "destructive",
        });
      }
    }
  };

  const handleMuteToggle = () => {
      setIsMuted(prevMuted => {
          const newMuted = !prevMuted;
          if (videoRef.current?.srcObject) {
              const stream = videoRef.current.srcObject as MediaStream;
              stream.getAudioTracks().forEach(track => {
                  track.enabled = !newMuted;
              });
          }
          return newMuted;
      });
  };

  const handleEndClick = () => {
      // For now, just navigates back. Could be expanded to show a modal.
      navigate(-1);
  };

  return (
    <ChatLayout>
      {/* Main View */}
      <div className={cn("flex-[3] relative flex flex-col border-r border-futuristic-border transition-all duration-500 ease-in-out", { 'video-active': isVideoActive })}>
        <main className="audio-interface flex-grow flex flex-col justify-center items-center text-center p-8 pb-44 relative">
          <div className={cn("video-feeds absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center gap-4 p-4 transition-opacity duration-500", isVideoActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')}>
              <div className="video-feed partner-feed w-full flex-1 bg-gray-200 rounded-2xl flex justify-center items-center text-futuristic-text-secondary"><span>Partner's Video</span></div>
              <div className="video-feed user-feed absolute w-32 h-40 bottom-48 right-4 border-2 border-white rounded-2xl shadow-lg overflow-hidden">
                <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover"/>
              </div>
          </div>
          <div className={cn("ai-visualizer-container transition-all duration-500", {"transform scale-40 -translate-x-[120%] -translate-y-[350%]": isVideoActive})}>
            <AudioVisualizer isSpeaking={isAssistantSpeaking} isListening={isRecording} />
          </div>
          <div className={cn("transition-opacity duration-300", { "opacity-0 pointer-events-none": isVideoActive })}>
            <h1 className="ai-name text-3xl font-medium text-futuristic-text-primary mb-2">Sanskara</h1>
            <p className="ai-status text-base text-futuristic-text-secondary min-h-[24px]">
              {aiStatus}
            </p>
          </div>
        </main>
        <Controls
          isRecording={isRecording}
          onTalkClick={handleTalkClick}
          isVideoActive={isVideoActive}
          onVideoClick={handleCameraToggle}
          isMuted={isMuted}
          onMuteClick={handleMuteToggle}
          onEndClick={handleEndClick}
        />
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
        <ChatHistory
          transcript={transcript}
          isLoadingHistory={isLoadingHistory}
          hasMoreHistory={hasMoreHistory}
          loadMoreHistory={loadMoreHistory}
        />
        <ChatInput onSendMessage={sendTextMessage} disabled={!sessionId} />
      </div>
    </ChatLayout>
  );
};

export default FuturisticChatPage;