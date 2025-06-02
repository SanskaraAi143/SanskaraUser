import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
  CalendarDays, 
  Users, 
  Clock, 
  Settings, 
  LayoutDashboard, 
  FileText, 
  ShoppingCart,
  User,
  LogOut,
  MessageCircle,
  PieChart,
  Paintbrush,
  CheckSquare,
  Linkedin,
  Instagram,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import UserProfileDropdown from "@/components/auth/UserProfileDropdown";

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

  const sidebarLinks = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Profile", icon: User, href: "/dashboard/profile" },
    { name: "Chat with AI", icon: MessageCircle, href: "/dashboard/chat" },
    { name: "Tasks", icon: CheckSquare, href: "/dashboard/tasks" },
    { name: "Timeline", icon: CalendarDays, href: "/dashboard/timeline" },
    { name: "Mood Board", icon: Paintbrush, href: "/dashboard/moodboard" },
    { name: "Budget", icon: PieChart, href: "/dashboard/budget" },
    { name: "Guest List", icon: Users, href: "/dashboard/guests" },
    { name: "Vendors", icon: ShoppingCart, href: "/dashboard/vendors" },
    { name: "Settings", icon: Settings, href: "/dashboard/settings" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-wedding-cream via-white to-wedding-cream/80">
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
      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 w-64 bg-[#fffbe7] border-r border-[#ffd700]/30 shadow-lg flex flex-col justify-between z-30">
          <div className="p-6">
            <Link to="/" className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 flex items-center justify-center bg-gradient-to-br from-[#ffd700] to-[#ffecb3] rounded-full shadow-lg">
                <img
                  src="/WhatsApp%20Image%202025-05-26%20at%206.40.58%20PM.jpeg"
                  alt="Site Logo"
                  className="h-8 w-8 object-contain rounded-full"
                />
              </div>
              <span className="text-xl font-playfair font-semibold" style={{color:'#ff8f00'}}>
                Sanskara<span style={{color:'#8d6e63'}}>AI</span>
              </span>
            </Link>
            <nav className="space-y-1">
              {sidebarLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-lg ${isActive ? 'bg-gradient-to-r from-[#ffd700] to-[#ffecb3] text-[#8d6e63] shadow-lg' : 'text-[#8d6e63] hover:bg-[#fffde7]'}`}
                  >
                    <link.icon size={20} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="px-6 py-4">
            <Button className="w-full py-3 rounded-xl bg-gradient-to-r from-[#ffd700] to-[#ff8f00] text-white font-semibold text-lg shadow-lg hover:scale-105 transition-transform duration-200">
              Ask AI
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64">
          {/* Header */}
          <header className="glass-card border-b border-wedding-gold/20 sticky top-0 z-50">
            <div className="px-8 py-4 flex items-center justify-between">
              <h1 className="text-2xl font-playfair font-semibold title-gradient">
                {sidebarLinks.find(link => link.href === location.pathname)?.name || 'Dashboard'}
              </h1>
              <UserProfileDropdown />
            </div>
          </header>

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
