import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext.tsx';
import { logError } from './utils/errorLogger';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  logError(new Error('Unhandled Promise Rejection'), {
    reason: event.reason,
    promise: event.promise,
    context: 'unhandledrejection',
  });
  // Prevent the default handling (e.g., logging to console by browser)
  event.preventDefault();
});

// Register service worker for performance - only in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
        logError(registrationError, { context: 'serviceWorkerRegistration' });
      });
  });
}
