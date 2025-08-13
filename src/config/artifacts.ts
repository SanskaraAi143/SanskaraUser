// Central artifact feature configuration
export const ARTIFACTS_ENABLED = import.meta.env.VITE_ENABLE_ARTIFACTS !== 'false';
export const ARTIFACTS_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ARTIFACTS_POLL_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes
export const ARTIFACTS_ALLOWED_MIME_PREFIXES = ['image/', 'text/', 'application/pdf']; // extend as needed

export function isMimeAllowed(mime: string) {
  return ARTIFACTS_ALLOWED_MIME_PREFIXES.some(p => mime.startsWith(p));
}
