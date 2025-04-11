
import React from 'react';
import TimelineCreator from '@/components/dashboard/TimelineCreator';

const TimelinePage = () => {
  return (
    <div className="space-y-6">
      <div className="bg-wedding-maroon/5 rounded-xl p-6 border border-wedding-maroon/20">
        <h1 className="text-2xl font-playfair text-wedding-maroon mb-2">
          Wedding Timeline
        </h1>
        <p className="text-gray-600">
          Create and manage your wedding events schedule from mehndi ceremony to reception.
        </p>
      </div>
      
      <TimelineCreator />
    </div>
  );
};

export default TimelinePage;
