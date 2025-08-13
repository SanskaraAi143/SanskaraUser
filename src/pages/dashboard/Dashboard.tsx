import React, { Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import TaskTracker from "@/components/dashboard/TaskTracker";
import TimelineCreator from "@/components/dashboard/TimelineCreator";
import MoodBoard from "@/components/dashboard/MoodBoard";
import BudgetManager from "@/components/dashboard/BudgetManager";
import { AnimatePresence } from "framer-motion";
import { useDashboardData } from "@/hooks/useDashboardData";

// Import the new sub-components
import DashboardWelcome from "@/components/dashboard/dashboard-sections/DashboardWelcome";
import DashboardOverviewCards from "@/components/dashboard/dashboard-sections/DashboardOverviewCards";
import DashboardUpcomingTasks from "@/components/dashboard/dashboard-sections/DashboardUpcomingTasks";
import DashboardUpcomingEvents from "@/components/dashboard/dashboard-sections/DashboardUpcomingEvents";
import DashboardNotifications from "@/components/dashboard/dashboard-sections/DashboardNotifications";
import DashboardAIAssistant from "@/components/dashboard/dashboard-sections/DashboardAIAssistant";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    // You can replace this with a more sophisticated skeleton loader
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
        <AnimatePresence>
          <div className="space-y-8">
            {/* Overview Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-lora">At a Glance</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            {/* Upcoming Section */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-lora">Upcoming Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <DashboardUpcomingTasks nextTasks={nextTasks} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-lora">Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <DashboardUpcomingEvents nextEvents={nextEvents} />
                </CardContent>
              </Card>
            </div>

            {/* Full Width Sections, previously tabs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-lora">Task Tracker</CardTitle>
              </CardHeader>
              <CardContent>
                <TaskTracker />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-lora">Wedding Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <TimelineCreator />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-lora">Budget Manager</CardTitle>
              </CardHeader>
              <CardContent>
                <BudgetManager />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-lora">Mood Board</CardTitle>
              </CardHeader>
              <CardContent>
                <MoodBoard />
              </CardContent>
            </Card>

            {/* AI and Notifications */}
             <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardHeader><CardTitle className="text-xl font-lora">Notifications</CardTitle></CardHeader>
                    <CardContent><DashboardNotifications /></CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardHeader><CardTitle className="text-xl font-lora">AI Assistant</CardTitle></CardHeader>
                    <CardContent><DashboardAIAssistant /></CardContent>
                </Card>
            </div>

          </div>
        </AnimatePresence>
      </Suspense>
    </div>
  );
};

export default Dashboard;
