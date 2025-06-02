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

interface RitualChatProps {
  initialRitual?: string;
  selectedTopic?: string | null;
}

const RitualChat = ({ initialRitual, selectedTopic }: RitualChatProps) => {
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

  // Handle initial ritual query if provided
  useEffect(() => {
    if (initialRitual) {
      const userMessage = `Tell me about the ${initialRitual} ritual`;
      setMessages(prev => [
        ...prev, 
        {
          id: Date.now().toString(),
          content: userMessage,
          sender: 'user',
          timestamp: new Date()
        }
      ]);
      
      // Simulate AI response for the ritual
      setIsLoading(true);
      setTimeout(() => {
        generateRitualResponse(initialRitual);
        setIsLoading(false);
      }, 1000);
    }
  }, [initialRitual]);

  // Update input message when selected topic changes
  useEffect(() => {
    if (selectedTopic) {
      setInputMessage(selectedTopic);
    }
  }, [selectedTopic]);

  // Generate ritual-specific response
  const generateRitualResponse = (ritualName: string) => {
    let aiResponse = "";
    
    const ritualResponses: Record<string, string> = {
      "Mehndi": "The Mehndi ceremony is a beautiful pre-wedding ritual where intricate henna designs are applied to the bride's hands and feet. These designs symbolize beauty, joy, and spiritual awakening. Traditionally, the bride's female relatives and friends gather to celebrate while the henna is applied.\n\nIn many Hindu traditions, it's believed that the darker the color of the mehndi, the stronger the love between the couple. Some families also hide the groom's name within the intricate patterns, and it becomes a fun task for the groom to find it on the wedding night.\n\nThe ceremony is accompanied by music, dancing, and feasting, making it one of the most joyous pre-wedding celebrations. Modern Mehndi ceremonies often include the groom and his family as well.",
      
      "Haldi": "The Haldi ceremony is a purification ritual that takes place before the wedding. Raw turmeric paste (haldi) mixed with sandalwood, rose water, and sometimes milk or yogurt is applied to the bride and groom's skin at their respective homes.\n\nThis ritual has both symbolic and practical significance. The turmeric is known for its antiseptic properties and gives a natural glow to the skin. Spiritually, it's believed to purify the body and mind, ward off evil spirits, and bless the couple before their union.\n\nThe ceremony is typically filled with laughter as family members playfully smear the paste on the bride or groom. It's considered auspicious for unmarried girls to wear the remaining turmeric, as it's believed to help them find good partners.",
      
      "Sangeet": "The Sangeet ceremony is a musical celebration that happens a few days before the wedding. The word 'Sangeet' literally means 'music' in Sanskrit. This event brings together the families of the bride and groom for an evening of music, dance, and festivities.\n\nTraditionally, women from both families would gather to sing folk songs and perform traditional dances. In modern times, it has evolved into a full-scale celebration with choreographed performances by family members, often depicting the couple's love story or funny anecdotes from their lives.\n\nThe Sangeet provides an opportunity for the two families to bond, break the ice, and celebrate the upcoming union in a joyous atmosphere. It's usually one of the most anticipated and energetic pre-wedding events.",
      
      "Saptapadi": "Saptapadi, or the Seven Steps, is the most sacred and legally binding ritual in a Hindu wedding. The couple takes seven steps together around the sacred fire (Agni), with each step representing a specific vow and blessing for their married life:\n\n1. For food and nourishment\n2. For strength (physical, emotional, and spiritual)\n3. For prosperity\n4. For wisdom and knowledge\n5. For progeny and healthy children\n6. For health and long life\n7. For friendship and eternal companionship\n\nAs they complete each step, they recite the corresponding vow, promising to support each other and lead a righteous life together. The fire serves as the divine witness to their promises.\n\nThis ritual signifies the beginning of their journey together as a married couple, and it's only after completing these seven steps that they are legally considered husband and wife.",
      
      "Kanyadaan": "Kanyadaan is one of the most emotional and significant rituals in a Hindu wedding. The term comes from 'kanya' meaning virgin girl and 'daan' meaning donation or gift. During this ritual, the father of the bride places his daughter's hand in the groom's hand, symbolically giving her away.\n\nThis act represents the father entrusting his precious daughter to the groom, who promises to love, protect, and care for her throughout their lives. It's considered the ultimate sacrifice and gift a father can make.\n\nThe mother of the bride typically pours water over her husband's hand during this ritual, symbolizing her consent and participation in giving their daughter away. Many modern interpretations emphasize that this is not about 'giving away property' but about entrusting the bride to start her new journey with a trusted partner.",
      
      "Mangalsutra": "The Mangalsutra ceremony is a beautiful ritual where the groom ties a sacred necklace around the bride's neck. The Mangalsutra (meaning 'auspicious thread') is made of black beads strung together with a gold or diamond pendant.\n\nThis necklace symbolizes the couple's union and the groom's promise to care for his bride throughout their lives. The black beads are believed to protect the couple from evil and strengthen their bond.\n\nIn many Hindu traditions, the Mangalsutra is equivalent to wedding rings in Western cultures and is worn by married women as a symbol of their married status. The design of the Mangalsutra varies across different regions of India, but its significance remains the same - as a sacred symbol of marriage, love, and commitment."
    };
    
    // Default response if ritual not found
    aiResponse = ritualResponses[ritualName] || `${ritualName} is an important ritual in Hindu weddings. It symbolizes the sacredness of marriage and is performed with great reverence. Would you like to know specific details about how this ritual is conducted?`;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content: aiResponse,
      sender: 'ai',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  // Simulate AI response
  const generateAIResponse = async (userMessage: string) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Sample responses for ritual-specific questions
    let aiResponse = "I understand you're asking about a ritual. Could you provide more details about which specific ritual you'd like to learn about?";
    
    const lowerCaseMessage = userMessage.toLowerCase();
    
    if (lowerCaseMessage.includes('saptapadi') || lowerCaseMessage.includes('seven steps')) {
      generateRitualResponse("Saptapadi");
      setIsLoading(false);
      return;
    } else if (lowerCaseMessage.includes('mehndi') || lowerCaseMessage.includes('henna')) {
      generateRitualResponse("Mehndi");
      setIsLoading(false);
      return;
    } else if (lowerCaseMessage.includes('haldi') || lowerCaseMessage.includes('turmeric')) {
      generateRitualResponse("Haldi");
      setIsLoading(false);
      return;
    } else if (lowerCaseMessage.includes('kanyadaan')) {
      generateRitualResponse("Kanyadaan");
      setIsLoading(false);
      return;
    } else if (lowerCaseMessage.includes('mangalsutra')) {
      generateRitualResponse("Mangalsutra");
      setIsLoading(false);
      return;
    } else if (lowerCaseMessage.includes('sangeet')) {
      generateRitualResponse("Sangeet");
      setIsLoading(false);
      return;
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
                {message.content.split('\n\n').map((paragraph, i) => (
                  <p key={i} className={i > 0 ? 'mt-3' : ''}>{paragraph}</p>
                ))}
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
