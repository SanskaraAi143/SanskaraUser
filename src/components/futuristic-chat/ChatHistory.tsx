import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

interface Message {
  sender: 'user' | 'assistant' | string;
  text: string;
  isMarkdown?: boolean;
}

interface ChatHistoryProps {
  transcript: Message[];
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ transcript }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript]);

  return (
    <div className="flex-grow p-4 overflow-y-auto space-y-4">
      {transcript.map((msg, index) => (
        <MessageBubble key={index} sender={msg.sender === 'user' ? 'user' : 'ai'}>
          {msg.text}
        </MessageBubble>
      ))}
      <div ref={scrollRef} />
    </div>
  );
};

export default ChatHistory;