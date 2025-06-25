import React from 'react';

interface ChatMessageBubbleProps {
  sender: string;
  message: string;
  isUserMessage: boolean;
  animationDelay?: string;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ 
  sender, 
  message, 
  isUserMessage, 
  animationDelay = '0s' 
}) => {
  return (
    <div 
      className="chat-message animate-fade-in" 
      style={{ animationDelay }}
    >
      <p className="font-medium title-gradient mb-1 text-sm">
        {sender}
      </p>
      <div 
        className={`p-3 md:p-4 rounded-2xl shadow-md ${
          isUserMessage 
            ? 'bg-wedding-red text-white ml-8' 
            : 'glass-card mr-8'
        }`}
      >
        <p className={`text-sm ${
          isUserMessage 
            ? 'text-white' 
            : 'text-wedding-brown/90'
        }`}>
          {message}
        </p>
      </div>
    </div>
  );
};

export default ChatMessageBubble;
