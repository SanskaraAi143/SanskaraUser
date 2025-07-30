import React, { useState, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

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
    return <div className="text-center py-10 text-gray-400">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <DashboardWelcome
        profile={profile}
        userName={user?.name}
        weddingDate={weddingDetails?.wedding_date}
        daysUntilWedding={daysUntilWedding}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="moodboard">Mood Board</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6 pt-4">
          <Suspense fallback={<div className="animate-pulse text-center text-gray-400">Loading dashboard...</div>}>
            <AnimatePresence>
              <DashboardOverviewCards
                key="dashboard-overview-cards"
                daysUntilWedding={daysUntilWedding}
                weddingDate={weddingDetails?.wedding_date}
                confirmedGuests={confirmedGuests}
                invitedGuests={invitedGuests}
                spentBudget={spentBudget}
                totalBudget={totalBudget}
                completedTasks={completedTasks}
                totalTasks={totalTasks}
              />

              <div key="dashboard-upcoming-section" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <DashboardUpcomingTasks nextTasks={nextTasks} />
                <DashboardUpcomingEvents nextEvents={nextEvents} />
              </div>

              <div key="dashboard-utility-section" className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <DashboardNotifications />
                <DashboardAIAssistant />
              </div>
            </AnimatePresence>
          </Suspense>
        </TabsContent>
        <TabsContent value="tasks" className="pt-4">
          <TaskTracker />
        </TabsContent>
        <TabsContent value="timeline" className="pt-4">
          <TimelineCreator />
        </TabsContent>
        <TabsContent value="moodboard" className="pt-4">
          <MoodBoard />
        </TabsContent>
        <TabsContent value="budget" className="pt-4">
          <BudgetManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
