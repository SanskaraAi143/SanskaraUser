
import React from 'react';
import BudgetManager from '@/components/dashboard/BudgetManager';

const BudgetPage = () => {
  return (
    <div className="space-y-6">
      <div className="bg-wedding-maroon/5 rounded-xl p-6 border border-wedding-maroon/20">
        <h1 className="text-2xl  text-wedding-maroon mb-2">
          Wedding Budget
        </h1>
        <p className="text-gray-600">
          Manage your wedding expenses and keep track of your budget in one place.
        </p>
      </div>

      <BudgetManager />
    </div>
  );
};

export default BudgetPage;
