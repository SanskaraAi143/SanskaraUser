import React, { Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { AnimatePresence } from "framer-motion";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Import sections
import DashboardWelcome from "@/components/dashboard/dashboard-sections/DashboardWelcome";
import DashboardUpcomingTasks from "@/components/dashboard/dashboard-sections/DashboardUpcomingTasks";
import DashboardUpcomingEvents from "@/components/dashboard/dashboard-sections/DashboardUpcomingEvents";

// Import new summary widgets
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
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-20 w-1/2" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-destructive">Error: {error}</div>;
  }

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6">
      <DashboardWelcome
        profile={profile}
        userName={user?.name}
        weddingDate={weddingDetails?.wedding_date}
        daysUntilWedding={daysUntilWedding}
      />

      <Suspense fallback={<div className="text-center py-10">Loading dashboard widgets...</div>}>
        <div className="space-y-6 md:space-y-8">

          {/* Analytical Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BudgetSummary spent={spentBudget} total={totalBudget} />
            <TaskSummary completed={completedTasks} total={totalTasks} />
            <GuestSummary confirmed={confirmedGuests} invited={invitedGuests} />
          </div>

          {/* New Analytical Elements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
             <Card>
                <CardHeader><CardTitle className="text-lg font-semibold">Vendor Status</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">A chart showing vendors by status (booked, contacted, etc.) will be here.</p>
                </CardContent>
             </Card>
             <Card>
                <CardHeader><CardTitle className="text-lg font-semibold">Upcoming Payments</CardTitle></CardHeader>
                <CardContent>
                   <p className="text-muted-foreground">A list of the next due payments from your budget will appear here.</p>
                </CardContent>
             </Card>
          </div>

          {/* Upcoming Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Next Important Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <DashboardUpcomingTasks nextTasks={nextTasks} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Upcoming Timeline Events</CardTitle>
              </CardHeader>
              <CardContent>
                <DashboardUpcomingEvents nextEvents={nextEvents} />
              </CardContent>
            </Card>
          </div>

        </div>
      </Suspense>
    </div>
  );
};

export default Dashboard;
