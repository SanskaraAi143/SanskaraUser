import React from 'react';
import { cn } from '@/lib/utils';

interface ChatLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ children, className }) => {
  return (
    <div className={cn("flex flex-col h-screen bg-futuristic-bg text-futuristic-text-primary font-sans", className)}>
      <div className="flex flex-row h-full max-w-7xl mx-auto w-full">
        {children}
      </div>
    </div>
  );
};

export default ChatLayout;