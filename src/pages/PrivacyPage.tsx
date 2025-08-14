import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Privacy Policy - Sanskara AI</title>
        <meta name="description" content="Privacy Policy for Sanskara AI - Your AI-powered Hindu wedding planning assistant." />
        <link rel="canonical" href="https://sanskaraai.com/privacy" />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12 pt-20 md:pt-24 lg:pt-28">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 ">
            Privacy Policy
          </h1>
          
          <div className="prose prose-lg max-w-none space-y-8">
            <div className=" p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4 ">Information We Collect</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                At Sanskara AI, we collect information you provide directly to us, such as when you create an account, 
                plan your wedding, or contact us for support. This includes your name, email address, phone number, 
                wedding details, and preferences.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We also automatically collect certain information about your device and how you interact with our 
                services, including IP address, browser type, pages visited, and usage patterns.
              </p>
            </div>

            <div className=" p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4 ">How We Use Your Information</h2>
              <ul className="text-gray-700 leading-relaxed space-y-2">
                <li>• Provide personalized wedding planning recommendations</li>
                <li>• Connect you with relevant vendors and services</li>
                <li>• Send important updates about your wedding plans</li>
                <li>• Improve our AI algorithms and user experience</li>
                <li>• Provide customer support</li>
              </ul>
            </div>

            <div className=" p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4 ">Data Security</h2>
              <p className="text-gray-700 leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction. Your data is encrypted in transit 
                and at rest using industry-standard protocols.
              </p>
            </div>

            <div className=" p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4 ">Your Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You have the right to access, update, or delete your personal information. You can also opt out of 
                marketing communications at any time.
              </p>              <p className="text-gray-700 leading-relaxed">
                For any privacy-related questions or requests, please contact us at{' '}
                <a href="mailto:admin@sanskaraai.com" className="text-orange-600 hover:text-orange-700">
                  admin@sanskaraai.com
                </a>{' '}
                or call us at{' '}
                <a href="tel:+918639468919" className="text-orange-600 hover:text-orange-700">
                  +91 8639468919
                </a>
              </p>
            </div>

            <div className=" p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4 ">Updates to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes 
                by posting the new policy on this page and updating the "Last Updated" date.
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

export default PrivacyPage;
