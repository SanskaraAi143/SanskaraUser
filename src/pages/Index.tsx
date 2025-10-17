import React, { useRef, useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import BetaNotice from '@/components/BetaNotice';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import RitualGuide from '@/components/RitualGuide';
import ChatDemo from '@/components/ChatDemo';
import Pricing from '@/components/Pricing';
import Footer from '@/components/Footer';
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Helmet } from 'react-helmet-async';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioError, setAudioError] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [isBetaNoticeVisible, setIsBetaNoticeVisible] = useState(() => {
    return localStorage.getItem('beta-notice-dismissed') !== 'true';
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      if (!user) {
        audio.muted = true;
        audio.play().then(() => {
          audio.muted = false;
          setAudioPlaying(true);
          setAudioError(false);
        }).catch(error => {
          setAudioError(true);
          setAudioPlaying(false);
        });
      } else {
        audio.pause();
        setAudioPlaying(false);
        setAudioError(false);
      }
    }
  }, [user]);

  const handleManualPlay = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.play().then(() => {
        setAudioPlaying(true);
        setAudioError(false);
      }).catch(error => {
        setAudioError(true);
        console.log("Manual audio play failed:", error);
      });
    }
  };
  
  const handleGetStarted = () => {
    if (user) {
      if (user.wedding_id) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    }
  };
  
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Sanskara AI",
    "url": "https://sanskaraai.com/",
    "logo": "https://sanskaraai.com/logo.jpeg",
    "sameAs": [
      "https://www.linkedin.com/company/sanskaraai/",
      "https://www.instagram.com/sanskaraai/"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "admin@sanskaraai.com",
      "contactType": "Customer Service"
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Sanskara AI",
    "url": "https://sanskaraai.com/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://sanskaraai.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Sanskara AI",
    "url": "https://sanskaraai.com/",
    "logo": "https://sanskaraai.com/logo.jpeg",
    "image": "https://sanskaraai.com/logo.jpeg",
    "description": "AI-powered Hindu wedding planning assistant. Personalized guidance, ritual explanations, and vendor recommendations for your perfect Indian wedding.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN"
    },
    "telephone": "+91-XXX-XXXXXXX",
    "email": "admin@sanskaraai.com",
    "areaServed": {
      "@type": "Country",
      "name": "India"
    },
    "priceRange": "$$$",
    "openingHoursSpecification": [
        {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"
            ],
            "opens": "00:00",
            "closes": "23:59"
        }
    ],
    "sameAs": [
      "https://www.linkedin.com/company/sanskaraai/",
      "https://www.instagram.com/sanskaraai/"
    ]
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "AI-Powered Hindu Wedding Planning",
    "description": "Comprehensive Hindu wedding planning service powered by artificial intelligence. Get personalized guidance, ritual explanations, vendor recommendations, and complete wedding management.",
    "provider": {
      "@type": "Organization",
      "name": "Sanskara AI",
      "url": "https://sanskaraai.com/"
    },
    "areaServed": {
      "@type": "Country",
      "name": "India"
    },
    "serviceType": "Wedding Planning",
    "category": "Hindu Wedding Planning",
    "offers": {
      "@type": "Offer",
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock"
    }
  };

  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Hindu Wedding Planning Services",
    "description": "Complete Hindu wedding planning with AI assistance, from engagement to reception",
    "organizer": {
      "@type": "Organization",
      "name": "Sanskara AI",
      "url": "https://sanskaraai.com/"
    },
    "location": {
      "@type": "Country",
      "name": "India"
    },
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/MixedEventAttendanceMode"
  };


  return (
    <div className="min-h-screen pt-20">
      <audio ref={audioRef} src="/audio_app.mp3" loop />
      <Helmet>
        {/* Existing meta tags from index.html will be overridden if also defined here,
            but it's good practice to have them defined per-page for clarity & SPAs.
            The ones in index.html serve as fallbacks.
        */}
        <title>Sanskara AI - AI Powered Hindu Wedding Planner India</title>
        <meta name="description" content="Plan your perfect Hindu wedding in India with Sanskara AI. Get AI-driven guidance, ritual explanations, vendor matching, and create your dream Indian wedding." />
        <link rel="canonical" href="https://sanskaraai.com/" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sanskaraai.com/" />
        <meta property="og:title" content="Sanskara AI - AI Powered Hindu Wedding Planner India" />
        <meta property="og:description" content="Plan your perfect Hindu wedding in India with Sanskara AI. Get AI-driven guidance, ritual explanations, vendor matching, and create your dream Indian wedding." />
        <meta property="og:image" content="https://sanskaraai.com/logo.jpeg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://sanskaraai.com/" />
        <meta property="twitter:title" content="Sanskara AI - AI Powered Hindu Wedding Planner India" />
        <meta property="twitter:description" content="Plan your perfect Hindu wedding in India with Sanskara AI. Get AI-driven guidance, ritual explanations, vendor matching, and create your dream Indian wedding." />
        <meta property="twitter:image" content="https://sanskaraai.com/logo.jpeg" />        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(websiteSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(localBusinessSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(serviceSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(eventSchema)}
        </script>      </Helmet>
      <BetaNotice onDismiss={() => setIsBetaNoticeVisible(false)} onVisibilityChange={setIsBetaNoticeVisible} />

      {audioPlaying && !user && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 flex items-center justify-center">
          <span className="text-lg mr-2 animate-pulse">🎵</span>
          <span className="font-medium text-sm">Wedding background music playing</span>
        </div>
      )}
      {audioError && !user && (
        <div className="fixed top-0 left-0 w-full bg-yellow-100 border-b-4 border-yellow-500 text-yellow-700 p-4 flex items-center justify-center z-50">
          <div className="flex items-center space-x-4">
            <span className="text-3xl">🎵</span>
            <div>
              <p className="font-bold text-lg">Background music couldn't start automatically</p>
              <p className="text-base">Click here to experience our wedding ambiance!</p>
            </div>
            <Button
              onClick={handleManualPlay}
              className="bg-wedding-gold hover:bg-yellow-500 text-black px-6 py-3 rounded-full text-lg font-semibold"
            >
              Play Music
            </Button>
          </div>
        </div>
      )}
      <Navbar isBetaNoticeVisible={isBetaNoticeVisible} />
      <main role="main" aria-label="Main content">
        <Hero />
        <Features />
        <RitualGuide />
        <ChatDemo />
        <Pricing />
        
        {/* Divine Planning Crew Section (match New Latest.html style) */}
        <section id="crew" className="py-16 md:py-28 bg-wedding-cream flex justify-center items-center">
          <div className="planning-crew glass-card max-w-5xl w-full mx-auto flex flex-col md:flex-row items-center gap-10 p-8 md:p-12 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="crew-image-container flex-1 flex justify-center items-center">              <img
                src="/crew-bitemoji.jpeg"
                alt="Divine Planning Crew"
                className="crew-image rounded-2xl w-full max-w-md object-cover shadow-lg"
                style={{ minHeight: '320px', background: '#fff8e1' }}
                loading="lazy"
                width="400"
                height="320"
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
            </div>          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-20 bg-gradient-to-r from-yellow-200 to-yellow-400">
          <div className="container mx-auto px-4 text-center animate-fade-in">
            <h2 className="text-2xl md:text-4xl font-playfair font-bold mb-4 md:mb-6 text-gray-900">
              Begin Your Wedding Journey Today
            </h2>
            <p className="text-gray-800 text-base md:text-lg max-w-2xl mx-auto mb-6 md:mb-8">
              Start planning your perfect Hindu wedding with personalized guidance,
              vendor recommendations, and cultural insights.
            </p>
            {user ? (
              <Button
                className="bg-gray-900 text-white hover:bg-gray-700 transition-colors py-2 md:py-3 px-6 md:px-8 rounded-full text-base md:text-lg font-medium"
                onClick={handleGetStarted}
              >
                Go to Dashboard
              </Button>
            ) : (
              <Button asChild size="lg">
                <Link to="/auth?mode=signup">Get Started For Free</Link>
              </Button>
            )}
          </div>        </section>
        <Footer />
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default Index;