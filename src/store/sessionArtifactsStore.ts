import { create } from 'zustand';
import { SessionArtifactMeta, uploadArtifactV2, listArtifacts, fetchArtifactContent, SessionArtifactContent } from '@/services/api/sessionArtifactsApi';

interface ArtifactByNameEntry {
  filename: string;
  versions: string[]; // version ids newest first
  selected: boolean;
}

interface SessionArtifactsState {
  byVersion: Record<string, SessionArtifactMeta & { status?: string; progress?: number; error?: string; }>; // keep for preview/content
  order: string[]; // versions newest first (legacy internal)
  artifactsByName: Record<string, ArtifactByNameEntry>;
  artifactOrder: string[]; // filenames newest first
  selectedArtifacts: string[]; // filenames selected for next message
  loading: boolean;
  lastFetchedAt?: number;
  uploading: boolean;
  uploadProgress?: number;
  selectedVersion?: string;
  pendingCaption: string;
  contentCache: Record<string, string>; // version -> content/URL
  contentLoading: Record<string, boolean>;
  error?: string;
  maxFileSize: number;
  listArtifacts: (userId: string, sessionId: string, force?: boolean) => Promise<void>;
  uploadFile: (params: { userId: string; sessionId: string; file: File; caption?: string; }) => Promise<void>;
  setPendingCaption: (c: string) => void;
  selectVersion: (v?: string) => void;
  fetchContentIfNeeded: (userId: string, sessionId: string, version: string) => Promise<void>;
  resetForSession: () => void;
  toggleSelect: (filename: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  upsertArtifactMeta: (a: SessionArtifactMeta & { status?: string; progress?: number; error?: string }) => void;
}

export const useSessionArtifactsStore = create<SessionArtifactsState>((set, get) => ({
  byVersion: {},
  order: [],
  artifactsByName: {},
  artifactOrder: [],
  selectedArtifacts: [],
  loading: false,
  uploading: false,
  pendingCaption: '',
  contentCache: {},
  contentLoading: {},
  maxFileSize: 10 * 1024 * 1024,

  upsertArtifactMeta(a) {
    set(s => {
      const byVersion = { ...s.byVersion, [a.version]: a };
      const artifactsByName = { ...s.artifactsByName };
      const existingNameEntry = artifactsByName[a.filename];
      let versions: string[];
      if (existingNameEntry) {
        // add version to front if new
        versions = existingNameEntry.versions.includes(a.version)
          ? existingNameEntry.versions
          : [a.version, ...existingNameEntry.versions];
      } else {
        versions = [a.version];
      }
      artifactsByName[a.filename] = {
        filename: a.filename,
        versions,
        selected: existingNameEntry?.selected || false,
      };
      // maintain artifactOrder (filenames) newest first
      const artifactOrder = [a.filename, ...s.artifactOrder.filter(f => f !== a.filename)];
      // maintain version order
      const order = [a.version, ...s.order.filter(v => v !== a.version)];
      return { byVersion, artifactsByName, artifactOrder, order };
    });
  },

  async listArtifacts(userId, sessionId, force = false) {
    const { lastFetchedAt, loading } = get();
    const now = Date.now();
    if (!force && !loading && lastFetchedAt && now - lastFetchedAt < 30000) return;
    set({ loading: true, error: undefined });
    try {
      const items = await listArtifacts({ userId, sessionId });
      items.forEach(a => get().upsertArtifactMeta({ ...a, status: 'uploaded' }));
      set({ loading: false, lastFetchedAt: now });
    } catch (e:any) {
      set({ loading: false, error: e.message || 'Failed to list artifacts' });
    }
  },

  async uploadFile({ userId, sessionId, file, caption }) {
    if (file.size > get().maxFileSize) {
      set({ error: 'File too large' });
      return;
    }
    const tempVersion = `temp-${crypto.randomUUID()}`;
    const tempMeta: SessionArtifactMeta & { status: string; progress: number } = {
      version: tempVersion,
      filename: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      caption,
      status: 'uploading',
      progress: 0,
    } as any;
    get().upsertArtifactMeta(tempMeta);
    set({ uploading: true, uploadProgress: 0 });
    try {
      const artifact = await uploadArtifactV2({ userId, sessionId, file, caption, onProgress: p => set(st => ({ uploadProgress: p, byVersion: { ...st.byVersion, [tempVersion]: { ...st.byVersion[tempVersion], progress: p } } })) });
      // replace temp with real
      set(s => {
        const { [tempVersion]: _old, ...rest } = s.byVersion;
        return { byVersion: rest };
      });
      get().upsertArtifactMeta({ ...artifact, status: 'uploaded' });
      set({ uploading: false, uploadProgress: undefined });
    } catch (e:any) {
      set(s => ({
        uploading: false,
        uploadProgress: undefined,
        byVersion: { ...s.byVersion, [tempVersion]: { ...s.byVersion[tempVersion], status: 'error', error: e.message || 'Upload failed' } }
      }));
    }
  },

  setPendingCaption(c) { set({ pendingCaption: c }); },
  selectVersion(v) { set({ selectedVersion: v }); },

  async fetchContentIfNeeded(userId, sessionId, version) {
    const { contentCache, contentLoading, byVersion } = get();
    if (contentCache[version] || contentLoading[version]) return;
    set({ contentLoading: { ...contentLoading, [version]: true } });
    try {
      const content = await fetchArtifactContent({ userId, sessionId, version });
      if (content.mime_type.startsWith('text/')) {
        const decoded = atob(content.base64_content);
        set(s => ({
          contentCache: { ...s.contentCache, [version]: decoded },
          contentLoading: { ...s.contentLoading, [version]: false },
          byVersion: { ...s.byVersion, [version]: { ...s.byVersion[version] } }
        }));
      } else if (content.mime_type.startsWith('image/')) {
        const binary = atob(content.base64_content);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: content.mime_type });
        const url = URL.createObjectURL(blob);
        set(s => ({ contentCache: { ...s.contentCache, [version]: url }, contentLoading: { ...s.contentLoading, [version]: false } }));
      } else {
        set(s => ({ contentCache: { ...s.contentCache, [version]: '[Preview not supported]' }, contentLoading: { ...s.contentLoading, [version]: false } }));
      }
    } catch (e:any) {
      set(s => ({ contentLoading: { ...s.contentLoading, [version]: false }, byVersion: { ...s.byVersion, [version]: { ...s.byVersion[version], error: e.message || 'Content load failed' } } }));
    }
  },

  resetForSession() { set({ byVersion: {}, order: [], artifactsByName: {}, artifactOrder: [], selectedArtifacts: [], loading: false, lastFetchedAt: undefined, uploading: false, uploadProgress: undefined, selectedVersion: undefined, pendingCaption: '', contentCache: {}, contentLoading: {}, error: undefined }); },

  toggleSelect(filename) {
    set(s => {
      const entry = s.artifactsByName[filename];
      if (!entry) return {} as any;
      const selected = !entry.selected;
      const artifactsByName = { ...s.artifactsByName, [filename]: { ...entry, selected } };
      const selectedArtifacts = selected
        ? [...s.selectedArtifacts, filename]
        : s.selectedArtifacts.filter(f => f !== filename);
      return { artifactsByName, selectedArtifacts };
    });
  },
  selectAll() { set(s => ({ artifactsByName: Object.fromEntries(Object.entries(s.artifactsByName).map(([k,v]) => [k,{...v, selected:true}])), selectedArtifacts: Object.keys(s.artifactsByName) })); },
  clearSelection() { set(s => ({ artifactsByName: Object.fromEntries(Object.entries(s.artifactsByName).map(([k,v]) => [k,{...v, selected:false}])), selectedArtifacts: [] })); },
}));
