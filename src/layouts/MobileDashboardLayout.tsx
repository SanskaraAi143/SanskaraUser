import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import TopNavBar from "@/components/layout/TopNavBar";

const MobileDashboardLayout = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // While loading auth state, show a loading spinner
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-wedding-red border-t-transparent"></div>
      </div>
    );
  }

  // If not authenticated, redirect to home page
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If user hasn't started onboarding, redirect to onboarding page.
  // Allow dashboard access once a wedding_id exists (even if status is onboarding_in_progress)
  if (!user.wedding_id) {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  // If this is the invited partner and onboarding is still in progress, keep them in onboarding flow
  const details: any = user.wedding_details_json || {};
  const isInvitedPartner = user.role === 'invited_partner' || details?.other_partner_email_expected === user.email;
  if (isInvitedPartner && user.wedding_status === 'onboarding_in_progress') {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNavBar />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default MobileDashboardLayout;
