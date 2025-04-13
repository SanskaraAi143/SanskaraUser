
import React from 'react';
import { Button } from "@/components/ui/button";
import { Send, Mic, Image } from 'lucide-react';

const ChatDemo = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-24 mandala-bg">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-wedding-maroon mb-4">
            Your Personal Wedding Guide
          </h2>
          <p className="text-gray-700 text-lg">
            Sanskara AI understands Hindu wedding traditions, answering your questions and
            guiding you through every step of the planning process.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden animate-scale-in">
          <div className="bg-wedding-red/10 p-4 border-b border-wedding-red/20">
            <div className="flex items-center justify-center">
              <img src="/lovable-uploads/82e13d9f-7faf-4d65-8c82-2be524f85cf7.png" alt="Sanskara Logo" className="h-8 w-8 mr-2" />
              <h3 className="font-playfair text-xl font-semibold text-wedding-maroon text-center">
                Chat with Sanskara AI
              </h3>
            </div>
          </div>
          
          <div className="h-[400px] md:h-[500px] p-4 flex flex-col overflow-y-auto">
            <div className="flex flex-col flex-grow space-y-4">
              <div className="chat-message ai-message animate-slide-up">
                <p className="font-medium text-wedding-maroon">Sanskara AI</p>
                <p>Namaste! I'm Sanskara, your AI wedding planning assistant. I'm here to help you plan your perfect Hindu wedding. What aspect of your wedding would you like to discuss today?</p>
              </div>
              
              <div className="chat-message user-message animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <p>We're planning our wedding for next summer and want to include traditional rituals. Can you explain what Saptapadi is?</p>
              </div>
              
              <div className="chat-message ai-message animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <p className="font-medium text-wedding-maroon">Sanskara AI</p>
                <p>Saptapadi (or "Seven Steps") is one of the most important rituals in a Hindu wedding. The couple takes seven steps together around the sacred fire (Agni), with each step representing a vow and blessing:</p>
                <ol className="list-decimal pl-5 mt-2 space-y-1">
                  <li>For food and nourishment</li>
                  <li>For strength</li>
                  <li>For prosperity</li>
                  <li>For wisdom</li>
                  <li>For progeny</li>
                  <li>For health</li>
                  <li>For friendship and loyalty</li>
                </ol>
                <p className="mt-2">This ritual legally solemnizes the marriage. Would you like suggestions on how to incorporate it into your ceremony?</p>
              </div>
              
              <div className="chat-message user-message animate-slide-up" style={{ animationDelay: '0.6s' }}>
                <p>Yes, that would be helpful! Also, can you suggest some pandits near Boston?</p>
              </div>
              
              <div className="chat-message ai-message animate-slide-up" style={{ animationDelay: '0.8s' }}>
                <p className="font-medium text-wedding-maroon">Sanskara AI</p>
                <p>I'd be happy to suggest ways to incorporate Saptapadi and recommend pandits in Boston. First, for Saptapadi:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Consider having the seven vows printed in both Sanskrit and English for guests</li>
                  <li>You can personalize each step with your own promises to each other</li>
                  <li>Many couples use rose petals or rice to mark each step</li>
                </ul>
                <p className="mt-2">For pandits in the Boston area, I recommend checking with:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Sri Lakshmi Temple in Ashland</li>
                  <li>Pandit Sharma at the Hindu Cultural Center</li>
                  <li>Boston Vedic Center</li>
                </ul>
                <p className="mt-2">Would you like me to help you create a task list for preparing for this ritual?</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="rounded-full">
                <Image size={18} />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full">
                <Mic size={18} />
              </Button>
              <div className="flex-grow relative">
                <input 
                  type="text" 
                  placeholder="Ask about any Hindu wedding ritual or tradition..." 
                  className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-300 focus:border-wedding-red focus:ring-1 focus:ring-wedding-red focus:outline-none"
                />
                <Button size="icon" className="absolute right-1 top-1 h-8 w-8 bg-wedding-red hover:bg-wedding-deepred rounded-full">
                  <Send size={16} className="text-white" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChatDemo;
