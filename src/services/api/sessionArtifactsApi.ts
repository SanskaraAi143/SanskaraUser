import { ARTIFACTS_ENABLED } from '@/config/artifacts';
import { APP_NAME } from '@/config/app';

// New session-based artifact API (v2)
// Endpoint contract (as provided):
// POST /artifacts/upload multipart: user_id, session_id, file, caption?, app_name?
//   -> { artifact: { version, filename, mime_type, size_bytes, caption, auto_summary, session_id, user_id } }
// GET /artifacts/list?user_id=&session_id=
//   -> { artifacts: [ { version, filename, mime_type, size_bytes, caption?, auto_summary? } ] }
// GET /artifacts/content?user_id=&session_id=&version=
//   -> { artifact: { version, filename, mime_type, base64_content } }

export interface SessionArtifactMeta {
  version: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  caption?: string;
  auto_summary?: string;
  uploaded_at?: string;
  status?: 'uploading' | 'uploaded' | 'error';
  error?: string;
  // client-only progress
  progress?: number;
}

export interface SessionArtifactContent extends SessionArtifactMeta {
  base64_content: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function ensureEnabled() {
  if (!ARTIFACTS_ENABLED) throw new Error('Artifacts disabled');
  if (!API_BASE_URL) throw new Error('API base URL missing');
}

export async function listArtifacts(params: { userId: string; sessionId: string; signal?: AbortSignal; }): Promise<SessionArtifactMeta[]> {
  ensureEnabled();
  const { userId, sessionId, signal } = params;
  const url = `${API_BASE_URL}/artifacts/list?user_id=${encodeURIComponent(userId)}&session_id=${encodeURIComponent(sessionId)}&app_name=${encodeURIComponent(APP_NAME)}`;
  const res = await fetch(url, { signal, headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`List artifacts failed (${res.status})`);
  const json = await res.json();
  return json.artifacts || [];
}

export async function fetchArtifactContent(params: { userId: string; sessionId: string; version: string; signal?: AbortSignal; }): Promise<SessionArtifactContent> {
  ensureEnabled();
  const { userId, sessionId, version, signal } = params;
  const url = `${API_BASE_URL}/artifacts/content?user_id=${encodeURIComponent(userId)}&session_id=${encodeURIComponent(sessionId)}&version=${encodeURIComponent(version)}&app_name=${encodeURIComponent(APP_NAME)}`;
  const res = await fetch(url, { signal, headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`Fetch artifact content failed (${res.status})`);
  const json = await res.json();
  return json.artifact;
}

export function uploadArtifactV2(params: {
  userId: string;
  sessionId: string;
  file: File;
  caption?: string;
  onProgress?: (p: number) => void;
  signal?: AbortSignal;
}): Promise<SessionArtifactMeta> {
  ensureEnabled();
  const { userId, sessionId, file, caption, onProgress, signal } = params;
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('user_id', userId);
    form.append('session_id', sessionId);
    form.append('file', file);
    if (caption) form.append('caption', caption);
    form.append('app_name', APP_NAME);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE_URL}/artifacts/upload`);

    xhr.upload.onprogress = e => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText);
          resolve(json.artifact);
        } catch (e) {
          reject(e);
        }
      } else {
        reject(new Error(`Upload failed (${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.onabort = () => reject(new Error('Upload aborted'));
    if (signal) signal.addEventListener('abort', () => xhr.abort());
    xhr.send(form);
  });
}
