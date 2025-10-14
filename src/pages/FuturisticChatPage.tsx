import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Paperclip, Image as ImageIcon, Loader2, X, MonitorPlay, Video, VideoOff } from 'lucide-react';
import ChatLayout from '@/components/futuristic-chat/ChatLayout';
import AudioVisualizer from '@/components/futuristic-chat/AudioVisualizer';
import ChatHistory from '@/components/futuristic-chat/ChatHistory';
import ChatInput from '@/components/futuristic-chat/ChatInput';
import Controls from '@/components/futuristic-chat/Controls';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useMultimodalClient } from '@/hooks/useMultimodalClient';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { ARTIFACTS_ENABLED } from '@/config/artifacts';
import { ArtifactSessionPanel } from '@/components/artifacts/ArtifactSessionPanel';
import { useSessionArtifactsStore } from '@/store/sessionArtifactsStore';
import { uploadArtifactV2 } from '@/services/api/sessionArtifactsApi';

const FuturisticChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showArtifactPanel, setShowArtifactPanel] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [keepSelection, setKeepSelection] = useState(false);

  const { resetForSession, uploadFile, selectedArtifacts, toggleSelect, clearSelection } = useSessionArtifactsStore();

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
    initializeScreenShare,
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
  }, [connectionState, sessionId, isAssistantSpeaking, isAssistantTyping, isRecording, isLoadingHistory, isVideoActive, activeVideoMode]);

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
    <ChatLayout>
      {/* Main View */}
      <div className={cn("flex-[3] relative flex flex-col border-r border-futuristic-border transition-all duration-500 ease-in-out", { 'video-active': isVideoActive })}
        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
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
          activeVideoMode={activeVideoMode as 'webcam' | 'screen' | null}
          onCameraClick={handleCameraToggle}
          onScreenShareClick={handleScreenShareToggle}
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
            onClick={() => navigate('/dashboard')} // Navigate to dashboard
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
        {/* Selected artifact pills */}
        {selectedArtifacts.length > 0 && (
          <div className="px-4 pt-2 pb-1 bg-futuristic-container-bg border-t border-futuristic-border flex gap-2 flex-wrap items-center">
            {selectedArtifacts.map(fname => (
              <span key={fname} className="flex items-center gap-1 text-[10px] bg-futuristic-secondary-bg border border-futuristic-border text-futuristic-text-secondary px-2 py-0.5 rounded-full">
                {fname}
                <button aria-label={`Remove ${fname}`} onClick={() => toggleSelect(fname)} className="hover:text-red-600"><X className="h-3 w-3" /></button>
              </span>
            ))}
            <span className="ml-auto flex items-center gap-2">
              <label className="flex items-center gap-1 text-[10px] text-futuristic-text-secondary">
                <input type="checkbox" className="accent-futuristic-primary-accent" checked={keepSelection} onChange={e => setKeepSelection(e.target.checked)} />
                Keep after send
              </label>
              {!keepSelection && <button className="text-[10px] text-futuristic-text-secondary hover:text-futuristic-primary-accent" onClick={clearSelection}>Clear</button>}
            </span>
          </div>
        )}
        <div className="flex items-end gap-2 p-4 border-t border-futuristic-border">
          {userCanUseArtifacts && (
            <Button size="icon" variant="ghost" className="h-9 w-9 text-futuristic-text-secondary hover:text-futuristic-primary-accent" title={artifactsReady ? 'Session Artifacts' : 'Waiting for session'} disabled={!artifactsReady} onClick={() => setShowArtifactPanel(p => !p)}>
              {artifactsReady ? <Paperclip className="h-5 w-5" /> : <Loader2 className="h-5 w-5 animate-spin" />}
            </Button>
          )}
          {/* Removed redundant paperclip button */}
          <Button size="icon" variant="ghost" disabled className="h-9 w-9 opacity-40 text-futuristic-text-secondary" title="Images (future)">
            <ImageIcon className="h-5 w-5" />
          </Button>
          <ChatInput onSendMessage={handleSend} disabled={!sessionId} />
        </div>
      </div>

      {/* Session Artifact Panel */}
      {showArtifactPanel && userCanUseArtifacts && artifactsReady && sessionId && user?.internal_user_id && (
        <ArtifactSessionPanel
          userId={user.internal_user_id}
          sessionId={sessionId}
          onInsertVersion={insertVersionReference}
          onClose={() => setShowArtifactPanel(false)}
        />
      )}

      {/* Drag Overlay */}
      {dragActive && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-futuristic-primary-accent/10 backdrop-blur-sm border-4 border-dashed border-futuristic-primary-accent text-futuristic-primary-accent text-lg font-semibold" onDragLeave={() => setDragActive(false)}>Drop files to upload (session)</div>
      )}
    </ChatLayout>
  );
};

export default FuturisticChatPage;