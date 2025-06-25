import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowRight, Check, Star, Users } from 'lucide-react';

const GetStartedPage = () => {
  const steps = [
    {
      step: 1,
      title: 'Create Your Account',
      description: 'Sign up for free and tell us about your wedding vision, culture, and preferences.',
      action: 'Get started in 2 minutes'
    },
    {
      step: 2,
      title: 'AI Assessment',
      description: 'Our AI analyzes your requirements and creates a personalized wedding planning roadmap.',
      action: 'Intelligent matching'
    },
    {
      step: 3,
      title: 'Start Planning',
      description: 'Access your custom dashboard with timelines, budgets, vendors, and AI assistant.',
      action: 'Begin your journey'
    }
  ];

  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: 'forever',
      features: [
        'Basic wedding timeline',
        'Guest list up to 50',
        'Budget tracker',
        'Ritual guide access',
        'Community support'
      ],
      cta: 'Start Free',
      popular: false
    },
    {
      name: 'Premium',
      price: '₹2,999',
      period: 'one-time',
      features: [
        'Everything in Free',
        'Unlimited guests',
        'AI vendor matching',
        'Priority support',
        'Custom invitations',
        'Advanced analytics'
      ],
      cta: 'Go Premium',
      popular: true
    },
    {
      name: 'Luxury',
      price: '₹9,999',
      period: 'one-time',
      features: [
        'Everything in Premium',
        'Dedicated wedding coordinator',
        'White-glove planning service',
        'Custom ritual creation',
        'Professional consultation',
        'VIP vendor network'
      ],
      cta: 'Contact Us',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Your Dream Wedding Starts <span className="text-wedding-red">Here</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Join 500+ couples who have successfully planned their Hindu wedding with Sanskara AI. 
              Save 9+ months of planning time and ₹2+ lakhs in costs.
            </p>
            <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-wedding-gold fill-current" />
                <span>4.9/5 rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-wedding-red" />
                <span>500+ happy couples</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                <span>Free to start</span>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-wedding-red text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 mb-4">{step.description}</p>
                  <span className="text-sm text-wedding-red font-semibold">{step.action}</span>
                  {index < steps.length - 1 && (
                    <ArrowRight className="h-6 w-6 text-gray-400 mx-auto mt-8 hidden md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Plans */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Choose Your Plan</h2>
            <p className="text-center text-gray-600 mb-12">Start free, upgrade when you need more features</p>
            
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <div key={index} className={`bg-white rounded-xl shadow-lg p-8 relative ${plan.popular ? 'ring-2 ring-wedding-red' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-wedding-red text-white px-4 py-2 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold text-wedding-red">
                      {plan.price}
                      <span className="text-sm text-gray-600 font-normal">/{plan.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a 
                    href={plan.name === 'Luxury' ? '/contact' : '/auth?mode=signup'}
                    className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors ${
                      plan.popular 
                        ? 'bg-wedding-red text-white hover:bg-wedding-red/90' 
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.cta}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-wedding-red to-wedding-gold rounded-xl text-white p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Plan Your Dream Wedding?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join hundreds of couples who saved months of time and thousands of rupees with Sanskara AI
            </p>
            <a 
              href="/auth?mode=signup" 
              className="inline-flex items-center gap-2 bg-white text-wedding-red px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg"
            >
              Start Planning Now - It's Free
              <ArrowRight className="h-5 w-5" />
            </a>
            <p className="text-sm mt-4 opacity-75">No credit card required • Setup in 2 minutes</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GetStartedPage;
