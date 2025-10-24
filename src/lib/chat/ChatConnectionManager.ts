
const connectionState = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error'
};

class ChatConnectionManager {
  constructor() {
    this.state = connectionState.DISCONNECTED;
    this.ws = null;
    this.sessionId = null;
    this.chatSessionId = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    this.baseReconnectDelay = 750; // ms
    this.listeners = new Set();
    this.heartbeatInterval = null;
  }

  connect(userId, weddingId, adkSessionId, chatSessionId) {
    // Build WebSocket URL with parameters
    let wsUrl = `${import.meta.env.VITE_API_BASE_URL.replace('https', 'wss')}/ws?user_id=${userId}&wedding_id=${weddingId}`;

    const params = [];
    if (adkSessionId) params.push(`adk_session_id=${adkSessionId}`);
    if (chatSessionId) params.push(`chat_session_id=${chatSessionId}`);
    if (params.length) wsUrl += '&' + params.join('&');

    this.state = connectionState.CONNECTING;
    this.notifyStateChange(this.state);

    this.ws = new WebSocket(wsUrl);
    this.setupWebSocketHandlers();
  }

  setupWebSocketHandlers() {
    this.ws.onopen = () => {
      this.state = connectionState.CONNECTED;
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.notifyStateChange(this.state);
    };

    this.ws.onmessage = (event) => {
      this.handleMessage(event);
    };

    this.ws.onclose = (event) => {
      this.handleConnectionClose(event);
    };

    this.ws.onerror = (error) => {
      this.handleConnectionError(error);
    };
  }

  handleMessage(event) {
    let data;
    try {
      data = JSON.parse(event.data);
    } catch (e) {
      console.error('Failed to parse WebSocket message:', e);
      return;
    }

    const type = data.type;

    switch (type) {
      case 'session_id':
        this.sessionId = data.data;
        break;
      case 'ready':
        // Connection fully established
        break;
      case 'error':
        this.notifyError(data.data);
        break;
      case 'reconnecting':
        this.state = connectionState.RECONNECTING;
        this.notifyStateChange(this.state, data.data);
        break;
      default:
        // Forward to message handler
        this.onMessageReceived(type, data);
    }
  }

  handleConnectionClose(event) {
    this.stopHeartbeat();
    if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.attemptReconnection();
    } else {
      this.state = connectionState.DISCONNECTED;
      this.notifyStateChange(this.state);
    }
  }

  handleConnectionError(error) {
    console.error('WebSocket error:', error);
    this.state = connectionState.ERROR;
    this.notifyStateChange(this.state, error);
  }

  attemptReconnection() {
    this.reconnectAttempts++;
    const delay = this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      this.state = connectionState.RECONNECTING;
      this.notifyStateChange(this.state, { attempt: this.reconnectAttempts });
      this.connect(this.lastUserId, this.lastWeddingId, this.sessionId, this.chatSessionId);
    }, delay);
  }

  sendMessage(message) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      throw new Error('WebSocket is not connected');
    }
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        // Backend should respond appropriately to ping
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // 30 second heartbeat
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.state = connectionState.DISCONNECTED;
    this.notifyStateChange(this.state);
  }

  onStateChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyStateChange(newState, data) {
    this.state = newState;
    this.listeners.forEach(callback => callback(newState, data));
  }

  notifyError(errorMessage) {
    this.listeners.forEach(callback => {
      if (callback.name === 'onError') callback(errorMessage);
    });
  }
}

export default ChatConnectionManager;
