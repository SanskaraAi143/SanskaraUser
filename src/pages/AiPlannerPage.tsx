import React from 'react';
import SmartCanvas from '../../components/AiPlanner/SmartCanvas';
import FloatingIndicators from '../../components/AiPlanner/FloatingIndicators';
import ConversationHub from '../../components/AiPlanner/ConversationHub';

const AiPlannerPage: React.FC = () => {
  return (
    <div className="bg-background text-foreground h-screen w-screen flex flex-col">
      {/* Smart Canvas Layer */}
      <div className="flex-grow-[3] bg-blue-100 relative">
        {/* Floating Indicators Layer */}
        <div className="absolute top-4 right-4 z-10">
          <FloatingIndicators />
        </div>
        <SmartCanvas />
      </div>

      {/* AI Conversation Hub Layer */}
      <div className="flex-grow-[1] bg-gray-200">
        <ConversationHub />
      </div>
    </div>
  );
};

export default AiPlannerPage;
