import React, { useState, useRef } from 'react';
import './MultimodalInput.css';
// Using Font Awesome icons as per the new HTML example.
// We'll need to ensure Font Awesome is linked in the main HTML or use a React Font Awesome library.
// For now, using string placeholders or simple SVGs if lucide-react is still preferred.
// import { Send, Mic, StopCircle, Zap } from 'lucide-react'; // Example if we stick to lucide

interface MultimodalInputProps {
  onSendMessage: (text: string) => void;
  isSending?: boolean;
  onUserSpeakingChange: (isSpeaking: boolean) => void; // To notify parent about STT state
  // onGoImmersive: () => void; // To be added for immersive mode
}

const MultimodalInput: React.FC<MultimodalInputProps> = ({
  onSendMessage,
  isSending = false,
  onUserSpeakingChange,
  // onGoImmersive,
}) => {
  const [inputText, setInputText] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false); // For STT state
  const inputRef = useRef<HTMLInputElement>(null); // Changed from textarea to input to match HTML

  const handleSend = () => {
    if (inputText.trim() && !isSending) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoiceInput = () => {
    const newVoiceState = !isVoiceActive;
    setIsVoiceActive(newVoiceState);
    onUserSpeakingChange(newVoiceState); // Notify parent (FuturisticChatView)
    // STT start/stop logic will be added here in Phase 3
    if (newVoiceState && inputRef.current) {
        // Potentially clear input or set placeholder when voice starts
        // inputRef.current.placeholder = "Listening...";
    } else if (inputRef.current) {
        // inputRef.current.placeholder = "Type your message or speak...";
    }
  };

  // Placeholder for "Go Immersive" button click
  const handleGoImmersiveClick = () => {
    // if (onGoImmersive) onGoImmersive();
    console.log("Go Immersive clicked - functionality to be implemented");
  };

  return (
    <div className="futuristic-input-area"> {/* Changed class to match new CSS */}
      {/* Proactive Suggestions Area - temporarily commented out as not in new HTML design
      {suggestions.length > 0 && !isVoiceActive && (
        <div className="proactive-suggestions"> ... </div>
      )}
      */}

      {/* Main Input Bar - structure adapted from new HTML */}
      <input
        ref={inputRef}
        type="text"
        value={inputText}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Type your message or speak..." // From new HTML
        className="futuristic-text-input" // New class for styling
        disabled={isSending || isVoiceActive} // Disable if sending or voice is active (as per new HTML logic)
      />

      <div
        id="microphoneButton" // ID from HTML for consistency, though might not be used by React logic
        className={`futuristic-microphone-button ${isVoiceActive ? 'recording' : ''}`}
        onClick={toggleVoiceInput}
        title={isVoiceActive ? "Stop recording" : "Start voice input"}
      >
        {/* Using i tag for Font Awesome compatibility as per HTML example */}
        {isVoiceActive ? <i className="fas fa-stop"></i> : <i className="fas fa-microphone"></i>}
      </div>

      <button
        id="goImmersiveButton" // ID from HTML
        className="futuristic-button" // Generic button style, specific styles can be added
        onClick={handleGoImmersiveClick}
        disabled={isSending}
        title="Go to Immersive Mode"
      >
        {/* <Zap size={18} /> Icon example */}
        Go Immersive
      </button>

      <button
        id="sendButton" // ID from HTML
        className="futuristic-button" // Generic button style
        onClick={handleSend}
        disabled={isSending || !inputText.trim()}
        title="Send message"
      >
        {/* <Send size={18} /> Icon example */}
        Send
      </button>

      {/* Microphone Visualizer div (CSS only animation) - will be positioned by CSS relative to input area or mic button */}
      {/* <div id="microphoneVisualizer" className={`microphone-visualizer ${isVoiceActive ? 'active' : ''}`}></div> */}
      {/* This visualizer is better placed near the microphone button or as an overlay, handled by CSS.
          The JS for this specific element in the HTML was just adding 'active' class.
          We can create a separate component for it if it becomes complex, or just style it in MultimodalInput.css
      */}

       {/* Helper text from old design - removed as not in new HTML design
       {!isVoiceActive && (
         <div className="input-helper-text">Shift + Enter for new line.</div>
       )}
       */}
    </div>
  );
};

export default MultimodalInput;
