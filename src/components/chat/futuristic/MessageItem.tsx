import React from 'react';
import './MessageItem.css';
// import AIStateVisualizer from './AIStateVisualizer'; // Example: if AI avatar is the visualizer

export interface Message {
  id: string | number;
  role: 'user' | 'bot' | 'system'; // 'system' for neutral info if needed
  content: string; // For now, simple text. Later can be structured content.
  timestamp?: string;
  // Future: richMedia?: { type: 'image' | 'video' | 'graph', url: string }
  // Future: interactiveElements?: Record<string, unknown>;
}

interface MessageItemProps {
  message: Message;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message && message.role === 'user';

  if (!message || typeof message.role !== 'string' || typeof message.content !== 'string') {
    // Optionally render nothing or a fallback UI
    return null;
  }

  return (
    <div className={`message-item-wrapper ${isUser ? 'user-message-wrapper' : 'bot-message-wrapper'}`}>
      <div className={`message-item ${isUser ? 'user-message' : 'bot-message'}`}>
        {/*
          Future Avatar Placeholder:
          <div className="message-avatar">
            {isUser ? <UserIcon /> : <AIStateVisualizer state="idle" /> }
          </div>
        */}
        <div className="message-content">
          <p>{message.content}</p>
        </div>
        {message.timestamp && (
          <div className="message-timestamp">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
      {/* Placeholder for rich media or interactive elements below the message bubble */}
      {/*
        message.richMedia && (
          <div className="rich-media-container">
            {message.richMedia.type === 'image' && <img src={message.richMedia.url} alt="Rich content" />}
          </div>
        )
      */}
    </div>
  );
};

export default MessageItem;
