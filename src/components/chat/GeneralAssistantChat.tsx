import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '@/context/AuthContext';
import { useMultimodalClient } from '@/hooks/useMultimodalClient.ts';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, Mic, Send, User, Bot, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const GeneralAssistantChat: React.FC = () => {
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const { toast } = useToast();

  const {
    isRecording,
    transcript,
    startRecording,
    stopRecording,
    sendTextMessage,
    isAssistantTyping,
    sessionId,
    connectionState,
    reconnectNow,
  } = useMultimodalClient(user?.internal_user_id);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [transcript]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    sendTextMessage(input.trim());
    setInput('');
  }, [input, sendTextMessage]);

  return (
    <div className="flex flex-col h-full bg-background rounded-lg border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">AI</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">General Assistant</h2>
            <p className="text-xs text-muted-foreground capitalize">{connectionState}</p>
          </div>
        </div>
        {connectionState === 'failed' && (
          <Button size="sm" variant="outline" onClick={reconnectNow}>Reconnect</Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <AnimatePresence>
          {transcript.map((m: any, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn('flex items-end gap-2', m.sender === 'user' ? 'justify-end' : 'justify-start')}
            >
              {m.sender !== 'user' && (
                <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/20 text-primary">AI</AvatarFallback></Avatar>
              )}
              <div className={cn('chat-message', m.sender === 'user' ? 'user-message' : 'ai-message')}>
                {m.isMarkdown ? <ReactMarkdown className="prose prose-sm max-w-none">{m.text}</ReactMarkdown> : <div>{m.text}</div>}
              </div>
              {m.sender === 'user' && (
                <Avatar className="h-8 w-8"><AvatarFallback className="bg-muted"><User className="h-4 w-4" /></AvatarFallback></Avatar>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {isAssistantTyping && (
          <div className="flex items-end gap-2 justify-start">
            <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/20 text-primary">AI</AvatarFallback></Avatar>
            <div className="ai-message flex gap-1 items-center">
              <span className="animate-pulse">●</span><span className="animate-pulse [animation-delay:120ms]">●</span><span className="animate-pulse [animation-delay:240ms]">●</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Composer */}
      <div className="border-t bg-background px-4 py-3">
        <div className="flex gap-2 items-center">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask anything about your planning..."
            disabled={connectionState !== 'connected'}
            rows={1}
            className="resize-none text-sm"
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          />
          <Button size="icon" onClick={handleSend} disabled={connectionState !== 'connected' || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
          <Button size="icon" variant={isRecording ? "destructive" : "outline"} onClick={isRecording ? stopRecording : startRecording} disabled={connectionState !== 'connected'}>
            <Mic className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GeneralAssistantChat;
