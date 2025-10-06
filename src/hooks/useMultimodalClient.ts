import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import MultimodalClient from '../lib/multimodal-client.js';
import { getSessionHistory } from '../services/api/historyApi';
import { HistoryEvent, ChatMessageContent, ArtifactUploadContent } from '@/types/history';
import { useToast } from '@/components/ui/use-toast';

// This interface should be the single source of truth for message structure in the UI
export interface Message {
  id: string; // Unique ID for the message or event
  sender: 'user' | 'assistant' | 'system';
  text: string;
  isMarkdown?: boolean;
  timestamp: string;
  type: 'message' | 'artifact_upload' | 'system_event';

  // Optional fields for different event types
  artifactUrl?: string;
  artifactType?: string; // e.g., 'image', 'document'
  systemEventType?: string;
}


type ConnectionState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'failed';
const HISTORY_LIMIT = 20;

export const useMultimodalClient = (userId?: string, weddingId?: string, serverUrl?: string) => {
  const { toast } = useToast();

  // Client and connection state
  const clientRef = useRef<MultimodalClient | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const connectionStateRef = useRef<ConnectionState>('idle');

  // Real-time state
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [activeVideoMode, setActiveVideoMode] = useState<string | null>(null);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);

  // Transcript state
  const [realtimeTranscript, setRealtimeTranscript] = useState<Message[]>([]);
  const [historicalMessages, setHistoricalMessages] = useState<Message[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [historyOffset, setHistoryOffset] = useState(0);

  // Internal refs for managing state within callbacks
  const transcriptRef = useRef<Message[]>([]);
  const realtimeTranscriptRef = useRef<Message[]>([]);
  const currentAssistantMessageIndex = useRef<number | null>(null);
  const processingLockRef = useRef<boolean>(false);
  const reconnectAttemptsRef = useRef(0);
  const manualReconnectRequestedRef = useRef(false);
  const initiatedRef = useRef(false);
  const lastLocallySentUserTextRef = useRef<string | null>(null);

  // Refs for event handlers
  const disconnectHandlersRef = useRef<(() => void)[]>([]);
  const reconnectSuccessHandlersRef = useRef<(() => void)[]>([]);

  // Sync state to refs for use in callbacks
  useEffect(() => { transcriptRef.current = [...historicalMessages, ...realtimeTranscript]; }, [historicalMessages, realtimeTranscript]);
  useEffect(() => { realtimeTranscriptRef.current = realtimeTranscript; }, [realtimeTranscript]);
  useEffect(() => { connectionStateRef.current = connectionState; }, [connectionState]);

  // --- Callback Registration ---
  const registerOnDisconnect = (fn: () => void) => { disconnectHandlersRef.current.push(fn); };
  const registerOnReconnectSuccess = (fn: () => void) => { reconnectSuccessHandlersRef.current.push(fn); };

  // --- WebSocket Event Handlers ---
  const handleTextReceived = useCallback((message: { type: string; data: string; eventId?: string }) => {
    if (processingLockRef.current) return;
    processingLockRef.current = true;

    // Deduplication check against historical messages
    if (message.eventId && historicalMessages.some(histMsg => histMsg.id === message.eventId)) {
      processingLockRef.current = false;
      return; // Message already loaded from history
    }

    const newRealtimeTranscript = [...realtimeTranscriptRef.current];

    if (message.type === 'user_input') {
        const lastIdx = newRealtimeTranscript.length - 1;
        if (lastLocallySentUserTextRef.current === message.data) {
            lastLocallySentUserTextRef.current = null;
        } else if (lastIdx >= 0 && newRealtimeTranscript[lastIdx].sender === 'user' && newRealtimeTranscript[lastIdx].text === '...') {
            newRealtimeTranscript[lastIdx].text = message.data;
        } else {
            newRealtimeTranscript.push({ id: message.eventId || `local-${Date.now()}`, sender: 'user', text: message.data, type: 'message', timestamp: new Date().toISOString() });
        }
        currentAssistantMessageIndex.current = null;
        setIsAssistantTyping(false);
    } else if (message.type === 'text') {
        if (currentAssistantMessageIndex.current !== null && newRealtimeTranscript[currentAssistantMessageIndex.current]) {
            newRealtimeTranscript[currentAssistantMessageIndex.current].text += message.data;
        } else {
            newRealtimeTranscript.push({ id: message.eventId || `local-${Date.now()}`, sender: 'assistant', text: message.data, isMarkdown: true, type: 'message', timestamp: new Date().toISOString() });
            currentAssistantMessageIndex.current = newRealtimeTranscript.length - 1;
        }
    }

    setRealtimeTranscript(newRealtimeTranscript);
    processingLockRef.current = false;
  }, [historicalMessages]);

  const handleTurnComplete = useCallback(() => {
    currentAssistantMessageIndex.current = null;
    setIsAssistantSpeaking(false);
    setIsAssistantTyping(false);
  }, []);

  const handleInterrupted = useCallback(() => {
    currentAssistantMessageIndex.current = null;
    setIsAssistantSpeaking(false);
    setIsAssistantTyping(false);
    if (clientRef.current) {
        clientRef.current.interrupt();
    }
  }, []);

  const handleAudioReceived = useCallback(() => {
    setIsAssistantSpeaking(true);
  }, []);

  const setTypingHeuristic = useCallback(() => {
    if (currentAssistantMessageIndex.current !== null) {
      const msg = realtimeTranscriptRef.current[currentAssistantMessageIndex.current];
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


  // --- Connection Management ---
  const tearDownClient = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.close();
      clientRef.current = null;
    }
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (manualReconnectRequestedRef.current || !userId || connectionStateRef.current === 'failed') return;
    reconnectAttemptsRef.current += 1;
    const attempt = reconnectAttemptsRef.current;
    if (attempt > 8) {
      setConnectionState('failed');
      disconnectHandlersRef.current.forEach(h => h());
      return;
    }
    setConnectionState('reconnecting');
    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 15000);
    setTimeout(() => attemptConnect(), delay);
  }, [userId]);

  const attemptConnect = useCallback(() => {
    if (!userId) return;
    const existing = clientRef.current;
    if (existing && existing.ws && [WebSocket.OPEN, WebSocket.CONNECTING].includes(existing.ws.readyState)) {
      return;
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
      scheduleReconnect();
    };
    client.onClose = () => {
      disconnectHandlersRef.current.forEach(h => h());
      scheduleReconnect();
    };
    client.connect().catch(err => {
      console.error('Connect failed', err);
      scheduleReconnect();
    });
  }, [userId, serverUrl, handleTextReceived, handleTurnComplete, handleInterrupted, handleAudioReceived, scheduleReconnect, tearDownClient]);

  useEffect(() => {
    if (!userId || initiatedRef.current) return;
    initiatedRef.current = true;
    attemptConnect();
    return () => tearDownClient();
  }, [userId, attemptConnect, tearDownClient]);

  // --- History Fetching ---
  useEffect(() => {
    if (userId && weddingId && sessionId && historyOffset === 0) { // Only fetch initial history once
      const fetchAndFormatHistory = async () => {
        setIsLoadingHistory(true);
        setHistoryError(null);
        try {
          const historyResponse = await getSessionHistory({
            sessionId,
            limit: HISTORY_LIMIT,
            offset: historyOffset,
          });
          if (historyResponse && historyResponse.events) {
            const formattedMessages: Message[] = historyResponse.events
              .map((event: HistoryEvent): Message | null => {
                if (event.metadata.event_type === 'message') {
                  const chatContent = event.content as ChatMessageContent;
                  return {
                    id: chatContent.message_id,
                    sender: chatContent.sender === 'user' ? 'user' : 'assistant',
                    text: chatContent.content,
                    isMarkdown: chatContent.sender !== 'user',
                    timestamp: event.metadata.timestamp,
                    type: 'message',
                  };
                } else if (event.metadata.event_type === 'artifact_upload') {
                  const artifactContent = event.content as ArtifactUploadContent;
                  return {
                    id: artifactContent.artifact_id,
                    sender: 'system',
                    text: `Artifact uploaded: ${artifactContent.filename}`,
                    timestamp: event.metadata.timestamp,
                    type: 'artifact_upload',
                    artifactUrl: artifactContent.file_url,
                  };
                }
                return null;
              })
              .filter((msg): msg is Message => msg !== null);

            setHasMoreHistory(historyResponse.has_more);
            setHistoricalMessages(prev => [...formattedMessages.reverse(), ...prev]);
          } else {
            setHasMoreHistory(false);
          }
        } catch (error: any) {
          console.error('Failed to fetch session history:', error);
          setHistoryError(error.message || 'Failed to load chat history.');
        } finally {
          setIsLoadingHistory(false);
        }
      };
      fetchAndFormatHistory();
    }
  }, [userId, weddingId, sessionId, historyOffset]);

  const loadMoreHistory = useCallback(() => {
    if (!isLoadingHistory && hasMoreHistory) {
      setHistoryOffset(prev => prev + HISTORY_LIMIT);
    }
  }, [isLoadingHistory, hasMoreHistory]);

  // --- Combined Transcript ---
  const combinedTranscript = useMemo(() => {
    const allMessages = [...historicalMessages, ...realtimeTranscript];
    const uniqueMessages = Array.from(new Map(allMessages.map(m => [m.id, m])).values());
    return uniqueMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [historicalMessages, realtimeTranscript]);

  // --- User Actions ---
  const startRecording = async () => {
    const client = clientRef.current;
    if (!client) return;
    if (isAssistantSpeaking) client.interrupt();
    await client.startRecording();
    setIsRecording(true);
  };

  const stopRecording = () => {
    clientRef.current?.stopRecording();
    setIsRecording(false);
  };

  const sendTextMessage = (text: string) => {
    const client = clientRef.current;
    if (!client) return;
    if (isAssistantSpeaking) client.interrupt();
    client.sendText(text);
    lastLocallySentUserTextRef.current = text;
    setRealtimeTranscript(prev => [...prev, { id: `local-${Date.now()}`, sender: 'user', text, type: 'message', timestamp: new Date().toISOString() }]);
    currentAssistantMessageIndex.current = null;
  };

  const initializeWebcam = async (videoEl: HTMLVideoElement | null) => {
    if (!videoEl || !clientRef.current) return;
    try {
      const ok = await clientRef.current.initializeWebcam(videoEl);
      if (ok) {
        setIsVideoActive(true);
        setActiveVideoMode('webcam');
        if (clientRef.current.isConnected) clientRef.current.startVideoStream(1);
      }
    } catch (e) {
      console.error('Error initializing webcam', e);
    }
  };

  const initializeScreenShare = async (videoEl: HTMLVideoElement | null) => {
    if (!videoEl || !clientRef.current) return;
     try {
      const ok = await clientRef.current.initializeScreenShare(videoEl);
      if (ok) {
        setIsVideoActive(true);
        setActiveVideoMode('screen');
        if (clientRef.current.isConnected) clientRef.current.startVideoStream(1);
      }
    } catch (e) {
      console.error('Error initializing screen share', e);
    }
  };

  const stopVideo = () => {
    clientRef.current?.stopVideo();
    setIsVideoActive(false);
    setActiveVideoMode(null);
  };

  const reconnectNow = useCallback(() => {
    manualReconnectRequestedRef.current = true;
    reconnectAttemptsRef.current = 0;
    attemptConnect();
  }, [attemptConnect]);

  return {
    isConnected: connectionState === 'connected',
    connectionState,
    isRecording,
    isVideoActive,
    activeVideoMode,
    transcript: combinedTranscript,
    sessionId,
    isSpeaking: isAssistantSpeaking, // Use isAssistantSpeaking for the UI "isSpeaking" state
    isAssistantSpeaking,
    isAssistantTyping,
    isLoadingHistory,
    historyError,
    hasMoreHistory,
    loadMoreHistory,
    startRecording,
    stopRecording,
    initializeWebcam,
    initializeScreenShare,
    stopVideo,
    sendTextMessage,
    interruptAssistant: handleInterrupted,
    reconnectNow,
    registerOnDisconnect,
    registerOnReconnectSuccess,
  };
};