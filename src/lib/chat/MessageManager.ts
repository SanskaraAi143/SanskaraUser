
const messageTypes = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
  ERROR: 'error'
};

class MessageManager {
  constructor() {
    this.messages = [];
    this.isLoadingHistory = false;
    this.hasMoreHistory = true;
    this.currentSessionId = null;
    this.messageListeners = new Set();
    this.historyPageSize = 50;
    this.isStreaming = false;
    this.currentStreamingMessage = null;
  }

  setSessionId(sessionId) {
    this.currentSessionId = sessionId;
  }

  addMessage(message) {
    const messageObj = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: message.type || messageTypes.USER,
      content: message.content || message.data,
      sessionId: this.currentSessionId,
      metadata: message.metadata || {},
      isStreaming: message.isStreaming || false
    };

    this.messages.push(messageObj);
    this.notifyListeners('add', messageObj);

    return messageObj.id;
  }

  updateLastMessage(updateFn) {
    if (this.messages.length > 0) {
      const lastIndex = this.messages.length - 1;
      const updatedMessage = updateFn(this.messages[lastIndex]);
      this.messages[lastIndex] = updatedMessage;
      this.notifyListeners('update', updatedMessage);
    }
  }

  startStreamingMessage() {
    this.isStreaming = true;
    this.currentStreamingMessage = {
      id: crypto.randomUUID(),
      type: messageTypes.ASSISTANT,
      content: '',
      isStreaming: true,
      timestamp: new Date()
    };

    this.messages.push(this.currentStreamingMessage);
    this.notifyListeners('add', this.currentStreamingMessage);

    return this.currentStreamingMessage.id;
  }

  appendToStreamingMessage(content) {
    if (this.currentStreamingMessage && this.isStreaming) {
      this.currentStreamingMessage.content += content;
      this.notifyListeners('update', this.currentStreamingMessage);
    }
  }

  endStreamingMessage() {
    if (this.currentStreamingMessage) {
      this.currentStreamingMessage.isStreaming = false;
      this.notifyListeners('update', this.currentStreamingMessage);
    }

    this.isStreaming = false;
    this.currentStreamingMessage = null;
  }

  async loadHistory(params = {}) {
    if (this.isLoadingHistory || !this.hasMoreHistory || !this.currentSessionId) {
      return;
    }

    this.isLoadingHistory = true;

    try {
      const queryParams = new URLSearchParams({
        limit: this.historyPageSize,
        offset: this.messages.filter(m => m.type !== messageTypes.SYSTEM).length,
        ...params
      });

      const response = await fetch(`/api/sessions/${this.currentSessionId}/history?${queryParams}`);

      if (!response.ok) {
        throw new Error(`History API error: ${response.status}`);
      }

      const data = await response.json();

      // Prepend history messages (older messages)
      const historyMessages = data.events.reverse(); // Reverse to show chronological order

      // Mark as history messages to distinguish from live messages
      historyMessages.forEach(msg => {
        msg.isHistoryMessage = true;
      });

      this.messages.unshift(...historyMessages);
      this.hasMoreHistory = data.has_more;

      // Notify listeners of history load
      this.notifyListeners('history_loaded', historyMessages);

    } catch (error) {
      console.error('Failed to load message history:', error);
      this.notifyListeners('error', { type: 'history_load_failed', error });
    } finally {
      this.isLoadingHistory = false;
    }
  }

  onMessageUpdate(callback) {
    this.messageListeners.add(callback);
    return () => this.messageListeners.delete(callback);
  }

  notifyListeners(eventType, data) {
    this.messageListeners.forEach(callback => callback(eventType, data));
  }

  clearMessages() {
    this.messages = [];
    this.hasMoreHistory = true;
    this.notifyListeners('cleared');
  }

  getMessages() {
    return [...this.messages];
  }

  getActiveMessage() {
    return this.currentStreamingMessage;
  }
}

export default MessageManager;
