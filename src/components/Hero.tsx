import React, { useRef, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, Heart, Wand2, Volume2, VolumeX } from 'lucide-react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { useIsMobile } from "@/hooks/use-mobile";
import FloatingParticles from '@/components/effects/FloatingParticles';
import AuthActionButton from '@/components/auth/AuthActionButton';

const Hero = () => {
  const isMobile = useIsMobile();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = isMuted;
      audio.play().catch(error => console.warn("Autoplay prevented:", error));
    }
  }, [isMuted]);
  
  return (
    <div className="relative min-h-[90vh] flex items-center">
      <div className="gradient-bg"></div>
      <FloatingParticles count={20} />
      
      {/* Audio element */}
      <audio ref={audioRef} src="/audio_app.mp3" loop autoPlay muted={isMuted} />

      <div className="container mx-auto px-4 pt-20">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="lg:w-1/2">
            <div className="glass-card p-8 md:p-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold leading-tight">
                Plan Your Dream <br/>
                <span className="title-gradient">Hindu Wedding</span><br/>
                <span className="inline-flex items-center">
                  With AI
                  {/* Mute/Unmute Button */}
                  <Button
                    onClick={() => setIsMuted(!isMuted)}
                    className="ml-2 bg-yellow-500 text-gray-900 rounded-full p-2 shadow-lg hover:bg-yellow-600 transition-colors flex items-center justify-center"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                    size="icon"
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </Button>
                </span>
              </h1>
                <p className="mt-6 text-lg md:text-xl max-w-2xl" style={{color: '#374151'}}>
                <strong>The Problem:</strong> Hindu wedding planning takes 12+ months with 15+ complex rituals and 50+ vendor decisions.
                <br/><br/>
                <strong>Our Solution:</strong> AI-powered planning that reduces time from 12 months to 3 months.
                Join 500+ couples who saved 9+ months and ₹2+ lakhs with Sanskara AI.
              </p>
              
              <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-4">
                <AuthActionButton
                  navigateTo="/dashboard"
                  className="cta-button text-lg"
                >
                  <Sparkles size={isMobile ? 18 : 22} className="mr-2" />
                  Chat with Sanskara
                </AuthActionButton>
                <AuthActionButton
                  navigateTo="/dashboard/timeline"
                  variant="outline"
                  className="h-10 md:h-12 px-4 md:px-6 text-base md:text-lg border-wedding-red text-wedding-red hover:bg-wedding-red/10 w-full sm:w-auto"
                >
                  <Calendar size={isMobile ? 16 : 20} className="mr-2" />
                  See Sample Plan
                </AuthActionButton>
                <AuthActionButton
                  navigateTo="/virtual-venue"
                  variant="outline"
                  className="h-10 md:h-12 px-4 md:px-6 text-base md:text-lg border-purple-500 text-purple-500 hover:bg-purple-500/10 w-full sm:w-auto"
                >
                  <Wand2 size={isMobile ? 16 : 20} className="mr-2" />
                  Virtual Try-On
                </AuthActionButton>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2 relative animate-fade-in mt-8 lg:mt-0">
            <div className="absolute -top-6 -left-6 w-24 h-24 md:w-40 md:h-40 bg-wedding-orange/10 rounded-full z-0"></div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 md:w-40 md:h-40 bg-wedding-red/10 rounded-full z-0"></div>
            <div className="relative z-10 bg-white p-3 md:p-4 rounded-2xl shadow-lg max-w-xs md:max-w-md mx-auto">
              <div className="aspect-[4/5] rounded-xl overflow-hidden">                <img
                  src="/lovable-uploads/ef091a6d-01c3-422d-9dac-faf459fb74ab.webp"
                  alt="Hindu couple holding hands in traditional wedding attire"
                  className="w-full h-full object-cover"
                  loading="eager"
                  width="400"
                  height="500"
                />
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
