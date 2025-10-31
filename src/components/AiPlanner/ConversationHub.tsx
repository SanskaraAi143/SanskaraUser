import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import { useMockAi } from '../../hooks/useMockAi';

// Mock initial messages for layout purposes
const initialMessages = [
  { sender: 'assistant', text: "Hello! I am your AI wedding planner. How can I help you get started?" },
];

const ConversationHub: React.FC = () => {
  const { messages, sendMessage, isTyping } = useMockAi(initialMessages);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() === '') return;
    sendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 p-4">
      {/* Conversation History */}
      <div className="flex-grow overflow-y-auto mb-4 pr-4">
        {messages.map((msg, index) => (
          <ChatMessage key={index} sender={msg.sender} text={msg.text} />
        ))}
        {isTyping && <ChatMessage sender="assistant" text="Typing..." />}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSendMessage} className="flex items-center border-t pt-4">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask me anything about your wedding..."
          className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          rows={1}
          disabled={isTyping}
        />
        <button type="submit" className="ml-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700" disabled={isTyping}>
          Send
        </button>
        {/* Placeholder for Voice Button */}
        <button type="button" className="ml-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400" disabled={isTyping}>
          🎤
        </button>
      </form>
    </div>
  );
};

export default ConversationHub;
