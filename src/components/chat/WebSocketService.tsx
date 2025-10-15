// WebSocket Service Implementation for Sanskara AI Chat
// Implements robust WebSocket communication with reconnection and subscriber pattern

// WebSocket Message Types
export interface WebSocketMessage {
  type: 'text' | 'audio' | 'video' | 'blob' | 'session_id' | 'chat_session_id' | 'ready' | 'error' | 'interrupted' | 'turn_complete' | 'reconnecting';
  data?: any;
  mime?: string;
}

export interface WebSocketMessageData {
  session_id?: string;
  chat_session_id?: string;
  text?: string;
  audioData?: ArrayBuffer;
  videoData?: string; // base64
  blobData?: Blob;
  error?: string;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectDelay = 1000; // ms
  private subscribers = new Set<(message: WebSocketMessage) => void>();
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error' = 'disconnected';
  private url: string;
  private userId: string;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private messageQueue: WebSocketMessage[] = [];

  constructor(url: string, userId: string) {
    this.url = url;
    this.userId = userId;
  }

  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    this.connectionState = 'connecting';
    const fullUrl = `${this.url}?user_id=${this.userId}`;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(fullUrl);

        this.ws.onopen = () => {
          console.log('[WebSocketService] Connected successfully');
          this.connectionState = 'connected';
          this.reconnectAttempts = 0;
          this.processMessageQueue();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const messages = this.parseMultipleJSONs(event.data);
            messages.forEach((message: WebSocketMessage) => {
              console.log('[WebSocketService] Received message:', message.type);
              this.notifySubscribers(message);
            });
          } catch (error) {
            console.error('[WebSocketService] Failed to parse message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('[WebSocketService] Connection closed:', event.code, event.reason);
          this.connectionState = 'disconnected';
          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('[WebSocketService] WebSocket error:', error);
          this.connectionState = 'error';
        };

        // Timeout after 10 seconds
        setTimeout(() => {
          if (this.connectionState === 'connecting') {
            reject(new Error('Connection timeout'));
            this.ws?.close();
          }
        }, 10000);

      } catch (error) {
        this.connectionState = 'error';
        reject(error);
      }
    });
  }

  private scheduleReconnect() {
    if (this.connectionState === 'reconnecting') return;

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`[WebSocketService] Scheduling reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    this.notifySubscribers({ type: 'reconnecting' });

    this.reconnectTimer = setTimeout(() => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.connectionState = 'reconnecting';
        this.connect().then(() => {
          this.notifySubscribers({ type: 'ready' });
        }).catch(() => {
          // Connection failed, schedule next attempt
        });
      } else {
        this.connectionState = 'error';
        this.notifySubscribers({
          type: 'error',
          data: { error: 'Failed to reconnect after multiple attempts' }
        });
      }
    }, delay);
  }

  private notifySubscribers(message: WebSocketMessage) {
    this.subscribers.forEach(callback => callback(message));
  }

  private processMessageQueue() {
    while (this.messageQueue.length > 0 && this.connectionState === 'connected') {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendMessage(message);
      }
    }
  }

  subscribe(callback: (message: WebSocketMessage) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  sendText(text: string) {
    this.sendMessage({ type: 'text', data: text });
  }

  sendAudio(audioData: ArrayBuffer) {
    this.sendMessage({ type: 'audio', data: audioData });
  }

  sendVideo(videoData: string) {
    this.sendMessage({ type: 'video', data: videoData });
  }

  sendBlob(blobData: Blob, mime: string) {
    this.sendMessage({ type: 'blob', data: blobData, mime });
  }

  private sendMessage(message: WebSocketMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('[WebSocketService] Failed to send message:', error);
        this.messageQueue.unshift(message); // Re-queue the message
      }
    } else {
      // Queue the message for when connection is restored
      if (this.connectionState !== 'reconnecting') {
        this.messageQueue.push(message);
      }

      if (this.connectionState !== 'reconnecting' && this.connectionState !== 'connecting') {
        this.scheduleReconnect();
      }
    }
  }

  private parseMultipleJSONs(data: string): WebSocketMessage[] {
    const messages: WebSocketMessage[] = [];
    const jsonRegex = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
    let match;

    while ((match = jsonRegex.exec(data)) !== null) {
      try {
        const parsed = JSON.parse(match[0]);
        messages.push(parsed);
      } catch (error) {
        console.warn('[WebSocketService] Failed to parse individual JSON chunk:', match[0], error);
      }
    }

    return messages.length > 0 ? messages : [JSON.parse(data)]; // Fallback to single JSON parse
  }

  disconnect() {
    this.connectionState = 'disconnected';
    this.reconnectAttempts = 0;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.messageQueue = [];
  }

  getConnectionState() {
    return this.connectionState;
  }

  isConnected() {
    return this.connectionState === 'connected';
  }

  getReconnectAttempts() {
    return this.reconnectAttempts;
  }

  // Force immediate reconnect
  forceReconnect() {
    this.disconnect();
    this.reconnectAttempts = 0;
    this.connect().then(() => {
      this.notifySubscribers({ type: 'ready' });
    });
  }
}

export default WebSocketService;
