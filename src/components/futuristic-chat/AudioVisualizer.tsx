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
    className
  );

  const visualizerBaseClasses = 'absolute top-1/2 left-1/2 rounded-full transition-all duration-500 ease-in-out';

  return (
    <div className={containerClasses}>
      <div
        className={cn(
          visualizerBaseClasses,
          'w-52 h-52 border-2 border-futuristic-gold/30',
          isSpeaking ? 'animate-speaking-ring-2' : 'animate-gentle-pulse'
        )}
        style={{ transform: 'translate(-50%, -50%)', animationDelay: isSpeaking ? '0s' : '1s' }}
      />
      <div
        className={cn(
          visualizerBaseClasses,
          'w-40 h-40 border-2 border-futuristic-gold/30',
          isSpeaking ? 'animate-speaking-ring-1' : 'animate-gentle-pulse'
        )}
        style={{ transform: 'translate(-50%, -50%)', animationDelay: isSpeaking ? '0s' : '0.5s' }}
      />
      <div
        className={cn(
          visualizerBaseClasses,
          'w-32 h-32 bg-gradient-radial from-futuristic-gold to-futuristic-gold/30 shadow-[0_0_20px_theme(colors.futuristic.gold),0_0_40px_rgba(255,215,0,0.5)]',
          isSpeaking ? 'animate-speaking-pulse' : 'animate-gentle-pulse',
          {
            'scale-110 shadow-[0_0_30px_theme(colors.futuristic.primary-accent)]': isListening,
          }
        )}
        style={{ transform: 'translate(-50%, -50%)' }}
      />
    </div>
  );
};

export default AudioVisualizer;