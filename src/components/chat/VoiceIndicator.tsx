
import React from 'react';
import { cn } from '../../lib/utils';

interface VoiceIndicatorProps {
  isSpeaking: boolean;
  isAssistantSpeaking?: boolean;
  isUserSpeaking?: boolean;
}

const VoiceIndicator: React.FC<VoiceIndicatorProps> = ({ 
  isSpeaking, 
  isAssistantSpeaking = false, 
  isUserSpeaking = false 
}) => {
  // Determine the speaking state and colors
  const getIndicatorState = () => {
    if (isAssistantSpeaking) {
      return {
        gradient: "from-[#ff8f00] via-[#ffd700] to-[#ff8f00]",
        label: "Assistant speaking...",
        animate: true
      };
    }
    if (isUserSpeaking || isSpeaking) {
      return {
        gradient: "from-blue-400 via-blue-600 to-blue-400",
        label: "Listening...",
        animate: true
      };
    }
    return {
      gradient: "from-gray-300 via-gray-400 to-gray-300",
      label: "Ready to listen",
      animate: false
    };
  };

  const { gradient, label, animate } = getIndicatorState();

  return (
    <div className="flex flex-col items-center space-y-2">
      <div
        className={cn(
          `w-full h-2 bg-gradient-to-r ${gradient} rounded-full transition-all duration-300 ease-in-out`,
          animate ? "animate-pulse scale-x-100" : "scale-x-50 opacity-50"
        )}
        style={{
          animationDuration: isAssistantSpeaking ? '2s' : '1.5s',
          animationIterationCount: 'infinite',
          animationTimingFunction: 'ease-in-out',
        }}
      />
      <div className="text-xs text-gray-500 text-center">
        {label}
      </div>
    </div>
  );
};

export default VoiceIndicator;
