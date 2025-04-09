
import React from 'react';
import { Button } from "@/components/ui/button";
import { BookOpen, MessageCircle, User } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white/90 backdrop-blur-sm fixed w-full top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 bg-wedding-red rounded-full flex items-center justify-center">
            <span className="text-white font-playfair text-xl font-bold">S</span>
          </div>
          <h1 className="text-2xl font-playfair font-semibold text-wedding-maroon">
            Sanskara<span className="text-wedding-red">AI</span>
          </h1>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="font-medium text-gray-700 hover:text-wedding-red transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="font-medium text-gray-700 hover:text-wedding-red transition-colors">
            How It Works
          </a>
          <a href="#testimonials" className="font-medium text-gray-700 hover:text-wedding-red transition-colors">
            Testimonials
          </a>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="hidden sm:flex">
            <User size={18} className="mr-2" />
            Sign In
          </Button>
          <Button className="bg-wedding-red hover:bg-wedding-deepred">
            <MessageCircle size={18} className="mr-2" />
            Start Planning
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
