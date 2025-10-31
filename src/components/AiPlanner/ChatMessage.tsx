import React from 'react';

interface ChatMessageProps {
  sender: 'user' | 'assistant';
  text: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ sender, text }) => {
  const isAssistant = sender === 'assistant';

  return (
    <div className={`flex mb-4 ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div
        className={`rounded-lg px-4 py-2 max-w-lg ${
          isAssistant
            ? 'bg-gray-200 text-gray-800'
            : 'bg-purple-600 text-white'
        }`}
      >
        <p className="text-sm">{text}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
