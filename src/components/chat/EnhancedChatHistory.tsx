import React, { useEffect, useRef, useCallback, useState, memo } from 'react';
import { Loader2, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import MessageBubble from '../chat/ChatMessageBubble';
import { cn } from '@/lib/utils';

interface Message {
  sender: string;
  text: string;
  isMarkdown?: boolean;
  timestamp?: string;
  eventId?: string;
  artifactUrl?: string;
  artifactType?: string;
  systemEventType?: string;
  type?: string;
  id?: string;
}

interface ChatMessageBubbleProps {
  sender: string;
  message: string;
  isUserMessage: boolean;
  animationDelay?: string;
  attachments?: { id: string; filename: string; thumbnailUrl?: string; mime_type?: string }[];
}

interface EnhancedChatHistoryProps {
  transcript: Message[];
  isLoadingHistory?: boolean;
  hasMoreHistory?: boolean;
  loadMoreHistory?: () => void;
  className?: string;
  virtualized?: boolean; // Enable virtual scrolling for performance
}

// Memoized message item to prevent unnecessary re-renders
const MessageItem = memo(({ message, index }: { message: Message; index: number }) => {
  const isUserMessage = message.sender === 'user';

  return (
    <div key={message.id || `msg-${index}`} className="chat-message animate-fade-in">
      <p className="font-medium title-gradient mb-1 text-sm">
        {isUserMessage ? 'You' : 'Sanskara AI'}
      </p>
      <div
        className={`p-3 md:p-4 rounded-2xl shadow-md ${isUserMessage ? 'bg-wedding-red text-white ml-8' : 'glass-card mr-8'}`}
      >
        <div className={`text-sm ${isUserMessage ? 'text-white' : 'text-wedding-brown/90'}`}>
          {message.isMarkdown ? (
            <div className="prose prose-sm max-w-full text-wedding-brown/90">
              <ReactMarkdown
                components={{
                  p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                }}
              >
                {message.text}
              </ReactMarkdown>
            </div>
          ) : (
            <p>{message.text}</p>
          )}
        </div>
        {message.type === 'artifact_upload' && message.artifactUrl && (
          <img
            src={message.artifactUrl}
            alt="Uploaded Artifact"
            className="max-w-xs mt-2 rounded-md"
            loading="lazy" // Lazy loading for images
          />
        )}
      </div>
    </div>
  );
});

MessageItem.displayName = 'MessageItem';

const EnhancedChatHistory: React.FC<EnhancedChatHistoryProps> = ({
  transcript,
  isLoadingHistory = false,
  hasMoreHistory = false,
  loadMoreHistory,
  className,
  virtualized = true,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasUserScrolledUp, setHasUserScrolledUp] = useState(false);

  // Virtual scrolling state
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: transcript.length });
  const itemHeight = 60; // Average message height
  const containerHeight = 400; // Fixed container height

  // Auto-scroll to bottom for new messages (if user hasn't scrolled up)
  useEffect(() => {
    if (!hasUserScrolledUp && transcript.length > 0) {
      const container = scrollContainerRef.current;
      if (container) {
        const isScrolledToBottom =
          container.scrollHeight - container.clientHeight <= container.scrollTop + 150; // 150px buffer

        if (isScrolledToBottom) {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [transcript, hasUserScrolledUp]);

  // Preserve scroll position when loading more history
  useEffect(() => {
    if (!isLoadingHistory && prevScrollHeightRef.current && scrollContainerRef.current) {
      const newScrollHeight = scrollContainerRef.current.scrollHeight;
      const prevScrollHeight = prevScrollHeightRef.current;
      scrollContainerRef.current.scrollTop = newScrollHeight - prevScrollHeight;
      prevScrollHeightRef.current = null;
      setIsLoadingMore(false);
    }
  }, [isLoadingHistory]);

  // Update visible range for virtual scrolling
  useEffect(() => {
    if (!virtualized) return;

    const updateVisibleRange = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const scrollTop = container.scrollTop;
      const start = Math.floor(scrollTop / itemHeight);
      const end = Math.min(
        start + Math.ceil(containerHeight / itemHeight) + 2, // +2 for buffer
        transcript.length
      );

      setVisibleRange({ start: Math.max(0, start), end });
    };

    const container = scrollContainerRef.current;
    if (container) {
      updateVisibleRange();
      container.addEventListener('scroll', updateVisibleRange, { passive: true });
      return () => container.removeEventListener('scroll', updateVisibleRange);
    }
  }, [transcript.length, virtualized, itemHeight, containerHeight]);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    // Determine if user has scrolled up significantly
    const isNearBottom = scrollHeight - clientHeight <= scrollTop + 150;
    setHasUserScrolledUp(!isNearBottom);

    // Load more history if scrolled to top
    if (scrollTop === 0 && !isLoadingHistory && hasMoreHistory && loadMoreHistory && !isLoadingMore) {
      prevScrollHeightRef.current = container.scrollHeight;
      setIsLoadingMore(true);
      loadMoreHistory();
    }
  }, [isLoadingHistory, hasMoreHistory, loadMoreHistory, isLoadingMore]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setHasUserScrolledUp(false);
  }, []);

  // Render messages based on virtualization
  const renderMessages = () => {
    if (virtualized && transcript.length > 50) { // Only virtualize if many messages
      return transcript
        .slice(visibleRange.start, visibleRange.end)
        .map((message, index) => (
          <div
            key={message.id || `msg-${visibleRange.start + index}`}
            style={{ position: 'absolute', top: (visibleRange.start + index) * itemHeight, width: '100%' }}
          >
            <MessageItem message={message} index={visibleRange.start + index} />
          </div>
        ));
    }

    // Regular rendering for smaller lists
    return transcript.map((message, index) => (
      <MessageItem key={message.id || `msg-${index}`} message={message} index={index} />
    ));
  };

  const totalHeight = virtualized && transcript.length > 50
    ? transcript.length * itemHeight
    : 'auto';

  return (
    <div className={cn("flex-grow p-4 overflow-hidden flex flex-col", className)}>
      {/* Load More Indicator */}
      {hasMoreHistory && (
        <div className="flex-shrink-0 py-2">
          {isLoadingHistory ? (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-futuristic-secondary-accent" />
            </div>
          ) : isLoadingMore ? (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-futuristic-secondary-accent" />
            </div>
          ) : (
            <button
              onClick={() => {
                if (loadMoreHistory) {
                  prevScrollHeightRef.current = scrollContainerRef.current?.scrollHeight || null;
                  setIsLoadingMore(true);
                  loadMoreHistory();
                }
              }}
              className="w-full text-futuristic-secondary-accent hover:underline text-sm flex justify-center items-center gap-2 py-1"
            >
              Load older messages
            </button>
          )}
        </div>
      )}

      {/* Messages Container */}
      <div
        ref={scrollContainerRef}
        className="flex-grow overflow-y-auto relative"
        onScroll={handleScroll}
        style={{ height: virtualized && transcript.length > 50 ? containerHeight : 'auto' }}
      >
        <div
          className="relative"
          style={{ height: totalHeight, minHeight: totalHeight === 'auto' ? 'auto' : `${containerHeight}px` }}
        >
          {renderMessages()}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to Bottom Button */}
      {hasUserScrolledUp && transcript.length > 0 && (
        <div className="flex-shrink-0 pt-2">
          <button
            onClick={scrollToBottom}
            className="mx-auto flex items-center gap-2 px-3 py-2 text-xs bg-futuristic-secondary-bg hover:bg-futuristic-secondary-accent text-futuristic-text-secondary rounded-full transition-colors duration-200 shadow-md"
            aria-label="Scroll to bottom"
          >
            <ChevronDown className="w-4 h-4" />
            New messages
          </button>
        </div>
      )}

      {/* Performance Indicator */}
      {process.env.NODE_ENV === 'development' && transcript.length > 100 && (
        <div className="flex-shrink-0 pt-2 text-xs text-gray-500 text-center">
          Messages: {transcript.length} | Visible: {visibleRange.end - visibleRange.start}
        </div>
      )}
    </div>
  );
};

export default EnhancedChatHistory;
