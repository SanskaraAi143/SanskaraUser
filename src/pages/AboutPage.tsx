import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Sparkles, Users, TrendingUp, Shield, Heart, Brain, Globe, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuthActionButton from '@/components/auth/AuthActionButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AboutPage = () => {
  return (
    <div className="bg-background text-foreground">
      <Helmet>
        <title>About Sanskara AI - Revolutionizing Hindu Wedding Planning</title>
        <meta name="description" content="Born from ancient wisdom, powered by AI. Sanskara AI transforms Hindu wedding planning with luxury service standards and spiritual authenticity for modern couples." />
        <link rel="canonical" href="https://sanskaraai.com/about" />
      </Helmet>

      <Navbar />

      <main className="container mx-auto px-4 py-16 space-y-16">
        {/* Hero Section */}
        <section className="text-center">
          <h1 className="text-5xl md:text-7xl font-lora font-bold leading-tight mb-6">
            Where Ancient Wisdom<br />Meets Modern Intelligence
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto">
            We're honoring 5,000 years of sacred traditions while leveraging cutting-edge AI to create experiences that are both spiritually authentic and effortlessly luxurious.
          </p>
        </section>

        {/* Metrics Row */}
        <section>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center p-4 rounded-lg">
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <div className="text-muted-foreground font-medium">Couples Served</div>
              </div>
              <div className="text-center p-4 rounded-lg">
                <div className="text-4xl font-bold text-primary mb-2">75%</div>
                <div className="text-muted-foreground font-medium">Time Reduction</div>
              </div>
              <div className="text-center p-4 rounded-lg">
                <div className="text-4xl font-bold text-primary mb-2">₹2L+</div>
                <div className="text-muted-foreground font-medium">Avg. Savings</div>
              </div>
              <div className="text-center p-4 rounded-lg">
                <div className="text-4xl font-bold text-primary mb-2">98%</div>
                <div className="text-muted-foreground font-medium">Satisfaction</div>
              </div>
            </div>
        </section>

        {/* Mission Statement */}
        <Card>
          <CardHeader>
            <CardTitle className="text-4xl text-center">Our Sacred Mission</CardTitle>
          </CardHeader>
          <CardContent className="max-w-4xl mx-auto text-center">
            <p className="text-xl leading-relaxed text-muted-foreground space-y-6">
              In an era where efficiency often comes at the expense of meaning, Sanskara AI stands as a bridge between the profound wisdom of Hindu traditions and the precision of artificial intelligence.
            </p>
            <blockquote className="text-2xl font-medium text-primary italic my-6">
              "We believe that your wedding should honor your ancestors while celebrating your future—seamlessly, authentically, and with unprecedented luxury."
            </blockquote>
          </CardContent>
        </Card>

        {/* Our Approach */}
        <section>
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-lora font-bold mb-4">Luxury Meets Authenticity</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Our approach combines the precision of enterprise-grade AI with the soul of authentic Hindu traditions.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 rounded-lg">
                <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-6">
                  <Brain className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">AI-Powered Intelligence</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Machine learning algorithms trained on thousands of successful Hindu weddings.
                </p>
              </div>
              <div className="text-center p-8 rounded-lg">
                <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-6">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Cultural Authenticity</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Deep respect for sacred traditions, with expert guidance on rituals.
                </p>
              </div>
              <div className="text-center p-8 rounded-lg">
                <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-6">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Luxury Service Standards</h3>
                <p className="text-muted-foreground leading-relaxed">
                  A white-glove experience with personalized attention and premium vendor networks.
                </p>
              </div>
            </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
            <h2 className="text-3xl md:text-4xl font-lora font-bold mb-4">Ready to Transform Your Wedding?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of couples who chose intelligence over chaos for their perfect day.
            </p>
            <AuthActionButton navigateTo="/dashboard" className="text-lg px-8 py-4">
              <Sparkles className="mr-2 h-5 w-5" />
              Start Planning Your Dream Wedding
            </AuthActionButton>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
