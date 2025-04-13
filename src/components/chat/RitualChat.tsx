
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Send, Mic, Image as ImageIcon, Paperclip } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

type Message = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

const RitualChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Namaste! I'm the Sanskara Ritual Expert. I can help you understand and plan traditional Hindu wedding rituals. What would you like to know about specific rituals?",
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simulate AI response
  const generateAIResponse = async (userMessage: string) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Sample responses for ritual-specific questions
    let aiResponse = "I understand you're asking about a ritual. Could you provide more details about which specific ritual you'd like to learn about?";
    
    const lowerCaseMessage = userMessage.toLowerCase();
    
    if (lowerCaseMessage.includes('saptapadi') || lowerCaseMessage.includes('seven steps')) {
      aiResponse = "Saptapadi, or the Seven Steps, is the most important ritual in a Hindu wedding. The couple takes seven steps together around the sacred fire (Agni), with each step representing a vow they make to each other. These vows cover aspects like food, strength, prosperity, wisdom, progeny, health, and friendship. This ritual legally solemnizes the marriage.";
    } else if (lowerCaseMessage.includes('mehndi') || lowerCaseMessage.includes('henna')) {
      aiResponse = "The Mehndi ceremony typically takes place 1-2 days before the wedding. Intricate henna patterns are applied to the bride's hands and feet. These designs symbolize joy, beauty, and spiritual awakening. It's also believed that the darker the color of the mehndi, the stronger the love between the couple.";
    } else if (lowerCaseMessage.includes('haldi') || lowerCaseMessage.includes('turmeric')) {
      aiResponse = "The Haldi ceremony involves applying a paste of turmeric, oil, and water to the bride and groom's skin. This takes place separately in their homes. Turmeric is known for its medicinal properties and is believed to bless the couple with prosperity and ward off evil spirits. It also gives a natural glow to the skin for the wedding day.";
    } else if (lowerCaseMessage.includes('kanyadaan')) {
      aiResponse = "Kanyadaan is one of the most significant rituals, where the father of the bride places his daughter's hand in the groom's hand, symbolically giving her away. The word comes from 'kanya' meaning virgin girl and 'daan' meaning donation. This ritual signifies the father entrusting his daughter to her husband.";
    } else if (lowerCaseMessage.includes('mangalsutra')) {
      aiResponse = "The Mangalsutra is a sacred necklace that the groom ties around the bride's neck during the ceremony. Made of black beads and gold, it symbolizes the couple's union and the groom's promise to care for his bride throughout their lives. It's considered an auspicious symbol of marriage.";
    }
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content: aiResponse,
      sender: 'ai',
      timestamp: new Date(),
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
  
  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden shadow-md border border-gray-200">
      <div className="bg-wedding-maroon/10 p-3 flex items-center">
        <Avatar className="h-9 w-9 mr-2">
          <AvatarImage src="/lovable-uploads/82e13d9f-7faf-4d65-8c82-2be524f85cf7.png" alt="Ritual Expert" />
          <AvatarFallback className="bg-wedding-deepred text-white">RE</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-wedding-maroon">Ritual Expert</h3>
          <p className="text-xs text-gray-500">Hindu Wedding Traditions Specialist</p>
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
          <div className="flex-grow relative">
            <Input
              placeholder="Ask about specific rituals and traditions..."
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

export default RitualChat;
