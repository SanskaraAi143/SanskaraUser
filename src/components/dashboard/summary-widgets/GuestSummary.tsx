import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

interface GuestSummaryProps {
  confirmed: number;
  invited: number;
}

const GuestSummary: React.FC<GuestSummaryProps> = ({ confirmed, invited }) => {
  const rsvpRate = invited > 0 ? (confirmed / invited) * 100 : 0;

  return (
    <div className="space-y-3 text-center">
      <div className="flex items-baseline justify-center gap-2">
        <span className="text-4xl font-bold text-wedding-brown">{confirmed}</span>
        <span className="text-xl text-muted-foreground">/ {invited}</span>
      </div>
      <p className="text-sm text-muted-foreground mt-1">Guests Confirmed ({rsvpRate.toFixed(0)}%)</p>
      <Link to="/dashboard/guests">
        <Button variant="outline" className="w-full mt-2">
          Manage Guest List
        </Button>
      </Link>
    </div>
  );
};

export default GuestSummary;
