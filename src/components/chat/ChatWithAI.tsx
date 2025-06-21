import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Send, User, Bot } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { runAgent, listSessions, createSession, listArtifacts, listArtifactVersions, getArtifact } from '@/services/api';

interface Message {
  id: number;
  role: 'user' | 'bot';
  content: string;
  timestamp: string;
}

const initialMessages: Message[] = [
  {
    id: 1,
    role: 'bot',
    content: "Namaste! I'm Sanskara, your AI Hindu Wedding assistant. How can I help with your wedding planning today?",
    timestamp: new Date().toISOString(),
  }
];

interface ChatWithAIProps {
  selectedTopic?: string | null;
}

const ChatWithAI: React.FC<ChatWithAIProps> = ({ selectedTopic }) => {
  const { user } = useAuth();
  const [jwt, setJwt] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [artifactVersions, setArtifactVersions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [selectedArtifact, setSelectedArtifact] = useState<string | null>(null);
  const [sessionEvents, setSessionEvents] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const appName = 'sanskara';

  useEffect(() => {
    const getJwt = async () => {
      const { data } = await import('@/services/supabase/config').then(mod => mod.supabase.auth.getSession());
      setJwt(data?.session?.access_token || null);
    };
    getJwt();
  }, [user]);

  useEffect(() => {
    // Session management: get or create session
    const setupSession = async () => {
      if (!user) return;
      try {
        const userId = user.id;
        const sessions = await listSessions(appName, userId);
        if (sessions && sessions.length > 0) {
          setSessionId(sessions[0].session_id || sessions[0].id || sessions[0]);
        } else {
          const session = await createSession(appName, userId);
          setSessionId(session.session_id || session.id || session);
        }
      } catch (err) {
        // Optionally show error toast
        setSessionId(null);
      }
    };
    setupSession();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (selectedTopic) {
      setInput(selectedTopic);
    }
  }, [selectedTopic]);

  // Fetch all sessions for user (for session history and recent conversations)
  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) return;
      try {
        const userId = user.id;
        const sessions = await listSessions(appName, userId);
        setSessions(sessions);
      } catch (err) {
        setSessions([]);
      }
    };
    fetchSessions();
  }, [user]);

  // When a session is selected from recent conversations, load its events and messages
  useEffect(() => {
    const fetchSessionEvents = async () => {
      if (!user || !selectedSession) return;
      try {
        const userId = user.id;
        const session = await (await import('@/services/api')).getSession(appName, userId, selectedSession);
        setSessionEvents(session.events || []);
        // Optionally, reconstruct chat messages from session events
        const chatMessages = (session.events || [])
          .filter(ev => ev.content && ev.content.parts && ev.content.parts.length > 0)
          .map((ev, idx) => ({
            id: idx + 1,
            role: ev.author === 'user' ? 'user' : 'bot',
            content: ev.content.parts.map(p => p.text).filter(Boolean).join(' '),
            timestamp: ev.timestamp || new Date().toISOString(),
          }));
        if (chatMessages.length > 0) setMessages(chatMessages);
      } catch (err) {
        setSessionEvents([]);
      }
    };
    fetchSessionEvents();
  }, [user, selectedSession]);

  // Fetch artifacts for selected session
  useEffect(() => {
    const fetchArtifacts = async () => {
      if (!user || !selectedSession) return;
      try {
        const userId = user.id;
        const artifacts = await listArtifacts(appName, userId, selectedSession);
        setArtifacts(artifacts);
      } catch (err) {
        setArtifacts([]);
      }
    };
    fetchArtifacts();
  }, [user, selectedSession]);

  // Fetch artifact versions for selected artifact
  useEffect(() => {
    const fetchArtifactVersions = async () => {
      if (!user || !selectedSession || !selectedArtifact) return;
      try {
        const userId = user.id;
        const versions = await listArtifactVersions(appName, userId, selectedSession, selectedArtifact);
        setArtifactVersions(versions);
      } catch (err) {
        setArtifactVersions([]);
      }
    };
    fetchArtifactVersions();
  }, [user, selectedSession, selectedArtifact]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  // Ensure a session is created before sending any messages
  const handleSendMessage = async () => {
    if (input.trim() === '' || !user) return;
    const userId = user.id;
    let activeSessionId = sessionId;
    // If no session exists, create one first
    if (!activeSessionId) {
      try {
        const session = await createSession(appName, userId);
        activeSessionId = session.session_id || session.id || session;
        setSessionId(activeSessionId);
        setSelectedSession(activeSessionId);
      } catch (err) {
        setIsTyping(false);
        return;
      }
    }
    const userMessage: Message = {
      id: messages.length + 1,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    try {
      // The runAgent endpoint expects newMessage to have both 'role' and 'parts' (OpenAPI spec)
      const newMessage = {
        role: 'user',
        parts: [{ text: userMessage.content }],
      };
      const data = await runAgent(appName, userId, activeSessionId, newMessage);
      // The API returns an array of events, not a single reply/message
      // Find the latest model/agent response event with text
      let aiText = '';
      if (Array.isArray(data)) {
        // Find the last event with content.parts[0].text and author not 'user'
        const aiEvent = [...data].reverse().find(ev => ev.content && ev.content.parts && ev.content.parts[0]?.text && ev.author && ev.author !== 'user');
        aiText = aiEvent?.content?.parts?.map?.(p => p.text).filter(Boolean).join(' ') || '';
      } else if (data && data.reply) {
        aiText = data.reply;
      } else if (data && data.message) {
        aiText = data.message;
      }
      const botMessage: Message = {
        id: messages.length + 2,
        role: 'bot',
        content: aiText || 'Sorry, no response from AI.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: messages.length + 2,
        role: 'bot',
        content: 'Sorry, there was a problem reaching the AI backend.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-full w-full bg-gradient-to-br from-[#fffbe7] via-[#fff3d1] to-[#ffd700]/30">
      {/* Sidebar: User, Sessions, Artifacts */}
      <aside className="hidden md:flex flex-col w-72 bg-white/90 border-r border-[#ffd700]/30 shadow-lg p-4 gap-6">
        {/* User Profile */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-12 w-12 bg-[#ffd700]/20">
            <AvatarFallback>
              <User className="text-[#ffd700]" />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-[#8d6e63] text-lg">{user?.name || 'Guest'}</div>
            <div className="text-xs text-[#8d6e63]/70">{user?.email || 'Not signed in'}</div>
          </div>
        </div>
        {/* New Chat Button */}
        <Button className="w-full bg-gradient-to-r from-[#ffd700] to-[#ff8f00] text-white font-semibold mb-2" onClick={() => { setSelectedSession(null); setMessages(initialMessages); }}>
          + New Chat
        </Button>
        {/* Recent Conversations */}
        <div>
          <div className="text-xs text-[#8d6e63] font-bold mb-2">Recent Conversations</div>
          <div className="flex flex-col gap-1 max-h-64 overflow-y-auto pr-1">
            {sessions && sessions.length > 0 ? (
              sessions.map((s) => (
                <button
                  key={s.session_id || s.id || s}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border transition-colors duration-150 ${selectedSession === (s.session_id || s.id || s)
                    ? 'bg-[#ffd700]/90 text-white border-[#ffd700] shadow-md'
                    : 'bg-white text-[#8d6e63] border-[#ffd700]/20 hover:bg-[#fffbe7]'}
                  `}
                  onClick={() => setSelectedSession(s.session_id || s.id || s)}
                  title={`Started: ${s.created_at ? new Date(s.created_at).toLocaleString() : ''}`}
                >
                  <Bot className="h-4 w-4 text-[#ff8f00]" />
                  <span className="truncate flex-1">{s.summary ? s.summary.slice(0, 32) : (s.session_id?.slice?.(-6) || s.id?.slice?.(-6) || String(s).slice(-6))}</span>
                  <span className="text-[10px] text-[#8d6e63]/60">{s.updated_at ? new Date(s.updated_at).toLocaleDateString() : ''}</span>
                </button>
              ))
            ) : (
              <span className="text-xs text-[#8d6e63]/60">No previous sessions</span>
            )}
          </div>
        </div>
        {/* Artifacts Quick Access */}
        {selectedSession && (
          <div className="mt-6">
            <div className="text-xs text-[#8d6e63] font-bold mb-2">Artifacts</div>
            <div className="flex flex-wrap gap-2">
              {artifacts.map((a) => (
                <button
                  key={a.name || a}
                  className={`px-2 py-1 rounded text-xs border ${selectedArtifact === (a.name || a) ? 'bg-[#ff8f00]/80 text-white' : 'bg-white text-[#8d6e63] border-[#ffd700]/30'}`}
                  onClick={() => setSelectedArtifact(a.name || a)}
                >
                  {a.name || a}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>
      {/* Main Chat Area */}
      <main className="flex flex-col flex-1 h-full">
        {/* Chat Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-[#ffd700] to-[#ff8f00] text-white px-6 py-4 shadow-md">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-[#ff8f00]/20">
              <AvatarFallback>
                <Bot className="text-[#ff8f00]" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-playfair text-xl font-bold">Sanskara AI</div>
              <div className="text-xs text-white/80">Hindu Wedding Planning Assistant</div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-white/80 font-semibold">Session</span>
            <span className="text-xs font-mono bg-white/20 px-2 py-1 rounded-md">
              {selectedSession?.slice?.(-8) || sessionId?.slice?.(-8) || 'None'}
            </span>
          </div>
        </div>
        {/* Session Event History (collapsible) */}
        {sessionEvents.length > 0 && (
          <div className="bg-white/80 border-b border-[#ffd700]/20 px-6 py-2">
            <details className="w-full" open>
              <summary className="text-xs text-[#8d6e63] font-semibold cursor-pointer">Session History</summary>
              <ul className="space-y-1 max-h-24 overflow-y-auto pr-2 mt-2">
                {sessionEvents.map((ev, idx) => (
                  <li key={ev.id || idx} className="border-b border-[#ffd700]/10 pb-1">
                    <span className="font-bold">{ev.author}:</span> {ev.content?.parts?.map?.(p => p.text).filter(Boolean).join(' ')}
                  </li>
                ))}
              </ul>
            </details>
          </div>
        )}
        {/* Artifact Versions (if selected) */}
        {selectedArtifact && artifactVersions.length > 0 && (
          <div className="p-2 bg-white/60 border-b border-[#ffd700]/20">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-[#8d6e63] font-semibold">Versions:</span>
              {artifactVersions.map((v) => (
                <button
                  key={v.version_id || v}
                  className="px-2 py-1 rounded text-xs border bg-white text-[#8d6e63] border-[#ffd700]/30"
                  onClick={async () => {
                    if (!user) return;
                    const userId = user.id;
                    const artifact = await getArtifact(appName, userId, selectedSession, selectedArtifact, v.version_id || v);
                    alert(JSON.stringify(artifact, null, 2));
                  }}
                >
                  {v.version_id || v}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Chat Messages Area */}
        <div className="flex-grow flex flex-col overflow-hidden bg-white/60">
          <ScrollArea className="flex-grow p-6">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-2.5 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <Avatar className={message.role === 'user' ? 'bg-[#ffd700]/20' : 'bg-[#ff8f00]/20'}>
                      <AvatarFallback>
                        {message.role === 'user' ? 
                          <User className="text-[#ffd700]" /> : 
                          <Bot className="text-[#ff8f00]" />
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div className={`p-3 rounded-2xl shadow-lg ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-[#ffd700] to-[#ff8f00] text-white'
                        : 'bg-white/90 text-[#8d6e63] border border-[#ffd700]/20'
                    }`}>
                      <p className="text-base whitespace-pre-line font-medium">{message.content}</p>
                      <p className="text-[10px] mt-1 opacity-70 text-right">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2.5 max-w-[80%]">
                    <Avatar className="bg-[#ff8f00]/20">
                      <AvatarFallback>
                        <Bot className="text-[#ff8f00]" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="p-3 rounded-2xl bg-white/80 border border-[#ffd700]/20">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 rounded-full bg-[#ff8f00] animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-[#ff8f00] animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-[#ff8f00] animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          {/* Input Area */}
          <div className="p-6 border-t border-[#ffd700]/30 bg-white/80 backdrop-blur-sm">
            <div className="flex items-end gap-2">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={1}
                className="resize-none min-h-[50px] bg-white border-[#ffd700]/30 focus:border-[#ff8f00] focus:ring-[#ff8f00]/20 text-base"
              />
              <Button 
                onClick={() => void handleSendMessage()} 
                className="bg-gradient-to-r from-[#ffd700] to-[#ff8f00] text-white hover:opacity-90 shadow-lg text-lg px-6 py-2 rounded-2xl"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-[#8d6e63]/70 mt-2 text-center">
              Ask me about Hindu wedding traditions, rituals, or planning help!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatWithAI;
