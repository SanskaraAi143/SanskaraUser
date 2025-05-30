
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Send, User, Bot, ArrowDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data for the chat
const initialMessages = [
  {
    id: 1,
    role: 'bot',
    content: "Namaste! I'm Sanskara, your AI Hindu Wedding assistant. How can I help with your wedding planning today?",
    timestamp: new Date().toISOString(),
  }
];

const ChatWithAI = () => {
  const { user } = useAuth();
  // You may want to add a way to get the JWT from supabase directly if not in context
  const [jwt, setJwt] = useState<string | null>(null);



  useEffect(() => {
    // Try to get JWT from Supabase client if available
    const getJwt = async () => {
      const { data } = await import('@/services/supabase/config').then(mod => mod.supabase.auth.getSession());
      setJwt(data?.session?.access_token || null);
    };
    getJwt();
  }, [user]);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (input.trim() === '' || !jwt) return;
    // Add user message
    const userMessage = {
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
      if (response.ok) {
        const botMessage = {
          id: messages.length + 2,
          role: 'bot',
          content: data.reply,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Print backend error detail if available
        setMessages(prev => [
          ...prev,
          {
            id: messages.length + 2,
            role: 'bot',
            content: data.detail || 'Sorry, there was a problem reaching the AI backend.',
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: messages.length + 2,
          role: 'bot',
          content: 'Sorry, there was a problem reaching the AI backend.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[85vh] bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-wedding-red text-white p-4">
        <h2 className="text-xl font-medium">Chat with Sanskara AI</h2>
        <p className="text-sm opacity-90">Your Hindu Wedding Planning Assistant</p>
      </div>
      
      <div className="flex-grow flex flex-col overflow-hidden">
        <ScrollArea className="flex-grow p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex items-start gap-2.5 max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <Avatar className={message.role === 'user' ? 'bg-wedding-orange/20' : 'bg-wedding-red/20'}>
                    <AvatarFallback>
                      {message.role === 'user' ? <User className="text-wedding-orange" /> : <Bot className="text-wedding-red" />}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-wedding-orange/10 text-gray-800'
                        : 'bg-wedding-red/10 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-[10px] text-gray-500 mt-1">
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
                  <Avatar className="bg-wedding-red/20">
                    <AvatarFallback>
                      <Bot className="text-wedding-red" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="p-3 rounded-lg bg-wedding-red/10 text-gray-800">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-wedding-red animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-wedding-red animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-wedding-red animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {messages.length > 4 && (
          <div className="absolute bottom-20 right-6">
            <Button
              size="icon"
              variant="outline"
              className="rounded-full shadow-md bg-white"
              onClick={scrollToBottom}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="p-4 border-t">
          <div className="flex items-end gap-2">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              className="resize-none min-h-[50px]"
            />
            <Button 
              onClick={handleSendMessage} 
              className="bg-wedding-red hover:bg-wedding-deepred"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Ask me about Hindu wedding traditions, rituals, or planning help!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatWithAI;
