
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Calendar, Clock, Phone, Video } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'vendor';
  timestamp: Date;
};

const VendorChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! This is Ravi from The Grand Pavilion. We're excited that you've chosen our venue for your wedding. How can I assist you with your event planning?",
      sender: 'vendor',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    
    // Simulate vendor response
    setTimeout(() => {
      const responses = [
        "Yes, we can definitely accommodate that request for your wedding ceremony.",
        "We do offer special rates for weekday events. I can send you our detailed pricing sheet.",
        "I've made a note about your dietary requirements. Our chef specializes in Gujarati cuisine and can prepare authentic dishes for your guests.",
        "We have several recommended decorators who are familiar with our venue. Would you like me to share their portfolios?",
        "That date is available. I can add a temporary hold for 48 hours while you make your decision."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const vendorMessage: Message = {
        id: Date.now().toString(),
        content: randomResponse,
        sender: 'vendor',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, vendorMessage]);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden shadow-md border border-gray-200">
      <div className="bg-gray-100 p-3 flex items-center justify-between">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop" alt="Vendor" />
            <AvatarFallback className="bg-wedding-maroon text-white">RP</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">Ravi Patel</h3>
            <p className="text-xs text-gray-500">The Grand Pavilion • Vendor Manager</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" className="rounded-full">
            <Phone className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="rounded-full">
            <Video className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="bg-wedding-maroon/5 p-2 flex items-center justify-between text-sm">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 text-wedding-maroon mr-1" />
          <span className="text-wedding-maroon font-medium">Booked: March 15, 2026</span>
        </div>
        <div className="flex items-center">
          <Clock className="h-4 w-4 text-wedding-maroon mr-1" />
          <span className="text-wedding-maroon font-medium">Venue Tour: July 10, 2025</span>
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
              {message.sender === 'vendor' && (
                <Avatar className="h-8 w-8 mt-1 mr-2">
                  <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop" alt="Vendor" />
                  <AvatarFallback className="bg-wedding-maroon text-white">RP</AvatarFallback>
                </Avatar>
              )}
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === 'user' 
                    ? 'bg-wedding-red text-white rounded-tr-none' 
                    : 'bg-gray-100 text-gray-800 rounded-tl-none'
                }`}
              >
                {message.content}
                <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <Separator />
      
      <div className="p-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="rounded-full">
            <Paperclip size={18} />
          </Button>
          <div className="flex-grow relative">
            <Input
              placeholder="Type your message to vendor..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="pr-12 rounded-full"
            />
            <Button 
              size="icon" 
              className="absolute right-1 top-1 h-8 w-8 bg-wedding-red hover:bg-wedding-deepred rounded-full"
              onClick={handleSendMessage}
              disabled={inputMessage.trim() === ''}
            >
              <Send size={16} className="text-white" />
            </Button>
          </div>
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">
          Your messages are private between you and the vendor. Save important details to your wedding plan.
        </p>
      </div>
    </div>
  );
};

export default VendorChat;
