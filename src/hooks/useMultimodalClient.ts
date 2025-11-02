import { useState, useEffect, useRef, useCallback } from 'react';
import MultimodalClient from '../lib/multimodal-client.js';
import { getSession, getChatMessages } from '../services/api';

export interface Message {
  sender: string;
  text: string;
  isMarkdown?: boolean;
  timestamp?: string;
  eventId?: string;
  // Additional fields for artifact uploads and system events
  artifactUrl?: string;
  artifactType?: string;
  systemEventType?: string;
}

type VideoMode = 'webcam' | 'screen' | null;
type ConnectionState = 'idle' | 'connecting' | 'connected' | 'initializing' | 'reconnecting' | 'failed';

export const useMultimodalClient = (userId?: string, serverUrl?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isAgentReady, setIsAgentReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [activeVideoMode, setActiveVideoMode] = useState<VideoMode>(null);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');

  const clientRef = useRef<MultimodalClient | null>(null);
  const assistantMessageInProgress = useRef(false);
  const transcriptRef = useRef<Message[]>([]);
  const reconnectAttemptsRef = useRef(0);
  const manualReconnectRequestedRef = useRef(false);
  const disconnectHandlersRef = useRef<(() => void)[]>([]);
  const reconnectSuccessHandlersRef = useRef<(() => void)[]>([]);
  const connectionStateRef = useRef<ConnectionState>('idle');
  const initiatedRef = useRef(false);
  // Track last user text we sent locally to avoid double-inserting when server echoes it back as `user_input`
  const lastLocallySentUserTextRef = useRef<string | null>(null);

  const registerOnDisconnect = (fn: () => void) => { disconnectHandlersRef.current.push(fn); };
  const registerOnReconnectSuccess = (fn: () => void) => { reconnectSuccessHandlersRef.current.push(fn); };

  // keep transcript ref synced
  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);
  useEffect(() => { connectionStateRef.current = connectionState; }, [connectionState]);

  const handleTextReceived = useCallback((message: { type: string; data: string }) => {
    setTranscript(prevTranscript => {
      const newTranscript = [...prevTranscript];
      const lastMessage = newTranscript.length > 0 ? newTranscript[newTranscript.length - 1] : null;

      if (message.type === 'user_input') {
        assistantMessageInProgress.current = false;
        if (lastLocallySentUserTextRef.current === message.data) {
          lastLocallySentUserTextRef.current = null; // Consume echo
        } else if (lastMessage?.sender === 'user' && lastMessage.text === '...') {
          newTranscript[newTranscript.length - 1] = { ...lastMessage, text: message.data };
        } else {
          newTranscript.push({ sender: 'user', text: message.data });
        }
      } else if (message.type === 'text') {
        if (assistantMessageInProgress.current && lastMessage?.sender === 'assistant') {
          // This is the key fix: create a new object to ensure re-render
          newTranscript[newTranscript.length - 1] = { ...lastMessage, text: lastMessage.text + message.data };
        } else {
          assistantMessageInProgress.current = true;
          newTranscript.push({ sender: 'assistant', text: message.data, isMarkdown: true });
        }
      } else if (message.type === 'user_transcription') {
        assistantMessageInProgress.current = false;
        if (lastMessage?.sender === 'user' && lastMessage.text === '...') {
          newTranscript[newTranscript.length - 1] = { ...lastMessage, text: message.data };
        } else {
          newTranscript.push({ sender: 'user', text: message.data });
        }
      }
      return newTranscript;
    });
  }, []);

  const handleTurnComplete = useCallback(() => {
    assistantMessageInProgress.current = false;
    setIsSpeaking(false);
    setIsAssistantSpeaking(false);
    setIsAssistantTyping(false);
  }, []);

  const handleInterrupted = useCallback(() => {
    assistantMessageInProgress.current = false;
    setIsSpeaking(false);
    setIsAssistantSpeaking(false);
    if (clientRef.current && (clientRef.current as any).interrupt) {
      (clientRef.current as any).interrupt();
    }
  }, []);

  const handleAudioReceived = useCallback(() => {
    setIsSpeaking(true);
    setIsAssistantSpeaking(true);
  }, []);

  const setTypingHeuristic = useCallback(() => {
    if (assistantMessageInProgress.current) {
      setIsAssistantTyping(true);
      return;
    }
    setIsAssistantTyping(false);
  }, []);

  useEffect(() => {
    const id = setInterval(setTypingHeuristic, 800);
    return () => clearInterval(id);
  }, [setTypingHeuristic]);

  const scheduleReconnect = useCallback(() => {
    // rely on external state refs to avoid dependency churn
    if (manualReconnectRequestedRef.current) return;
    if (!userId) return;
    if (connectionStateRef.current === 'failed') return;
    reconnectAttemptsRef.current += 1;
    const attempt = reconnectAttemptsRef.current;
    if (attempt > 8) {
      setConnectionState('failed');
      disconnectHandlersRef.current.forEach(h => h());
      return;
    }
    setConnectionState('reconnecting');
    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 15000);
    setTimeout(() => { attemptConnect(); }, delay);
  }, [userId]);

  const tearDownClient = useCallback(() => {
    if (clientRef.current) {
      try { clientRef.current.close(); } catch {}
      clientRef.current = null;
    }
  }, []);

  const attemptConnect = useCallback(() => {
    if (!userId) return;
    // Avoid creating a new client if current is open/connecting
    const existing = clientRef.current as any;
    if (existing && existing.ws && [WebSocket.OPEN, WebSocket.CONNECTING].includes(existing.ws.readyState)) {
      return; // already trying/connected
    }
    tearDownClient();
    setConnectionState(reconnectAttemptsRef.current > 0 ? 'reconnecting' : 'connecting');
    const client = new MultimodalClient(userId, serverUrl, sessionId);
    clientRef.current = client;
    client.onConnected = () => {
      setIsConnected(true);
      setConnectionState('initializing');
    };
    client.onAgentReady = () => {
      setIsAgentReady(true);
      setConnectionState('connected');
      reconnectAttemptsRef.current = 0;
      manualReconnectRequestedRef.current = false;
      reconnectSuccessHandlersRef.current.forEach(h => h());
    };
    client.onSessionIdReceived = (id: string) => {
      console.log('[useMultimodalClient] sessionId received:', id);
      setSessionId(id);
    };
    client.onTextReceived = handleTextReceived;
    client.onTurnComplete = handleTurnComplete;
    client.onInterrupted = handleInterrupted;
    client.onAudioReceived = handleAudioReceived;
    client.onError = (err: any) => {
      console.error('Multimodal client error', err);
      setIsConnected(false);
      scheduleReconnect();
    };
    client.onClose = () => {
      setIsConnected(false);
      disconnectHandlersRef.current.forEach(h => h());
      scheduleReconnect();
    };
    client.connect().catch(err => {
      console.error('Connect failed', err);
      setIsConnected(false);
      scheduleReconnect();
    });
  }, [userId, serverUrl, handleTextReceived, handleTurnComplete, handleInterrupted, handleAudioReceived, scheduleReconnect, tearDownClient]);

  // Initial connect (once) – avoids dependency on attemptConnect to stop loop
  useEffect(() => {
    if (!userId) return;
    if (initiatedRef.current) return;
    initiatedRef.current = true;
    attemptConnect();
  }, [userId, attemptConnect]); // Added attemptConnect to dependency array for completeness

  // Cleanup on unmount
  useEffect(() => { return () => { tearDownClient(); }; }, [tearDownClient]);

  const reconnectNow = useCallback(() => {
    manualReconnectRequestedRef.current = true;
    reconnectAttemptsRef.current = 0;
    attemptConnect();
  }, [attemptConnect]);

  const startRecording = async () => {
    const client = clientRef.current;
    if (!client) return;
    try {
      if (isAssistantSpeaking && (client as any).interrupt) {
        (client as any).interrupt();
        setIsAssistantSpeaking(false);
      }
      await (client as any).startRecording();
      setIsRecording(true);
      setIsSpeaking(true);
      const newTranscript = [...transcriptRef.current, { sender: 'user', text: '...' }];
      transcriptRef.current = newTranscript;
      setTranscript(newTranscript);
      assistantMessageInProgress.current = false;
    } catch (e) {
      console.error('Error starting recording', e);
    }
  };

  const stopRecording = () => {
    const client = clientRef.current;
    if (!client) return;
    (client as any).stopRecording();
    setIsRecording(false);
    setIsSpeaking(false);
    const newTranscript = [...transcriptRef.current];
    if (newTranscript.length > 0 && newTranscript[newTranscript.length - 1].sender === 'user' && newTranscript[newTranscript.length - 1].text === '...') {
      newTranscript.pop();
      transcriptRef.current = newTranscript;
      setTranscript(newTranscript);
    }
  };

  const initializeWebcam = async (videoEl: HTMLVideoElement) => {
    const client = clientRef.current;
    if (!client) return;
    try {
      const ok = await (client as any).initializeWebcam(videoEl);
      if (ok) {
        setIsVideoActive(true);
        setActiveVideoMode('webcam');
        if ((client as any).isConnected) (client as any).startVideoStream(1);
      }
    } catch (e) {
      console.error('Error initializing webcam', e);
    }
  };

  const initializeScreenShare = async (videoEl: HTMLVideoElement) => {
    const client = clientRef.current;
    if (!client) return;
    try {
      const ok = await (client as any).initializeScreenShare(videoEl);
      if (ok) {
        setIsVideoActive(true);
        setActiveVideoMode('screen');
        if ((client as any).isConnected) (client as any).startVideoStream(1);
      }
    } catch (e) {
      console.error('Error initializing screen share', e);
    }
  };

  const stopVideo = () => {
    const client = clientRef.current;
    if (!client) return;
    (client as any).stopVideo();
    setIsVideoActive(false);
    setActiveVideoMode(null);
  };

  const sendTextMessage = (text: string) => {
    const client = clientRef.current;
    if (!client) return;
    if (isAssistantSpeaking && (client as any).interrupt) {
      (client as any).interrupt();
      setIsAssistantSpeaking(false);
    }
    (client as any).sendText(text);
    // Reset assistant message index so the next assistant response starts a fresh bubble
    assistantMessageInProgress.current = false;
    const newTranscript = [...transcriptRef.current, { sender: 'user', text }];
    transcriptRef.current = newTranscript;
    setTranscript(newTranscript);
    // Remember locally-sent text to ignore server echo of the same content
    lastLocallySentUserTextRef.current = text;
  };

  const interruptAssistant = () => {
    const client = clientRef.current;
    if (!client || !isAssistantSpeaking) return;
    if ((client as any).interrupt) {
      (client as any).interrupt();
      setIsAssistantSpeaking(false);
      setIsSpeaking(false);
    }
  };

  return {
    isConnected,
    isAgentReady,
    connectionState,
    isRecording,
    isVideoActive,
    activeVideoMode,
    transcript,
    sessionId,
    isSpeaking,
    isAssistantSpeaking,
    isAssistantTyping,
    startRecording,
    stopRecording,
    initializeWebcam,
    initializeScreenShare,
    stopVideo,
    sendTextMessage,
    interruptAssistant,
    reconnectNow,
    registerOnDisconnect,
    registerOnReconnectSuccess,
  };
};
