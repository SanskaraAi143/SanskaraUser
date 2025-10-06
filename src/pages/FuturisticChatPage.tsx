import React from 'react';
import { useNavigate } from 'react-router-dom';
import ChatLayout from '@/components/futuristic-chat/ChatLayout';
import AudioVisualizer from '@/components/futuristic-chat/AudioVisualizer';
import ChatHistory from '@/components/futuristic-chat/ChatHistory';
import ChatInput from '@/components/futuristic-chat/ChatInput';
import Controls from '@/components/futuristic-chat/Controls';
import { ArrowLeft } from 'lucide-react';

const FuturisticChatPage: React.FC = () => {
  const navigate = useNavigate();
  // Mock state for demonstration purposes
  const [isRecording, setIsRecording] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const [aiStatus, setAiStatus] = React.useState('Tap to begin conversation');

  // Simulate AI speaking cycle
  const handleTalkClick = () => {
    setIsRecording(true);
    setAiStatus('Listening...');
    setTimeout(() => {
      setIsRecording(false);
      setIsSpeaking(true);
      setAiStatus('Speaking...');
    }, 2000);
    setTimeout(() => {
      setIsSpeaking(false);
      setAiStatus('Tap to speak again');
    }, 5000);
  };

  return (
    <ChatLayout>
      {/* Main View */}
      <div className="flex-[3] relative flex flex-col border-r border-futuristic-border">
        <main className="flex-grow flex flex-col justify-center items-center text-center p-8 pb-44 relative">
          <AudioVisualizer isSpeaking={isSpeaking} isListening={isRecording} />
          <h1 className="text-3xl font-medium text-futuristic-text-primary mb-2">Sanskara</h1>
          <p className="text-base text-futuristic-text-secondary min-h-[24px] transition-opacity duration-300">
            {aiStatus}
          </p>
        </main>
        <Controls isRecording={isRecording} onTalkClick={handleTalkClick} />
      </div>

      {/* Chat Panel */}
      <div className="flex-[2] flex flex-col bg-futuristic-container-bg">
        <div className="flex justify-between items-center p-4 border-b border-futuristic-border shrink-0">
          <h2 className="font-semibold">Conversation History</h2>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-futuristic-text-secondary hover:text-futuristic-primary-accent"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
        <ChatHistory transcript={[]} />
        <ChatInput onSendMessage={() => {}} />
      </div>
    </ChatLayout>
  );
};

export default FuturisticChatPage;