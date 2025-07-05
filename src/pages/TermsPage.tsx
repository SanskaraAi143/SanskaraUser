import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Terms of Service - Sanskara AI</title>
        <meta name="description" content="Terms of Service for Sanskara AI - Your AI-powered Hindu wedding planning assistant." />
        <link rel="canonical" href="https://sanskaraai.com/terms" />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12 pt-20 md:pt-24 lg:pt-28">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 title-gradient">
            Terms of Service
          </h1>
          
          <div className="prose prose-lg max-w-none space-y-8">
            <div className="glass-card p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4 title-gradient">Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using Sanskara AI's services, you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4 title-gradient">Use License</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Permission is granted to temporarily use Sanskara AI's services for personal, non-commercial 
                wedding planning purposes. This is the grant of a license, not a transfer of title, and under this license you may:
              </p>
              <ul className="text-gray-700 leading-relaxed space-y-2">
                <li>• Use our AI-powered wedding planning tools for your personal wedding</li>
                <li>• Access vendor recommendations and planning resources</li>
                <li>• Create and manage your wedding timeline and budget</li>
                <li>• Share appropriate content with family and friends</li>
              </ul>
            </div>

            <div className="glass-card p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4 title-gradient">Service Availability</h2>
              <p className="text-gray-700 leading-relaxed">
                While we strive to provide continuous service availability, Sanskara AI may experience temporary 
                interruptions due to maintenance, updates, or technical issues. We do not guarantee uninterrupted 
                access to our services.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4 title-gradient">Vendor Relationships</h2>
              <p className="text-gray-700 leading-relaxed">
                Sanskara AI provides recommendations for wedding vendors and services. We are not responsible for 
                the quality, performance, or actions of third-party vendors. All contracts and agreements with 
                vendors are between you and the vendor directly.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4 title-gradient">Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                In no event shall Sanskara AI or its suppliers be liable for any damages (including, without limitation, 
                damages for loss of data or profit, or due to business interruption) arising out of the use or inability 
                to use the materials on Sanskara AI's website.
              </p>
            </div>

            <div className="glass-card p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4 title-gradient">Contact Information</h2>              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at{' '}
                <a href="mailto:admin@sanskaraai.com" className="text-orange-600 hover:text-orange-700">
                  admin@sanskaraai.com
                </a>{' '}
                or call us at{' '}
                <a href="tel:+918639468919" className="text-orange-600 hover:text-orange-700">
                  +91 8639468919
                </a>
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Last Updated: June 24, 2025
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TermsPage;
