import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const RitualGuidePage: React.FC = () => {
  const rituals = [
    {
      name: "Saptapadi (Seven Steps)",
      description: "The most sacred ritual where the couple takes seven vows around the sacred fire",
      blogSlug: "saptapadi-seven-sacred-steps",
      image: "/lovable-uploads/89ffba58-4862-4bf8-b505-e54b0c6fd052.png"
    },
    {
      name: "Hindu Wedding Rituals Overview",
      description: "Complete guide to all Hindu wedding ceremonies from engagement to post-wedding rituals",
      blogSlug: "hindu-wedding-rituals",
      image: "/lovable-uploads/89ffba58-4862-4bf8-b505-e54b0c6fd052.png"
    },
    {
      name: "Modern Haldi Ceremonies",
      description: "Traditional turmeric ceremony reimagined with modern flair and creativity",
      blogSlug: "modern-haldi-ceremonies",
      image: "/lovable-uploads/ef091a6d-01c3-422d-9dac-faf459fb74ab.png"
    },
    {
      name: "Choosing Auspicious Dates",
      description: "Understanding Panchangam and selecting the perfect wedding date according to Hindu traditions",
      blogSlug: "choosing-auspicious-dates-panchangam",
      image: "/lovable-uploads/82e13d9f-7faf-4d65-8c82-2be524f85cf7.png"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Hindu Wedding Ritual Guide - Sanskara AI</title>
        <meta name="description" content="Complete guide to Hindu wedding rituals and ceremonies. Understand the meaning, significance, and modern adaptations of sacred traditions." />
        <link rel="canonical" href="https://sanskaraai.com/ritual-guide" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Hindu Wedding Ritual Guide",
            "description": "Complete guide to Hindu wedding rituals and ceremonies",
            "url": "https://sanskaraai.com/ritual-guide",
            "mainEntity": {
              "@type": "ItemList",
              "itemListElement": rituals.map((ritual, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                  "@type": "Article",
                  "name": ritual.name,
                  "description": ritual.description,
                  "url": `https://sanskaraai.com/blog/${ritual.blogSlug}`
                }
              }))
            }
          })}
        </script>
      </Helmet>
      
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12 pt-20 md:pt-24 lg:pt-28">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 title-gradient">
              Hindu Wedding Ritual Guide
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover the profound meaning behind sacred Hindu wedding traditions. From ancient Vedic customs 
              to modern adaptations, understand each ritual's significance in your spiritual journey together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {rituals.map((ritual, index) => (
              <article key={index} className="glass-card p-8 rounded-2xl hover:shadow-xl transition-all duration-300">
                <div className="aspect-[16/9] mb-6 rounded-lg overflow-hidden">
                  <img 
                    src={ritual.image} 
                    alt={ritual.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-2xl font-bold mb-4 title-gradient">
                  {ritual.name}
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {ritual.description}
                </p>
                <Link 
                  to={`/blog/${ritual.blogSlug}`}
                  className="inline-flex items-center cta-button text-white px-6 py-3 rounded-full font-medium"
                >
                  Learn More
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </article>
            ))}
          </div>

          <div className="glass-card p-8 rounded-2xl text-center">
            <h2 className="text-3xl font-bold mb-4 title-gradient">
              Personalize Your Ceremony
            </h2>
            <p className="text-gray-600 mb-6 text-lg max-w-2xl mx-auto">
              Every Hindu wedding is unique. Let our AI guide help you understand which rituals are 
              meaningful for your family traditions and create a personalized ceremony timeline.
            </p>
            <Link 
              to="/dashboard/chat"
              className="cta-button text-white px-8 py-4 rounded-full font-semibold text-lg"
            >
              Chat with AI Guide
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RitualGuidePage;
