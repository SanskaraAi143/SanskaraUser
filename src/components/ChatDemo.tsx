
import React from 'react';
import { Button } from "@/components/ui/button";
import { Send, Mic, Image, Check, ArrowRight } from 'lucide-react';

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
          
          <div className="h-[500px] md:h-[600px] p-4 flex flex-col overflow-y-auto">
            <div className="flex flex-col flex-grow space-y-4">
              <div className="chat-message ai-message animate-slide-up">
                <p className="font-medium text-wedding-maroon">Sanskara AI</p>
                <p>Namaste! I'm Sanskara, your AI wedding planning assistant. To help you find the perfect vendors for your wedding, I'll need some information. Could you please share your location, wedding traditions, and desired wedding date?</p>
              </div>
              
              <div className="chat-message user-message animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <p>We're planning our wedding in Mumbai for March 15, 2026. We're following Gujarati traditions.</p>
              </div>
              
              <div className="chat-message ai-message animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <p className="font-medium text-wedding-maroon">Sanskara AI</p>
                <p>Thank you for sharing those details! For a Gujarati wedding in Mumbai in March 2026, here are some recommended venues:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div className="border border-wedding-red/20 rounded-lg p-3 hover:bg-wedding-red/5 cursor-pointer transition">
                    <h4 className="font-semibold text-wedding-maroon">Royal Garden Resort</h4>
                    <p className="text-sm text-gray-600 mt-1">Andheri West, Mumbai</p>
                    <div className="flex items-center text-sm mt-1">
                      <span className="text-yellow-500">★★★★★</span>
                      <span className="text-gray-600 ml-1">(124 reviews)</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">₹2,50,000 - ₹4,00,000</p>
                  </div>
                  <div className="border border-wedding-red/20 rounded-lg p-3 hover:bg-wedding-red/5 cursor-pointer transition">
                    <h4 className="font-semibold text-wedding-maroon">The Grand Pavilion</h4>
                    <p className="text-sm text-gray-600 mt-1">Juhu, Mumbai</p>
                    <div className="flex items-center text-sm mt-1">
                      <span className="text-yellow-500">★★★★☆</span>
                      <span className="text-gray-600 ml-1">(98 reviews)</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">₹3,00,000 - ₹5,50,000</p>
                  </div>
                </div>
                <p className="mt-3">Would you like more information about either of these venues, or would you prefer to see more options?</p>
              </div>
              
              <div className="chat-message user-message animate-slide-up" style={{ animationDelay: '0.6s' }}>
                <p>I'm interested in The Grand Pavilion. Do they specialize in Gujarati weddings?</p>
              </div>
              
              <div className="chat-message ai-message animate-slide-up" style={{ animationDelay: '0.8s' }}>
                <p className="font-medium text-wedding-maroon">Sanskara AI</p>
                <div className="border border-wedding-red/20 rounded-lg p-4 bg-wedding-red/5 mb-3">
                  <h4 className="font-semibold text-wedding-maroon text-lg">The Grand Pavilion</h4>
                  <p className="text-gray-700 mt-1">Yes, The Grand Pavilion has extensive experience hosting traditional Gujarati weddings. They offer:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                    <li>Dedicated spaces for Garba and Sangeet</li>
                    <li>In-house catering with authentic Gujarati cuisine options</li>
                    <li>Special mandap decoration packages</li>
                    <li>Accommodation for up to 150 out-of-town guests</li>
                  </ul>
                  <p className="mt-2 text-gray-700">Available on your preferred date: March 15, 2026</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="font-semibold text-wedding-maroon">₹3,75,000 for full package</span>
                    <Button size="sm" className="bg-wedding-red hover:bg-wedding-deepred text-white">
                      View Complete Details
                    </Button>
                  </div>
                </div>
                <p>Here are two similar venues that might also interest you:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div className="border border-wedding-red/20 rounded-lg p-3 hover:bg-wedding-red/5 cursor-pointer transition">
                    <h4 className="font-semibold text-wedding-maroon">Saffron Banquet Hall</h4>
                    <p className="text-sm text-gray-600 mt-1">Worli, Mumbai</p>
                    <div className="flex items-center text-sm mt-1">
                      <span className="text-yellow-500">★★★★★</span>
                      <span className="text-gray-600 ml-1">(87 reviews)</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">₹3,25,000 - ₹4,50,000</p>
                  </div>
                  <div className="border border-wedding-red/20 rounded-lg p-3 hover:bg-wedding-red/5 cursor-pointer transition">
                    <h4 className="font-semibold text-wedding-maroon">Lakeside Gardens</h4>
                    <p className="text-sm text-gray-600 mt-1">Powai, Mumbai</p>
                    <div className="flex items-center text-sm mt-1">
                      <span className="text-yellow-500">★★★★☆</span>
                      <span className="text-gray-600 ml-1">(112 reviews)</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">₹2,80,000 - ₹4,20,000</p>
                  </div>
                </div>
                <p className="mt-3">Would you like to check The Grand Pavilion's availability and proceed with booking?</p>
              </div>
              
              <div className="chat-message user-message animate-slide-up" style={{ animationDelay: '1.0s' }}>
                <p>Yes, please check if The Grand Pavilion is available on March 15, 2026 and what deposit is required to book.</p>
              </div>
              
              <div className="chat-message ai-message animate-slide-up" style={{ animationDelay: '1.2s' }}>
                <p className="font-medium text-wedding-maroon">Sanskara AI</p>
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
                  placeholder="Ask about vendors, traditions, or planning tips..." 
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
