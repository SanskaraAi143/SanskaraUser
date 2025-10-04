import React from 'react';
import { cn } from '@/lib/utils';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface MessageBubbleProps {
  sender: 'user' | 'ai';
  children: React.ReactNode;
  className?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ sender, children, className }) => {
  const bubbleClasses = cn(
    'max-w-[80%] rounded-2xl px-4 py-3 mb-4 leading-relaxed transition-all duration-300',
    {
      'bg-[#e9e1d2] text-futuristic-text-primary ml-auto rounded-br-md': sender === 'user',
      'bg-futuristic-secondary-accent text-white mr-auto rounded-bl-md': sender === 'ai',
    },
    className
  );

  return (
    <div className={bubbleClasses}>
      {children}
      {sender === 'ai' && (
        <div className="flex gap-2 mt-2">
          <button className="bg-white/10 border border-white/20 rounded-full w-7 h-7 flex items-center justify-center text-white transition-colors hover:bg-white/20">
            <ThumbsUp size={14} />
          </button>
          <button className="bg-white/10 border border-white/20 rounded-full w-7 h-7 flex items-center justify-center text-white transition-colors hover:bg-white/20">
            <ThumbsDown size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;