
import React from 'react';
import { Github, Twitter, Instagram, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-wedding-maroon text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-wedding-red font-playfair text-xl font-bold">S</span>
              </div>
              <h2 className="text-2xl font-playfair font-semibold">
                Sanskara<span className="text-wedding-orange">AI</span>
              </h2>
            </div>
            <p className="text-white/80 max-w-md">
              Your AI-powered guide to planning a beautiful, authentic Hindu wedding that honors
              traditions while reflecting your unique love story.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-white/80 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-white/80 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-white/80 hover:text-white transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-white/80 hover:text-white transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Features</h3>
            <ul className="space-y-2 text-white/80">
              <li><a href="#" className="hover:text-white transition-colors">AI Assistant</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Ritual Guide</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Vendor Directory</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Planning Tools</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Mood Boards</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2 text-white/80">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Our Team</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Testimonials</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-12 pt-8 text-center text-white/60">
          <p>© {new Date().getFullYear()} Sanskara AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
