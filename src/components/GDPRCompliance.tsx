import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { X, Shield, Cookie, Eye } from 'lucide-react';

const GDPRCompliance = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('gdpr-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('gdpr-consent', JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem('gdpr-consent', JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  const handleCustomize = () => {
    setShowPreferences(true);
  };

  if (!showBanner) return null;

  return (
    <>      {/* GDPR Banner */}
      <div className="fixed bottom-0 left-0 right-0  border-t-2 border-wedding-gold shadow-2xl z-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-wedding-gold/20 rounded-full flex-shrink-0">
              <Cookie className="h-5 w-5 text-wedding-gold" />
            </div>
            <div className="flex-1">              <h3 className="font-bold text-yellow-800 mb-2 ">Your Privacy Matters to Us</h3>
              <p className="text-yellow-700 text-sm mb-4">
                We use cookies and similar technologies to enhance your experience, analyze site traffic, 
                and personalize content. By clicking "Accept All", you consent to our use of cookies. 
                You can customize your preferences or learn more in our{' '}
                <a href="/privacy" className="text-wedding-gold hover:underline">Privacy Policy</a>.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={handleAcceptAll}
                  className="bg-wedding-gold hover:bg-wedding-secondaryGold text-white"
                >
                  Accept All
                </Button>
                <Button 
                  onClick={handleRejectAll}
                  variant="outline"
                  className="border-wedding-gold text-wedding-gold hover:bg-wedding-gold/10"
                >
                  Reject All
                </Button>
                <Button 
                  onClick={handleCustomize}
                  variant="ghost"
                  className="text-wedding-gold hover:bg-wedding-gold/10"
                >
                  Customize
                </Button>
              </div>
            </div>            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowBanner(false)}
              className="flex-shrink-0"
              aria-label="Close privacy banner"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className=" rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-wedding-gold/20">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-wedding-gold">Privacy Preferences</h2>                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPreferences(false)}
                  className="text-wedding-gold hover:bg-wedding-gold/10"
                  aria-label="Close privacy preferences"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="border border-wedding-gold/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-wedding-gold">Necessary Cookies</h3>
                  <span className="bg-wedding-gold/20 text-wedding-gold px-2 py-1 rounded text-xs">Always Active</span>
                </div>
                <p className="text-gray-600 text-sm">
                  Essential for the website to function properly. These cannot be disabled.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Analytics Cookies</h3>
                  <input type="checkbox" className="toggle" defaultChecked />
                </div>
                <p className="text-gray-600 text-sm">
                  Help us understand how visitors interact with our website to improve user experience.
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">Marketing Cookies</h3>
                  <input type="checkbox" className="toggle" />
                </div>
                <p className="text-gray-600 text-sm">
                  Used to deliver personalized advertisements and track campaign effectiveness.
                </p>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex gap-3 justify-end">
              <Button onClick={() => setShowPreferences(false)} variant="outline">
                Cancel
              </Button>
              <Button onClick={() => { handleAcceptAll(); setShowPreferences(false); }}>
                Save Preferences
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GDPRCompliance;
