import { useState, useEffect, useRef, useCallback } from 'react';
import MultimodalClient from '../lib/multimodal-client.js';

interface Message {
  sender: string;
  text: string;
  isMarkdown?: boolean;
}

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'failed';

export const useMultimodalClient = (userId?: string, serverUrl?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [activeVideoMode, setActiveVideoMode] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');

  const clientRef = useRef<MultimodalClient | null>(null);
  const currentAssistantMessageIndex = useRef<number | null>(null);
  const transcriptRef = useRef<Message[]>([]);
  const processingLockRef = useRef<boolean>(false);
  const reconnectAttemptsRef = useRef(0);
  const manualReconnectRequestedRef = useRef(false);
  const disconnectHandlersRef = useRef<(() => void)[]>([]);
  const reconnectSuccessHandlersRef = useRef<(() => void)[]>([]);
  const connectionStateRef = useRef<ConnectionState>('idle');
  const initiatedRef = useRef(false);

  const registerOnDisconnect = (fn: () => void) => { disconnectHandlersRef.current.push(fn); };
  const registerOnReconnectSuccess = (fn: () => void) => { reconnectSuccessHandlersRef.current.push(fn); };

  // keep transcript ref synced
  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);
  useEffect(() => { connectionStateRef.current = connectionState; }, [connectionState]);

  const handleTextReceived = useCallback((message: { type: string; data: string }) => {
    if (processingLockRef.current) return;
    processingLockRef.current = true;
    const newTranscript = [...transcriptRef.current];
    if (message.type === 'user_input') {
      const lastIdx = newTranscript.length - 1;
      if (lastIdx >= 0 && newTranscript[lastIdx].sender === 'user' && newTranscript[lastIdx].text === '...') {
        newTranscript[lastIdx].text = message.data;
      } else {
        newTranscript.push({ sender: 'user', text: message.data });
      }
    } else if (message.type === 'text') {
      if (currentAssistantMessageIndex.current !== null && newTranscript[currentAssistantMessageIndex.current]) {
        newTranscript[currentAssistantMessageIndex.current].text += message.data;
      } else {
        newTranscript.push({ sender: 'assistant', text: message.data, isMarkdown: true });
        currentAssistantMessageIndex.current = newTranscript.length - 1;
      }
    }
    transcriptRef.current = newTranscript;
    setTranscript(newTranscript);
    processingLockRef.current = false;
  }, []);

  const handleTurnComplete = useCallback(() => {
    currentAssistantMessageIndex.current = null;
    setIsSpeaking(false);
    setIsAssistantSpeaking(false);
    setIsAssistantTyping(false);
  }, []);

  const handleInterrupted = useCallback(() => {
    currentAssistantMessageIndex.current = null;
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
    if (currentAssistantMessageIndex.current !== null) {
      const msg = transcriptRef.current[currentAssistantMessageIndex.current];
      if (msg && msg.sender === 'assistant') {
        setIsAssistantTyping(true);
        return;
      }
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
    const client = new MultimodalClient(userId, serverUrl);
    clientRef.current = client;
    client.onReady = () => {
      setIsConnected(true);
      setConnectionState('connected');
      reconnectAttemptsRef.current = 0;
      manualReconnectRequestedRef.current = false;
      reconnectSuccessHandlersRef.current.forEach(h => h());
    };
    client.onSessionIdReceived = (id: string) => setSessionId(id);
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
  }, [userId]);

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
      currentAssistantMessageIndex.current = null;
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
    const newTranscript = [...transcriptRef.current, { sender: 'user', text }];
    transcriptRef.current = newTranscript;
    setTranscript(newTranscript);
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
