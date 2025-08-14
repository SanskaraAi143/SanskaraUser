
import React from 'react';
import MoodBoard from '@/components/dashboard/MoodBoard';

const MoodBoardPage = () => {
  return (
    <div className="space-y-6">
      <div className="bg-wedding-maroon/5 rounded-xl p-6 border border-wedding-maroon/20">
        <h1 className="text-2xl  text-wedding-maroon mb-2">
          Wedding Mood Board
        </h1>
        <p className="text-gray-600">
          Gather inspiration and visualize your wedding aesthetic with our mood board tool.
        </p>
      </div>
      
      <MoodBoard />
    </div>
  );
};

export default MoodBoardPage;
