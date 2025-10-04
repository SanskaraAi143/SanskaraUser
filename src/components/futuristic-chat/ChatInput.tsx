import React, { useState } from 'react';
import { Paperclip, Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center p-4 border-t border-futuristic-border bg-white shrink-0">
      <input type="file" id="file-upload-input" hidden multiple />
      <button
        type="button"
        className="w-11 h-11 flex-shrink-0 flex items-center justify-center text-futuristic-text-secondary transition-colors hover:text-futuristic-secondary-accent"
        title="Attach File"
        disabled // Disabled for now
      >
        <Paperclip size={22} />
      </button>
      <input
        type="text"
        placeholder="Or type your message..."
        autoComplete="off"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="flex-grow border border-gray-300 rounded-full px-4 py-2 text-base font-sans bg-gray-100 focus:outline-none focus:ring-2 focus:ring-futuristic-secondary-accent focus:bg-white"
      />
      <button
        type="submit"
        className="w-11 h-11 ml-2 flex-shrink-0 flex items-center justify-center bg-futuristic-secondary-accent text-white rounded-full transition-colors hover:bg-opacity-90 disabled:opacity-50"
        title="Send Message"
        disabled={!inputValue.trim()}
      >
        <Send size={20} />
      </button>
    </form>
  );
};

export default ChatInput;