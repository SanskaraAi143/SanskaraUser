import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import FuturisticChat from '@/components/futuristic-chat/FuturisticChat';
import { useAuth } from '@/context/AuthContext';
import { useMultimodalClient } from '@/hooks/useMultimodalClient';
import { useChatHistory } from '@/hooks/useChatHistory';
import { useToast } from '@/components/ui/use-toast';
import { useSessionArtifactsStore } from '@/store/sessionArtifactsStore';

const FuturisticChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null); 
  
  const [isMuted, setIsMuted] = useState(false);
  
  const { clearSelection, selectedArtifacts } = useSessionArtifactsStore();

  const {
    isAgentReady,
    isRecording,
    isAssistantSpeaking,
    transcript: multimodalTranscript,
    sendTextMessage,
    connectionState,
    sessionId,
    isVideoActive,
    activeVideoMode,
    initializeWebcam,
    initializeScreenShare,
    stopVideo,
    startRecording,
    stopRecording,
  } = useMultimodalClient(
    user?.internal_user_id,
    undefined // serverUrl param, was undefined
  );

  const { messages: historyMessages, isLoading: isLoadingHistory, hasMore: hasMoreHistory, loadMore: loadMoreHistory, error: historyError } = useChatHistory({
    userId: user?.internal_user_id,
    weddingId: user?.wedding_id,
    sessionId,
  });

  const allMessages = useMemo(() => {
    return [...historyMessages, ...multimodalTranscript];
  }, [historyMessages, multimodalTranscript]);

  const handleTalkClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleCameraToggle = async () => {
    if (isVideoActive && activeVideoMode === 'webcam') {
      stopVideo();
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    } else {
      try {
        await initializeWebcam(videoRef.current);
        if (videoRef.current?.srcObject && localVideoRef.current) {
            localVideoRef.current.srcObject = videoRef.current.srcObject;
        }
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

  const handleScreenShareToggle = async () => {
    if (isVideoActive && activeVideoMode === 'screen') {
      stopVideo();
    } else {
      try {
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }
        await initializeScreenShare(videoRef.current);
      } catch (err) {
        console.error("Error sharing screen:", err);
        toast({
          title: "Screen Share Error",
          description: "Could not start screen share. Please check permissions.",
          variant: "destructive",
        });
      }
    }
  };

  const handleMuteToggle = () => {
      setIsMuted(prevMuted => {
          const newMuted = !prevMuted;
          if (localVideoRef.current) {
            localVideoRef.current.muted = newMuted;
          }
          // Here you would also toggle the actual audio track being sent
          // For example: stream.getAudioTracks().forEach(track => track.enabled = !newMuted);
          return newMuted;
      });
  };

  const handleEndClick = () => {
      navigate('/dashboard'); 
  };
  
  const handleSend = useCallback((text: string) => {
    const base = text.trim();
    const suffix = selectedArtifacts.length ? `\n[FILES: ${selectedArtifacts.join(', ')}]` : '';
    sendTextMessage(base + suffix);
    if (selectedArtifacts.length) clearSelection();
  }, [sendTextMessage, selectedArtifacts, clearSelection]);

  return (
    <FuturisticChat
      isAgentReady={isAgentReady}
      connectionState={connectionState}
      isRecording={isRecording}
      isAssistantSpeaking={isAssistantSpeaking}
      // REMOVED: transcript={multimodalTranscript} // This was causing the TypeScript error
      onTalkClick={handleTalkClick}
      onEndClick={handleEndClick}
      onCameraToggle={handleCameraToggle}
      onScreenShareToggle={handleScreenShareToggle}
      isMuted={isMuted}
      onMuteToggle={handleMuteToggle}
      isVideoActive={isVideoActive}
      activeVideoMode={activeVideoMode}
      videoRef={videoRef}
      localVideoRef={localVideoRef}
      messages={allMessages}
      onSendMessage={handleSend}
      isLoadingHistory={isLoadingHistory}
      hasMoreHistory={hasMoreHistory}
      loadMoreHistory={loadMoreHistory}
    />
  );
};

export default FuturisticChatPage;
