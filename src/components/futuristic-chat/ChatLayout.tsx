import React from 'react';
import { cn } from '@/lib/utils';

interface ChatLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ children, sidebar, className }) => {
  return (
    <div className={cn("flex flex-col h-screen bg-futuristic-bg text-futuristic-text-primary font-poppins", className)}>
      <div className="flex flex-row h-full max-w-7xl mx-auto w-full">
        {sidebar}
        {children}
      </div>
    </div>
  );
};

export default ChatLayout;