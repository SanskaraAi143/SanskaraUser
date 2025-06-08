import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import RitualGuide from '@/components/RitualGuide';
import ChatDemo from '@/components/ChatDemo';
import Pricing from '@/components/Pricing';
import Footer from '@/components/Footer';
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import SignInDialog from "@/components/auth/SignInDialog";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    }
  };
  
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <RitualGuide />
        <ChatDemo />
        <Pricing />
        
        {/* Divine Planning Crew Section (match New Latest.html style) */}
        <section id="crew" className="py-16 md:py-28 bg-wedding-cream flex justify-center items-center">
          <div className="planning-crew glass-card max-w-5xl w-full mx-auto flex flex-col md:flex-row items-center gap-10 p-8 md:p-12 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="crew-image-container flex-1 flex justify-center items-center">
              <img
                src="/crew-bitemoji.jpeg"
                alt="Divine Planning Crew"
                className="crew-image rounded-2xl w-full max-w-md object-cover shadow-lg"
                style={{ minHeight: '320px', background: '#fff8e1' }}
              />
            </div>
            <div className="crew-description flex-1">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 title-gradient" style={{ color: '#ffd700' }}>Meet Your Divine Planning Crew</h2>
              <p className="mb-4 text-gray-700/90">Your dedicated team of AI assistants, each specializing in different aspects of your wedding journey:</p>
              <ul className="crew-members space-y-3 text-base md:text-lg">
                <li className="flex items-center gap-2 font-semibold"><span className="text-2xl">👨‍🍳</span> Chef Arjun - <span className="font-normal">Your culinary excellence guide</span></li>
                <li className="flex items-center gap-2 font-semibold"><span className="text-2xl">💃</span> Priya - <span className="font-normal">Your tradition & decoration specialist</span></li>
                <li className="flex items-center gap-2 font-semibold"><span className="text-2xl">🧘‍♂️</span> Pandit Ji - <span className="font-normal">Your sacred ritual advisor</span></li>
                <li className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-xl bg-yellow-100 text-wedding-gold font-semibold text-base"><span className="text-xl mr-2">🎧</span>Tech Guide - Your digital planning assistant</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-12 md:py-20 bg-gradient-to-r from-wedding-gold to-wedding-secondaryGold text-white">
          <div className="container mx-auto px-4 text-center animate-fade-in">
            <h2 className="text-2xl md:text-4xl font-playfair font-bold mb-4 md:mb-6">
              Begin Your Wedding Journey Today
            </h2>
            <p className="text-white/90 text-base md:text-lg max-w-2xl mx-auto mb-6 md:mb-8">
              Start planning your perfect Hindu wedding with personalized guidance, 
              vendor recommendations, and cultural insights.
            </p>
            {user ? (
              <Button 
                className="bg-white text-wedding-gold hover:bg-wedding-cream transition-colors py-2 md:py-3 px-6 md:px-8 rounded-full text-base md:text-lg font-medium"
                onClick={handleGetStarted}
              >
                Go to Dashboard
              </Button>
            ) : (
              <SignInDialog>
                <Button className="bg-white text-wedding-red hover:bg-wedding-cream transition-colors py-2 md:py-3 px-6 md:px-8 rounded-full text-base md:text-lg font-medium">
                  Get Started For Free
                </Button>
              </SignInDialog>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
