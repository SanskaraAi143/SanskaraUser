
import React from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  
  const handleStartPlanning = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="pattern-bg pt-28 pb-16 md:pt-32 md:pb-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          <div className="lg:w-1/2 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-wedding-maroon leading-tight">
              Plan Your Dream <span className="text-wedding-red">Hindu Wedding</span> With AI
            </h1>
            <p className="mt-6 text-lg text-gray-700 max-w-2xl">
              Sanskara AI is your virtual wedding planner that helps you navigate Hindu wedding
              rituals, vendors, and traditions to create your perfect ceremony.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button 
                className="bg-wedding-red hover:bg-wedding-deepred text-white h-12 px-6 text-lg"
                onClick={handleStartPlanning}
              >
                <Sparkles size={20} className="mr-2" />
                Chat with Sanskara
              </Button>
              <Button variant="outline" className="h-12 px-6 text-lg border-wedding-red text-wedding-red hover:bg-wedding-red/10">
                <Calendar size={20} className="mr-2" />
                See Sample Plan
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 w-10 rounded-full bg-wedding-red/20 border-2 border-white flex items-center justify-center text-xs font-semibold text-wedding-red">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p className="text-gray-600">
                <span className="font-medium">500+</span> couples planned their dream wedding
              </p>
            </div>
          </div>
          
          <div className="lg:w-1/2 relative animate-fade-in">
            <div className="absolute -top-6 -left-6 w-40 h-40 bg-wedding-orange/10 rounded-full z-0"></div>
            <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-wedding-red/10 rounded-full z-0"></div>
            <div className="relative z-10 bg-white p-4 rounded-2xl shadow-lg max-w-md mx-auto">
              <div className="aspect-[4/5] rounded-xl overflow-hidden">
                <img 
                  src="/lovable-uploads/89ffba58-4862-4bf8-b505-e54b0c6fd052.png"
                  alt="Beautiful wedding decoration with floral arch and fairy lights" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-xl shadow-md flex items-center gap-2">
                <Heart size={24} className="text-wedding-red" fill="#D62F32" />
                <span className="font-medium">Perfect match</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
