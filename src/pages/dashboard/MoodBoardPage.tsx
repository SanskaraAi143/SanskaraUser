
import React from 'react';
import MoodBoard from '@/components/dashboard/MoodBoard';

const MoodBoardPage = () => {
  return (
    <div className="space-y-6 font-body">
      <div className="bg-card-bg rounded-lg p-6 border border-border shadow-sm">
        <h1 className="text-2xl font-heading text-foreground mb-2">
          Wedding Mood Board
        </h1>
        <p className="text-text-secondary">
          Gather inspiration and visualize your wedding aesthetic with our mood board tool.
        </p>
      </div>
      
      <MoodBoard />
    </div>
  );
};

export default MoodBoardPage;
