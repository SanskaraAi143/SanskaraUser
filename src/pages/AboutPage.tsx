import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Sparkles, Users, TrendingUp, Shield, Heart, Brain, Globe, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthActionButton from '@/components/auth/AuthActionButton';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-wedding-cream via-white to-wedding-cream/80">
      <Helmet>
        <title>About Sanskara AI - Revolutionizing Hindu Wedding Planning</title>
        <meta name="description" content="Born from ancient wisdom, powered by AI. Sanskara AI transforms Hindu wedding planning with luxury service standards and spiritual authenticity for modern couples." />
        <link rel="canonical" href="https://sanskaraai.com/about" />
        <meta property="og:title" content="About Sanskara AI - Luxury Hindu Wedding Planning" />
        <meta property="og:description" content="Born from ancient wisdom, powered by AI. Sanskara AI transforms Hindu wedding planning with luxury service standards and spiritual authenticity." />
        <meta property="og:image" content="https://sanskaraai.com/logo.jpeg" />
        <meta property="og:url" content="https://sanskaraai.com/about" />
      </Helmet>

      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-wedding-gold/10 to-wedding-secondaryGold/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">              <div className="inline-flex items-center px-4 py-2 bg-wedding-cream rounded-full text-wedding-gold font-medium mb-6">
                <Sparkles className="h-4 w-4 mr-2" />
                Pioneering the Future of Wedding Planning
              </div>
              <h1 className="text-5xl md:text-7xl font-playfair font-bold leading-tight mb-8">
                Where Ancient <span className="title-gradient">Wisdom</span><br/>
                Meets Modern <span className="title-gradient">Intelligence</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed">
                We're not just disrupting wedding planning—we're honoring 5,000 years of sacred traditions
                while leveraging cutting-edge AI to create experiences that are both spiritually authentic
                and effortlessly luxurious.
              </p>
            </div>

            {/* Metrics Row */}            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              <div className="text-center">
                <div className="text-4xl font-bold text-wedding-gold mb-2">500+</div>
                <div className="text-yellow-800 font-medium">Couples Served</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-wedding-secondaryGold mb-2">75%</div>
                <div className="text-yellow-800 font-medium">Time Reduction</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-wedding-red mb-2">₹2L+</div>
                <div className="text-yellow-800 font-medium">Avg. Savings</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-wedding-orange mb-2">98%</div>
                <div className="text-yellow-800 font-medium">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-8 text-gray-900">
              Our Sacred Mission
            </h2>
            <div className="text-xl leading-relaxed text-gray-700 space-y-6">
              <p>
                In an era where efficiency often comes at the expense of meaning, Sanskara AI stands as a bridge
                between the profound wisdom of Hindu traditions and the precision of artificial intelligence.
              </p>
              <p className="text-2xl font-medium text-wedding-gold italic">
                "We believe that your wedding should honor your ancestors while celebrating your future—
                seamlessly, authentically, and with unprecedented luxury."
              </p>
              <p>
                Every ritual, every tradition, every sacred moment is preserved in its full spiritual significance
                while being enhanced by intelligent technology that anticipates your needs, connects you with
                the finest vendors, and ensures that your celebration is nothing short of extraordinary.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem We Solve */}
      <section className="py-20 bg-gradient-to-br from-wedding-cream to-wedding-gold/20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-8 text-gray-900">
                The $50B Problem We're Solving
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                The Indian wedding industry is massive, but planning remains fragmented, stressful,
                and disconnected from cultural authenticity.
              </p>
            </div>
              <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="glass-card p-6 rounded-xl shadow-lg border-l-4 border-wedding-red">
                  <h3 className="font-bold text-xl text-wedding-red mb-3">The Traditional Way</h3>
                  <ul className="space-y-2 text-yellow-800">
                    <li>• 12+ months of chaotic planning</li>
                    <li>• 50+ vendor decisions without guidance</li>
                    <li>• Cultural authenticity compromised for convenience</li>
                    <li>• Budget overruns of 40-60%</li>
                    <li>• Overwhelming stress, lost joy</li>
                  </ul>
                </div>

                <div className="glass-card p-6 rounded-xl shadow-lg border-l-4 border-wedding-secondaryGold">
                  <h3 className="font-bold text-xl text-wedding-secondaryGold mb-3">The Sanskara AI Way</h3>                  <ul className="space-y-2 text-yellow-800">
                    <li>• 3-month streamlined planning</li>
                    <li>• AI-curated vendor recommendations</li>
                    <li>• Cultural traditions enhanced, not compromised</li>
                    <li>• 20-30% cost savings through optimization</li>
                    <li>• Joyful, stress-free experience</li>
                  </ul>
                </div>
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-wedding-cream to-wedding-gold/20 rounded-2xl p-8">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-2xl font-bold text-yellow-800 mb-4">Market Opportunity</h3>
                    <div className="space-y-3 text-yellow-800">
                      <div className="flex justify-between">
                        <span>Indian Wedding Market:</span>
                        <span className="font-bold">$50B annually</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Wedding Cost:</span>
                        <span className="font-bold">₹12-15 lakhs</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Planning Time Saved:</span>
                        <span className="font-bold">9+ months</span>
                      </div>
                      <div className="flex justify-between">
                        <span>TAM Growth Rate:</span>
                        <span className="font-bold">25% YoY</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-8 text-gray-900">
                Luxury Meets Authenticity
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                Our approach combines the precision of enterprise-grade AI with the soul of authentic Hindu traditions.
              </p>
            </div>
              <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center glass-card p-8 rounded-xl">
                <div className="inline-flex items-center justify-center p-4 bg-wedding-gold/20 rounded-full mb-6">
                  <Brain className="h-8 w-8 text-wedding-orange" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">AI-Powered Intelligence</h3>
                <p className="text-gray-700 leading-relaxed">
                  Machine learning algorithms trained on thousands of successful Hindu weddings,
                  understanding cultural nuances and modern preferences.
                </p>
              </div>

              <div className="text-center glass-card p-8 rounded-xl">
                <div className="inline-flex items-center justify-center p-4 bg-wedding-secondaryGold/20 rounded-full mb-6">
                  <Heart className="h-8 w-8 text-wedding-red" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Cultural Authenticity</h3>
                <p className="text-gray-700 leading-relaxed">
                  Deep respect for sacred traditions, with expert guidance on rituals,
                  ensuring spiritual significance is preserved and celebrated.
                </p>
              </div>

              <div className="text-center glass-card p-8 rounded-xl">
                <div className="inline-flex items-center justify-center p-4 bg-wedding-gold/20 rounded-full mb-6">
                  <Shield className="h-8 w-8 text-wedding-secondaryGold" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Luxury Service Standards</h3>
                <p className="text-gray-700 leading-relaxed">
                  White-glove experience with personalized attention, premium vendor networks,
                  and concierge-level service throughout your journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>      {/* Traction & Growth */}
      <section className="py-20 bg-gradient-to-br from-wedding-cream to-wedding-gold/10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-8 text-gray-900">
                Proven Traction & Explosive Growth
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                Real metrics from real couples who chose intelligence over chaos.
              </p>
            </div>
              <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="glass-card p-6 rounded-xl shadow-lg border-l-4 border-wedding-gold">
                  <div className="flex items-center mb-4">
                    <TrendingUp className="h-6 w-6 text-wedding-gold mr-3" />
                    <h3 className="text-xl font-bold text-gray-900">Growth Metrics</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Active Users:</span>
                      <span className="font-bold text-wedding-red">+150% MoM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">User Retention (3m):</span>
                      <span className="font-bold text-wedding-secondaryGold">89%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">NPS Score:</span>
                      <span className="font-bold text-wedding-orange">78</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenue Growth:</span>
                      <span className="font-bold text-wedding-gold">+300% YoY</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6 rounded-xl shadow-lg border-l-4 border-wedding-red">
                  <div className="flex items-center mb-4">
                    <Users className="h-6 w-6 text-wedding-red mr-3" />
                    <h3 className="text-xl font-bold text-gray-900">User Impact</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Planning Time Reduced:</span>
                      <span className="font-bold text-wedding-red">75% average</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Budget Optimization:</span>
                      <span className="font-bold text-wedding-secondaryGold">₹2.3L saved</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vendor Satisfaction:</span>
                      <span className="font-bold text-wedding-orange">4.8/5 stars</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cultural Authenticity:</span>
                      <span className="font-bold text-wedding-gold">96% preserved</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-wedding-cream to-wedding-gold/20 rounded-xl p-8 border border-wedding-gold/30">
                <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">Market Validation</h3>
                <div className="space-y-6">
                  <blockquote className="italic text-gray-700 text-center">
                    "Sanskara AI saved us 8 months of planning and ₹3 lakhs. The cultural guidance was invaluable."
                  </blockquote>
                  <div className="text-center text-sm text-gray-600">— Priya & Arjun, Mumbai</div>

                  <blockquote className="italic text-gray-700 text-center">
                    "Finally, technology that respects our traditions while making everything effortless."
                  </blockquote>
                  <div className="text-center text-sm text-gray-600">— Sneha & Vikram, Bangalore</div>
                    <div className="bg-white p-4 rounded-lg text-center border border-wedding-gold/30">
                    <div className="text-3xl font-bold text-wedding-red mb-2">4.9/5</div>
                    <div className="text-gray-600">Average Rating</div>
                    <div className="text-sm text-gray-500 mt-1">From 500+ couples</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Future */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-8 text-gray-900">
              Our Vision for the Future
            </h2>
            <div className="text-xl leading-relaxed text-gray-700 space-y-6 mb-12">
              <p>
                We envision a world where every Hindu wedding seamlessly honors ancient traditions
                while embracing the convenience and precision of modern technology.
              </p>              <p className="text-2xl font-medium text-wedding-red">
                Our goal: To become the global standard for culturally authentic,
                AI-powered wedding planning.
              </p>
            </div>
              <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="p-6 bg-gradient-to-br from-wedding-cream to-wedding-gold/20 rounded-xl border border-wedding-gold/30">
                <Globe className="h-12 w-12 text-wedding-orange mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3">Global Expansion</h3>
                <p className="text-gray-700">Serving Hindu couples worldwide with local expertise</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-wedding-cream to-wedding-secondaryGold/20 rounded-xl border border-wedding-secondaryGold/30">
                <Brain className="h-12 w-12 text-wedding-secondaryGold mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3">AI Innovation</h3>
                <p className="text-gray-700">Next-generation intelligence for hyper-personalization</p>
              </div>

              <div className="p-6 bg-gradient-to-br from-wedding-cream to-wedding-red/20 rounded-xl border border-wedding-red/30">
                <Heart className="h-12 w-12 text-wedding-red mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3">Cultural Preservation</h3>
                <p className="text-gray-700">Digitizing and preserving traditions for future generations</p>
              </div></div>

            <AuthActionButton
              navigateTo="/dashboard"
              className="cta-button text-lg px-8 py-4"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Experience the Future Today
            </AuthActionButton>
          </div>
        </div>
      </section>      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-br from-wedding-cream to-wedding-gold/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-8 text-gray-900">
              Ready to Transform Your Wedding?
            </h2>
            <p className="text-xl text-gray-700 mb-8">
              Join thousands of couples who chose intelligence over chaos for their perfect day.
            </p>
              <div className="glass-card rounded-xl shadow-lg p-8 mb-8 border border-wedding-gold/30">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="text-left">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Get in Touch</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-wedding-red mr-3" />
                      <a href="mailto:admin@sanskaraai.com" className="text-wedding-red hover:underline">
                        admin@sanskaraai.com
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-wedding-red mr-3" />
                      <a href="tel:+918639468919" className="text-wedding-red hover:underline">
                        +91 8639468919
                      </a>
                    </div>
                  </div>
                </div>

                <div className="text-left">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Business Hours</h3>
                  <div className="space-y-2 text-gray-600">
                    <p>Monday - Friday: 9:00 AM - 8:00 PM IST</p>
                    <p>Saturday - Sunday: 10:00 AM - 6:00 PM IST</p>
                    <p className="text-sm text-wedding-gold">AI Assistant available 24/7</p>
                  </div>
                </div>
              </div>
            </div>

            <AuthActionButton
              navigateTo="/dashboard"
              className="cta-button text-lg px-8 py-4"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Start Planning Your Dream Wedding
            </AuthActionButton>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
