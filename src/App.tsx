import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from './components/ui/toaster';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// import MobileDashboardLayout from './layouts/MobileDashboardLayout'; // Eagerly load layout for dashboard

// Page Components - Lazy Loaded
const Index = lazy(() => import('./pages/Index'));
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
const NotFound = lazy(() => import('./pages/NotFound'));
const BlogListPage = lazy(() => import('./pages/blog/index'));
const BlogDetailPage = lazy(() => import('./pages/blog/[slug]'));
const FAQPage = lazy(() => import('./pages/FAQPage'));

// Layouts - Eagerly load common layouts if they are small or contain fallbacks
import MobileDashboardLayout from './layouts/MobileDashboardLayout';

// Import the shared FloatingChatButton
import FloatingChatButton from './components/ui/FloatingChatButton';
// MessageCircle and useNavigate are no longer directly needed here for FloatingChatButton

// Use the new PageLoader component
import PageLoader from './components/ui/PageLoader';


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/faq" element={<FAQPage />} />
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
            </Route>
            <Route path="/blog" element={<BlogListPage />} />
            <Route path="/blog/:slug" element={<BlogDetailPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Toaster />
        <FloatingChatButton />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
