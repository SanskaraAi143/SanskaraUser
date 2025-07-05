import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from './components/ui/toaster';
import { ErrorBoundary } from './components/ErrorBoundary';
import GDPRCompliance from './components/GDPRCompliance';
import PageLoader from './components/ui/PageLoader';
import FloatingChatButton from './components/ui/FloatingChatButton';

// Layouts - Keep eager for critical path
import MobileDashboardLayout from './layouts/MobileDashboardLayout';

// Core Pages - High priority
const Index = lazy(() => import('./pages/Index'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage'));
const GetStartedPage = lazy(() => import('./pages/GetStartedPage'));

// Dashboard Pages - Group into one chunk
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const ProfilePage = lazy(() => import('./pages/dashboard/ProfilePage'));
const ChatPage = lazy(() => import('./pages/dashboard/ChatPage'));
const TasksPage = lazy(() => import('./pages/dashboard/TasksPage'));
const TimelinePage = lazy(() => import('./pages/dashboard/TimelinePage'));
const MoodBoardPage = lazy(() => import('./pages/dashboard/MoodBoardPage'));
const BudgetPage = lazy(() => import('./pages/dashboard/BudgetPage'));
const GuestsPage = lazy(() => import('./pages/dashboard/GuestsPage'));
const VendorsPage = lazy(() => import('./pages/dashboard/VendorsPage'));
const SettingsPage = lazy(() => import('./pages/dashboard/SettingsPage'));
const RitualsPage = lazy(() => import('./pages/dashboard/RitualsPage'));

// Blog Pages
const BlogListPage = lazy(() => import('./pages/blog/index'));
const BlogDetailPage = lazy(() => import('./pages/blog/[slug]'));

// Support/Contact Pages
const CareersPage = lazy(() => import('./pages/CareersPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage'));

// Utility Pages - Lower priority
const NotFound = lazy(() => import('./pages/NotFound'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const RitualGuidePage = lazy(() => import('./pages/RitualGuidePage'));

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AuthProvider>
        <ErrorBoundary>
          <div className="app-container">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
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
                <Route path="/dashboard" element={<MobileDashboardLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="chat" element={<ChatPage />} />
                  <Route path="tasks" element={<TasksPage />} />
                  <Route path="timeline" element={<TimelinePage />} />
                  <Route path="moodboard" element={<MoodBoardPage />} />
                  <Route path="budget" element={<BudgetPage />} />
                  <Route path="guests" element={<GuestsPage />} />
                  <Route path="vendors" element={<VendorsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="rituals" element={<RitualsPage />} />
                </Route>
                <Route path="/blog" element={<BlogListPage />} />
                <Route path="/blog/:slug" element={<BlogDetailPage />} />
                <Route path="/careers" element={<CareersPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/cookie-policy" element={<CookiePolicyPage />} />
                <Route path="/cookies" element={<CookiePolicyPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <Toaster />
            <FloatingChatButton />
            <GDPRCompliance />
          </div>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
