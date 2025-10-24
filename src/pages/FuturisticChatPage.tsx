import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Paperclip, Image as ImageIcon, Loader2, X, MonitorPlay, Video, VideoOff } from 'lucide-react';
import FuturisticChat from '@/components/futuristic-chat/FuturisticChat';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useMultimodalClient } from '@/hooks/useMultimodalClient';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { ARTIFACTS_ENABLED } from '@/config/artifacts';
import { ArtifactSessionPanel } from '@/components/artifacts/ArtifactSessionPanel';
import { useSessionArtifactsStore } from '@/store/sessionArtifactsStore';
import { uploadArtifactV2 } from '@/services/api/sessionArtifactsApi';
import ChatErrorBoundary from '@/components/chat/ChatErrorBoundary';
import ConnectionStatusIndicator from '@/components/chat/ConnectionStatusIndicator';
import EnhancedChatHistory from '@/components/chat/EnhancedChatHistory';
import { getChatMessages, runAgent } from '@/services/api';
import { useWebSocket } from '@/hooks/useWebSocket';

const FuturisticChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showArtifactPanel, setShowArtifactPanel] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [keepSelection, setKeepSelection] = useState(false);

  const { resetForSession, uploadFile, selectedArtifacts, toggleSelect, clearSelection } = useSessionArtifactsStore();

  // Use original multimodal client for functionality (works with existing backend)
  const {
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
    isLoadingHistory,
    historyError,
    hasMoreHistory,
    loadMoreHistory,
    startRecording,
    stopRecording,
  } = useMultimodalClient(
    user?.internal_user_id,
    user?.wedding_id
  );

  // Use multimodal transcript as primary source, WebSocket messages are handled separately
  // WebSocket integration moved to separate effect below to avoid circular dependencies

  // WebSocket overlay for enhanced features disabled to prevent infinite loop
  // TODO: Re-enable when WebSocket backend is ready and infinite loop is fixed
  /*
  const {
    isConnected: wsConnected,
    messages: wsMessages,
  } = useWebSocket({
    autoConnect: true, // Enable WebSocket auto-connect after message parsing fix
  });
  */
  const wsConnected = false;
  const wsMessages: any[] = [];

  const [aiStatus, setAiStatus] = useState('Tap to begin conversation');
  const [isMuted, setIsMuted] = useState(false);

  // Update status based on connection and recording state
  useEffect(() => {
    if (connectionState === 'reconnecting') {
      setAiStatus('Reconnecting...');
    } else if (connectionState === 'failed') {
      setAiStatus('Connection failed');
    } else if (!sessionId && !isLoadingHistory) {
      setAiStatus('Establishing session...');
    } else if (isAssistantSpeaking) {
      setAiStatus('Speaking...');
    } else if (isRecording) {
      setAiStatus('Listening...');
    } else if (isVideoActive) {
      setAiStatus('Video call active');
    } else {
      setAiStatus('Tap to speak or type');
    }
  }, [connectionState, sessionId, isAssistantSpeaking, isRecording, isLoadingHistory, isVideoActive, activeVideoMode]);

  // WebSocket messages are logged but not integrated with multimodal transcript
  // to avoid infinite loops - this is for future enhancement
  useEffect(() => {
    if (wsMessages.length > 0) {
      console.log('WebSocket messages received:', wsMessages);
      // TODO: In future, integrate WebSocket messages with multimodal transcript when backend supports it
    }
  }, [wsMessages]);

  // Reset artifact session state when sessionId changes
  useEffect(() => {
    if (sessionId) {
      resetForSession();
    }
  }, [sessionId, resetForSession]);

  // Drag & Drop overlay
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); if (!dragActive) setDragActive(true); };
  const onDragLeave = (e: React.DragEvent) => { if (e.currentTarget === e.target) setDragActive(false); };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (!sessionId || !user?.internal_user_id) return;
    const files = Array.from(e.dataTransfer.files || []);
    if (!files.length) return;
    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: 'File too large', description: `${file.name} exceeds 10MB limit`, variant: 'destructive' });
        return;
      }
      uploadFile({ userId: user.internal_user_id!, sessionId, file }).then(() => {
        toast({ title: 'Uploaded', description: `${file.name} uploaded.` });
      }).catch(err => {
        toast({ title: 'Upload failed', description: err.message || 'Unknown error', variant: 'destructive' });
      });
    });
  };

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

  const handleScreenShareToggle = async () => {
    if (isVideoActive && activeVideoMode === 'screen') {
      stopVideo();
    } else {
      try {
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
      navigate('/dashboard'); // Navigate to dashboard
  };

  const userCanUseArtifacts = Boolean(user?.internal_user_id && ARTIFACTS_ENABLED);
  const artifactsReady = Boolean(sessionId) && connectionState === 'connected'; // gate UI until session established

  const insertVersionReference = useCallback((text: string) => {
    console.log("Insert Version Reference:", text);
    // If we wanted to send it as a message:
    // sendTextMessage(text);
  }, []);

  const handleSend = useCallback((text: string) => {
    const base = text.trim();
    const suffix = selectedArtifacts.length ? `\n[FILES: ${selectedArtifacts.join(', ')}]` : '';
    sendTextMessage(base + suffix);
    if (!keepSelection && selectedArtifacts.length) clearSelection();
  }, [sendTextMessage, selectedArtifacts, keepSelection, clearSelection]);

  return (
    <FuturisticChat
      isRecording={isRecording}
      isAssistantSpeaking={isAssistantSpeaking}
      transcript={multimodalTranscript}
      onTalkClick={handleTalkClick}
      onEndClick={handleEndClick}
      onCameraToggle={handleCameraToggle}
      onScreenShareToggle={handleScreenShareToggle}
      isMuted={isMuted}
      onMuteToggle={handleMuteToggle}
      isVideoActive={isVideoActive}
      activeVideoMode={activeVideoMode}
      videoRef={videoRef}
      messages={multimodalTranscript}
      onSendMessage={handleSend}
      user={user}
      isLoadingHistory={isLoadingHistory}
      hasMoreHistory={hasMoreHistory}
      loadMoreHistory={loadMoreHistory}
    />
  );
};

export default FuturisticChatPage;
