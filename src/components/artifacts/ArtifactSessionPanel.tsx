import React, { useState, useEffect } from 'react';
import { useSessionArtifactsStore } from '@/store/sessionArtifactsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, RefreshCw, UploadCloud, Search, Eye } from 'lucide-react';
import { formatBytes } from '@/utils/formatBytes';

interface Props {
  userId: string;
  sessionId: string;
  onInsertVersion: (text: string) => void;
  onClose: () => void;
}

export const ArtifactSessionPanel: React.FC<Props> = ({ userId, sessionId, onInsertVersion, onClose }) => {
  const {
    byVersion, order, loading, listArtifacts, uploadFile, uploading, uploadProgress,
    pendingCaption, setPendingCaption, fetchContentIfNeeded, contentCache, contentLoading,
    selectVersion, selectedVersion, resetForSession,
    artifactsByName, artifactOrder, toggleSelect, selectAll, clearSelection, selectedArtifacts
  } = useSessionArtifactsStore();

  const [file, setFile] = useState<File | null>(null);
  const [lastRefresh, setLastRefresh] = useState<number>(0);

  // Initial load when opened
  useEffect(() => {
    listArtifacts(userId, sessionId, true);
  }, [userId, sessionId]);

  const handleRefresh = () => {
    const now = Date.now();
    if (now - lastRefresh < 30000) return; // 30s debounce
    setLastRefresh(now);
    listArtifacts(userId, sessionId, true);
  };

  const handleUpload = () => {
    if (!file) return;
    uploadFile({ userId, sessionId, file, caption: pendingCaption || undefined });
    setFile(null);
    setPendingCaption('');
  };

  const handleAnalyze = (version: string) => {
    const meta = byVersion[version];
    const text = `Analyze artifact version ${version} (filename: ${meta.filename})`;
    onInsertVersion(text);
    onClose();
  };

  // Preview modal logic
  const selected = selectedVersion ? byVersion[selectedVersion] : undefined;
  useEffect(() => {
    if (selectedVersion) fetchContentIfNeeded(userId, sessionId, selectedVersion);
  }, [selectedVersion, userId, sessionId]);

  const content = selectedVersion ? contentCache[selectedVersion] : undefined;
  const isLoadingContent = selectedVersion ? contentLoading[selectedVersion] : false;

  const closePreview = () => {
    if (selected && selected.mime_type.startsWith('image/') && content) {
      try { URL.revokeObjectURL(content); } catch {}
    }
    selectVersion(undefined);
  };

  return (
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-end z-40" onClick={onClose}>
      <div className="bg-white w-full max-h-[80%] rounded-t-2xl shadow-xl p-4 overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Session Artifacts</h3>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" onClick={handleRefresh} title="Refresh list" disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button size="icon" variant="ghost" onClick={onClose}><X className="h-4 w-4" /></Button>
          </div>
        </div>

        {/* Upload Form */}
        <div className="border rounded-md p-3 mb-4 space-y-2">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <Input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="text-xs" />
            <Input placeholder="Optional caption" value={pendingCaption} onChange={e => setPendingCaption(e.target.value)} className="text-xs" />
            <Button onClick={handleUpload} disabled={!file || uploading} className="bg-gradient-to-r from-[#ffd700] to-[#ff8f00] text-white text-xs">
              <UploadCloud className="h-4 w-4 mr-1" /> {uploading ? `Uploading ${uploadProgress ?? 0}%` : 'Upload'}
            </Button>
          </div>
          {file && !uploading && (
            <div className="text-[11px] text-gray-500">{file.name} • {formatBytes(file.size)}</div>
          )}
        </div>

        {/* List */}
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] text-gray-500">Newest first • {artifactOrder.length} file{artifactOrder.length!==1?'s':''}</p>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="h-6 px-2" onClick={selectAll} disabled={!artifactOrder.length}>All</Button>
            <Button size="sm" variant="outline" className="h-6 px-2" onClick={clearSelection} disabled={!selectedArtifacts.length}>Clear</Button>
          </div>
        </div>
        <div className="space-y-2">
          {artifactOrder.map(fname => {
            const entry = artifactsByName[fname];
            const latestVersion = entry.versions[0];
            const a = byVersion[latestVersion];
            return (
              <div key={fname} className={`border rounded-md p-2 text-xs flex flex-col gap-1 bg-white/60 ${entry.selected ? 'ring-2 ring-[#ffd700]' : ''}`}> 
                <div className="flex flex-wrap items-center gap-2">
                  <button aria-label={`Select artifact ${fname}`} onClick={() => toggleSelect(fname)} className={`h-4 w-4 border rounded flex items-center justify-center text-[10px] ${entry.selected ? 'bg-[#ffd700] text-white border-[#e0b800]' : 'bg-white'}`}>{entry.selected ? '✓' : ''}</button>
                  <span className="font-medium truncate max-w-[140px]" title={a.filename}>{a.filename}</span>
                  <span className="px-1.5 py-0.5 bg-gray-100 rounded border text-[10px]">{a.mime_type.split('/')[1] || a.mime_type}</span>
                  <span className="text-[10px] text-gray-500">{formatBytes(a.size_bytes)}</span>
                  <span className="text-[10px] text-gray-400">v{a.version}</span>
                  {a.status === 'uploading' && <span className="text-[10px] text-blue-600">Uploading {a.progress ?? 0}%</span>}
                  {a.status === 'error' && <span className="text-[10px] text-red-600">Error: {a.error}</span>}
                </div>
                {a.caption && <div className="text-[10px] text-gray-600 line-clamp-1">Caption: {a.caption}</div>}
                {a.auto_summary && <div className="text-[10px] text-gray-500 line-clamp-2">{a.auto_summary.slice(0,120)}</div>}
                <div className="flex gap-2 mt-1">
                  <Button size="sm" variant="outline" className="h-6 px-2" onClick={() => handleAnalyze(latestVersion)} disabled={a.status!=='uploaded'}>Analyze</Button>
                  <Button size="sm" variant="outline" className="h-6 px-2" onClick={() => selectVersion(latestVersion)} disabled={a.status!=='uploaded'}>
                    <Eye className="h-3 w-3 mr-1" /> Preview
                  </Button>
                </div>
              </div>
            );
          })}
          {artifactOrder.length === 0 && !loading && (
            <div className="text-[12px] text-gray-500 text-center py-6">No artifacts yet. Upload a file to get started.</div>
          )}
          {loading && artifactOrder.length === 0 && (
            <div className="text-[12px] text-gray-500 text-center py-6">Loading...</div>
          )}
        </div>

        {/* Preview Modal */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closePreview}>
            <div className="bg-white rounded-lg max-w-lg w-full max-h-[80%] overflow-y-auto p-4 relative" onClick={e => e.stopPropagation()}>
              <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={closePreview} aria-label="Close preview">
                <X className="h-4 w-4" />
              </button>
              <h4 className="text-sm font-semibold mb-2 truncate" title={selected.filename}>{selected.filename} <span className="text-xs text-gray-400">v{selected.version}</span></h4>
              {isLoadingContent && <div className="text-xs text-gray-500">Loading content...</div>}
              {!isLoadingContent && content && selected.mime_type.startsWith('text/') && (
                <pre className="text-[11px] bg-gray-100 p-2 rounded max-h-80 overflow-auto whitespace-pre-wrap">{content.slice(0,5000)}</pre>
              )}
              {!isLoadingContent && content && selected.mime_type.startsWith('image/') && (
                <img src={content} alt={selected.filename} className="max-h-80 object-contain mx-auto" />
              )}
              {!isLoadingContent && content && !selected.mime_type.startsWith('text/') && !selected.mime_type.startsWith('image/') && (
                <div className="text-xs text-gray-500">Preview not supported for this file type.</div>
              )}
              {!isLoadingContent && !content && (
                <div className="text-xs text-red-600">Failed to load content.</div>
              )}
              <div className="mt-4 flex justify-end">
                <Button size="sm" onClick={() => handleAnalyze(selected.version)} className="bg-gradient-to-r from-[#ffd700] to-[#ff8f00] text-white">Analyze</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
