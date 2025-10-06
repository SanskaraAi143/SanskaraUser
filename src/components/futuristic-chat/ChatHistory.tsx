import React, { useEffect, useRef, useCallback } from 'react';
import MessageBubble from './MessageBubble';
import { Loader2 } from 'lucide-react';

// Assuming Message interface is defined in a shared types file, e.g., @/types/index.ts or similar
// For this component, we'll redefine a simplified version.
interface Message {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  isMarkdown?: boolean;
  timestamp: string;
  type: 'message' | 'artifact_upload' | 'system_event';
  artifactUrl?: string;
}

interface ChatHistoryProps {
  transcript: Message[];
  isLoadingHistory?: boolean;
  hasMoreHistory?: boolean;
  loadMoreHistory?: () => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ transcript, isLoadingHistory, hasMoreHistory, loadMoreHistory }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number | null>(null);

  // Auto-scroll to bottom for new messages
  useEffect(() => {
    // Only auto-scroll if the user isn't trying to view older messages.
    // A common heuristic is to check if the user is near the bottom.
    const container = scrollContainerRef.current;
    if (container) {
        const isScrolledToBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 100; // 100px buffer
        if (isScrolledToBottom) {
             messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }
  }, [transcript]);

  // Preserve scroll position when loading more history
  useEffect(() => {
    if (!isLoadingHistory && prevScrollHeightRef.current && scrollContainerRef.current) {
      const newScrollHeight = scrollContainerRef.current.scrollHeight;
      scrollContainerRef.current.scrollTop = newScrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = null; // Reset after adjusting
    }
  }, [isLoadingHistory]);


  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container && !isLoadingHistory && hasMoreHistory && loadMoreHistory) {
      // If scrolled to the very top, trigger loading more history.
      if (container.scrollTop === 0) {
        prevScrollHeightRef.current = container.scrollHeight;
        loadMoreHistory();
      }
    }
  }, [isLoadingHistory, hasMoreHistory, loadMoreHistory]);

  return (
    <div ref={scrollContainerRef} className="flex-grow p-4 overflow-y-auto" onScroll={handleScroll}>
      {hasMoreHistory && (
        <div className="text-center py-2">
           {isLoadingHistory ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-futuristic-secondary-accent" />
           ) : (
                <button onClick={loadMoreHistory} className="text-futuristic-secondary-accent hover:underline text-sm">
                    Load older messages
                </button>
           )}
        </div>
      )}
      {transcript.map((msg, index) => (
        <MessageBubble key={msg.id || index} sender={msg.sender === 'user' ? 'user' : 'ai'}>
          {msg.text}
          {msg.type === 'artifact_upload' && msg.artifactUrl && (
            <img src={msg.artifactUrl} alt="Uploaded Artifact" className="max-w-xs mt-2 rounded-md" />
          )}
        </MessageBubble>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatHistory;