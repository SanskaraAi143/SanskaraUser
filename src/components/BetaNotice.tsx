import React, { useState, useEffect } from 'react';
import { X, Phone, Mail, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface BetaNoticeProps {
  onDismiss: () => void;
  onVisibilityChange: (isVisible: boolean) => void;
}

const BetaNotice: React.FC<BetaNoticeProps> = ({ onDismiss, onVisibilityChange }) => {
  const [isVisible, setIsVisible] = useState(() => {
    return localStorage.getItem('beta-notice-dismissed') !== 'true';
  });

  useEffect(() => {
    onVisibilityChange(isVisible);
  }, [isVisible, onVisibilityChange]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('beta-notice-dismissed', 'true');
    onDismiss();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white overflow-hidden shadow-2xl z-[100] h-20 flex items-center justify-center"> {/* Added h-20 and flex properties */}
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-white rounded-full animate-pulse"></div>
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 py-4 relative z-10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-yellow-300 flex-shrink-0" />
              <span className="font-bold text-lg uppercase tracking-wide">BETA</span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-sm md:text-base">
              <span className="font-semibold whitespace-nowrap">FREE END-TO-END MARRIAGES</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <a href="tel:7674051127" className="hover:underline font-medium">
                    7674051127
                  </a>
                </div>
                <div className="hidden sm:block text-white/60">|</div>
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <a href="mailto:startupsunder22@gmail.com" className="hover:underline font-medium">
                    startupsunder22@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 hover:text-white flex-shrink-0 p-1 h-auto"
            aria-label="Dismiss beta notice"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BetaNotice;
