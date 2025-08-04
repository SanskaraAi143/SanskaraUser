import React, { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
  CalendarDays, 
  Users, 
  Settings, 
  LayoutDashboard, 
  User,
  MessageCircle,
  PieChart,
  Paintbrush,
  CheckSquare,
  ShoppingCart,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import UserProfileDropdown from "@/components/auth/UserProfileDropdown";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const MobileDashboardLayout = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  
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

  // If user hasn't completed onboarding, redirect to onboarding page
  if (!user.wedding_id || user.wedding_status !== 'active') {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
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

  const getCurrentPageTitle = () => {
    return sidebarLinks.find((link) => link.href === location.pathname)?.name || "Dashboard";
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-30 md:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex h-16 items-center justify-between border-b px-4">
                  <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                    <img 
                      src="/lovable-uploads/82e13d9f-7faf-4d65-8c82-2be524f85cf7.webp" 
                      alt="Sanskara AI Logo" 
                      className="h-8 w-8 object-contain"
                    />            <h1 className="text-lg font-playfair font-semibold text-wedding-maroon">
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
                        onClick={() => setOpen(false)}
                      >
                        <link.icon className={`mr-3 h-5 w-5 ${isActive ? "text-wedding-red" : "text-gray-500"}`} />
                        {link.name}
                      </Link>
                    );
                  })}
                </nav>
                <div className="border-t p-4">
                  <Button 
                    variant="outline" 
                    className="w-full text-wedding-red border-wedding-red hover:bg-wedding-red/10"
                    asChild
                  >
                    <Link to="/dashboard/chat" onClick={() => setOpen(false)}>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Ask AI
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <Link to="/" className="flex items-center ml-4">
              <img 
                src="/lovable-uploads/82e13d9f-7faf-4d65-8c82-2be524f85cf7.webp" 
                alt="Sanskara AI Logo" 
                className="h-8 w-8 object-contain"
              />              <h2 className="ml-2 text-lg font-playfair font-semibold text-wedding-maroon">
                Sanskara<span className="text-wedding-red">AI</span>
              </h2>
            </Link>
          </div>
          <UserProfileDropdown />
        </div>
        <div className="px-4 py-2 border-t flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-700">{getCurrentPageTitle()}</h3>
          <Button
            variant="outline"
            size="sm"
            className="text-wedding-red border-wedding-red hover:bg-wedding-red/10"
            asChild
          >
            <Link to="/dashboard/chat">
              <MessageCircle className="mr-1 h-4 w-4" />
              Ask AI
            </Link>
          </Button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 flex-col border-r bg-[#fffbe7] border-[#ffd700]/30 min-h-screen shadow-lg">
        <div className="flex h-16 items-center justify-between border-b px-4 bg-gradient-to-br from-[#ffd700] to-[#ffecb3]">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/logo.jpeg" 
              alt="SanskaraAI Logo" 
              className="h-10 w-10 object-contain"
            />            <h2 className="text-lg font-playfair font-semibold" style={{color:'#ff8f00'}}>
              Sanskara<span style={{color:'#8d6e63'}}>AI</span>
            </h2>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-2 py-4">
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
        <div className="px-4 py-4">          <Button className="w-full py-3 rounded-xl bg-gradient-to-r from-[#ffd700] to-[#ff8f00] text-white font-semibold text-lg shadow-lg hover:scale-105 transition-transform duration-200" asChild>
            <Link to="/dashboard/chat">Ask AI</Link>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Desktop Header */}
        <header className="hidden md:block bg-white shadow-sm z-10">
          <div className="flex h-16 items-center justify-between px-4">            <h3 className="text-lg font-semibold text-gray-700">
              {getCurrentPageTitle()}
            </h3>
            <Button
              variant="outline"
              size="sm"
              className="text-wedding-red border-wedding-red hover:bg-wedding-red/10"
              asChild
            >
              <Link to="/dashboard/chat">
                <MessageCircle className="mr-1 h-4 w-4" />
                Ask AI
              </Link>
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4 md:py-6 md:px-8 mt-28 md:mt-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MobileDashboardLayout;
