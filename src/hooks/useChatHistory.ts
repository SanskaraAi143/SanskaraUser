import { useState, useEffect, useCallback } from 'react';
import { getChatMessages } from '@/services/api';

export interface ChatMessage {
  sender: string;
  text: string;
  isMarkdown?: boolean;
  timestamp?: string;
  eventId?: string;
  artifactUrl?: string;
  artifactType?: string;
  systemEventType?: string;
}

export interface UseChatHistoryOptions {
  userId?: string;
  weddingId?: string;
  sessionId?: string | null;
  limit?: number;
}

export const useChatHistory = ({
  userId,
  weddingId,
  sessionId,
  limit = 20
}: UseChatHistoryOptions) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const fetchMessages = useCallback(async () => {
    if (!userId || !weddingId || !sessionId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getChatMessages(weddingId, sessionId, {
        limit,
        offset,
      });

      if (response && response.history) {
        const reversedHistory = response.history.reverse();
        const formattedMessages = reversedHistory.map((event: any) => ({
          sender: event.metadata?.sender_type === 'assistant' ? 'assistant' : 'user',
          text: event.content?.text || `[Unsupported event: ${event.event_type}]`,
          isMarkdown: event.metadata?.sender_type === 'assistant',
          timestamp: event.timestamp,
          eventId: event.event_id,
          artifactUrl: event.content?.artifact_url,
          artifactType: event.content?.artifact_type,
          systemEventType: event.event_type === 'system' ? event.content?.type : undefined
        }));

        setHasMore(response.total_count > (offset + limit));

        setMessages(prev =>
          offset === 0 ? formattedMessages : [...formattedMessages, ...prev]
        );
      } else {
        setHasMore(false);
      }
    } catch (error: any) {
      console.error('Failed to fetch chat history:', error);
      setError(error.message || 'Failed to load chat history');
    } finally {
      setIsLoading(false);
    }
  }, [userId, weddingId, sessionId, offset, limit]);

  useEffect(() => {
    if (sessionId) {
      fetchMessages();
    }
  }, [sessionId, fetchMessages]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setOffset(prev => prev + limit);
    }
  }, [isLoading, hasMore, limit]);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const updateLastMessage = useCallback((update: Partial<ChatMessage>) => {
    setMessages(prev => {
      if (prev.length === 0) return prev;
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];
      newMessages[newMessages.length - 1] = { ...lastMessage, ...update };
      return newMessages;
    });
  }, []);

  return {
    messages,
    isLoading,
    error,
    hasMore,
    loadMore,
    addMessage,
    updateLastMessage,
  };
};