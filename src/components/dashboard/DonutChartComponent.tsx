import React from 'react';
import * as RechartsPrimitive from 'recharts';
import { ChartTooltip } from '@/components/ui/chart';
import { Expense } from '@/services/api/budgetApi';

interface PieDataEntry {
  name: string;
  value: number;
  fill?: string; // Optional fill property
}

const DonutChartComponent = ({ budget, expenses, onCategoryClick }: { budget: number, expenses: Expense[], onCategoryClick: (category: string | null) => void }) => {
  const categoryTotals: { [category: string]: number } = {};
  expenses.forEach(e => {
    const actualAmount = e.actual_cost || e.estimated_cost || e.amount_paid;
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + actualAmount;
  });

  const totalSpent = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  const remainingBudget = Math.max(0, budget - totalSpent);

  const pieData: PieDataEntry[] = [ // Apply the new interface here
    ...Object.entries(categoryTotals).map(([cat, amt]) => ({ name: cat, value: amt })),
    { name: 'Remaining', value: remainingBudget, fill: '#d1d5db' } // Default color for remaining
  ];

  const COLORS = ['#6366f1', '#f59e42', '#10b981', '#f43f5e', '#eab308', '#3b82f6', '#a21caf', '#6ee7b7', '#f472b6', '#475569'];

  return (
    <div className="w-full flex justify-center py-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col md:flex-row items-center md:items-center px-4 md:px-8 py-8 gap-8 animate-fadein">
        <div className="flex items-center justify-center w-full relative">
          <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
            <RechartsPrimitive.PieChart>
              <RechartsPrimitive.Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60} // Donut chart inner radius
                outerRadius={95}
                fill="#8884d8"
                label={false}
                labelLine={false}
                minAngle={3}
              >
                {pieData.map((entry, idx) => (
                  <RechartsPrimitive.Cell key={`cell-${idx}`} fill={entry.fill || COLORS[idx % COLORS.length]} />
                ))}
              </RechartsPrimitive.Pie>
              <ChartTooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
            </RechartsPrimitive.PieChart>
          </RechartsPrimitive.ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <div className="text-sm text-gray-500">Total Spent</div>
            <div className="text-xl font-bold text-rose-600">₹{totalSpent.toLocaleString()}</div>
            <div className="text-sm text-gray-500 mt-2">Total Budget</div>
            <div className="text-lg font-bold text-green-700">₹{budget.toLocaleString()}</div>
          </div>
        </div>
        <div className="w-full md:w-auto flex flex-col gap-2 items-center md:items-start justify-center">
          {pieData.map((entry, idx) => (
            <div
              key={entry.name}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow border border-gray-200 min-w-[150px] transition-all duration-200 hover:bg-blue-50 hover:shadow-md cursor-pointer"
              style={{ fontSize: '1rem', fontWeight: 500 }}
              onClick={() => onCategoryClick(entry.name === 'Remaining' ? null : entry.name)} // Interactive legend
            >
              <span className="inline-block w-3.5 h-3.5 rounded-full" style={{ background: entry.fill || COLORS[idx % COLORS.length] }} />
              <span className="font-semibold text-gray-700 truncate max-w-[90px]" title={entry.name}>{entry.name.length > 14 ? entry.name.slice(0, 13) + '…' : entry.name}</span>
              <span className="text-gray-500 font-mono text-xs ml-1">₹{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes fadein { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        .animate-fadein { animation: fadein 0.7s cubic-bezier(.4,0,.2,1); }
      `}</style>
    </div>
  );
};

export default DonutChartComponent;