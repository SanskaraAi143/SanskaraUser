import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/context/AuthContext';
import { useMultimodalClient } from '@/hooks/useMultimodalClient.ts';
import { ARTIFACTS_ENABLED } from '@/config/artifacts';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, Image as ImageIcon, Mic, X, Send, User, Bot, Video, VideoOff, MonitorPlay, Loader2 } from 'lucide-react';
import { ArtifactSessionPanel } from '@/components/artifacts/ArtifactSessionPanel';
import { useSessionArtifactsStore } from '@/store/sessionArtifactsStore';
import { useToast } from '@/components/ui/use-toast';
import { uploadArtifactV2 } from '@/services/api/sessionArtifactsApi';

const GeneralAssistantChat: React.FC = () => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [showArtifactPanel, setShowArtifactPanel] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [keepSelection, setKeepSelection] = useState(false);

  const { resetForSession, uploadFile, selectedArtifacts, toggleSelect, clearSelection } = useSessionArtifactsStore();
  const { toast } = useToast();
  const [connecting, setConnecting] = useState(true);

  const {
    isRecording,
    isVideoActive,
    activeVideoMode,
    transcript,
    startRecording,
    stopRecording,
    initializeWebcam,
    initializeScreenShare,
    stopVideo,
    sendTextMessage,
    isSpeaking,
    isAssistantSpeaking,
    isAssistantTyping,
    isLoadingHistory,    // Import new state
    historyError,        // Import new state
    interruptAssistant,
    sessionId,
    connectionState,
    reconnectNow,
    registerOnDisconnect,
    registerOnReconnectSuccess,
  } = useMultimodalClient(
    user?.internal_user_id,
    typeof (user?.wedding_details_json as any)?.wedding_id === 'string'
      ? (user?.wedding_details_json as any).wedding_id as string
      : (typeof user?.wedding_id === 'string' ? (user!.wedding_id as string) : undefined)
  );

  // Reset artifact session state when sessionId changes
  useEffect(() => {
    if (sessionId) {
      resetForSession();
    }
  }, [sessionId, resetForSession]);

  // Mark connecting false when session established or error occurs
  useEffect(() => {
    if (sessionId) setConnecting(false);
  }, [sessionId]);

  // Scroll to bottom on new transcript
  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [transcript]);

  // Keyboard shortcuts (interrupt + record)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey)) return;
      const tag = (document.activeElement as HTMLElement | null)?.tagName;
      const inField = tag === 'INPUT' || tag === 'TEXTAREA';
      if (e.key === 'i' && !inField) { if (isAssistantSpeaking) interruptAssistant(); }
      if (e.key === ' ' && !inField) { e.preventDefault(); isRecording ? stopRecording() : startRecording(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isAssistantSpeaking, isRecording, startRecording, stopRecording, interruptAssistant]);

  // Drag & Drop overlay (future integration for direct upload once session ready)
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); if (!dragActive) setDragActive(true); };
  const onDragLeave = (e: React.DragEvent) => { if (e.currentTarget === e.target) setDragActive(false); };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (!sessionId || !user?.internal_user_id) return;
    const files = Array.from(e.dataTransfer.files || []);
    if (!files.length) return;
    files.forEach(file => {
      if (file.size > 10*1024*1024) {
        toast({ title: 'File too large', description: `${file.name} exceeds 10MB limit`, variant: 'destructive' });
        return;
      }
      uploadFile({ userId: user.internal_user_id!, sessionId, file }).then(() => {
        toast({ title: 'Uploaded', description: `${file.name} uploaded.` });
      }).catch(err => {
        toast({ title: 'Upload failed', description: err.message || 'Unknown error', variant: 'destructive' });
      });
    });
  };

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    const base = input.trim();
    const suffix = selectedArtifacts.length ? `\n[FILES: ${selectedArtifacts.join(', ')}]` : '';
    sendTextMessage(base + suffix);
    setInput('');
    if (!keepSelection && selectedArtifacts.length) clearSelection();
  }, [input, sendTextMessage, selectedArtifacts, keepSelection, clearSelection]);

  const handleScreenShareToggle = () => { if (isVideoActive && activeVideoMode === 'screen') stopVideo(); else initializeScreenShare(videoRef.current); };
  const handleCameraToggle = () => { if (isVideoActive && activeVideoMode === 'webcam') stopVideo(); else initializeWebcam(videoRef.current); };

  const userCanUseArtifacts = Boolean(user?.internal_user_id && ARTIFACTS_ENABLED);
  const artifactsReady = Boolean(sessionId) && connectionState === 'connected'; // gate UI until session established

  // Gate chat until second partner completes onboarding for initiator
  const details: any = user?.wedding_details_json || {};
  const partnerData = details?.partner_data || {};
  const isInitiator = user?.email ? Boolean(partnerData[user.email]) : false;
  const invitedPartnerEmail: string | undefined = details?.other_partner_email_expected;
  const waitingForPartner = user?.wedding_status === 'onboarding_in_progress' && isInitiator;

  const insertVersionReference = (text: string) => {
    // If input empty, set; else append newline
    setInput(prev => prev ? prev + (prev.endsWith('\n') ? '' : '\n') + text : text);
  };

  // Toast on disconnect/reconnect
  useEffect(() => {
    const offDisconnectToast = registerOnDisconnect(() => {
      toast({ title: 'Connection lost', description: 'Attempting to reconnect...', variant: 'destructive' });
    });
    const offReconnect = registerOnReconnectSuccess(() => {
      toast({ title: 'Reconnected', description: 'Session restored.' });
    });
    return () => { /* handlers stored internally; no explicit removal API provided */ };
  }, [registerOnDisconnect, registerOnReconnectSuccess, toast]);

  // waitingForPartner computed above

  return (
    <div className="flex flex-col h-full relative" onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-white sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#ffd700] to-[#ff8f00] flex items-center justify-center text-xs font-bold text-white">AI</div>
          <div>
            <h2 className="text-sm font-semibold">General Assistant</h2>
            <p className="text-[11px] text-gray-500">
              {waitingForPartner
                ? 'Waiting for your partner to complete onboarding'
                : (connectionState === 'failed'
                    ? 'Disconnected'
                    : connectionState === 'reconnecting'
                      ? 'Reconnecting...'
                      : (sessionId ? 'Session active' : 'Establishing session...'))} • {isAssistantSpeaking ? 'Speaking' : isRecording ? 'Recording' : 'Idle'}
            </p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {connectionState === 'failed' && !waitingForPartner && (
            <Button size="sm" variant="outline" onClick={reconnectNow} className="h-7 text-xs">Reconnect</Button>
          )}
          <Button size="icon" variant="outline" disabled={waitingForPartner} className={cn('h-8 w-8', isVideoActive && activeVideoMode==='webcam' && 'bg-blue-100', waitingForPartner && 'opacity-50 cursor-not-allowed')} onClick={handleCameraToggle} title="Toggle Webcam">
            {isVideoActive && activeVideoMode==='webcam' ? <VideoOff className="h-4 w-4"/> : <Video className="h-4 w-4"/>}
          </Button>
          <Button size="icon" variant="outline" disabled={waitingForPartner} className={cn('h-8 w-8', isVideoActive && activeVideoMode==='screen' && 'bg-purple-100', waitingForPartner && 'opacity-50 cursor-not-allowed')} onClick={handleScreenShareToggle} title="Share Screen">
            <MonitorPlay className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" disabled={waitingForPartner} className={cn('h-8 w-8', isRecording && 'bg-red-100', waitingForPartner && 'opacity-50 cursor-not-allowed')} onClick={isRecording ? stopRecording : startRecording} title={isRecording ? 'Stop Recording' : 'Start Recording'}>
            <Mic className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {waitingForPartner && (
        <div className="bg-yellow-50 border-b border-yellow-200 text-yellow-800 text-xs px-4 py-2">
          Waiting for your partner (<strong>{(user?.wedding_details_json as any)?.other_partner_email_expected}</strong>) to complete onboarding. Some collaborative features will unlock after they join.
        </div>
      )}

      {/* Optional Video */}
      {isVideoActive && (
        <div className="relative h-48 bg-black flex items-center justify-center border-b">
          <video ref={videoRef} className="h-full w-full object-cover" autoPlay playsInline />
        </div>
      )}

      {/* Waiting banner */}
      {waitingForPartner && (
        <div className="bg-yellow-50 border-b border-yellow-200 text-yellow-800 text-sm px-4 py-2">
          Waiting for your partner{invitedPartnerEmail ? ` (${invitedPartnerEmail})` : ''} to complete onboarding. Chat is disabled until they join.
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gradient-to-b from-white to-[#fff9ef]">
        {!sessionId && (
          <div className="text-xs text-gray-500">Waiting for session to initialize…</div>
        )}
        {sessionId && !((user?.wedding_details_json as any)?.wedding_id || user?.wedding_id) && (
          <div className="text-xs text-red-500">Wedding ID not available; cannot load chat history.</div>
        )}
        {isLoadingHistory && (
          <div className="flex justify-center items-center h-full text-gray-500">
            <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading chat history...
          </div>
        )}
        {historyError && (
          <div className="flex justify-center items-center h-full text-red-500">
            Error loading chat history: {historyError}
          </div>
        )}
        {!isLoadingHistory && !historyError && transcript.map((m: any, idx: number) => {
          const fileMatch = m.sender === 'user' ? /\[FILES:\s([^\]]+)\]$/.exec(m.text) : null;
          const files = fileMatch ? fileMatch[1].split(',').map((f:string)=>f.trim()) : [];
          const displayText = fileMatch ? m.text.replace(/\n?\[FILES:[^\]]+\]$/, '') : m.text;
          return (
            <div key={idx} className={cn('flex gap-2', m.sender === 'user' ? 'justify-end' : 'justify-start')}>
              {m.sender !== 'user' && (
                <Avatar className="h-7 w-7 bg-[#ff8f00]/20"><AvatarFallback><Bot className="h-4 w-4 text-[#ff8f00]" /></AvatarFallback></Avatar>
              )}
              <div className={cn('max-w-[75%] rounded-lg px-3 py-2 text-sm shadow-sm space-y-1', m.sender === 'user' ? 'bg-gradient-to-r from-[#ffd700] to-[#ff8f00] text-white rounded-tr-none' : 'bg-white border rounded-tl-none')}>
                {m.sender === 'assistant' && m.isMarkdown ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{displayText}</ReactMarkdown>
                  </div>
                ) : (
                  <div>{displayText}</div>
                )}
                {files.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {files.map((f:string) => (
                      <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 text-white/90">
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {m.sender === 'user' && (
                <Avatar className="h-7 w-7 bg-[#ffd700]/20"><AvatarFallback><User className="h-4 w-4 text-[#ffd700]" /></AvatarFallback></Avatar>
              )}
            </div>
          );
        })}
        {/* Typing indicator */}
        { isAssistantTyping && (
          <div className="flex gap-2 justify-start">
            <div className="h-7 w-7 bg-[#ff8f00]/20 rounded-full flex items-center justify-center"><Bot className="h-4 w-4 text-[#ff8f00]" /></div>
            <div className="bg-white border rounded-lg px-3 py-2 text-sm flex gap-1 items-center">
              <span className="animate-pulse">●</span><span className="animate-pulse [animation-delay:120ms]">●</span><span className="animate-pulse [animation-delay:240ms]">●</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>
      {/* Selected artifact pills */}
      {selectedArtifacts.length > 0 && (
        <div className="px-4 pt-2 pb-1 bg-white border-t flex gap-2 flex-wrap items-center">
          {selectedArtifacts.map(fname => (
            <span key={fname} className="flex items-center gap-1 text-[10px] bg-[#ffd700]/15 border border-[#ffd700]/40 text-[#8a6b00] px-2 py-0.5 rounded-full">
              {fname}
              <button aria-label={`Remove ${fname}`} onClick={() => toggleSelect(fname)} className="hover:text-red-600"><X className="h-3 w-3" /></button>
            </span>
          ))}
          <span className="ml-auto flex items-center gap-2">
            <label className="flex items-center gap-1 text-[10px] text-gray-600">
              <input type="checkbox" className="accent-[#ff8f00]" checked={keepSelection} onChange={e => setKeepSelection(e.target.checked)} />
              Keep after send
            </label>
            {!keepSelection && <button className="text-[10px] text-red-600" onClick={clearSelection}>Clear</button>}
          </span>
        </div>
      )}
      {/* Composer */}
      <div className="border-t bg-white px-4 py-3 space-y-2">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={waitingForPartner ? 'Chat will be available once your partner completes onboarding.' : (sessionId ? 'Ask anything about your planning... (Reference: "Analyze artifact version vXYZ")' : 'Waiting for session to start...')}
              disabled={waitingForPartner || !sessionId}
              rows={2}
              className="resize-none pr-24 text-sm"
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && sessionId) { e.preventDefault(); handleSend(); } }}
            />
            <div className="absolute right-2 bottom-2 flex gap-1">
              {userCanUseArtifacts && (
                <Button size="icon" variant="ghost" className="h-8 w-8" title={artifactsReady ? 'Session Artifacts' : 'Waiting for session'} disabled={waitingForPartner || !artifactsReady} onClick={() => setShowArtifactPanel(p => !p)}>
                  {artifactsReady ? <Paperclip className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />}
                </Button>
              )}
              <Button size="icon" variant="ghost" disabled className="h-8 w-8 opacity-40" title="Images (future)">
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button size="icon" className="h-8 w-8 bg-gradient-to-r from-[#ffd700] to-[#ff8f00]" onClick={handleSend} disabled={waitingForPartner || !sessionId || !input.trim() || connectionState!=='connected'}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-gray-500">Enter to send • Shift+Enter newline • Mention: Analyze artifact version vXYZ</p>
      </div>

      {/* Session Artifact Panel */}
      {showArtifactPanel && userCanUseArtifacts && artifactsReady && sessionId && user?.internal_user_id && (
        <ArtifactSessionPanel
          userId={user.internal_user_id}
          sessionId={sessionId}
          onInsertVersion={(text) => insertVersionReference(text)}
          onClose={() => setShowArtifactPanel(false)}
        />
      )}

      {/* Drag Overlay */}
      {dragActive && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#ffd700]/10 backdrop-blur-sm border-4 border-dashed border-[#ff8f00] text-[#ff8f00] text-lg font-semibold" onDragLeave={() => setDragActive(false)}>Drop files to upload (session)</div>
      )}
    </div>
  );
};

export default GeneralAssistantChat;
