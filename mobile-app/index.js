import { registerRootComponent } from 'expo';

import App from './src/App';
import { logError } from './src/utils/errorLogger';

// Global error handler
const originalErrorHandler = ErrorUtils.getGlobalHandler();

ErrorUtils.setGlobalHandler((error, isFatal) => {
  logError(error, { context: 'globalErrorHandler', isFatal });

  // Optionally, re-throw the error in development to see the red screen
  if (__DEV__) {
    originalErrorHandler(error, isFatal);
  }
});


registerRootComponent(App);
