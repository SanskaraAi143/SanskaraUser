import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import WebSocketService, { WebSocketMessage } from '@/components/chat/WebSocketService';

interface WebSocketState {
  // Service instance
  service: WebSocketService | null;
  // Connection state
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
  reconnectAttempts: number;

  // Messages and session data
  sessionId: string | null;
  chatSessionId: string | null;
  messages: WebSocketMessage[];

  // Recording/Audio states
  isRecording: boolean;
  isAssistantSpeaking: boolean;

  // Video states
  isVideoActive: boolean;
  activeVideoMode: 'webcam' | 'screen' | null;

  // Actions
  initializeService: (userId: string, serverUrl?: string) => Promise<void>;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  sendText: (text: string) => void;
  sendAudio: (audioData: ArrayBuffer) => void;
  sendVideo: (videoData: string) => void;
  sendBlob: (blobData: Blob, mime: string) => void;

  // State setters
  setRecording: (recording: boolean) => void;
  setAssistantSpeaking: (speaking: boolean) => void;
  setVideoActive: (active: boolean, mode: 'webcam' | 'screen' | null) => void;
  addMessage: (message: WebSocketMessage) => void;
  clearMessages: () => void;

  // Reconnection
  forceReconnect: () => void;
}

const getWebSocketUrl = (path = '/ws') => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const wsUrl = baseUrl.replace(/^https?:/, baseUrl.startsWith('https:') ? 'wss:' : 'ws:');
  return `${wsUrl}${path}`;
};

export const useWebSocketStore = create<WebSocketState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    service: null,
    connectionState: 'disconnected',
    reconnectAttempts: 0,
    sessionId: null,
    chatSessionId: null,
    messages: [],
    isRecording: false,
    isAssistantSpeaking: false,
    isVideoActive: false,
    activeVideoMode: null,

    // Initialize the WebSocket service
    initializeService: async (userId: string, serverUrl?: string) => {
      const url = serverUrl || getWebSocketUrl('/ws');
      const service = new WebSocketService(url, userId);

      // Subscribe to service messages
      const unsubscribe = service.subscribe((message: WebSocketMessage) => {
        const { addMessage, messages } = get();

        // Update state based on message type
        switch (message.type) {
          case 'session_id':
            set({ sessionId: message.data?.session_id });
            break;
          case 'chat_session_id':
            set({ chatSessionId: message.data?.chat_session_id });
            break;
          case 'ready':
            set({ connectionState: 'connected' });
            break;
          case 'reconnecting':
            set({ connectionState: 'reconnecting' });
            break;
          case 'error':
            set({ connectionState: 'error' });
            break;
          case 'interrupted':
            set({
              isRecording: false,
              isAssistantSpeaking: false
            });
            break;
          case 'turn_complete':
            set({
              isRecording: false,
              isAssistantSpeaking: false
            });
            break;
          case 'audio':
            // This is handled separately by the audio client
            set({ isAssistantSpeaking: true });
            break;
        }

        // Add to messages array (except for pure connection messages)
        if (!['ready', 'reconnecting'].includes(message.type)) {
          addMessage(message);
        }
      });

      set({
        service,
        messages: [], // Clear previous messages on new session
        sessionId: null,
        chatSessionId: null,
        connectionState: 'disconnected',
        reconnectAttempts: service.getReconnectAttempts(),
        isRecording: false,
        isAssistantSpeaking: false,
        isVideoActive: false,
        activeVideoMode: null,
      });

      // Store unsubscribe function for cleanup
      (service as any).unsubscribe = unsubscribe;
    },

    // Connect to WebSocket
    connect: async () => {
      const { service } = get();
      if (!service) {
        console.error('[WebSocketStore] Service not initialized');
        return false;
      }

      try {
        set({ connectionState: 'connecting' });
        await service.connect();
        set({
          connectionState: service.getConnectionState(),
          reconnectAttempts: service.getReconnectAttempts()
        });
        return true;
      } catch (error) {
        console.error('[WebSocketStore] Connection failed:', error);
        set({ connectionState: 'error' });
        return false;
      }
    },

    // Disconnect from WebSocket
    disconnect: () => {
      const { service } = get();
      if (service) {
        service.disconnect();
        (service as any).unsubscribe?.(); // Clean up subscription
      }
      set({
        service: null,
        connectionState: 'disconnected',
        sessionId: null,
        chatSessionId: null,
        isRecording: false,
        isAssistantSpeaking: false,
        isVideoActive: false,
        activeVideoMode: null,
      });
    },

    // Send methods
    sendText: (text: string) => {
      const { service, messages } = get();
      if (!service || !service.isConnected()) {
        console.warn('[WebSocketStore] Cannot send text: not connected');
        return;
      }

      service.sendText(text);

      // Add user message to local state
      const userMessage: WebSocketMessage = { type: 'text', data: text };
      const newMessages = [...messages, userMessage];
      set({ messages: newMessages });
    },

    sendAudio: (audioData: ArrayBuffer) => {
      const { service } = get();
      if (!service || !service.isConnected()) {
        console.warn('[WebSocketStore] Cannot send audio: not connected');
        return;
      }

      service.sendAudio(audioData);
    },

    sendVideo: (videoData: string) => {
      const { service } = get();
      if (!service || !service.isConnected()) {
        console.warn('[WebSocketStore] Cannot send video: not connected');
        return;
      }

      service.sendVideo(videoData);
    },

    sendBlob: (blobData: Blob, mime: string) => {
      const { service } = get();
      if (!service || !service.isConnected()) {
        console.warn('[WebSocketStore] Cannot send blob: not connected');
        return;
      }

      service.sendBlob(blobData, mime);
    },

    // State setters
    setRecording: (recording: boolean) => set({ isRecording: recording }),

    setAssistantSpeaking: (speaking: boolean) => set({ isAssistantSpeaking: speaking }),

    setVideoActive: (active: boolean, mode: 'webcam' | 'screen' | null) =>
      set({ isVideoActive: active, activeVideoMode: mode }),

    addMessage: (message: WebSocketMessage) => {
      const { messages } = get();
      set({ messages: [...messages, message] });
    },

    clearMessages: () => set({ messages: [] }),

    // Force reconnect
    forceReconnect: () => {
      const { service } = get();
      if (service) {
        service.forceReconnect();
      }
    },
  }))
);

// Selectors for common state slices
export const useConnectionState = () =>
  useWebSocketStore(state => state.connectionState);

export const useWebSocketMessages = () =>
  useWebSocketStore(state => state.messages);

export const useSessionIds = () =>
  useWebSocketStore(state => ({
    sessionId: state.sessionId,
    chatSessionId: state.chatSessionId
  }));

export const useWebSocketActions = () =>
  useWebSocketStore(state => ({
    connect: state.connect,
    disconnect: state.disconnect,
    sendText: state.sendText,
    sendAudio: state.sendAudio,
    sendVideo: state.sendVideo,
    sendBlob: state.sendBlob,
    forceReconnect: state.forceReconnect,
  }));

export default useWebSocketStore;
