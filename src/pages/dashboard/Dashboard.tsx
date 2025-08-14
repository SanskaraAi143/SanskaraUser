import React, { Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { AnimatePresence } from "framer-motion";
import { useDashboardData } from "@/hooks/useDashboardData";
import DashboardWelcome from "@/components/dashboard/dashboard-sections/DashboardWelcome";
import DashboardOverviewCards from "@/components/dashboard/dashboard-sections/DashboardOverviewCards";
import DashboardUpcomingTasks from "@/components/dashboard/dashboard-sections/DashboardUpcomingTasks";
import DashboardUpcomingEvents from "@/components/dashboard/dashboard-sections/DashboardUpcomingEvents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BudgetSummary from '@/components/dashboard/summary-widgets/BudgetSummary';
import TaskSummary from '@/components/dashboard/summary-widgets/TaskSummary';
import GuestSummary from '@/components/dashboard/summary-widgets/GuestSummary';

const Dashboard = () => {
  const { user } = useAuth();
  const {
    profile,
    weddingDetails,
    loading,
    error,
    daysUntilWedding,
    confirmedGuests,
    invitedGuests,
    totalBudget,
    spentBudget,
    completedTasks,
    totalTasks,
    nextTasks,
    nextEvents,
  } = useDashboardData();

  if (loading) {
    return <div className="text-center py-10">Loading your dashboard...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-destructive">Error: {error}</div>;
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      <DashboardWelcome
        profile={profile}
        userName={user?.name}
        weddingDate={weddingDetails?.wedding_date}
        daysUntilWedding={daysUntilWedding}
      />

      <Suspense fallback={<div>Loading sections...</div>}>
        <div className="space-y-8">
          <DashboardOverviewCards
            daysUntilWedding={daysUntilWedding}
            weddingDate={weddingDetails?.wedding_date}
            confirmedGuests={confirmedGuests}
            invitedGuests={invitedGuests}
            spentBudget={spentBudget}
            totalBudget={totalBudget}
            completedTasks={completedTasks}
            totalTasks={totalTasks}
          />

          {/* New Analytical Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <Card>
              <CardHeader><CardTitle className="text-xl md:text-2xl">Budget Overview</CardTitle></CardHeader>
              <CardContent><BudgetSummary spent={spentBudget} total={totalBudget} /></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-xl md:text-2xl">Task Progress</CardTitle></CardHeader>
              <CardContent><TaskSummary completed={completedTasks} total={totalTasks} /></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-xl md:text-2xl">Guest List Summary</CardTitle></CardHeader>
              <CardContent><GuestSummary confirmed={confirmedGuests} invited={invitedGuests} /></CardContent>
            </Card>
          </div>

          {/* Upcoming Section */}
          <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-xl md:text-2xl">Upcoming Tasks</CardTitle></CardHeader>
              <CardContent><DashboardUpcomingTasks nextTasks={nextTasks} /></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-xl md:text-2xl">Upcoming Events</CardTitle></CardHeader>
              <CardContent><DashboardUpcomingEvents nextEvents={nextEvents} /></CardContent>
            </Card>
          </div>
        </div>
      </Suspense>
    </div>
  );
};

export default Dashboard;
