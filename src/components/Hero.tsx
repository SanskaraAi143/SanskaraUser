import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative min-h-[90vh] flex items-center justify-center bg-wedding-cream/50">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-wedding-cream/30 z-0"></div>
      
      <div className="container mx-auto px-4 z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold leading-tight text-gray-800">
            Host the Perfect Hindu Wedding Without the Chaos.
            <br/>
            <span className="title-gradient">Save 9 Months of Planning & ₹2 Lakhs in Mistakes.</span>
            <br/>
            Guaranteed.
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-gray-600">
            Sanskara AI orchestrates everything from your Sangeet to your Saptapadi, connecting you with verified vendors and managing every ritual, so you can focus on your forever.
          </p>
          
          <div className="mt-10">
            <Button asChild size="lg" className="cta-button text-lg">
              <Link to="/ritual-navigator">
                Instantly Map Your Wedding Timeline
                <ArrowRight size={22} className="ml-2" />
              </Link>
            </Button>
            <p className="mt-4 text-sm text-gray-500">
              Get a Free, Personalized Ritual & Vendor Checklist for Your Wedding.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
