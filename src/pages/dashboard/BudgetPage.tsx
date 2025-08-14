import React from 'react';
import BudgetManager from '@/components/dashboard/BudgetManager';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const BudgetPage = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Wedding Budget</CardTitle>
          <CardDescription>
            Manage your wedding expenses and keep track of your budget in one place.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BudgetManager />
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetPage;
