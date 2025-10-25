import React, { useRef, useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import BetaNotice from '@/components/BetaNotice';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import { Helmet } from 'react-helmet-async';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const Index = () => {
  const [isBetaNoticeVisible, setIsBetaNoticeVisible] = useState(() => {
    return localStorage.getItem('beta-notice-dismissed') !== 'true';
  });

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
    "name": "Sanskara AI - The Digital Mandap",
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

  return (
    <div className="min-h-screen pt-20 bg-wedding-cream/50">
      <Helmet>
        <title>Sanskara AI - The Digital Mandap for Modern Hindu Weddings</title>
        <meta name="description" content="Host the perfect Hindu wedding without the chaos. Sanskara AI saves you 9 months of planning and ₹2 lakhs in mistakes. Get your free personalized wedding checklist." />
        <link rel="canonical" href="https://sanskaraai.com/" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sanskaraai.com/" />
        <meta property="og:title" content="Sanskara AI - The Digital Mandap for Modern Hindu Weddings" />
        <meta property="og:description" content="Host the perfect Hindu wedding without the chaos. Save 9 months of planning and ₹2 lakhs in mistakes. Guaranteed." />
        <meta property="og:image" content="https://sanskaraai.com/og-image-digital-mandap.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://sanskaraai.com/" />
        <meta property="twitter:title" content="Sanskara AI - The Digital Mandap for Modern Hindu Weddings" />
        <meta property="twitter:description" content="Host the perfect Hindu wedding without the chaos. Save 9 months of planning and ₹2 lakhs in mistakes. Guaranteed." />
        <meta property="twitter:image" content="https://sanskaraai.com/twitter-image-digital-mandap.jpg" />

        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(websiteSchema)}
        </script>
      </Helmet>

      <BetaNotice onDismiss={() => setIsBetaNoticeVisible(false)} onVisibilityChange={setIsBetaNoticeVisible} />
      <Navbar isBetaNoticeVisible={isBetaNoticeVisible} />

      <main role="main" aria-label="Main content">
        <Hero />

        {/* A simplified CTA section that echoes the Hero's message */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 text-center animate-fade-in">
            <h2 className="text-2xl md:text-4xl font-playfair font-bold mb-4 md:mb-6 text-gray-800">
              Ready to Build Your Dream Wedding?
            </h2>
            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto mb-6 md:mb-8">
              Take the first step towards a stress-free planning experience. Get your complimentary, personalized checklist and see how The Digital Mandap can bring your vision to life.
            </p>
            <Button asChild size="lg" className="cta-button-secondary text-lg">
              <Link to="/ritual-navigator">
                Get Your Free Checklist Now
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;