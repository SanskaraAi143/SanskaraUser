import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Send, Mic, Image, Check, ArrowRight } from 'lucide-react';
import FloatingChatButton from '@/components/ui/FloatingChatButton';
import ChatMessageBubble from '@/components/chat/ChatMessageBubble';
import VenueSuggestionCard, { VenueData } from '@/components/ui/VenueSuggestionCard';

const ChatDemo = () => {
  const { t } = useTranslation();

  const demoMessages = [
    { sender: t("chat_demo_msg1_sender"), message: t("chat_demo_msg1_text"), isUser: false, delay: '0s' },
    { sender: t("chat_demo_msg2_sender"), message: t("chat_demo_msg2_text"), isUser: true, delay: '0.2s' },
  ];

  const venue1: VenueData = { name: t("chat_demo_venue1_name"), location: t("chat_demo_venue1_location"), rating: "★★★★★", ratingAria: "5 out of 5 stars", reviews: t("chat_demo_venue1_reviews") };
  const venue2: VenueData = { name: t("chat_demo_venue2_name"), location: t("chat_demo_venue2_location"), rating: "★★★★☆", ratingAria: "4 out of 5 stars", reviews: t("chat_demo_venue2_reviews") };
  const venue3: VenueData = { name: t("chat_demo_venue3_name"), location: t("chat_demo_venue3_location"), rating: "★★★★★", ratingAria: "5 out of 5 stars", reviews: t("chat_demo_venue3_reviews") };
  const venue4: VenueData = { name: t("chat_demo_venue4_name"), location: t("chat_demo_venue4_location"), rating: "★★★★☆", ratingAria: "4 out of 5 stars", reviews: t("chat_demo_venue4_reviews") };


  return (
    <section id="how-it-works" className="relative py-20 md:py-32 overflow-hidden">
      <div className="gradient-bg opacity-50"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="glass-card p-8 md:p-12 mb-16 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-bold mb-6">
            {t('chat_demo_title_1')}<br/>
            <span className="title-gradient">{t('chat_demo_title_2')}</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-700">
            {t('chat_demo_subtitle')}
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
                  {t('chat_demo_header')}
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
                  <p className="font-medium title-gradient mb-1 text-sm">{t('chat_demo_msg1_sender')}</p>
                  <div className="glass-card p-3 md:p-4 rounded-2xl shadow-md">
                    <p className="text-wedding-brown/90 mb-3 text-sm">{t('chat_demo_venue_msg_1')}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <VenueSuggestionCard venue={venue1} />
                      <VenueSuggestionCard venue={venue2} />
                    </div>
                  </div>
                </div>

                <ChatMessageBubble sender={t("chat_demo_msg2_sender")} message={t("chat_demo_msg3_text")} isUserMessage={true} animationDelay="0.6s" />
                
                <div className="chat-message animate-fade-in" style={{ animationDelay: '0.8s' }}>
                  <p className="font-medium title-gradient mb-1 text-sm">{t('chat_demo_msg1_sender')}</p>
                  <div className="glass-card p-3 md:p-4 rounded-2xl shadow-md">
                    <p className="text-wedding-brown/90 text-sm">{t('chat_demo_venue_msg_2')}</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-wedding-brown/90 text-xs">
                      <li>{t('chat_demo_venue_feature1')}</li>
                      <li>{t('chat_demo_venue_feature2')}</li>
                      <li>{t('chat_demo_venue_feature3')}</li>
                      <li>{t('chat_demo_venue_feature4')}</li>
                    </ul>
                    <p className="mt-2 text-wedding-brown/90 text-xs">{t('chat_demo_venue_availability')}</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className="font-semibold title-gradient text-xs">{t('chat_demo_venue_price')}</span>
                      <Button size="sm" className="bg-wedding-red hover:bg-wedding-deepred text-white text-xs px-2 py-1 h-auto">
                        {t('chat_demo_view_details')}
                      </Button>
                    </div>
                  </div>
                </div>

                 <div className="chat-message animate-fade-in" style={{ animationDelay: '1.0s' }}>
                  <p className="font-medium title-gradient mb-1 text-sm">{t('chat_demo_msg1_sender')}</p>
                  <div className="glass-card p-3 md:p-4 rounded-2xl shadow-md">
                    <p className="text-wedding-brown/90 mb-3 text-sm">{t('chat_demo_venue_msg_3')}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <VenueSuggestionCard venue={venue3} />
                      <VenueSuggestionCard venue={venue4} />
                    </div>
                    <p className="mt-3 text-wedding-brown/90 text-sm">{t('chat_demo_venue_msg_4')}</p>
                  </div>
                </div>

                <ChatMessageBubble sender={t("chat_demo_msg2_sender")} message={t("chat_demo_msg4_text")} isUserMessage={true} animationDelay="1.2s" />

                <div className="chat-message animate-fade-in" style={{ animationDelay: '1.4s' }}>
                  <p className="font-medium title-gradient mb-1 text-sm">{t('chat_demo_msg1_sender')}</p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 md:p-4 mb-3 shadow-sm">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-1.5 rounded-full">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="ml-2 font-medium text-green-800 text-sm">{t('chat_demo_availability_confirmed')}</p>
                    </div>
                    <div className="mt-2 space-y-1 text-gray-700 text-xs">
                      <p><span className="font-medium">{t('chat_demo_deposit_required')}</span> {t('chat_demo_deposit_amount')}</p>
                      <p><span className="font-medium">{t('chat_demo_payment_options')}</span> {t('chat_demo_payment_methods')}</p>
                      <p><span className="font-medium">{t('chat_demo_cancellation_policy')}</span> {t('chat_demo_cancellation_terms')}</p>
                    </div>
                  </div>
                  <div className="glass-card p-3 md:p-4 rounded-2xl shadow-md">
                    <p className="text-wedding-brown/90 text-sm">{t('chat_demo_booking_prompt')}</p>
                    <div className="mt-3 flex flex-col sm:flex-row gap-2">
                      <Button className="bg-wedding-red hover:bg-wedding-deepred text-white text-xs px-3 py-1.5 h-auto">
                        {t('chat_demo_proceed_to_payment')}
                        <ArrowRight className="ml-1.5 h-3 w-3" />
                      </Button>
                      <Button variant="outline" className="border-wedding-red text-wedding-red hover:bg-wedding-red/10 text-xs px-3 py-1.5 h-auto">
                        {t('chat_demo_chat_with_manager')}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{t('chat_demo_booking_info')}</p>
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
                      placeholder={t('chat_demo_input_placeholder')}
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
              <span>{t('chat_demo_feature1')}</span>
            </div>
            <div className="flex items-center gap-2 text-wedding-brown/70">
              <Check className="h-5 w-5 text-wedding-gold" />
              <span>{t('chat_demo_feature2')}</span>
            </div>
            <div className="flex items-center gap-2 text-wedding-brown/70">
              <Check className="h-5 w-5 text-wedding-gold" />
              <span>{t('chat_demo_feature3')}</span>
            </div>
          </div>
        </div>
      </div>
      <FloatingChatButton />
    </section>
  );
};

export default ChatDemo;
