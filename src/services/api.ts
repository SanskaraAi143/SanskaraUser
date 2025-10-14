// MCP/Google ADK API integration for agent chat, session, and artifact management
import axios from 'axios';
import { supabase } from './supabase/config';

// Set the MCP API base URL (prefer Vite env for consistency with other services)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Run agent (chat) - POST /run and /run_sse
export const runAgent = async (appName, userId, sessionId, newMessage, streaming = false) => {
  // Always ensure newMessage has role and parts (OpenAPI spec)
  const messagePayload = {
    role: newMessage.role || 'user',
    parts: newMessage.parts || [],
  };
  const payload = {
    appName,
    userId,
    sessionId,
    newMessage: messagePayload,
    streaming,
  };
  console.log('appname, userId, sessionId, newMessage, streaming', appName, userId, sessionId, messagePayload, streaming);
  if (streaming) {
    // Use /run_sse for streaming responses
    const response = await api.post('/run_sse', payload);
    return response.data;
  } else {
    // Use /run for normal responses
    const response = await api.post('/run', payload);
    return response.data;
  }
};

// List all apps - GET /list-apps
export const listApps = async () => {
  const response = await api.get('/list-apps');
  return response.data;
};

// List sessions for a user - GET /apps/{app_name}/users/{user_id}/sessions
export const listSessions = async (appName, userId) => {
  const response = await api.get(`/apps/${appName}/users/${userId}/sessions`);
  return response.data;
};

// Get a session - GET /apps/{app_name}/users/{user_id}/sessions/{session_id}
export const getSession = async (appName, userId, sessionId) => {
  const response = await api.get(`/apps/${appName}/users/${userId}/sessions/${sessionId}`);
  return response.data;
};

// Create a session - POST /apps/{app_name}/users/{user_id}/sessions
export const createSession = async (appName, userId, state = {}) => {
  const response = await api.post(`/apps/${appName}/users/${userId}/sessions`, state);
  return response.data;
};

// Delete a session - DELETE /apps/{app_name}/users/{user_id}/sessions/{session_id}
export const deleteSession = async (appName, userId, sessionId) => {
  const response = await api.delete(`/apps/${appName}/users/${userId}/sessions/${sessionId}`);
  return response.data;
};

// List artifacts for a session - GET /apps/{app_name}/users/{user_id}/sessions/{session_id}/artifacts
export const listArtifacts = async (appName, userId, sessionId) => {
  const response = await api.get(`/apps/${appName}/users/${userId}/sessions/${sessionId}/artifacts`);
  return response.data;
};

// Get artifact - GET /apps/{app_name}/users/{user_id}/sessions/{session_id}/artifacts/{artifact_name}
export const getArtifact = async (appName, userId, sessionId, artifactName, version) => {
  const params = version ? { version } : undefined;
  const response = await api.get(`/apps/${appName}/users/${userId}/sessions/${sessionId}/artifacts/${artifactName}`, { params });
  return response.data;
};

// Delete artifact - DELETE /apps/{app_name}/users/{user_id}/sessions/{session_id}/artifacts/{artifact_name}
export const deleteArtifact = async (appName, userId, sessionId, artifactName) => {
  const response = await api.delete(`/apps/${appName}/users/${userId}/sessions/${sessionId}/artifacts/${artifactName}`);
  return response.data;
};

// List artifact versions - GET /apps/{app_name}/users/{user_id}/sessions/{session_id}/artifacts/{artifact_name}/versions
export const listArtifactVersions = async (appName, userId, sessionId, artifactName) => {
  const response = await api.get(`/apps/${appName}/users/${userId}/sessions/${sessionId}/artifacts/${artifactName}/versions`);
  return response.data;
};

// Get artifact version - GET /apps/{app_name}/users/{user_id}/sessions/{session_id}/artifacts/{artifact_name}/versions/{version_id}
export const getArtifactVersion = async (appName, userId, sessionId, artifactName, versionId) => {
  const response = await api.get(`/apps/${appName}/users/${userId}/sessions/${sessionId}/artifacts/${artifactName}/versions/${versionId}`);
  return response.data;
};

// Debug: Get trace - GET /debug/trace/{event_id}
export const getTrace = async (eventId) => {
  const response = await api.get(`/debug/trace/${eventId}`);
  return response.data;
};

// Debug: Get session trace - GET /debug/trace/session/{session_id}
export const getSessionTrace = async (sessionId) => {
  const response = await api.get(`/debug/trace/session/${sessionId}`);
  return response.data;
};

interface HistoryParams {
  limit?: number;
  offset?: number;
  start_date?: string;
  end_date?: string;
  event_types?: ('message' | 'artifact_upload' | 'system_event')[];
}

// API endpoint to fetch chat history with pagination and filters
export const getChatMessages = async (
  weddingId: string,
  sessionId: string,
  params: { limit?: number; offset?: number } = {}
): Promise<any> => {
  if (!sessionId) {
    throw new Error('A session ID is required to fetch chat messages.');
  }
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('User not authenticated');

  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append('limit', String(params.limit));
  if (params.offset) queryParams.append('offset', String(params.offset));

  const url = `${API_BASE_URL}/sessions/${sessionId}/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const response = await axios.get(url, {
    headers: {
      'accept': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
  });

  // The actual API returns { events: [...] }, so we transform it to match what the client expects
  if (response.data && Array.isArray(response.data.events)) {
    return {
      history: response.data.events.map((event: any) => {
        const sender = event.content?.sender;
        const senderType = sender === 'User' ? 'user' : 'assistant';

        return {
          event_id: event.content?.message_id || `${sessionId}-${Math.random()}`,
          timestamp: event.metadata.timestamp,
          event_type: event.metadata.event_type,
          content: {
            text: event.content?.content,
          },
          metadata: {
            sender_type: senderType,
            sender_name: sender,
            session_id: event.content?.session_id,
            details: event.metadata.details,
          },
        };
      }),
      total_count: response.data.total_count || response.data.events.length,
      limit: response.data.limit || params.limit,
      offset: response.data.offset || params.offset,
    };
  }

  return { history: [], total_count: 0, limit: params.limit, offset: params.offset };
};

export default api;
