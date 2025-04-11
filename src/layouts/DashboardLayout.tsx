
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
  Heart, 
  User,
  LogOut 
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
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-wedding-red border-t-transparent"></div>
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
    { name: "Rituals", icon: Heart, href: "/dashboard/rituals" },
    { name: "Timeline", icon: CalendarDays, href: "/dashboard/timeline" },
    { name: "Guest List", icon: Users, href: "/dashboard/guests" },
    { name: "Checklist", icon: FileText, href: "/dashboard/checklist" },
    { name: "Budget", icon: ShoppingCart, href: "/dashboard/budget" },
    { name: "Vendors", icon: Clock, href: "/dashboard/vendors" },
    { name: "Settings", icon: Settings, href: "/dashboard/settings" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 flex-col border-r bg-white">
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/7d1ca230-11c7-4edb-9419-d5847fd86028.png" 
              alt="Ganesha Logo" 
              className="h-10 w-10"
            />
            <h1 className="text-lg font-playfair font-semibold text-wedding-maroon">
              Sanskara<span className="text-wedding-red">AI</span>
            </h1>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-2 py-4">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.name}
                to={link.href}
                className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-wedding-red/10 text-wedding-red"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <link.icon className={`mr-3 h-5 w-5 ${isActive ? "text-wedding-red" : "text-gray-500"}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <UserProfileDropdown />
            </div>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Topbar */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center md:hidden">
              <Link to="/dashboard" className="flex items-center">
                <img 
                  src="/lovable-uploads/7d1ca230-11c7-4edb-9419-d5847fd86028.png" 
                  alt="Ganesha Logo" 
                  className="h-8 w-8"
                />
                <h1 className="ml-2 text-lg font-playfair font-semibold text-wedding-maroon">
                  Sanskara<span className="text-wedding-red">AI</span>
                </h1>
              </Link>
            </div>
            <div className="hidden md:block">
              <h2 className="text-lg font-semibold text-gray-700">
                {sidebarLinks.find((link) => link.href === location.pathname)?.name || "Dashboard"}
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="text-wedding-red border-wedding-red hover:bg-wedding-red/10"
              >
                <Heart className="mr-1 h-4 w-4" />
                New Ritual
              </Button>
              <div className="md:hidden">
                <UserProfileDropdown />
              </div>
            </div>
          </div>
          {/* Mobile Navigation */}
          <div className="flex overflow-x-auto border-t md:hidden">
            <nav className="flex space-x-4 px-4 py-2">
              {sidebarLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`flex flex-col items-center py-1 px-3 rounded-md ${
                      isActive
                        ? "bg-wedding-red/10 text-wedding-red"
                        : "text-gray-600"
                    }`}
                  >
                    <link.icon className="h-5 w-5" />
                    <span className="text-xs mt-1">{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
