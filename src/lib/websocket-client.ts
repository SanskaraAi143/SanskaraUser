import EventEmitter from 'events';

export type ConnectionState = 'connecting' | 'initializing' | 'connected' | 'reconnecting' | 'failed';
export type MessageType = 'text' | 'audio' | 'video' | 'control' | 'session_id' | 'agent_ready' | 'ready' | 'turn_complete' | 'interrupted' | 'error';

interface WebSocketMessage {
  type: MessageType;
  data?: any;
  mime?: string;
}

interface WebSocketClientOptions {
  userId: string;
  sessionId?: string;
  mode?: 'live' | 'test';
  reconnectAttempts?: number;
  reconnectInterval?: number;
  pingInterval?: number;
}

interface InternalWebSocketClientOptions extends Required<Omit<WebSocketClientOptions, 'sessionId'>> {
  sessionId?: string;
}

export class WebSocketClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private url: string;
  private options: InternalWebSocketClientOptions;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;
  private _connectionState: ConnectionState = 'connecting';
  private _sessionId: string | null = null;
  private _isAgentReady = false;

  constructor(baseUrl: string, options: WebSocketClientOptions) {
    super();
    this.url = this.buildWebSocketUrl(baseUrl, options);
    this.options = {
      reconnectAttempts: 5,
      reconnectInterval: 1000,
      pingInterval: 30000,
      mode: 'live',
      ...options
    };
  }

  private buildWebSocketUrl(baseUrl: string, options: WebSocketClientOptions): string {
    const url = new URL(baseUrl);
    url.searchParams.set('user_id', options.userId);
    url.searchParams.set('mode', options.mode || 'live');
    if (options.sessionId) {
      url.searchParams.set('session_id', options.sessionId);
    }
    return url.toString();
  }

  get connectionState(): ConnectionState {
    return this._connectionState;
  }

  get sessionId(): string | null {
    return this._sessionId;
  }

  get isAgentReady(): boolean {
    return this._isAgentReady;
  }

  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.CONNECTING || this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        this._connectionState = 'connecting';
        this.emit('connectionStateChanged', this._connectionState);

        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          this._connectionState = 'initializing';
          this.emit('connectionStateChanged', this._connectionState);
          this.startPingInterval();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          this.handleDisconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.handleDisconnect();
        };

      } catch (error) {
        this.handleDisconnect();
        reject(error);
      }
    });
  }

  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'session_id':
        this._sessionId = message.data;
        this.emit('sessionId', message.data);
        break;

      case 'agent_ready':
      case 'ready': // Handle legacy 'ready' message
        this._isAgentReady = true;
        this._connectionState = 'connected';
        this.emit('connectionStateChanged', this._connectionState);
        this.emit('agentReady');
        break;

      case 'turn_complete':
        this.emit('turnComplete');
        break;

      case 'interrupted':
        this.emit('interrupted');
        break;

      case 'error':
        this.emit('error', message.data);
        break;

      default:
        this.emit('message', message);
    }
  }

  private handleDisconnect(): void {
    this.clearTimers();
    
    if (this._connectionState !== 'failed') {
      this._connectionState = 'reconnecting';
      this.emit('connectionStateChanged', this._connectionState);
      this.scheduleReconnect();
    }
  }

  private async scheduleReconnect(): Promise<void> {
    if (this.reconnectAttempt >= this.options.reconnectAttempts) {
      this._connectionState = 'failed';
      this.emit('connectionStateChanged', this._connectionState);
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempt), 30000);
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectAttempt++;
      try {
        await this.connect();
        this.reconnectAttempt = 0;
      } catch (error) {
        this.scheduleReconnect();
      }
    }, delay);
  }

  private startPingInterval(): void {
    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, this.options.pingInterval);
  }

  private clearTimers(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      throw new Error('WebSocket is not connected');
    }
  }

  close(): void {
    this.clearTimers();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
