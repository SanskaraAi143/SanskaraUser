import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface SessionSummarySidebarProps {
  // Props will be added later to pass dynamic data
}

const SessionSummarySidebar: React.FC<SessionSummarySidebarProps> = () => {
  return (
    <div className="flex flex-col gap-6 h-full">
      <Card className="bg-white border-secondary/20 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold text-text-dark">Session Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm text-text-dark/80 mb-1">Task</h4>
            <p className="font-medium text-text-dark">Wedding Venue Search</p>
          </div>
          <Separator />
          <div>
            <h4 className="font-semibold text-sm text-text-dark/80 mb-1">Key Details</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-text-dark">
              <li>Budget: ₹8 lakh</li>
              <li>Location: Dharmavaram</li>
              <li>Dates: TBD</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      <Card className="flex-1 bg-white border-secondary/20 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold text-text-dark">Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          {/* A checklist can be implemented here later */}
          <p className="text-sm text-text-dark/70">No actions defined yet.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionSummarySidebar;