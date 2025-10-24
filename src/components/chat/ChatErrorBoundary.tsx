import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logError } from '@/utils/errorLogger';
import { globalErrorHandler } from '@/lib/chat/ErrorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  maxRetries: number;
}

class ChatErrorBoundary extends Component<Props, State> {
  private retryTimeoutRef: NodeJS.Timeout | null = null;
  private unsubscribeFromGlobalErrorHandler: (() => void) | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      maxRetries: 3,
    };
  }

  componentDidMount() {
    this.unsubscribeFromGlobalErrorHandler = globalErrorHandler.onError(this.handleGlobalError);
  }

  componentWillUnmount() {
    if (this.retryTimeoutRef) {
      clearTimeout(this.retryTimeoutRef);
    }
    if (this.unsubscribeFromGlobalErrorHandler) {
      this.unsubscribeFromGlobalErrorHandler();
    }
  }

  handleGlobalError = (errorData: any) => {
    this.setState({
      hasError: true,
      error: errorData.originalError || new Error(errorData.message),
    });
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ChatErrorBoundary] Chat error caught:', error, errorInfo);
    logError(error, {
      component: 'ChatErrorBoundary',
      errorInfo,
      retryCount: this.state.retryCount,
      timestamp: new Date().toISOString(),
    });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });

    if (this.shouldRetry(error) && this.state.retryCount < this.state.maxRetries) {
      this.retryTimeoutRef = setTimeout(() => {
        this.handleRetry();
      }, 2000);
    }
  }

  shouldRetry = (error: Error): boolean => {
    const retryableErrors = [
      'WebSocket connection error',
      'NetworkError',
      'TimeoutError',
      'Failed to establish WebSocket connection',
    ];

    return retryableErrors.some(retryError =>
      error.message.includes(retryError) ||
      error.name.includes(retryError)
    );
  };

  handleRetry = () => {
    console.log(`[ChatErrorBoundary] Retrying... Attempt ${this.state.retryCount + 1}/${this.state.maxRetries}`);

    this.setState(prevState => ({
      retryCount: prevState.retryCount + 1,
      hasError: false,
      error: null,
      errorInfo: null,
    }));
  };

  handleRefresh = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    });

    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, retryCount, maxRetries } = this.state;
      const canRetry = retryCount < maxRetries;
      const autoRetrying = this.retryTimeoutRef !== null;

      return (
        <div className="chat-error-fallback flex flex-col items-center justify-center min-h-[200px] p-8 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 rounded-2xl border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-800 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>

          <h3 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-2 text-center">
            Chat temporarily unavailable
          </h3>

          <p className="text-sm text-red-700 dark:text-red-300 mb-4 text-center max-w-md">
            {error?.message || 'An unexpected error occurred in the chat system.'}
          </p>

          {canRetry && !autoRetrying && (
            <p className="text-xs text-red-600 dark:text-red-400 mb-4">
              Retry attempt {retryCount + 1} of {maxRetries}
            </p>
          )}

          {autoRetrying && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 mb-4">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Auto-retrying connection...
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            {canRetry && !autoRetrying && (
              <Button
                onClick={this.handleRetry}
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}

            <Button
              onClick={this.handleRefresh}
              variant="default"
              size="sm"
              className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Chat
            </Button>

            <Button
              onClick={this.handleGoHome}
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && error?.stack && (
            <details className="mt-4 w-full max-w-lg">
              <summary className="text-xs text-red-500 cursor-pointer hover:text-red-400">
                Debug Info
              </summary>
              <pre className="mt-2 p-2 bg-red-50 dark:bg-red-900 rounded text-xs text-red-800 dark:text-red-200 overflow-auto max-h-32">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChatErrorBoundary;
