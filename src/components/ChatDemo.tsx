import React from 'react';
import { Button } from "@/components/ui/button";
import { Send, Mic, Image, Check, ArrowRight } from 'lucide-react';
import FloatingChatButton from '@/components/ui/FloatingChatButton'; // Import the extracted component
import ChatMessageBubble from '@/components/chat/ChatMessageBubble'; // Import the new component
import VenueSuggestionCard, { VenueData } from '@/components/ui/VenueSuggestionCard'; // Import the extracted component and type

// Data for the demo
const demoMessages = [
  { sender: "Sanskara AI", message: "Namaste! I'm Sanskara, your AI wedding planning assistant. To help you find the perfect vendors for your wedding, I'll need some information. Could you please share your location, wedding traditions, and desired wedding date?", isUser: false, delay: '0s' },
  { sender: "User", message: "We're planning our wedding in Mumbai for March 15, 2026. We're following Gujarati traditions.", isUser: true, delay: '0.2s' },
];

const venue1: VenueData = { name: "Royal Garden Resort", location: "Andheri West, Mumbai", rating: "★★★★★", ratingAria: "5 out of 5 stars", reviews: "(124 reviews)" };
const venue2: VenueData = { name: "The Grand Pavilion", location: "Juhu, Mumbai", rating: "★★★★☆", ratingAria: "4 out of 5 stars", reviews: "(98 reviews)" };
const venue3: VenueData = { name: "Saffron Banquet Hall", location: "Worli, Mumbai", rating: "★★★★★", ratingAria: "5 out of 5 stars", reviews: "(87 reviews)" };
const venue4: VenueData = { name: "Lakeside Gardens", location: "Powai, Mumbai", rating: "★★★★☆", ratingAria: "4 out of 5 stars", reviews: "(112 reviews)" };


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
          <p className="text-lg md:text-xl text-gray-700">
            Sanskara AI understands Hindu wedding traditions, answering your questions and
            guiding you through every step of the planning process.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="glass-card overflow-hidden shadow-2xl">
            <div className="bg-gradient-primary bg-opacity-10 p-6 border-b border-wedding-gold/20">
              <div className="flex items-center justify-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center bg-gradient-primary rounded-full shadow-lg">
                  <img src="/lovable-uploads/82e13d9f-7faf-4d65-8c82-2be524f85cf7.webp" alt="Sanskara Logo" className="h-8 w-8" />
                </div>
                <h3 className="font-playfair text-2xl font-semibold title-gradient">
                  Chat with Sanskara AI
                </h3>
              </div>
            </div>
            
            <div className="h-[500px] md:h-[600px] p-6 flex flex-col">
              <div className="flex flex-col flex-grow space-y-6 overflow-y-auto pr-2">
                {demoMessages.map((msg, index) => (
                  <ChatMessageBubble
                    key={index}
                    sender={msg.sender}
                    message={msg.message}
                    isUserMessage={msg.isUser}
                    animationDelay={msg.delay}
                  />
                ))}

                {/* Message with venue cards */}
                <div className="chat-message animate-fade-in" style={{ animationDelay: '0.4s' }}>
                  <p className="font-medium title-gradient mb-1 text-sm">Sanskara AI</p>
                  <div className="glass-card p-3 md:p-4 rounded-2xl shadow-md">
                    <p className="text-wedding-brown/90 mb-3 text-sm">Thank you for sharing those details! For a Gujarati wedding in Mumbai in March 2026, here are some recommended venues:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <VenueSuggestionCard venue={venue1} />
                      <VenueSuggestionCard venue={venue2} />
                    </div>
                  </div>
                </div>

                <ChatMessageBubble sender="User" message="I'm interested in The Grand Pavilion. Do they specialize in Gujarati weddings?" isUserMessage={true} animationDelay="0.6s" />
                
                <div className="chat-message animate-fade-in" style={{ animationDelay: '0.8s' }}>
                  <p className="font-medium title-gradient mb-1 text-sm">Sanskara AI</p>
                  <div className="glass-card p-3 md:p-4 rounded-2xl shadow-md">
                    <p className="text-wedding-brown/90 text-sm">Yes, The Grand Pavilion has extensive experience hosting traditional Gujarati weddings. They offer:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-wedding-brown/90 text-xs">
                      <li>Dedicated spaces for Garba and Sangeet</li>
                      <li>In-house catering with authentic Gujarati cuisine options</li>
                      <li>Special mandap decoration packages</li>
                      <li>Accommodation for up to 150 out-of-town guests</li>
                    </ul>
                    <p className="mt-2 text-wedding-brown/90 text-xs">Available on your preferred date: March 15, 2026</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="font-semibold title-gradient text-xs">₹3,75,000 for full package</span>
                      <Button size="sm" className="bg-wedding-red hover:bg-wedding-deepred text-white text-xs px-2 py-1 h-auto">
                        View Complete Details
                      </Button>
                    </div>
                  </div>
                </div>

                 <div className="chat-message animate-fade-in" style={{ animationDelay: '1.0s' }}>
                  <p className="font-medium title-gradient mb-1 text-sm">Sanskara AI</p>
                  <div className="glass-card p-3 md:p-4 rounded-2xl shadow-md">
                    <p className="text-wedding-brown/90 mb-3 text-sm">Here are two similar venues that might also interest you:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <VenueSuggestionCard venue={venue3} />
                      <VenueSuggestionCard venue={venue4} />
                    </div>
                    <p className="mt-3 text-wedding-brown/90 text-sm">Would you like to check The Grand Pavilion's availability and proceed with booking?</p>
                  </div>
                </div>

                <ChatMessageBubble sender="User" message="Yes, please check if The Grand Pavilion is available on March 15, 2026 and what deposit is required to book." isUserMessage={true} animationDelay="1.2s" />

                <div className="chat-message animate-fade-in" style={{ animationDelay: '1.4s' }}>
                  <p className="font-medium title-gradient mb-1 text-sm">Sanskara AI</p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 md:p-4 mb-3 shadow-sm">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-1.5 rounded-full">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="ml-2 font-medium text-green-800 text-sm">The Grand Pavilion is available on March 15, 2026!</p>
                    </div>
                    <div className="mt-2 space-y-1 text-gray-700 text-xs">
                      <p><span className="font-medium">Deposit required:</span> ₹1,00,000 (non-refundable)</p>
                      <p><span className="font-medium">Payment options:</span> Credit/Debit cards, Net Banking, UPI</p>
                      <p><span className="font-medium">Cancellation policy:</span> Full refund (minus deposit) if cancelled 90+ days before event</p>
                    </div>
                  </div>
                  <div className="glass-card p-3 md:p-4 rounded-2xl shadow-md">
                    <p className="text-wedding-brown/90 text-sm">To secure this venue for your wedding date, you can make the booking with the required deposit. Would you like to proceed with the payment?</p>
                    <div className="mt-3 flex flex-col sm:flex-row gap-2">
                      <Button className="bg-wedding-red hover:bg-wedding-deepred text-white text-xs px-3 py-1.5 h-auto">
                        Proceed to Payment
                        <ArrowRight className="ml-1.5 h-3 w-3" />
                      </Button>
                      <Button variant="outline" className="border-wedding-red text-wedding-red hover:bg-wedding-red/10 text-xs px-3 py-1.5 h-auto">
                        Chat with Venue Manager
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">After booking, you'll be connected with the venue manager to discuss your specific requirements.</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 border-t border-wedding-gold/10 pt-4">
                <div className="flex gap-3">
                  <Button variant="ghost" className="nav-link p-2" aria-label="Use microphone">
                    <Mic className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" className="nav-link p-2" aria-label="Upload image">
                    <Image className="h-5 w-5" />
                  </Button>
                  <div className="flex-grow glass-card flex items-center px-4">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="bg-transparent border-0 focus:outline-none text-wedding-brown/90 w-full"
                      aria-label="Chat input"
                    />
                  </div>
                  <Button className="cta-button p-2" aria-label="Send message">
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
