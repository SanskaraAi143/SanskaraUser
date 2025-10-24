import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";

const DashboardLayout = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // While loading auth state, show a loading spinner
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-wedding-cream via-white to-wedding-cream/80">
        <div className="glass-card p-8 rounded-full">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-wedding-gold border-t-transparent"></div>
        </div>
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Floating particles background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="floating-particles">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="particle opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 6 + 3}px`,
                height: `${Math.random() * 6 + 3}px`,
                animationDelay: `${Math.random() * 15}s`,
                animationDuration: `${Math.random() * 15 + 15}s`
              }}
            />
          ))}
        </div>
      </div>
 
      {/* Dashboard Layout */}
      <div className="flex flex-col">
        {/* Main Content */}
        <main className="flex-1 relative z-10 w-full">
          {/* Page Content */}
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
