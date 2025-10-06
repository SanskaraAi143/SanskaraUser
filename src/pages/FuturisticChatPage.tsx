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
    activeVideoMode,
    initializeWebcam,
    stopVideo,
  } = useMultimodalClient(
    user?.internal_user_id,
    user?.wedding_id
  );

  const [aiStatus, setAiStatus] = useState('Tap to begin conversation');
  const [isMuted, setIsMuted] = useState(false);

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
    setIsMuted(!isMuted);
    // Here you would also call the mute/unmute function from your WebRTC logic
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => {
        track.enabled = isMuted; // isMuted is the old state, so this toggles it
      });
    }
  };

  return (
    <ChatLayout>
      {/* Main View */}
      <div className={cn("flex-[3] relative flex flex-col border-r border-futuristic-border", { 'video-active': isVideoActive })}>
        <main className="audio-interface flex-grow flex flex-col justify-center items-center text-center p-8 pb-44 relative">
          <div className="video-feeds">
              <div className="video-feed partner-feed"><span>Partner's Video</span></div>
              <div className="video-feed user-feed"><video ref={videoRef} autoPlay playsInline muted /></div>
          </div>
          <div className="ai-visualizer-container">
            <AudioVisualizer isSpeaking={isAssistantSpeaking} isListening={isRecording} />
          </div>
          <h1 className="ai-name text-3xl font-medium text-futuristic-text-primary mb-2">Sanskara</h1>
          <p className="ai-status text-base text-futuristic-text-secondary min-h-[24px] transition-opacity duration-300">
            {aiStatus}
          </p>
        </main>
        <Controls
          isRecording={isRecording}
          onTalkClick={handleTalkClick}
          isVideoActive={isVideoActive}
          onVideoClick={handleCameraToggle}
          isMuted={isMuted}
          onMuteClick={handleMuteToggle}
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
        <ChatHistory transcript={transcript} />
        <ChatInput onSendMessage={sendTextMessage} />
      </div>
    </ChatLayout>
  );
};

export default FuturisticChatPage;