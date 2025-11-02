import React from 'react';
import { cn } from '@/lib/utils';

interface NewChatLayoutProps {
  chatHistory: React.ReactNode;
  chatInput: React.ReactNode;
  sessionSummary: React.ReactNode;
  className?: string;
}

const NewChatLayout: React.FC<NewChatLayoutProps> = ({
  chatHistory,
  chatInput,
  sessionSummary,
  className,
}) => {
  return (
    <div className={cn("flex h-dvh w-full bg-background-light font-sans text-text-dark", className)}>
      {/* Main Conversation Area */}
      <main className="flex flex-1 flex-col bg-white">
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {chatHistory}
        </div>
        {/* Chat Input */}
        <div className="flex-shrink-0 p-4 border-t border-secondary/20 bg-background-light">
          {chatInput}
        </div>
      </main>

      {/* Session Summary Sidebar */}
      <aside className="w-96 border-l border-secondary/20 bg-background-light p-4 hidden md:block">
        {sessionSummary}
      </aside>
    </div>
  );
};

export default NewChatLayout;