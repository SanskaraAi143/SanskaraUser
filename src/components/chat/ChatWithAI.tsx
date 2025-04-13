
import React, { useState, useRef, useEffect } from 'react';
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
    if (input.trim() === '') return;
    
    // Add user message
    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Simulate bot typing
    setIsTyping(true);
    
    // Simulate response delay
    setTimeout(() => {
      const botResponses = [
        "I'd be happy to help you plan your wedding rituals!",
        "Here are some popular mandap decoration options for a traditional ceremony.",
        "For the Sangeet, I recommend these 5 popular songs that guests always enjoy.",
        "The mehndi ceremony typically occurs 1-2 days before the wedding. Here's a planning checklist.",
        "I can help you find vendors who specialize in traditional Hindu ceremonies in your area."
      ];
      
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      
      const botMessage = {
        id: messages.length + 2,
        role: 'bot',
        content: randomResponse,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
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
