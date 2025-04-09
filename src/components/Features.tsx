
import React from 'react';
import { MessageSquare, BookOpen, Users, Bookmark, Palette, Calendar, FileCheck, Star } from 'lucide-react';

const features = [
  {
    icon: <MessageSquare size={24} className="text-wedding-red" />,
    title: "AI Wedding Assistant",
    description: "Get instant guidance about rituals, customs, and planning steps from our intelligent AI assistant."
  },
  {
    icon: <BookOpen size={24} className="text-wedding-red" />,
    title: "Ritual Knowledge",
    description: "Learn about Hindu wedding rituals, their meaning, and how to incorporate them into your ceremony."
  },
  {
    icon: <Users size={24} className="text-wedding-red" />,
    title: "Vendor Recommendations",
    description: "Discover and connect with vendors who specialize in Hindu weddings in your area."
  },
  {
    icon: <Bookmark size={24} className="text-wedding-red" />,
    title: "Task Tracking",
    description: "Stay organized with a customized to-do list based on your wedding timeline and traditions."
  },
  {
    icon: <Palette size={24} className="text-wedding-red" />,
    title: "Mood Boards",
    description: "Create visual inspiration boards for colors, decorations, and outfits for your special day."
  },
  {
    icon: <Calendar size={24} className="text-wedding-red" />,
    title: "Timeline Creation",
    description: "Generate a personalized wedding timeline integrating all important rituals and events."
  },
  {
    icon: <FileCheck size={24} className="text-wedding-red" />,
    title: "Budget Management",
    description: "Track expenses and manage your budget with ceremony-specific recommendations."
  },
  {
    icon: <Star size={24} className="text-wedding-red" />,
    title: "Ceremony Customization",
    description: "Get suggestions on how to personalize traditions while respecting cultural significance."
  }
];

const Features = () => {
  return (
    <section id="features" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-wedding-maroon mb-4">
            Plan Every Sacred Moment
          </h2>
          <p className="text-gray-700 text-lg mb-16">
            Sanskara AI combines cultural knowledge with modern planning tools to help you create
            a wedding that honors traditions while reflecting your personal style.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="h-12 w-12 rounded-full bg-wedding-red/10 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-playfair font-semibold text-wedding-maroon mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
