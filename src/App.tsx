
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import ProfilePage from "./pages/dashboard/ProfilePage";
import ChatPage from "./pages/dashboard/ChatPage";
import TasksPage from "./pages/dashboard/TasksPage";
import TimelinePage from "./pages/dashboard/TimelinePage";
import MoodBoardPage from "./pages/dashboard/MoodBoardPage";
import BudgetPage from "./pages/dashboard/BudgetPage";

const App = () => {
  // Create a new QueryClient instance inside the component
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              
              {/* Dashboard Routes */}
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="tasks" element={<TasksPage />} />
                <Route path="timeline" element={<TimelinePage />} />
                <Route path="moodboard" element={<MoodBoardPage />} />
                <Route path="budget" element={<BudgetPage />} />
                <Route path="rituals" element={<Dashboard />} />
                <Route path="guests" element={<Dashboard />} />
                <Route path="checklist" element={<Dashboard />} />
                <Route path="vendors" element={<Dashboard />} />
                <Route path="settings" element={<Dashboard />} />
              </Route>
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
