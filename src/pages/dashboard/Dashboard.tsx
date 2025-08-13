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

const Dashboard = () => {
  const { user } = useAuth();
  // const [activeTab, setActiveTab] = useState("overview"); // No longer needed

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
    <div className="space-y-8">
      <DashboardWelcome
        profile={profile}
        userName={user?.name}
        weddingDate={weddingDetails?.wedding_date}
        daysUntilWedding={daysUntilWedding}
      />

      {/* All content is now in a single, scrollable view */}
      <Suspense fallback={<div className="animate-pulse text-center text-gray-400">Loading dashboard sections...</div>}>
        <AnimatePresence>
          {/* Overview Cards */}
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

          {/* Upcoming Tasks and Events */}
          <div key="dashboard-upcoming-section" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <DashboardUpcomingTasks nextTasks={nextTasks} />
            <DashboardUpcomingEvents nextEvents={nextEvents} />
          </div>

          {/* Notifications and AI Assistant */}
          <div key="dashboard-utility-section" className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <DashboardNotifications />
            <DashboardAIAssistant />
          </div>

          {/* Formerly Tabbed Content, now as sections */}
          <div key="task-tracker-section" className="pt-6">
             <h2 className="text-2xl font-semibold mb-4">Task Tracker</h2>
             <TaskTracker />
          </div>

          <div key="timeline-section" className="pt-6">
            <h2 className="text-2xl font-semibold mb-4">Wedding Timeline</h2>
            <TimelineCreator />
          </div>

          <div key="budget-section" className="pt-6">
            <h2 className="text-2xl font-semibold mb-4">Budget Manager</h2>
            <BudgetManager />
          </div>

          <div key="moodboard-section" className="pt-6">
            <h2 className="text-2xl font-semibold mb-4">Mood Board</h2>
            <MoodBoard />
          </div>

        </AnimatePresence>
      </Suspense>
    </div>
  );
};

export default Dashboard;
