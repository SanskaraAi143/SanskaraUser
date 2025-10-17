import React from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { format } from 'date-fns';

const PlanningContextSidebar: React.FC = () => {
  const { weddingDetails, loading, error } = useDashboardData();

  if (loading) {
    return (
      <div className="flex-[1] bg-futuristic-container-bg border-r border-futuristic-border p-4 flex items-center justify-center">
        <p className="text-futuristic-text-secondary">Loading context...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-[1] bg-futuristic-container-bg border-r border-futuristic-border p-4 flex items-center justify-center">
        <p className="text-red-500">Error loading context.</p>
      </div>
    );
  }

  const weddingDate = weddingDetails?.wedding_date ? format(new Date(weddingDetails.wedding_date), 'PPP') : 'N/A';
  const weddingLocation = weddingDetails?.wedding_location || 'N/A';
  const totalBudget = weddingDetails?.total_budget !== undefined && weddingDetails.total_budget !== null ? `₹${weddingDetails.total_budget.toLocaleString()}` : 'N/A';

  return (
    <div className="flex-[1] bg-futuristic-container-bg border-r border-futuristic-border p-4">
      <h3 className="text-lg font-semibold mb-4">Planning Context</h3>
      <div className="space-y-2 text-sm text-futuristic-text-secondary">
        <p><strong>Wedding Date:</strong> {weddingDate}</p>
        <p><strong>Location:</strong> {weddingLocation}</p>
        <p><strong>Budget:</strong> {totalBudget}</p>
      </div>
    </div>
  );
};

export default PlanningContextSidebar;