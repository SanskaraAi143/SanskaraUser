import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, ArrowDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/services/supabase/config";
import { API_BASE_URL } from "@/services/api";
import axios from "axios";

// Types for chat messages
interface ChatMessage {
  id: number | string;
  role: 'user' | 'bot';
  content: string;
  timestamp: string;
}

// Initial welcome message
const initialMessages: ChatMessage[] = [
  {
    id: 1,
    role: 'bot' as const,
    content: "Namaste! I'm Sanskara, your AI Hindu Wedding assistant. How can I help with your wedding planning today?",
    timestamp: new Date().toISOString(),
  }
];

const ChatWithAI = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch or create a chat session when the component loads
  useEffect(() => {
    const fetchOrCreateSession = async () => {
      if (!user) return;
      
      try {
        // Check if there's an active session
        const { data: sessions, error: fetchError } = await supabase
          .from('chat_sessions')
          .select('session_id')
          .eq('user_id', user.id)
          .order('last_updated_at', { ascending: false })
          .limit(1);
        
        if (fetchError) throw fetchError;
        
        if (sessions && sessions.length > 0) {
          // Use the most recent session
          setSessionId(sessions[0].session_id);
          
          // Fetch messages for this session
          const { data: chatMessages, error: messagesError } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('session_id', sessions[0].session_id)
            .order('timestamp', { ascending: true });
          
          if (messagesError) throw messagesError;
          
          if (chatMessages && chatMessages.length > 0) {
            // Convert the database messages to our format
            const formattedMessages: ChatMessage[] = chatMessages.map((msg: any) => ({
              id: msg.message_id,
              role: msg.sender_type === 'user' ? 'user' : 'bot',
              content: typeof msg.content === 'object' ? msg.content.text : msg.content,
              timestamp: msg.timestamp,
            }));
            
            setMessages(formattedMessages);
          }
        } else {
          // Create a new session
          const { data: newSession, error: createError } = await supabase
            .from('chat_sessions')
            .insert([
              { user_id: user.id }
            ])
            .select();
          
          if (createError) throw createError;
          
          if (newSession && newSession.length > 0) {
            setSessionId(newSession[0].session_id);
            
            // Add welcome message to the new session
            await supabase
              .from('chat_messages')
              .insert([
                { 
                  session_id: newSession[0].session_id,
                  sender_type: 'assistant',
                  sender_name: 'Sanskara',
                  content: { type: 'text', text: initialMessages[0].content },
                  timestamp: new Date().toISOString()
                }
              ]);
          }
        }
      } catch (error) {
        console.error("Error managing chat session:", error);
      }
    };
    
    fetchOrCreateSession();
  }, [user]);

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
    if (input.trim() === '' || !user || !sessionId) return;
    
    // Add user message to UI
    const userMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Save user message to Supabase
    try {
      await supabase
        .from('chat_messages')
        .insert([
          { 
            session_id: sessionId,
            sender_type: 'user',
            sender_name: user.name || 'User',
            content: { type: 'text', text: userMessage.content },
            timestamp: userMessage.timestamp
          }
        ]);
        
      // Update session last_updated_at
      await supabase
        .from('chat_sessions')
        .update({ last_updated_at: new Date().toISOString() })
        .eq('session_id', sessionId);
    } catch (error) {
      console.error("Error saving message:", error);
    }
    
    // Simulate bot typing
    setIsTyping(true);
    
    try {
      // Send the message to our backend API
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        message: userMessage.content,
        session_id: sessionId
      });
      
      if (response.data && response.data.messages) {
        // Process and add bot response to UI
        const botResponse: ChatMessage = {
          id: Date.now() + 1,
          role: 'bot',
          content: response.data.messages[0].content.text || response.data.messages[0].content,
          timestamp: new Date().toISOString(),
        };
        
        setMessages(prev => [...prev, botResponse]);
        
        // Save bot message to Supabase
        await supabase
          .from('chat_messages')
          .insert([
            { 
              session_id: sessionId,
              sender_type: 'assistant',
              sender_name: 'Sanskara',
              content: { type: 'text', text: botResponse.content },
              timestamp: botResponse.timestamp
            }
          ]);
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      // Add fallback error message
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        role: 'bot',
        content: "I'm sorry, but I couldn't process your request right now. Please try again later.",
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
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
              disabled={!user}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {user ? "Ask me about Hindu wedding traditions, rituals, or planning help!" : "Please sign in to chat with Sanskara AI"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatWithAI;
