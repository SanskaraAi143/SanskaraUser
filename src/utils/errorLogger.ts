/**
 * Centralized error logging utility.
 * In a production environment, this would integrate with a dedicated error monitoring service
 * like Sentry, Datadog, LogRocket, or send logs to a custom backend endpoint.
 * For this task, it logs to the console with structured information.
 *
 * @param error The error object to log.
 * @param context Optional additional context related to the error (e.g., component name, function name, user ID).
 */
export const logError = (error: Error, context?: Record<string, any>): void => {
  if (process.env.NODE_ENV === 'development') {
    console.error('Logged Error:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      context: context,
      timestamp: new Date().toISOString(),
    });
  } else {
    // In production, send to a real error monitoring service or a custom backend.
    // Example placeholder:
    // sendErrorToMonitoringService({
    //   message: error.message,
    //   name: error.name,
    //   stack: error.stack,
    //   context: context,
    //   timestamp: new Date().toISOString(),
    // });
    console.error('Production Error:', {
      message: error.message,
      name: error.name,
      context: context,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * A basic custom error class for API-related errors.
 * This can be extended to include specific error codes, HTTP statuses, etc.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    // Set the prototype explicitly to ensure `instanceof` works correctly
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}