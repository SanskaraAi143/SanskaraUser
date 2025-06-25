import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Cookie, Shield, Eye } from 'lucide-react';

const CookiePolicyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <Navbar />
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-wedding-gold/20 rounded-full mb-4">
              <Cookie className="h-8 w-8 text-wedding-red" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
            <p className="text-xl text-gray-600">
              Learn how we use cookies to enhance your wedding planning experience
            </p>
            <p className="text-sm text-gray-500 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <Cookie className="h-6 w-6 text-wedding-red" />
                What Are Cookies?
              </h2>
              <p className="text-gray-700 mb-4">
                Cookies are small text files stored on your device when you visit our website. They help us 
                provide you with a better, more personalized wedding planning experience.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Types of Cookies We Use</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border border-wedding-gold/20 rounded-lg p-4">
                  <h3 className="font-semibold text-wedding-red mb-2">Essential Cookies</h3>
                  <p className="text-gray-700 text-sm">
                    Required for the website to function properly. These enable core functionality like 
                    security, network management, and accessibility.
                  </p>
                </div>
                <div className="border border-wedding-gold/20 rounded-lg p-4">
                  <h3 className="font-semibold text-wedding-red mb-2">Analytics Cookies</h3>
                  <p className="text-gray-700 text-sm">
                    Help us understand how visitors interact with our website by collecting 
                    and reporting information anonymously.
                  </p>
                </div>
                <div className="border border-wedding-gold/20 rounded-lg p-4">
                  <h3 className="font-semibold text-wedding-red mb-2">Functional Cookies</h3>
                  <p className="text-gray-700 text-sm">
                    Enable enhanced functionality and personalization, such as remembering your 
                    preferences and settings.
                  </p>
                </div>
                <div className="border border-wedding-gold/20 rounded-lg p-4">
                  <h3 className="font-semibold text-wedding-red mb-2">Marketing Cookies</h3>
                  <p className="text-gray-700 text-sm">
                    Used to deliver personalized advertisements and track the effectiveness 
                    of our marketing campaigns.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <Shield className="h-6 w-6 text-wedding-red" />
                Managing Your Cookie Preferences
              </h2>
              <div className="bg-wedding-gold/10 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  You have full control over your cookie preferences. You can:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>• Accept or reject non-essential cookies when you first visit our site</li>
                  <li>• Change your preferences at any time through your browser settings</li>
                  <li>• Delete existing cookies from your device</li>
                  <li>• Set your browser to refuse all cookies (may affect functionality)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
              <p className="text-gray-700 mb-4">
                Some cookies are placed by third-party services that appear on our pages. We use:
              </p>
              <div className="space-y-3">
                <div className="border-l-4 border-wedding-red pl-4">
                  <h3 className="font-semibold text-gray-900">Google Analytics</h3>
                  <p className="text-gray-600 text-sm">To analyze website traffic and user behavior</p>
                </div>
                <div className="border-l-4 border-wedding-red pl-4">
                  <h3 className="font-semibold text-gray-900">Social Media Platforms</h3>
                  <p className="text-gray-600 text-sm">For social sharing functionality</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <Eye className="h-6 w-6 text-wedding-red" />
                Your Rights
              </h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <p className="text-green-800 mb-4">
                  Under GDPR and other privacy regulations, you have the right to:
                </p>
                <ul className="space-y-2 text-green-700">
                  <li>• Know what cookies are being used</li>
                  <li>• Consent to or refuse non-essential cookies</li>
                  <li>• Withdraw your consent at any time</li>
                  <li>• Access information about how your data is used</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <div className="bg-wedding-gold/10 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  If you have any questions about our Cookie Policy, please contact us:
                </p>
                <div className="space-y-2">
                  <p><strong>Email:</strong> <a href="mailto:admin@sanskaraai.com" className="text-wedding-red hover:underline">admin@sanskaraai.com</a></p>
                  <p><strong>Phone:</strong> <a href="tel:+918639468919" className="text-wedding-red hover:underline">+91 86394 68919</a></p>
                </div>
              </div>
            </section>

            <section className="border-t pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Updates to This Policy</h2>
              <p className="text-gray-700">
                We may update this Cookie Policy from time to time. We will notify you of any material 
                changes by posting the new policy on this page and updating the "Last updated" date above.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CookiePolicyPage;
