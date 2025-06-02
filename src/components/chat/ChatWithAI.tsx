import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Send, User, Bot } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const getJwt = async () => {
      const { data } = await import('@/services/supabase/config').then(mod => mod.supabase.auth.getSession());
      setJwt(data?.session?.access_token || null);
    };
    getJwt();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (selectedTopic) {
      setInput(selectedTopic);
    }
  }, [selectedTopic]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (input.trim() === '' || !jwt) return;
    
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
      const response = await fetch('http://localhost:8000/api/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          message: userMessage.content,
          session_id: 'user-session-id',
        }),
      });

      const data = await response.json();
      
      const botMessage: Message = {
        id: messages.length + 2,
        role: 'bot',
        content: response.ok ? data.reply : (data.detail || 'Sorry, there was a problem reaching the AI backend.'),
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
    <div className="flex flex-col h-full bg-[#fffbe7] rounded-xl overflow-hidden border-2 border-[#ffd700]/30 shadow-lg">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-[#ffd700] to-[#ff8f00] text-white p-6">
        <h2 className="text-xl font-playfair font-medium">Chat with Sanskara AI</h2>
        <p className="text-white/90 text-sm">Your Hindu Wedding Planning Assistant</p>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-grow flex flex-col overflow-hidden">
        <ScrollArea className="flex-grow p-4">
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
                  <div className={`p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-[#ffd700] to-[#ff8f00] text-white'
                      : 'bg-white/80 text-[#8d6e63] border border-[#ffd700]/20'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className="text-[10px] mt-1 opacity-70">
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
                  <div className="p-3 rounded-lg bg-white/80 border border-[#ffd700]/20">
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
        <div className="p-4 border-t border-[#ffd700]/30 bg-white/50 backdrop-blur-sm">
          <div className="flex items-end gap-2">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              className="resize-none min-h-[50px] bg-white border-[#ffd700]/30 focus:border-[#ff8f00] focus:ring-[#ff8f00]/20"
            />
            <Button 
              onClick={() => void handleSendMessage()} 
              className="bg-gradient-to-r from-[#ffd700] to-[#ff8f00] text-white hover:opacity-90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-[#8d6e63]/70 mt-2 text-center">
            Ask me about Hindu wedding traditions, rituals, or planning help!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatWithAI;
