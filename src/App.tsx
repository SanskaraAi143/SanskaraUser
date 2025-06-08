import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Index from './pages/Index';
import Dashboard from './pages/dashboard/Dashboard';
import ProfilePage from './pages/dashboard/ProfilePage';
import ChatPage from './pages/dashboard/ChatPage';
import TasksPage from './pages/dashboard/TasksPage';
import TimelinePage from './pages/dashboard/TimelinePage';
import MoodBoardPage from './pages/dashboard/MoodBoardPage';
import BudgetPage from './pages/dashboard/BudgetPage';
import GuestsPage from './pages/dashboard/GuestsPage';
import VendorsPage from './pages/dashboard/VendorsPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import NotFound from './pages/NotFound';
import MobileDashboardLayout from './layouts/MobileDashboardLayout';
import { Toaster } from './components/ui/toaster';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FloatingChatButton = () => {
  const navigate = useNavigate();
  return (
    <button
      className="fixed bottom-6 right-6 z-50 bg-gradient-primary text-white shadow-xl rounded-full p-4 flex items-center justify-center hover:scale-105 transition-all duration-300"
      onClick={() => navigate('/dashboard/chat')}
      aria-label="Chat with Sanskara AI"
    >
      <MessageCircle size={28} />
    </button>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
        <FloatingChatButton />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
