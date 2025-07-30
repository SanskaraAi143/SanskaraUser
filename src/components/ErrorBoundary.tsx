import React from 'react';
import { logError } from '../utils/errorLogger';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logError(error, { componentStack: info.componentStack, context: 'ErrorBoundary' });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, textAlign: 'center', color: '#b91c1c', background: '#fffbe7' }}>
          <h2>Something went wrong.</h2>
          <pre style={{ color: '#b91c1c', marginTop: 16 }}>{this.state.error?.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
