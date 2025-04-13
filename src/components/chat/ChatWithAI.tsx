
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Send, Mic, Image as ImageIcon, Paperclip, Cube } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import ModelViewer from '../models/ModelViewer';

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  showModel?: boolean;
};

const ChatWithAI = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Namaste! I'm Sanskara, your AI wedding planning assistant. I'm here to help you plan your perfect Hindu wedding. What aspect of your wedding would you like to discuss today?",
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simulate AI response
  const generateAIResponse = async (userMessage: string) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check if the message is about pandits or priests
    const shouldShowModel = userMessage.toLowerCase().includes('pandit') || 
                          userMessage.toLowerCase().includes('priest') ||
                          userMessage.toLowerCase().includes('3d') ||
                          userMessage.toLowerCase().includes('model');
    
    // Sample responses based on keywords
    let aiResponse = "I understand you're asking about wedding planning. Could you provide more details about what you'd like to know?";
    
    if (userMessage.toLowerCase().includes('ritual')) {
      aiResponse = "Hindu weddings include many beautiful rituals like Mehndi, Sangeet, Haldi, Kanyadaan, and Saptapadi. Each has deep cultural significance. Which one would you like to know more about?";
    } else if (userMessage.toLowerCase().includes('vendor')) {
      aiResponse = "Finding the right vendors is crucial. I recommend starting with a venue, caterer, and photographer who understand Hindu wedding traditions. Would you like me to suggest some questions to ask potential vendors?";
    } else if (userMessage.toLowerCase().includes('budget')) {
      aiResponse = "Wedding budgets typically include costs for venue, catering, attire, photography, decor, and priest services. A traditional Hindu wedding can range widely in cost. Would you like to create a budget plan?";
    } else if (shouldShowModel) {
      aiResponse = "Here's a visualization of a traditional Hindu priest (pandit) who would perform your wedding ceremony. The pandit plays a crucial role in ensuring all rituals are performed correctly according to Hindu traditions. Would you like me to explain more about their role in the ceremony?";
    }
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content: aiResponse,
      sender: 'ai',
      timestamp: new Date(),
      showModel: shouldShowModel
    };
    
    setMessages(prev => [...prev, newMessage]);
    setIsLoading(false);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    generateAIResponse(inputMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleModel = () => {
    toast({
      title: showModel ? "3D Model hidden" : "3D Model will appear in the next relevant response",
      description: showModel 
        ? "The 3D model has been hidden from the chat" 
        : "Ask about a pandit or priest to see the 3D model",
      duration: 3000,
    });
    setShowModel(!showModel);
  };
  
  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden shadow-md border border-gray-200">
      <div className="bg-wedding-maroon/10 p-3 flex items-center">
        <Avatar className="h-9 w-9 mr-2">
          <AvatarImage src="/lovable-uploads/82e13d9f-7faf-4d65-8c82-2be524f85cf7.png" alt="Sanskara AI" />
          <AvatarFallback className="bg-wedding-red/20 text-wedding-red">SA</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-wedding-maroon">Sanskara AI</h3>
          <p className="text-xs text-gray-500">Your Hindu Wedding Assistant</p>
        </div>
      </div>
      
      <Separator />
      
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-6">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === 'user' 
                    ? 'bg-wedding-red text-white rounded-tr-none' 
                    : 'bg-gray-100 text-gray-800 rounded-tl-none'
                }`}
              >
                {message.content}
                {message.showModel && (
                  <div className="mt-3 bg-white rounded-md p-2">
                    <p className="text-xs text-gray-500 mb-2">3D Model of a Hindu priest (pandit)</p>
                    <ModelViewer height="250px" />
                  </div>
                )}
                <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] bg-gray-100 rounded-lg p-3 rounded-tl-none">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <Separator />
      
      <div className="p-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="rounded-full">
            <Paperclip size={18} />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full">
            <ImageIcon size={18} />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className={`rounded-full ${showModel ? 'bg-wedding-red/10 text-wedding-red' : ''}`}
            onClick={toggleModel}
            title="Toggle 3D model"
          >
            <Cube size={18} />
          </Button>
          <div className="flex-grow relative">
            <Input
              placeholder="Ask about rituals, vendors, planning..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="pr-12 rounded-full"
            />
            <Button 
              size="icon" 
              className="absolute right-1 top-1 h-8 w-8 bg-wedding-red hover:bg-wedding-deepred rounded-full"
              onClick={handleSendMessage}
              disabled={isLoading || inputMessage.trim() === ''}
            >
              <Send size={16} className="text-white" />
            </Button>
          </div>
          <Button variant="outline" size="icon" className="rounded-full">
            <Mic size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWithAI;
