
import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import ChatDemo from '@/components/ChatDemo';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <ChatDemo />
        
        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 md:py-24 bg-wedding-cream">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-playfair font-bold text-wedding-maroon mb-4">
                Couples Love Sanskara
              </h2>
              <p className="text-gray-700 text-lg">
                Hear from couples who planned their perfect Hindu wedding with Sanskara AI.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Priya & Arjun",
                  location: "New Jersey",
                  image: "https://images.unsplash.com/photo-1592055559446-1a8c265f95d0?w=400&auto=format&fit=crop",
                  quote: "Sanskara AI helped us blend traditional rituals with our modern style. Our families were impressed with how authentic our ceremony felt!"
                },
                {
                  name: "Ananya & Vikram",
                  location: "California",
                  image: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400&auto=format&fit=crop",
                  quote: "The vendor recommendations saved us so much time! We found an amazing pandit and decorator who understood exactly what we wanted."
                },
                {
                  name: "Meera & Raj",
                  location: "Texas",
                  image: "https://images.unsplash.com/photo-1620684937434-a5170f8b022f?w=400&auto=format&fit=crop",
                  quote: "As an interfaith couple, we weren't sure how to incorporate both traditions. Sanskara guided us through creating a meaningful ceremony everyone loved."
                }
              ].map((testimonial, index) => (
                <div 
                  key={index} 
                  className="bg-white p-6 rounded-xl shadow-md animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-full overflow-hidden">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-playfair font-semibold text-wedding-maroon">
                        {testimonial.name}
                      </h3>
                      <p className="text-gray-600 text-sm">{testimonial.location}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                </div>
              ))}
            </div>
            
            <div className="mt-16 text-center animate-fade-in">
              <a 
                href="#" 
                className="inline-flex items-center font-medium text-wedding-red hover:text-wedding-deepred"
              >
                Read more stories from our couples
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 md:py-20 bg-gradient-to-r from-wedding-red to-wedding-deepred text-white">
          <div className="container mx-auto px-4 text-center animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-6">
              Begin Your Wedding Journey Today
            </h2>
            <p className="text-white/90 text-lg max-w-2xl mx-auto mb-8">
              Start planning your perfect Hindu wedding with personalized guidance, 
              vendor recommendations, and cultural insights.
            </p>
            <button className="bg-white text-wedding-red hover:bg-wedding-cream transition-colors py-3 px-8 rounded-full text-lg font-medium">
              Get Started For Free
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
