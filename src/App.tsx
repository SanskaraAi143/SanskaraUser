import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import { ErrorBoundary } from './components/ErrorBoundary';
import PageLoader from './components/ui/PageLoader';
import FloatingChatButton from './components/ui/FloatingChatButton';
import { useToast } from './hooks/use-toast';
import { logError } from './utils/errorLogger';
import { useAuth } from './context/AuthContext';
import { useIsMobile } from './hooks/use-mobile';
import Navbar from './components/Navbar'; // Import Navbar

// Layouts - Keep eager for critical path
import DashboardLayout from './layouts/DashboardLayout';

// Core Pages - High priority
const Index = lazy(() => import('./pages/Index'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage'));
const GetStartedPage = lazy(() => import('./pages/GetStartedPage'));

// Dashboard Pages - Group into one chunk
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const ProfilePage = lazy(() => import('./pages/dashboard/ProfilePage'));
const FuturisticChatPage = lazy(() => import('./pages/FuturisticChatPage'));
const TasksPage = lazy(() => import('./pages/dashboard/TasksPage'));
const TimelinePage = lazy(() => import('./pages/dashboard/TimelinePage'));
const MoodBoardPage = lazy(() => import('./pages/dashboard/MoodBoardPage'));
const BudgetPage = lazy(() => import('./pages/dashboard/BudgetPage'));
const GuestsPage = lazy(() => import('./pages/dashboard/GuestsPage'));
const VendorsPage = lazy(() => import('./pages/dashboard/VendorsPage'));
const SettingsPage = lazy(() => import('./pages/dashboard/SettingsPage'));
// const HistoryPage = lazy(() => import('@/pages/dashboard/HistoryPage')); // This file does not exist
const RitualsPage = lazy(() => import('./pages/dashboard/RitualsPage'));

// Blog Pages
const BlogListPage = lazy(() => import('./pages/blog/index'));
const BlogDetailPage = lazy(() => import('./pages/blog/[slug]'));

// Support/Contact Pages
const CareersPage = lazy(() => import('./pages/CareersPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
// Cookie policy removed

// Utility Pages - Lower priority
const NotFound = lazy(() => import('./pages/NotFound'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const RitualGuidePage = lazy(() => import('./pages/RitualGuidePage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const VirtualVenuePage = lazy(() => import('./pages/VirtualVenuePage'));
const AiPlannerPage = lazy(() => import('./pages/AiPlannerPage'));

const ConditionalFloatingChatButton = () => {
  const location = useLocation();
  // Do not show the button on the new futuristic chat page
  if (location.pathname === '/chat' || location.pathname.startsWith('/dashboard/new-chat')) {
    return null;
  }
  return <FloatingChatButton />;
};


function App() {
  const { toast } = useToast();
  const { loading } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleOffline = () => {
      toast({
        title: "No Internet Connection",
        description: "It looks like you're offline. Some features may not be available.",
        variant: "destructive",
        duration: 5000,
      });
      logError(new Error("Network offline"), { type: "network" });
    };

    const handleOnline = () => {
      toast({
        title: "Back Online",
        description: "Your internet connection has been restored.",
        variant: "default",
        duration: 3000,
      });
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [toast]);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
        <ErrorBoundary>
          <div className="app-container"> {/* Removed padding-top for full-screen chat */}
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/chat" element={<FuturisticChatPage />} /> {/* Move chat route here to exclude Navbar */}
                <Route path="/ai-planner" element={<AiPlannerPage />} />
                <Route path="/dashboard/new-chat" element={<FuturisticChatPash />} /> {/* Also exclude Navbar for dashboard new-chat */}
                <Route path="*" element={<NavbarRoutes />} /> {/* New component to wrap routes that need Navbar */}
              </Routes>
            </Suspense>
            <Toaster />
            <ConditionalFloatingChatButton />
          </div>
        </ErrorBoundary>
    </BrowserRouter>
  );
}

// New component to render routes that require the Navbar
const NavbarRoutes = () => {
  const location = useLocation();
  const isChatRoute = location.pathname === '/chat' || location.pathname.startsWith('/dashboard/new-chat');

  // Logic to determine if BetaNotice is visible (placeholder for now)
  const isBetaNoticeVisible = false; // Replace with actual logic if BetaNotice is dynamic

  return (
    <>
      {!isChatRoute && <Navbar isBetaNoticeVisible={isBetaNoticeVisible} />}
      <div className={!isChatRoute ? "pt-20" : ""}> {/* Apply padding only if Navbar is present */}
        <Routes>
          <Route path="/about" element={<AboutPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/get-started" element={<GetStartedPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />
          <Route path="/signin" element={<AuthPage />} />
          <Route path="/ritual-guide" element={<RitualGuidePage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/virtual-venue" element={<VirtualVenuePage />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="timeline" element={<TimelinePage />} />
            <Route path="moodboard" element={<MoodBoardPage />} />
            <Route path="budget" element={<BudgetPage />} />
            <Route path="guests" element={<GuestsPage />} />
            <Route path="vendors" element={<VendorsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="rituals" element={<RitualsPage />} />
            {/* <Route path="history" element={<HistoryPage />} /> */}
          </Route>
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/contact" element={<ContactPage />} />
          {/** Cookie policy routes removed **/}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
};

export default App;