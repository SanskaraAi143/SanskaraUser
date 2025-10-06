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
    }
    else {
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
          // Also toggle mute state in the multimodal client if it controls the microphone stream
          // This part is assumed to be handled within the hook or related logic, for now we just manage local video mute
          return newMuted;
      });
  };

  return (
    <ChatLayout>
      <div className={cn('app-container', { 'video-active': isVideoActive })}>
        <div className="main-view-wrapper">
          <main className="audio-interface">
             <div className="video-feeds" id="video-feeds">
                <div className="video-feed partner-feed"><span>Partner's Video</span></div>
                <div className="video-feed user-feed">
                  <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover"/>
                </div>
            </div>
            <div className="ai-visualizer-container">
              <AudioVisualizer isSpeaking={isAssistantSpeaking} isListening={isRecording} />
            </div>
            <h1 className="ai-name">Sanskara</h1>
            <p className="ai-status">{aiStatus}</p>
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

        <div className="chat-panel open">
          <div className="chat-header">
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
          <ChatInput onSendMessage={sendTextMessage} />
        </div>
      </div>
    </ChatLayout>
  );
};

export default FuturisticChatPage;