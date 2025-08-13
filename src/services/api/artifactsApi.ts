import { supabase } from './supabaseClient';

// Legacy artifactsApi removed. Use sessionArtifactsApi for session-scoped operations.
export const ARTIFACTS_ENABLED = false;
export function fetchRecentArtifacts() { throw new Error('fetchRecentArtifacts removed; use listArtifacts in sessionArtifactsApi'); }
export function uploadArtifact() { throw new Error('uploadArtifact removed; use uploadArtifactV2 in sessionArtifactsApi'); }
