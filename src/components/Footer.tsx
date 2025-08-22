import React from 'react';
import { Github, Twitter, Instagram, Mail, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative overflow-hidden">
      <div className="gradient-bg opacity-30"></div>
      <div className="glass-card border-t border-wedding-gold/20">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 flex items-center justify-center bg-gradient-primary rounded-full shadow-lg">
                  <img
                    src="/logo.jpeg"
                    alt="Sanskara AI Logo"
                    className="h-10 w-10 object-contain rounded-full"
                  />
                </div>
                <span className="text-2xl font-playfair font-semibold title-gradient">
                  Sanskara<span className="font-bold">AI</span>
                </span>
              </div>              <p className="max-w-md text-lg" style={{color: '#374151'}}>
                Your AI-powered guide to planning a beautiful, authentic Hindu wedding that honors
                traditions while reflecting your unique love story.
              </p>
              <div className="flex gap-4 mt-8">
                <a
                  href="https://www.linkedin.com/company/sanskaraai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-primary text-white shadow-lg transform hover:scale-110 transition-transform duration-300"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
                <a
                  href="https://www.instagram.com/sanskaraai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-primary text-white shadow-lg transform hover:scale-110 transition-transform duration-300"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a
                  href="mailto:admin@sanskaraai.com"
                  aria-label="Email Admin"
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-primary text-white shadow-lg transform hover:scale-110 transition-transform duration-300"
                >
                  <Mail size={20} />
                </a>
                <a
                  href="https://vendors.sanskaraai.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Vendors GitHub"
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-gradient-primary text-white shadow-lg transform hover:scale-110 transition-transform duration-300"
                >
                  <Github size={20} />
                </a>
              </div>
            </div>            <div>
              <h3 className="text-lg font-playfair font-bold title-gradient mb-4">Company</h3>
              <ul className="space-y-3">
                <li><a href="/about" className="nav-link">About Us</a></li>
                <li><a href="/careers" className="nav-link">Careers</a></li>
                <li><a href="/contact" className="nav-link">Contact</a></li>
                <li><a href="/blog" className="nav-link">Blog</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-playfair font-bold title-gradient mb-4">Resources</h3>
              <ul className="space-y-3">
                <li><a href="/blog" className="nav-link">Wedding Guides</a></li>
                <li><a href="/dashboard/vendors" className="nav-link">Vendor Directory</a></li>
                <li><a href="/faq" className="nav-link">FAQs</a></li>
                <li><a href="mailto:admin@sanskaraai.com" className="nav-link">Support</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-wedding-gold/10 flex flex-col md:flex-row justify-between items-center gap-6">            <p className="text-sm" style={{color: '#374151'}}>
              © {new Date().getFullYear()} SanskaraAI. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="/privacy" className="nav-link text-sm">Privacy Policy</a>
              <a href="/terms" className="nav-link text-sm">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
