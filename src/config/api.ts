// src/config/api.ts
const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function to convert HTTP API URL to WebSocket URL
const getWebSocketUrl = (path: string = '/ws') => {
  const baseUrl = BASE_API_URL;
  const wsUrl = baseUrl.replace(/^https?:/, baseUrl.startsWith('https:') ? 'wss:' : 'ws:');
  return `${wsUrl}${path}`;
};

export { BASE_API_URL, getWebSocketUrl };