import React, { useEffect, useRef } from 'react';
import MessageItem, { Message } from './MessageItem';
import './FuturisticMessageDisplay.css';

interface FuturisticMessageDisplayProps {
  messages: Message[];
  isUserSpeaking: boolean;
  isAISpeaking: boolean;
  // Potentially add props for user typing, AI typing indicators if they are to be part of the message flow
}

const FuturisticMessageDisplay: React.FC<FuturisticMessageDisplayProps> = ({
  messages,
  isUserSpeaking,
  isAISpeaking
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Determine container class based on speaking state for background effects
  let containerClasses = "futuristic-conversational-canvas"; // Base class from new CSS
  if (isAISpeaking) {
    containerClasses += " speaking-ai";
  } else if (isUserSpeaking) {
    containerClasses += " speaking-user";
  }

  // Log messages before rendering to help debug (can be removed later)
  // console.log('[FuturisticMessageDisplay] Rendering messages:', JSON.parse(JSON.stringify(messages)));

  return (
    <div ref={containerRef} className={containerClasses}>
      {/* The message-list div might not be needed if styling is applied directly to items */}
      {messages.filter(Boolean).map((msg) => (
        <MessageItem key={msg.id} message={msg} />
      ))}
      {/* AI Typing indicator could be added here later, styled appropriately */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default FuturisticMessageDisplay;
