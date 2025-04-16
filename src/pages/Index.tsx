
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
        
        {/* Testimonials Section */}
        <section id="testimonials" className="py-12 md:py-24 bg-wedding-cream">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16 animate-fade-in">
              <h2 className="text-2xl md:text-4xl font-playfair font-bold text-wedding-maroon mb-3 md:mb-4">
                Couples Love Sanskara
              </h2>
              <p className="text-gray-700 text-base md:text-lg">
                Hear from couples who planned their perfect Hindu wedding with Sanskara AI.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  name: "Ananya & Rohan",
                  location: "Mumbai, India",
                  image: "https://images.unsplash.com/photo-1624537137100-b5b7be701ef4?w=400&auto=format&fit=crop",
                  quote: "Sanskara AI helped us blend North and South Indian traditions for our wedding. Our families were impressed with how authentic our ceremony felt!"
                },
                {
                  name: "Riya & Vikram",
                  location: "Delhi, India",
                  image: "https://images.unsplash.com/photo-1617812191487-74637566b7d6?w=400&auto=format&fit=crop",
                  quote: "The vendor recommendations saved us so much time! We found an amazing pandit and decorator in our city who understood exactly what we wanted."
                },
                {
                  name: "Divya & Arjun",
                  location: "Jaipur, India",
                  image: "https://images.unsplash.com/photo-1620481679288-89479bfd6b1a?w=400&auto=format&fit=crop",
                  quote: "As a couple from different regions of India, we weren't sure how to incorporate both traditions. Sanskara guided us through creating a meaningful ceremony everyone loved."
                }
              ].map((testimonial, index) => (
                <div 
                  key={index} 
                  className="bg-white p-4 md:p-6 rounded-xl shadow-md animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                    <div className="h-12 w-12 md:h-16 md:w-16 rounded-full overflow-hidden">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-playfair font-semibold text-wedding-maroon text-sm md:text-base">
                        {testimonial.name}
                      </h3>
                      <p className="text-gray-600 text-xs md:text-sm">{testimonial.location}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic text-sm md:text-base">"{testimonial.quote}"</p>
                </div>
              ))}
            </div>
            
            <div className="mt-10 md:mt-16 text-center animate-fade-in">
              <a 
                href="#" 
                className="inline-flex items-center font-medium text-wedding-red hover:text-wedding-deepred text-sm md:text-base"
              >
                Read more stories from our couples
                <svg className="ml-2 w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-12 md:py-20 bg-gradient-to-r from-wedding-red to-wedding-deepred text-white">
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
                className="bg-white text-wedding-red hover:bg-wedding-cream transition-colors py-2 md:py-3 px-6 md:px-8 rounded-full text-base md:text-lg font-medium"
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
