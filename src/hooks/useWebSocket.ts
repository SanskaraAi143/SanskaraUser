import { useEffect, useRef, useCallback } from 'react';
import { useWebSocketStore, useConnectionState, useWebSocketMessages, useSessionIds, useWebSocketActions } from '@/store/webSocketStore';
import { useAuth } from '@/context/AuthContext';

interface UseWebSocketOptions {
  autoConnect?: boolean;
  serverUrl?: string;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: any) => void;
  onMessage?: (message: any) => void;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const {
    autoConnect = true,
    serverUrl,
    onConnected,
    onDisconnected,
    onError,
    onMessage,
  } = options;

  const { user } = useAuth();
  const initializedRef = useRef(false);

  const {
    service,
    sessionId,
    chatSessionId,
    messages,
    isRecording,
    isAssistantSpeaking,
    isVideoActive,
    activeVideoMode,
    connectionState,
    initializeService,
    connect,
    disconnect,
    setRecording,
    setAssistantSpeaking,
    setVideoActive,
    clearMessages,
  } = useWebSocketStore();

  const actions = useWebSocketActions();

  // Initialize service when user changes or on first load
  useEffect(() => {
    if (!user?.internal_user_id || initializedRef.current) return;

    console.log('[useWebSocket] Initializing WebSocket service for user:', user.internal_user_id);

    const setup = async () => {
      try {
        await initializeService(user.internal_user_id, serverUrl);

        if (autoConnect) {
          const connected = await connect();
          if (connected && onConnected) {
            onConnected();
          }
        }

        initializedRef.current = true;
      } catch (error) {
        console.error('[useWebSocket] Setup failed:', error);
        if (onError) onError(error);
      }
    };

    if (!autoConnect) {
      // Only setup service if not auto-connecting to prevent loops
      try {
        initializeService(user.internal_user_id, serverUrl);
        initializedRef.current = true;
      } catch (error) {
        console.error('[useWebSocket] Service initialization failed:', error);
        if (onError) onError(error);
      }
    } else {
      setup();
    }

    // Cleanup function
    return () => {
      if (service) {
        service.disconnect();
      }
      initializedRef.current = false;
    };
  }, [user?.internal_user_id, initializeService, connect, service, autoConnect, serverUrl, onConnected, onError]);

  // Handle connection state changes
  useEffect(() => {
    switch (connectionState) {
      case 'connected':
        if (onConnected) onConnected();
        break;
      case 'disconnected':
        if (onDisconnected) onDisconnected();
        break;
      case 'error':
        if (onError) onError(new Error('WebSocket connection error'));
        break;
    }
  }, [connectionState, onConnected, onDisconnected, onError]);

  // Handle message callbacks
  useEffect(() => {
    if (messages.length > 0 && onMessage) {
      onMessage(messages[messages.length - 1]);
    }
  }, [messages, onMessage]);

  // Recording controls
  const startRecording = useCallback(() => {
    if (!service?.isConnected()) {
      console.warn('[useWebSocket] Cannot start recording: not connected');
      return;
    }
    setRecording(true);
  }, [service, setRecording]);

  const stopRecording = useCallback(() => {
    if (!service?.isConnected()) {
      console.warn('[useWebSocket] Cannot stop recording: not connected');
      return;
    }
    setRecording(false);
  }, [service, setRecording]);

  // Video controls
  const initializeWebcam = useCallback(async (videoElement?: HTMLVideoElement) => {
    if (!videoElement) {
      console.error('[useWebSocket] Video element required for webcam');
      return false;
    }

    try {
      setVideoActive(true, 'webcam');
      // TODO: Implement actual webcam initialization with audio client
      console.log('[useWebSocket] Webcam initialized (placeholder)');
      return true;
    } catch (error) {
      console.error('[useWebSocket] Webcam initialization failed:', error);
      setVideoActive(false, null);
      return false;
    }
  }, [setVideoActive]);

  const initializeScreenShare = useCallback(async (videoElement?: HTMLVideoElement) => {
    if (!videoElement) {
      console.error('[useWebSocket] Video element required for screen share');
      return false;
    }

    try {
      setVideoActive(true, 'screen');
      // TODO: Implement actual screen share initialization with audio client
      console.log('[useWebSocket] Screen share initialized (placeholder)');
      return true;
    } catch (error) {
      console.error('[useWebSocket] Screen share initialization failed:', error);
      setVideoActive(false, null);
      return false;
    }
  }, [setVideoActive]);

  const stopVideo = useCallback(() => {
    setVideoActive(false, null);
    // TODO: Implement actual video stream cleanup
    console.log('[useWebSocket] Video stopped');
  }, [setVideoActive]);

  // Enhanced message sending with validation
  const sendTextMessage = useCallback((text: string) => {
    if (!text?.trim()) {
      console.warn('[useWebSocket] Cannot send empty text message');
      return;
    }

    if (text.length > 10000) { // 10KB limit
      console.warn('[useWebSocket] Text message too large');
      return;
    }

    actions.sendText(text.trim());
  }, [actions]);

  const sendAudioData = useCallback((audioData: ArrayBuffer) => {
    if (!audioData || audioData.byteLength === 0) {
      console.warn('[useWebSocket] Invalid audio data');
      return;
    }

    // Limit audio chunk size (e.g., 1MB)
    if (audioData.byteLength > 1024 * 1024) {
      console.warn('[useWebSocket] Audio data too large');
      return;
    }

    actions.sendAudio(audioData);
  }, [actions]);

  const sendVideoFrame = useCallback((videoData: string) => {
    if (!videoData) {
      console.warn('[useWebSocket] Missing video frame data');
      return;
    }

    actions.sendVideo(videoData);
  }, [actions]);

  const sendFile = useCallback((file: File) => {
    // Validate file
    if (!file) {
      console.warn('[useWebSocket] No file provided');
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      console.warn('[useWebSocket] File too large:', file.name);
      return;
    }

    // Validate file type (basic check)
    const allowedTypes = ['image/', 'text/', 'application/pdf', 'application/json'];
    const isAllowedType = allowedTypes.some(type => file.type.startsWith(type));
    if (!isAllowedType) {
      console.warn('[useWebSocket] Unsupported file type:', file.type);
      return;
    }

    actions.sendBlob(file, file.type);
  }, [actions]);

  // Session management
  const resetSession = useCallback(() => {
    clearMessages();
    if (service) {
      service.forceReconnect();
    }
  }, [clearMessages, service]);

  // Multiple tabs synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'websocket_sess' + (user?.internal_user_id || '')) {
        // Handle session conflict from another tab
        console.log('[useWebSocket] Session conflict detected');
        // Could disconnect and reconnect with new session
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user?.internal_user_id]);

  return {
    // State
    isConnected: connectionState === 'connected',
    connectionState,
    sessionId,
    chatSessionId,
    messages,
    isRecording,
    isAssistantSpeaking,
    isVideoActive,
    activeVideoMode,

    // Actions
    connect: async () => {
      const result = await actions.connect();
      return result;
    },
    disconnect: actions.disconnect,
    reconnect: actions.forceReconnect,

    // Message sending
    sendTextMessage,
    sendAudioData,
    sendVideoData: sendVideoFrame,
    sendFile,

    // Recording controls
    startRecording,
    stopRecording,

    // Video controls
    initializeWebcam,
    initializeScreenShare,
    stopVideo,

    // Session management
    resetSession,
  };
};

export default useWebSocket;
