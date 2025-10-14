import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Bot, Calendar, Users, PieChart, Palette, CheckSquare, MessageCircle, Star } from 'lucide-react';

const FeaturesPage = () => {
  const features = [
    {
      icon: <Bot className="h-8 w-8" />,
      title: 'AI-Powered Planning',
      description: 'Our advanced AI analyzes your preferences, budget, and cultural requirements to create personalized wedding plans tailored to your unique story.',
      benefits: ['Custom ritual sequences', 'Vendor recommendations', 'Timeline optimization', 'Budget allocation']
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: 'Timeline Creator',
      description: 'Create detailed timelines for your wedding events, from pre-wedding ceremonies to the main celebration, ensuring nothing is missed.',
      benefits: ['Multi-event planning', 'Auspicious date selection', 'Milestone tracking', 'Automated reminders']
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Guest Management',
      description: 'Effortlessly manage your guest list, track RSVPs, and organize seating arrangements with our intelligent guest management system.',
      benefits: ['RSVP tracking', 'Dietary preferences', 'Plus-one management', 'Digital invitations']
    },
    {
      icon: <PieChart className="h-8 w-8" />,
      title: 'Budget Tracker',
      description: 'Keep your wedding expenses under control with real-time budget tracking, vendor payment schedules, and cost optimization suggestions.',
      benefits: ['Expense categorization', 'Payment reminders', 'Cost comparisons', 'Savings recommendations']
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: 'Mood Board Creator',
      description: 'Visualize your dream wedding with our mood board creator, featuring color palettes, décor ideas, and inspiration galleries.',
      benefits: ['Color coordination', 'Theme visualization', 'Vendor portfolios', 'Style matching']
    },
    {
      icon: <CheckSquare className="h-8 w-8" />,
      title: 'Task Management',
      description: 'Stay organized with our comprehensive task management system that breaks down your wedding planning into manageable steps.',
      benefits: ['Priority scheduling', 'Progress tracking', 'Team collaboration', 'Deadline management']
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: 'AI Wedding Assistant',
      description: '24/7 AI assistant ready to answer questions about Hindu wedding traditions, vendor suggestions, and planning advice.',
      benefits: ['Instant responses', 'Cultural guidance', 'Tradition explanations', 'Planning tips']
    },
    {
      icon: <Star className="h-8 w-8" />,
      title: 'Ritual Guide',
      description: 'Complete guide to Hindu wedding rituals with step-by-step instructions, significance explanations, and customization options.',
      benefits: ['Tradition preservation', 'Modern adaptations', 'Regional variations', 'Family involvement']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need for Your <span className="text-wedding-red">Perfect Wedding</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Sanskara AI combines traditional wisdom with modern technology to make your Hindu wedding planning 
              seamless, meaningful, and stress-free.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-wedding-red/10 rounded-full text-wedding-red">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-gray-700 mb-6">{feature.description}</p>
                <div className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-wedding-gold rounded-full"></div>
                      <span className="text-sm text-gray-600">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-wedding-red to-wedding-gold rounded-xl text-white p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Planning?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of couples who have successfully planned their dream wedding with Sanskara AI
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/auth?mode=signup" 
                className="bg-white text-wedding-red px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Get Started Free
              </a>
              <a 
                href="/chat" 
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-wedding-red transition-colors"
              >
                Try AI Assistant
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FeaturesPage;
