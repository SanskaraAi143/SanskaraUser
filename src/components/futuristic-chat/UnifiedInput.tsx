import React, { useState } from 'react';
import { Mic, Paperclip, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface UnifiedInputProps {
  onSendMessage: (message: string) => void;
  onVoiceClick: () => void;
  isRecording: boolean;
  disabled?: boolean;
}

const UnifiedInput: React.FC<UnifiedInputProps> = ({ onSendMessage, onVoiceClick, isRecording, disabled }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 w-full">
      <Button variant="ghost" size="icon" className="text-text-dark/70 hover:text-primary" disabled={disabled}>
        <Paperclip className="h-5 w-5" />
      </Button>
      <div className="relative flex-1">
        <Input
          placeholder="Type a message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={disabled}
          className="bg-white rounded-full px-4 py-2 border-secondary/30 focus:ring-primary"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onVoiceClick}
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-text-dark/70 hover:text-primary",
            isRecording && "text-red-500"
          )}
        >
          <Mic className="h-5 w-5" />
        </Button>
      </div>
      <Button type="submit" size="icon" className="bg-primary text-white rounded-full hover:bg-secondary disabled:opacity-50" disabled={!inputValue.trim() || disabled}>
        <Send className="h-5 w-5" />
      </Button>
    </form>
  );
};

export default UnifiedInput;