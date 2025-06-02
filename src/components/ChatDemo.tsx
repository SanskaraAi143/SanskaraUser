import React from 'react';
import { Button } from "@/components/ui/button";
import { Send, Mic, Image, Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

const FloatingChatButton = () => {
  const navigate = useNavigate();
  return (
    <button
      className="fixed bottom-6 right-6 z-50 bg-gradient-primary text-white shadow-xl rounded-full p-4 flex items-center justify-center hover:scale-105 transition-all duration-300"
      onClick={() => navigate('/dashboard/chat')}
      aria-label="Chat with Sanskara AI"
    >
      <MessageCircle size={28} />
    </button>
  );
};

const ChatDemo = () => {
  return (
    <section id="how-it-works" className="relative py-20 md:py-32 overflow-hidden">
      <div className="gradient-bg opacity-50"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="glass-card p-8 md:p-12 mb-16 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-bold mb-6">
            Your Personal<br/>
            <span className="title-gradient">Wedding Guide</span>
          </h2>
          <p className="text-lg md:text-xl text-wedding-brown/80">
            Sanskara AI understands Hindu wedding traditions, answering your questions and
            guiding you through every step of the planning process.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="glass-card overflow-hidden shadow-2xl">
            <div className="bg-gradient-primary bg-opacity-10 p-6 border-b border-wedding-gold/20">
              <div className="flex items-center justify-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center bg-gradient-primary rounded-full shadow-lg">
                  <img src="/lovable-uploads/82e13d9f-7faf-4d65-8c82-2be524f85cf7.png" alt="Sanskara Logo" className="h-8 w-8" />
                </div>
                <h3 className="font-playfair text-2xl font-semibold title-gradient">
                  Chat with Sanskara AI
                </h3>
              </div>
            </div>
            
            <div className="h-[500px] md:h-[600px] p-6 flex flex-col">
              <div className="flex flex-col flex-grow space-y-6 overflow-y-auto">
                <div className="chat-message animate-fade-in">
                  <p className="font-medium title-gradient mb-2">Sanskara AI</p>
                  <div className="glass-card p-4">
                    <p className="text-wedding-brown/90">Namaste! I'm Sanskara, your AI wedding planning assistant. To help you find the perfect vendors for your wedding, I'll need some information. Could you please share your location, wedding traditions, and desired wedding date?</p>
                  </div>
                </div>
                
                <div className="chat-message flex justify-end animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <div className="max-w-[80%]">
                    <div className="bg-gradient-primary text-white p-4 rounded-2xl">
                      <p>We're planning our wedding in Mumbai for March 15, 2026. We're following Gujarati traditions.</p>
                    </div>
                  </div>
                </div>
                
                <div className="chat-message animate-fade-in" style={{ animationDelay: '0.4s' }}>
                  <p className="font-medium title-gradient mb-2">Sanskara AI</p>
                  <div className="glass-card p-4">
                    <p className="text-wedding-brown/90 mb-4">Thank you for sharing those details! For a Gujarati wedding in Mumbai in March 2026, here are some recommended venues:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="glass-card p-4 hover:shadow-lg cursor-pointer transition-all duration-300 transform hover:-translate-y-1">
                        <h4 className="font-semibold title-gradient text-lg">Royal Garden Resort</h4>
                        <p className="text-wedding-brown/70 mt-1">Andheri West, Mumbai</p>
                        <div className="flex items-center mt-2">
                          <span className="text-wedding-gold">★★★★★</span>
                          <span className="text-wedding-brown/60 ml-2 text-sm">(124 reviews)</span>
                        </div>
                      </div>
                      <div className="glass-card p-4 hover:shadow-lg cursor-pointer transition-all duration-300 transform hover:-translate-y-1">
                        <h4 className="font-semibold title-gradient text-lg">The Grand Pavilion</h4>
                        <p className="text-wedding-brown/70 mt-1">Juhu, Mumbai</p>
                        <div className="flex items-center mt-2">
                          <span className="text-wedding-gold">★★★★☆</span>
                          <span className="text-wedding-brown/60 ml-2 text-sm">(98 reviews)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="chat-message flex justify-end animate-fade-in" style={{ animationDelay: '0.6s' }}>
                  <div className="max-w-[80%]">
                    <div className="bg-gradient-primary text-white p-4 rounded-2xl">
                      <p>I'm interested in The Grand Pavilion. Do they specialize in Gujarati weddings?</p>
                    </div>
                  </div>
                </div>
                
                <div className="chat-message animate-fade-in" style={{ animationDelay: '0.8s' }}>
                  <p className="font-medium title-gradient mb-2">Sanskara AI</p>
                  <div className="glass-card p-4">
                    <p className="text-wedding-brown/90">Yes, The Grand Pavilion has extensive experience hosting traditional Gujarati weddings. They offer:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-wedding-brown/90">
                      <li>Dedicated spaces for Garba and Sangeet</li>
                      <li>In-house catering with authentic Gujarati cuisine options</li>
                      <li>Special mandap decoration packages</li>
                      <li>Accommodation for up to 150 out-of-town guests</li>
                    </ul>
                    <p className="mt-2 text-wedding-brown/90">Available on your preferred date: March 15, 2026</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="font-semibold title-gradient">₹3,75,000 for full package</span>
                      <Button size="sm" className="bg-wedding-red hover:bg-wedding-deepred text-white">
                        View Complete Details
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="chat-message animate-fade-in" style={{ animationDelay: '1.0s' }}>
                  <p className="font-medium title-gradient mb-2">Sanskara AI</p>
                  <div className="glass-card p-4">
                    <p className="text-wedding-brown/90">Here are two similar venues that might also interest you:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                      <div className="glass-card p-4 hover:shadow-lg cursor-pointer transition-all duration-300 transform hover:-translate-y-1">
                        <h4 className="font-semibold title-gradient text-lg">Saffron Banquet Hall</h4>
                        <p className="text-wedding-brown/70 mt-1">Worli, Mumbai</p>
                        <div className="flex items-center mt-2">
                          <span className="text-wedding-gold">★★★★★</span>
                          <span className="text-wedding-brown/60 ml-2 text-sm">(87 reviews)</span>
                        </div>
                      </div>
                      <div className="glass-card p-4 hover:shadow-lg cursor-pointer transition-all duration-300 transform hover:-translate-y-1">
                        <h4 className="font-semibold title-gradient text-lg">Lakeside Gardens</h4>
                        <p className="text-wedding-brown/70 mt-1">Powai, Mumbai</p>
                        <div className="flex items-center mt-2">
                          <span className="text-wedding-gold">★★★★☆</span>
                          <span className="text-wedding-brown/60 ml-2 text-sm">(112 reviews)</span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-wedding-brown/90">Would you like to check The Grand Pavilion's availability and proceed with booking?</p>
                  </div>
                </div>
                
                <div className="chat-message flex justify-end animate-fade-in" style={{ animationDelay: '1.2s' }}>
                  <div className="max-w-[80%]">
                    <div className="bg-gradient-primary text-white p-4 rounded-2xl">
                      <p>Yes, please check if The Grand Pavilion is available on March 15, 2026 and what deposit is required to book.</p>
                    </div>
                  </div>
                </div>
                
                <div className="chat-message animate-fade-in" style={{ animationDelay: '1.4s' }}>
                  <p className="font-medium title-gradient mb-2">Sanskara AI</p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-3">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Check className="h-5 w-5 text-green-600" />
                      </div>
                      <p className="ml-2 font-medium text-green-800">The Grand Pavilion is available on March 15, 2026!</p>
                    </div>
                    <div className="mt-3 space-y-2 text-gray-700">
                      <p><span className="font-medium">Deposit required:</span> ₹1,00,000 (non-refundable)</p>
                      <p><span className="font-medium">Payment options:</span> Credit/Debit cards, Net Banking, UPI</p>
                      <p><span className="font-medium">Cancellation policy:</span> Full refund (minus deposit) if cancelled 90+ days before event</p>
                    </div>
                  </div>
                  
                  <p>To secure this venue for your wedding date, you can make the booking with the required deposit. Would you like to proceed with the payment?</p>
                  
                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <Button className="bg-wedding-red hover:bg-wedding-deepred text-white">
                      Proceed to Payment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="border-wedding-red text-wedding-red hover:bg-wedding-red/10">
                      Chat with Venue Manager
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">After booking, you'll be connected with the venue manager to discuss your specific requirements.</p>
                </div>
              </div>
              
              <div className="mt-4 border-t border-wedding-gold/10 pt-4">
                <div className="flex gap-3">
                  <Button variant="ghost" className="nav-link p-2">
                    <Mic className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" className="nav-link p-2">
                    <Image className="h-5 w-5" />
                  </Button>
                  <div className="flex-grow glass-card flex items-center px-4">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="bg-transparent border-0 focus:outline-none text-wedding-brown/90 w-full"
                    />
                  </div>
                  <Button className="cta-button p-2">
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 text-wedding-brown/70">
              <Check className="h-5 w-5 text-wedding-gold" />
              <span>Real-time guidance</span>
            </div>
            <div className="flex items-center gap-2 text-wedding-brown/70">
              <Check className="h-5 w-5 text-wedding-gold" />
              <span>Cultural expertise</span>
            </div>
            <div className="flex items-center gap-2 text-wedding-brown/70">
              <Check className="h-5 w-5 text-wedding-gold" />
              <span>24/7 availability</span>
            </div>
          </div>
        </div>
      </div>
      <FloatingChatButton />
    </section>
  );
};

export default ChatDemo;
