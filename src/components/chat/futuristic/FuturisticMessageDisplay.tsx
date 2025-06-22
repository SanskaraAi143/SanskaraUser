import React, { useEffect, useRef } from 'react';
import MessageItem, { Message } from './MessageItem';
import './FuturisticMessageDisplay.css';

interface FuturisticMessageDisplayProps {
  messages: Message[];
  // Potentially add props for user typing, AI typing indicators if they are to be part of the message flow
}

const FuturisticMessageDisplay: React.FC<FuturisticMessageDisplayProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Scroll to bottom whenever messages change

  return (
    <div className="futuristic-message-display-container">
      <div className="message-list">
        {messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} />
        ))}
        {/* AI Typing indicator could be a special type of MessageItem or a separate component here */}
        {/* Example:
          isAiTyping && (
            <MessageItem message={{ id: 'typing', role: 'bot', content: '...' }} />
          )
        */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default FuturisticMessageDisplay;
