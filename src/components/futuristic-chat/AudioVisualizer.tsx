import React from 'react';
import { cn } from '@/lib/utils';

interface AudioVisualizerProps {
  isSpeaking?: boolean;
  isListening?: boolean;
  className?: string;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isSpeaking, isListening, className }) => {
  const containerClasses = cn(
    'relative w-44 h-44 mb-4 transition-all duration-500 ease-in-out',
    {
      'speaking': isSpeaking,
      'listening': isListening,
    },
    className
  );

  const visualizerBaseClasses = 'absolute top-1/2 left-1/2 rounded-full transition-all duration-500 ease-in-out';

  return (
    <div className={containerClasses}>
      <div
        className={cn(
          visualizerBaseClasses,
          'w-52 h-52 border-2 border-futuristic-gold/30 animate-[gentle-pulse_4s_infinite_1s_ease-in-out]',
          { 'animate-[speaking-ring-2_1.2s_infinite_ease-in-out]': isSpeaking }
        )}
        style={{ transform: 'translate(-50%, -50%)' }}
      />
      <div
        className={cn(
          visualizerBaseClasses,
          'w-40 h-40 border-2 border-futuristic-gold/30 animate-[gentle-pulse_4s_infinite_0.5s_ease-in-out]',
          { 'animate-[speaking-ring-1_1.2s_infinite_ease-in-out]': isSpeaking }
        )}
        style={{ transform: 'translate(-50%, -50%)' }}
      />
      <div
        className={cn(
          visualizerBaseClasses,
          'w-32 h-32 bg-gradient-radial from-futuristic-gold to-futuristic-gold/30 shadow-[0_0_20px_theme(colors.futuristic.gold),0_0_40px_rgba(255,215,0,0.5)] animate-[gentle-pulse_4s_infinite_ease-in-out]',
          {
            'animate-[speaking-pulse_1.2s_infinite_ease-in-out]': isSpeaking,
            'scale-110 shadow-[0_0_30px_theme(colors.futuristic.primary-accent)]': isListening,
          }
        )}
        style={{ transform: 'translate(-50%, -50%)' }}
      />
    </div>
  );
};

// NOTE: Need to add keyframes to tailwind.config.ts for this to work
/*
keyframes: {
  'gentle-pulse': {
    '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: '0.8' },
    '50%': { transform: 'translate(-50%, -50%) scale(1.05)', opacity: '1' },
  },
  'speaking-pulse': {
    '0%, 100%': { transform: 'translate(-50%, -50%) scale(0.95)', opacity: '0.9' },
    '50%': { transform: 'translate(-50%, -50%) scale(1.1)', opacity: '1' },
  },
  'speaking-ring-1': {
    '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: '0.5' },
    '50%': { transform: 'translate(-50%, -50%) scale(1.1)', opacity: '0.8' },
  },
  'speaking-ring-2': {
    '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: '0.3' },
    '50%': { transform: 'translate(-50%, -50%) scale(1.15)', opacity: '0.6' },
  },
},
animation: {
  'gentle-pulse': 'gentle-pulse 4s infinite ease-in-out',
  'speaking-pulse': 'speaking-pulse 1.2s infinite ease-in-out',
  'speaking-ring-1': 'speaking-ring-1 1.2s infinite ease-in-out',
  'speaking-ring-2': 'speaking-ring-2 1.2s infinite ease-in-out',
}
*/

export default AudioVisualizer;