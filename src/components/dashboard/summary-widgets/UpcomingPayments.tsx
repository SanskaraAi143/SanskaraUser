import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const UpcomingPayments = () => {
  const { expenses } = useDashboardData();

  // Assuming expenses have a 'dueDate' and are not yet 'Paid'
  const upcoming = expenses
    .filter(e => e.status !== 'Paid' && e.dueDate)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Upcoming Payments</CardTitle>
      </CardHeader>
      <CardContent>
        {upcoming.length > 0 ? (
          <ul className="space-y-3">
            {upcoming.map(expense => (
              <li key={expense.item_id} className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{expense.item_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Due: {new Date(expense.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <p className="font-semibold">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(expense.amount)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">No upcoming payments found.</p>
        )}
        <Link to="/dashboard/budget">
            <Button variant="outline" className="w-full mt-4">
            View Full Budget
            </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default UpcomingPayments;
