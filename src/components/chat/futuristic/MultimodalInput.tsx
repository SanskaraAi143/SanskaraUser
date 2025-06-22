import React, { useState, useRef } from 'react';
import './MultimodalInput.css';
// Assuming lucide-react is available from the existing project for icons
import { Send, Mic, CornerDownLeft, X } from 'lucide-react';

interface ProactiveSuggestion {
  id: string;
  text: string;
}

interface MultimodalInputProps {
  onSendMessage: (text: string) => void;
  // onVoiceInputStart: () => void; // Future
  // onVoiceInputStop: () => void; // Future
  // onSuggestionClick: (text: string) => void; // Future
  isSending?: boolean;
  // Example proactive suggestions - this would likely come from props or state
  suggestions?: ProactiveSuggestion[];
}

const MultimodalInput: React.FC<MultimodalInputProps> = ({
  onSendMessage,
  isSending = false,
  suggestions = [], // Default to empty array
}) => {
  const [inputText, setInputText] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false); // UI stub for voice
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (inputText.trim() && !isSending) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoiceInput = () => { // UI Stub
    setIsVoiceActive(!isVoiceActive);
    // In future, would call onVoiceInputStart/Stop
  };

  const handleSuggestionClick = (text: string) => {
    setInputText(text); // Set text to input
    // Optionally, send immediately:
    // onSendMessage(text);
    // setInputText('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="multimodal-input-area">
      {/* Proactive Suggestions Area */}
      {suggestions.length > 0 && !isVoiceActive && (
        <div className="proactive-suggestions">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              className="suggestion-chip"
              onClick={() => handleSuggestionClick(suggestion.text)}
              title={`Use suggestion: "${suggestion.text}"`}
            >
              {suggestion.text}
            </button>
          ))}
        </div>
      )}

      {/* Main Input Bar */}
      <div className={`input-bar ${isVoiceActive ? 'voice-active-bar' : ''}`}>
        <button
          className={`voice-button ${isVoiceActive ? 'active' : ''}`}
          onClick={toggleVoiceInput}
          title={isVoiceActive ? "Stop voice input" : "Start voice input"}
          aria-pressed={isVoiceActive}
        >
          {isVoiceActive ? <X size={22} /> : <Mic size={22} />}
        </button>

        {isVoiceActive ? (
          <div className="voice-visualizer-stub">
            <div className="voice-dot"></div>
            <div className="voice-dot"></div>
            <div className="voice-dot"></div>
            <span>Listening... (Visualizer Placeholder)</span>
          </div>
        ) : (
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message, or use voice..."
            rows={1}
            className="text-input-field"
            disabled={isSending}
          />
        )}

        <button
          className="send-button"
          onClick={handleSend}
          disabled={isSending || (!inputText.trim() && !isVoiceActive)}
          title="Send message"
        >
          {isSending ? (
            <div className="sending-spinner"></div>
          ) : (
            <Send size={22} />
          )}
        </button>
      </div>
       {/* Helper text / context hint */}
       {!isVoiceActive && (
         <div className="input-helper-text">
           Shift + Enter for new line.
         </div>
       )}
    </div>
  );
};

export default MultimodalInput;
