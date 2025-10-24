
class ErrorHandler {
  constructor() {
    this.errorTypes = {
      NETWORK_ERROR: 'network_error',
      PERMISSION_DENIED: 'permission_denied',
      DEVICE_NOT_FOUND: 'device_not_found',
      SESSION_EXPIRED: 'session_expired',
      RATE_LIMITED: 'rate_limited',
      INVALID_MESSAGE: 'invalid_message',
      BROWSER_INCOMPATIBILITY: 'browser_incompatibility'
    };

    this.errorListeners = new Set();
  }

  handleConnectionError(error, context = {}) {
    let errorType = this.errorTypes.NETWORK_ERROR;
    let userMessage = 'Connection lost. Attempting to reconnect...';
    let isRetryable = true;

    if (error.name === 'SecurityError' || error.message.includes('permission')) {
      errorType = this.errorTypes.PERMISSION_DENIED;
      userMessage = 'Permission denied. Please allow microphone/camera access.';
      isRetryable = false;
    } else if (error.message.includes('NotFoundError') || error.message.includes('device')) {
      errorType = this.errorTypes.DEVICE_NOT_FOUND;
      userMessage = 'Required device not found. Please check your connections.';
      isRetryable = false;
    }

    this.notifyErrorListeners({
      type: errorType,
      message: userMessage,
      originalError: error,
      context: context,
      retryable: isRetryable,
      timestamp: new Date()
    });

    return { errorType, userMessage, isRetryable };
  }

  handleWebSocketError(data, context = {}) {
    const errorMessage = data.data || 'Unknown WebSocket error';
    let errorType = this.errorTypes.NETWORK_ERROR;
    let isRetryable = true;

    if (errorMessage.includes('session') || errorMessage.includes('wedding')) {
      errorType = this.errorTypes.SESSION_EXPIRED;
      isRetryable = false;
    } else if (errorMessage.includes('rate') || errorMessage.includes('limit')) {
      errorType = this.errorTypes.RATE_LIMITED;
      isRetryable = true;
    }

    this.notifyErrorListeners({
      type: errorType,
      message: errorMessage,
      context: context,
      retryable: isRetryable,
      timestamp: new Date()
    });
  }

  handleMediaError(error, mediaType, context = {}) {
    let errorType = this.errorTypes.NETWORK_ERROR;
    let userMessage = `Error with ${mediaType} handling`;
    let isRetryable = true;

    if (error.name === 'NotAllowedError') {
      errorType = this.errorTypes.PERMISSION_DENIED;
      userMessage = `${mediaType} access denied. Please grant permissions and try again.`;
      isRetryable = false;
    } else if (error.name === 'NotFoundError') {
      errorType = this.errorTypes.DEVICE_NOT_FOUND;
      userMessage = `No ${mediaType} device found. Please connect a device and refresh.`;
      isRetryable = false;
    } else if (error.name === 'NotSupportedError') {
      errorType = this.errorTypes.BROWSER_INCOMPATIBILITY;
      userMessage = `This browser doesn't support ${mediaType}. Please use a modern browser.`;
      isRetryable = false;
    }

    this.notifyErrorListeners({
      type: errorType,
      message: userMessage,
      mediaType: mediaType,
      originalError: error,
      context: context,
      retryable: isRetryable,
      timestamp: new Date()
    });

    return { errorType, userMessage, isRetryable };
  }

  handleAPIError(error, apiEndpoint, context = {}) {
    let errorType = this.errorTypes.NETWORK_ERROR;
    let userMessage = 'API request failed';
    let isRetryable = true;

    if (error.status === 401) {
      errorType = this.errorTypes.SESSION_EXPIRED;
      userMessage = 'Session expired. Please refresh the page.';
      isRetryable = false;
    } else if (error.status === 429) {
      errorType = this.errorTypes.RATE_LIMITED;
      userMessage = 'Too many requests. Please wait and try again.';
      isRetryable = true;
    } else if (error.status >= 500) {
      userMessage = 'Server error. Please try again later.';
      isRetryable = true;
    } else if (error.status >= 400) {
      errorType = this.errorTypes.INVALID_MESSAGE;
      userMessage = 'Invalid request. Please check your input.';
      isRetryable = false;
    }

    this.notifyErrorListeners({
      type: errorType,
      message: userMessage,
      apiEndpoint: apiEndpoint,
      statusCode: error.status,
      originalError: error,
      context: context,
      retryable: isRetryable,
      timestamp: new Date()
    });

    return { errorType, userMessage, isRetryable };
  }

  onError(callback) {
    this.errorListeners.add(callback);
    return () => this.errorListeners.delete(callback);
  }

  notifyErrorListeners(errorData) {
    this.errorListeners.forEach(callback => callback(errorData));
  }
}

const globalErrorHandler = new ErrorHandler();

export { ErrorHandler, globalErrorHandler };
