import React, { Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
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
import VendorStatusSummary from '@/components/dashboard/summary-widgets/VendorStatusSummary';
import UpcomingPayments from '@/components/dashboard/summary-widgets/UpcomingPayments';
import OnboardingSummary from '@/components/dashboard/summary-widgets/OnboardingSummary';


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
      {/* Waiting for partner banner for initiator during onboarding_in_progress */}
      {user?.wedding_status === 'onboarding_in_progress' && (() => {
        const details: any = weddingDetails?.details || user?.wedding_details_json || {};
        const partnerData = details?.partner_data || {};
        const isInitiator = user?.email ? !!partnerData[user.email] : false;
        if (!isInitiator) return null;
        const invitedEmail = details?.other_partner_email_expected;
        return (
          <div className="rounded-lg border border-amber-200 bg-amber-50 text-amber-900 p-4">
            <div className="font-medium">Waiting for your partner to finish onboarding</div>
            <div className="text-sm mt-1">{invitedEmail ? `We emailed ${invitedEmail}. Some collaborative features will unlock after they join.` : 'Some collaborative features will unlock after your partner joins.'}</div>
          </div>
        );
      })()}

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
            <BudgetSummary
              spent={spentBudget}
              total={totalBudget}
              currency={(weddingDetails?.details && (() => {
                const d: any = weddingDetails?.details;
                const hints = `${d?.budget_total || ''}${d?.total_budget || ''}${d?.budget || ''}${d?.estimated_budget || ''}${JSON.stringify(d?.partner_data || {})}`.toLowerCase();
                return hints.includes('l') || hints.includes('cr') || hints.includes('crore') || hints.includes('lakh') ? 'INR' : 'USD';
              })()) || 'USD'}
            />
            <TaskSummary completed={completedTasks} total={totalTasks} />
            <GuestSummary confirmed={confirmedGuests} invited={invitedGuests} />
          </div>

          {/* Onboarding data from single source of truth */}
          <OnboardingSummary
            details={weddingDetails?.details}
            weddingName={weddingDetails?.wedding_name}
            weddingDate={weddingDetails?.wedding_date}
            weddingLocation={weddingDetails?.wedding_location}
            weddingTradition={weddingDetails?.wedding_tradition}
            weddingStyle={weddingDetails?.wedding_style}
          />

          {/* New Analytical Elements */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <VendorStatusSummary />
            <UpcomingPayments />
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
