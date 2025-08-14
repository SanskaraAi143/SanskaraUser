import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface GuestSummaryProps {
  confirmed: number;
  invited: number;
}

const GuestSummary: React.FC<GuestSummaryProps> = ({ confirmed, invited }) => {
  return (
    <div className="space-y-4 text-center">
      <div className="flex items-baseline justify-center gap-2">
        <span className="text-4xl font-bold">{confirmed}</span>
        <span className="text-xl text-muted-foreground">/ {invited}</span>
      </div>
      <p className="text-sm text-muted-foreground">
        Guests Confirmed
      </p>
      <Link to="/dashboard/guests">
        <Button variant="outline" className="w-full">
          Manage Guest List
        </Button>
      </Link>
    </div>
  );
};

export default GuestSummary;
