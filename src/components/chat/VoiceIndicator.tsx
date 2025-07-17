
import React from 'react';
import { cn } from '../../lib/utils';

interface VoiceIndicatorProps {
  isSpeaking: boolean;
}

const VoiceIndicator: React.FC<VoiceIndicatorProps> = ({ isSpeaking }) => {
  return (
    <div
      className={cn(
        "w-full h-2 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 rounded-full transition-all duration-300 ease-in-out",
        isSpeaking ? "animate-waveform" : "scale-x-0"
      )}
      style={{
        animationDuration: '1.5s',
        animationIterationCount: 'infinite',
        animationTimingFunction: 'ease-in-out',
      }}
    />
  );
};

export default VoiceIndicator;
