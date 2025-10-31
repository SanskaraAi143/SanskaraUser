import React from 'react';

// Using simple placeholders for icons for now.
// In a real scenario, we'd use an icon library like react-icons or SVGs.
const PartnerIcon = () => <span>👥</span>;
const BudgetIcon = () => <span>💰</span>;
const TaskIcon = () => <span>📋</span>;

const FloatingIndicators: React.FC = () => {
  return (
    <div className="flex items-center space-x-4 p-2 bg-white bg-opacity-80 rounded-lg shadow-md">
      {/* Partner Activity Badge */}
      <div className="relative">
        <PartnerIcon />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
        </span>
      </div>

      {/* Budget Status Ring (Simplified) */}
      <div className="flex items-center space-x-1">
        <BudgetIcon />
        <span className="text-sm font-medium text-gray-700">68%</span>
      </div>

      {/* Task Counter */}
      <div className="flex items-center space-x-1">
        <TaskIcon />
        <span className="text-sm font-medium text-red-500">3 Due</span>
      </div>
    </div>
  );
};

export default FloatingIndicators;
