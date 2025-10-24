import { useState, useEffect, useRef, useCallback } from 'react';
import ChatConnectionManager from '../lib/chat/ChatConnectionManager';
import MessageManager from '../lib/chat/MessageManager';
import HistoryService from '../lib/chat/HistoryService';
import AudioRecordingManager from '../lib/chat/AudioRecordingManager';
import VideoCaptureManager from '../lib/chat/VideoCaptureManager';

export interface Message {
  sender: string;
  text: string;
  isMarkdown?: boolean;
  timestamp?: string;
  eventId?: string;
  artifactUrl?: string;
  artifactType?: string;
  systemEventType?: string;
}

type VideoMode = 'webcam' | 'screen' | null;
type ConnectionState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'failed';

export const useMultimodalClient = (userId?: string, weddingId?: string, serverUrl?: string) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [activeVideoMode, setActiveVideoMode] = useState<VideoMode>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');

  const connectionManager = useRef(new ChatConnectionManager()).current;
  const messageManager = useRef(new MessageManager()).current;
  const historyService = useRef(new HistoryService('/api')).current;
  const audioManager = useRef(new AudioRecordingManager()).current;
  const videoManager = useRef(new VideoCaptureManager()).current;

  useEffect(() => {
    if (userId && weddingId) {
      connectionManager.connect(userId, weddingId);
    }

    const unsubscribeState = connectionManager.onStateChange((state, data) => {
      setConnectionState(state);
      if (state === 'connected') {
        messageManager.setSessionId(connectionManager.sessionId);
        historyService.getSessionHistory(connectionManager.sessionId, { limit: 20 })
          .then(history => {
            messageManager.addMessage({type: 'history', data: history});
          });
      }
    });

    const unsubscribeMessage = messageManager.onMessageUpdate((eventType, data) => {
        if (eventType === 'add' || eventType === 'update' || eventType === 'history_loaded' || 'cleared') {
            setMessages(messageManager.getMessages());
        }
    });

    return () => {
      unsubscribeState();
      unsubscribeMessage();
      connectionManager.disconnect();
    };
  }, [userId, weddingId, connectionManager, messageManager, historyService]);

  const sendTextMessage = (text: string) => {
    connectionManager.sendMessage({ type: 'text', data: text });
    messageManager.addMessage({type: 'user', content: text});
  };

  const loadMoreHistory = useCallback(() => {
    if (!messageManager.isLoadingHistory && messageManager.hasMoreHistory) {
      historyService.getSessionHistory(messageManager.currentSessionId, {
        offset: messageManager.messages.length,
        limit: 50
      }).then(history => {
        messageManager.addMessage({type: 'history', data: history});
      });
    }
  }, [messageManager, historyService]);

  const startRecording = async () => {
    try {
      await audioManager.startRecording();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    audioManager.stopRecording();
    setIsRecording(false);
  };

  const initializeWebcam = async (videoEl: HTMLVideoElement) => {
    try {
        await videoManager.startCameraCapture();
        setIsVideoActive(true);
        setActiveVideoMode('camera');
    } catch (error) {
        console.error("Error initializing webcam", error);
    }
  };

  const initializeScreenShare = async (videoEl: HTMLVideoElement) => {
    try {
        await videoManager.startScreenCapture();
        setIsVideoActive(true);
        setActiveVideoMode('screen');
    } catch (error) {
        console.error("Error initializing screen share", error);
    }
  };

  const stopVideo = () => {
    videoManager.stopCapture();
    setIsVideoActive(false);
    setActiveVideoMode(null);
  };

  const interruptAssistant = () => {
    // This will be handled by the message manager in the future
    setIsAssistantSpeaking(false);
    setIsSpeaking(false);
  };

  return {
    isConnected: connectionState === 'connected',
    connectionState,
    isRecording,
    isVideoActive,
    activeVideoMode,
    transcript: messages,
    sessionId: connectionManager.sessionId,
    isSpeaking,
    isAssistantSpeaking,
    isAssistantTyping,
    isLoadingHistory: messageManager.isLoadingHistory,
    historyError: null, // Replace with error handling from ErrorHandler
    hasMoreHistory: messageManager.hasMoreHistory,
    loadMoreHistory,
    startRecording,
    stopRecording,
    initializeWebcam,
    initializeScreenShare,
    stopVideo,
    sendTextMessage,
    interruptAssistant,
    reconnectNow: () => connectionManager.connect(userId, weddingId),
    registerOnDisconnect: () => {},
    registerOnReconnectSuccess: () => {},
  };
};
