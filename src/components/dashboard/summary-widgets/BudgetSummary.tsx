import React from 'react';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface BudgetSummaryProps {
  spent: number;
  total: number;
}

const BudgetSummary: React.FC<BudgetSummaryProps> = ({ spent, total }) => {
  const percentage = total > 0 ? (spent / total) * 100 : 0;
  const formattedSpent = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(spent);
  const formattedTotal = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(total);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-2xl font-bold">{formattedSpent}</span>
          <span className="text-sm text-muted-foreground">/ {formattedTotal}</span>
        </div>
        <Progress value={percentage} />
      </div>
      <p className="text-sm text-muted-foreground">
        You have used {percentage.toFixed(0)}% of your budget.
      </p>
      <Link to="/dashboard/budget">
        <Button variant="outline" className="w-full">
          View Full Budget
        </Button>
      </Link>
    </div>
  );
};

export default BudgetSummary;
