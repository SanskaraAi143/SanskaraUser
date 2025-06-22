import React from 'react';
import FuturisticChatView from '@/components/chat/futuristic/FuturisticChatView';
import './FuturisticChatPage.css'; // For page-specific layout if needed

const FuturisticChatPage: React.FC = () => {
  return (
    <div className="futuristic-chat-page-container">
      {/*
        Can add page-specific headers or other elements here if needed,
        but FuturisticChatView is designed to be quite immersive.
      */}
      <FuturisticChatView />
    </div>
  );
};

export default FuturisticChatPage;
