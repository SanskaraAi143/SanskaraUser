import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Use Button for consistency if desired, or keep as raw button

const FloatingChatButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Button
      variant="default" // Or a custom variant if a specific style is defined
      className="fixed bottom-6 right-6 z-50 bg-gradient-primary text-white shadow-xl rounded-full p-4 h-auto hover:scale-105 transition-all duration-300"
      onClick={() => navigate('/dashboard/chat')}
      aria-label="Chat with Sanskara AI"
    >
      <MessageCircle size={28} />
    </Button>
  );
};

export default FloatingChatButton;
