
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, Crown, HelpCircle } from 'lucide-react';

const tiers = [
  {
    name: "Free",
    price: "₹0",
    description: "Get started with basic Hindu wedding planning",
    features: [
      "Basic AI chat assistance",
      "Essential Hindu ritual guides",
      "Limited vendor recommendations",
      "Basic to-do list",
      "Up to 3 saved items"
    ],
    buttonText: "Start Free",
    buttonVariant: "outline",
    mostPopular: false
  },
  {
    name: "Premium",
    price: "₹999",
    period: "/month",
    description: "Complete planning for your perfect Hindu wedding",
    features: [
      "Advanced AI wedding assistant",
      "Detailed ritual consultation",
      "Unlimited vendor recommendations",
      "Custom wedding timeline",
      "Personalized to-do lists",
      "Unlimited mood boards",
      "Priority support"
    ],
    buttonText: "Get Premium",
    buttonVariant: "default",
    mostPopular: true
  },
  {
    name: "One-time",
    price: "₹4,999",
    description: "Pay once for your entire wedding planning journey",
    features: [
      "Everything in Premium",
      "One-time payment (valid for 1 year)",
      "Downloadable wedding guides",
      "Video consultations with real planners",
      "Vendor negotiation assistance",
      "Invitation design templates"
    ],
    buttonText: "Choose Plan",
    buttonVariant: "outline",
    mostPopular: false
  },
];

const Pricing = () => {
  return (
    <section id="pricing" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-wedding-maroon mb-4">
            Choose Your Perfect Plan
          </h2>
          <p className="text-gray-700 text-lg">
            Select the plan that best suits your needs and begin your journey toward a beautiful Hindu wedding.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier, index) => (
            <div 
              key={tier.name}
              className={`bg-white border rounded-xl shadow-sm overflow-hidden transition-transform hover:scale-105 ${
                tier.mostPopular 
                  ? "border-wedding-red relative transform scale-105 md:scale-110 z-10 shadow-lg" 
                  : "border-gray-200"
              } animate-scale-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {tier.mostPopular && (
                <div className="bg-wedding-red text-white py-1 text-center text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="p-6">
                <div className="mb-4">
                  {tier.mostPopular ? (
                    <Crown className="h-8 w-8 text-wedding-red mb-2" />
                  ) : null}
                  <h3 className="text-xl font-playfair font-semibold text-wedding-maroon">
                    {tier.name}
                  </h3>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-semibold text-wedding-maroon">
                      {tier.price}
                    </span>
                    {tier.period && (
                      <span className="ml-1 text-gray-500">{tier.period}</span>
                    )}
                  </div>
                  <p className="text-gray-600 mt-2">{tier.description}</p>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-5 w-5 text-wedding-red shrink-0 mr-2" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${
                    tier.buttonVariant === "default" 
                      ? "bg-wedding-red hover:bg-wedding-deepred text-white" 
                      : "border-wedding-red text-wedding-red hover:bg-wedding-red/10"
                  }`}
                  variant={tier.buttonVariant === "default" ? "default" : "outline"}
                >
                  {tier.buttonText}
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-gray-600 hover:text-wedding-red transition-colors cursor-pointer">
            <HelpCircle size={18} />
            <span>Have questions about our plans?</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
