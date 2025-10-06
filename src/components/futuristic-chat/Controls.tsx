import React from 'react';
import { Video, Mic, Phone, MicOff, VideoOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ControlsProps {
  isMuted?: boolean;
  isVideoActive?: boolean;
  isRecording?: boolean;
  onTalkClick: () => void;
  onVideoClick: () => void;
  onMuteClick: () => void;
  onEndClick: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  isMuted,
  isVideoActive,
  isRecording,
  onTalkClick,
  onVideoClick,
  onMuteClick,
  onEndClick
}) => {
  const baseButtonClasses = 'w-12 h-12 flex items-center justify-center rounded-full text-futuristic-text-secondary transition-all duration-300 hover:bg-[#f0eada] hover:text-futuristic-primary-accent';

  return (
    <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-white via-white/80 to-transparent z-10">
      <div className="flex justify-around items-center max-w-sm mx-auto">
        <button
          onClick={onVideoClick}
          className={cn(baseButtonClasses, { 'bg-[#f0eada] text-futuristic-primary-accent': isVideoActive })}
          title="Toggle Video"
        >
          {isVideoActive ? <VideoOff size={24} /> : <Video size={24} />}
        </button>
        <button
          onClick={onMuteClick}
          className={cn(baseButtonClasses, { 'bg-[#f0eada] text-futuristic-primary-accent': isMuted })}
          title="Mute/Unmute"
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
        <button
          onClick={onTalkClick}
          className={cn(
            'w-20 h-20 flex items-center justify-center rounded-full bg-futuristic-primary-accent text-white shadow-lg shadow-red-900/40 transition-all duration-300 hover:scale-105 hover:bg-red-800',
            { 'scale-90 bg-futuristic-secondary-accent shadow-blue-900/50': isRecording }
          )}
          title={isRecording ? "Stop Talking" : "Tap to Talk"}
        >
          <Mic size={32} />
        </button>
        <button
          onClick={onEndClick}
          className={cn(baseButtonClasses, "text-futuristic-primary-accent hover:bg-red-100")}
          title="End Session"
        >
          <Phone size={24} fill="currentColor" />
        </button>
      </div>
    </div>
  );
};

export default Controls;