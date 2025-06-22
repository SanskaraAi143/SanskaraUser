import React from 'react';
import './MessageItem.css';

export interface Message {
  id: string | number;
  role: 'user' | 'bot' | 'system';
  content: string;
  timestamp?: string;
}

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  if (!message) {
    // console.error('MessageItem rendered with undefined message prop'); // Already logged if it happens
    return null;
  }

  const isUser = message.role === 'user';
  const isBot = message.role === 'bot';
  // const isSystem = message.role === 'system'; // For neutral system messages, not explicitly styled in new HTML

  // Choose class based on role
  let bubbleClass = 'message-bubble'; // Base class from new CSS
  if (isUser) {
    bubbleClass += ' user';
  } else if (isBot) {
    bubbleClass += ' ai'; // HTML uses 'ai', not 'bot'
  } else {
    bubbleClass += ' system'; // Fallback or specific system styling if needed
  }

  return (
    // The wrapper div might not be needed if align-self is applied directly to message-bubble
    // For now, keeping it to ensure structure is similar if complex alignments are needed.
    // The new CSS uses align-self on .message-bubble directly.
    <div className={bubbleClass}>
      <p>{message.content}</p>
      {/* Timestamp can be added here if desired, new HTML doesn't show it in bubble */}
      {/*
      {message.timestamp && (
        <div className="message-timestamp-futuristic"> // new class if styled differently
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
      */}
    </div>
  );
};

export default MessageItem;
