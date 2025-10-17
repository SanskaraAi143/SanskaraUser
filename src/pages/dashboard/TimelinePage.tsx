
import React from 'react';
import TimelineCreator from '@/components/dashboard/TimelineCreator';

const TimelinePage = () => {
  return (
    <div className="space-y-6 font-body">
      <div className="bg-card-bg rounded-lg p-6 border border-border shadow-sm">
        <h1 className="text-2xl font-heading text-foreground mb-2">
          Wedding Timeline
        </h1>
        <p className="text-text-secondary">
          Create and manage your wedding events schedule from mehndi ceremony to reception.
        </p>
      </div>
      
      <TimelineCreator />
    </div>
  );
};

export default TimelinePage;
