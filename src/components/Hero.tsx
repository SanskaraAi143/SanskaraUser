
import React from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/context/AuthContext";
import SignInDialog from "@/components/auth/SignInDialog";
import { useIsMobile } from "@/hooks/use-mobile";

const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const handleStartPlanning = () => {
    if (user) {
      navigate('/dashboard');
    }
  };
  
  return (
    <div className="pattern-bg pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          <div className="lg:w-1/2 animate-fade-in">
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-playfair font-bold text-wedding-maroon leading-tight">
              Plan Your Dream <span className="text-wedding-red">Hindu Wedding</span> With AI
            </h1>
            <p className="mt-4 md:mt-6 text-base md:text-lg text-gray-700 max-w-2xl">
              Sanskara AI is your virtual wedding planner that helps you navigate Hindu wedding
              rituals, vendors, and traditions to create your perfect ceremony.
            </p>
            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-4">
              {user ? (
                <Button 
                  className="bg-wedding-red hover:bg-wedding-deepred text-white h-10 md:h-12 px-4 md:px-6 text-base md:text-lg w-full sm:w-auto" 
                  onClick={handleStartPlanning}
                >
                  <Sparkles size={isMobile ? 16 : 20} className="mr-2" />
                  Chat with Sanskara
                </Button>
              ) : (
                <SignInDialog>
                  <Button className="bg-wedding-red hover:bg-wedding-deepred text-white h-10 md:h-12 px-4 md:px-6 text-base md:text-lg w-full sm:w-auto">
                    <Sparkles size={isMobile ? 16 : 20} className="mr-2" />
                    Chat with Sanskara
                  </Button>
                </SignInDialog>
              )}
              <Button 
                variant="outline" 
                className="h-10 md:h-12 px-4 md:px-6 text-base md:text-lg border-wedding-red text-wedding-red hover:bg-wedding-red/10 w-full sm:w-auto"
              >
                <Calendar size={isMobile ? 16 : 20} className="mr-2" />
                See Sample Plan
              </Button>
            </div>
            <div className="mt-6 md:mt-8 flex items-center gap-3">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-wedding-red/20 border-2 border-white flex items-center justify-center text-xs font-semibold text-wedding-red">
                    {String.fromCharCode(64 + i)}
                  </div>)}
              </div>
              <p className="text-sm md:text-base text-gray-600">
                <span className="font-medium">500+</span> couples planned their dream wedding
              </p>
            </div>
          </div>
          
          <div className="lg:w-1/2 relative animate-fade-in mt-8 lg:mt-0">
            <div className="absolute -top-6 -left-6 w-24 h-24 md:w-40 md:h-40 bg-wedding-orange/10 rounded-full z-0"></div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 md:w-40 md:h-40 bg-wedding-red/10 rounded-full z-0"></div>
            <div className="relative z-10 bg-white p-3 md:p-4 rounded-2xl shadow-lg max-w-xs md:max-w-md mx-auto">
              <div className="aspect-[4/5] rounded-xl overflow-hidden">
                <img src="/lovable-uploads/ef091a6d-01c3-422d-9dac-faf459fb74ab.png" alt="Hindu couple holding hands in traditional wedding attire" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-3 -right-3 md:-bottom-4 md:-right-4 bg-white p-2 md:p-3 rounded-xl shadow-md flex items-center gap-2">
                <Heart size={isMobile ? 18 : 24} className="text-wedding-red" fill="#D62F32" />
                <span className="text-sm md:text-base font-medium">Perfect match</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
