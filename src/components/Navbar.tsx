import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MenuIcon, LogIn, LayoutDashboard, User, MessageSquare, CheckSquare, Calendar, Image, DollarSign, Users, Briefcase, Settings, Clock } from 'lucide-react'; // Added icons for dashboard links
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import UserProfileDropdown from "@/components/auth/UserProfileDropdown";
import { Link, useNavigate } from "react-router-dom";
import AuthActionButton from '@/components/auth/AuthActionButton';
import DashboardDropdown from './DashboardDropdown'; // Import the new component

interface NavbarProps {
  isBetaNoticeVisible: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isBetaNoticeVisible }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { href: "/about", label: "About" },
    { href: "/features", label: "Features" },
    { href: "/blog", label: "Blog" },
    { href: "/pricing", label: "Pricing" },
  ];

  const dashboardLinks = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Profile", icon: User, href: "/dashboard/profile" },
    { name: "Tasks", icon: CheckSquare, href: "/dashboard/tasks" },
    { name: "Timeline", icon: Calendar, href: "/dashboard/timeline" },
    { name: "Mood Board", icon: Image, href: "/dashboard/moodboard" },
    { name: "Budget", icon: DollarSign, href: "/dashboard/budget" },
    { name: "Guest List", icon: Users, href: "/dashboard/guests" },
    { name: "Vendors", icon: Briefcase, href: "/dashboard/vendors" },
    { name: "History", icon: Clock, href: "/dashboard/history" },
    { name: "Settings", icon: Settings, href: "/dashboard/settings" },
  ];

  return (
    <nav className={`fixed left-0 right-0 z-50 bg-wedding-cream/80 backdrop-blur-sm border-b border-wedding-gold/20 transition-all duration-300 ${isBetaNoticeVisible ? 'top-20' : 'top-0'}`}>
      <div className="container mx-auto flex justify-between items-center h-20 px-4">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.jpeg" alt="Sanskara AI Logo" className="h-10 w-10 object-contain rounded-full" />
          <span className="text-2xl font-lora font-bold text-wedding-brown">
            Sanskara<span className="text-wedding-gold">AI</span>
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          {user && <DashboardDropdown />} {/* Dashboard dropdown as the first item */}
          {user && (
            <Link
              to="/chat"
              className={`text-sm font-semibold transition-colors ${location.pathname === '/chat' ? 'text-wedding-gold' : 'text-wedding-brown hover:text-wedding-gold'}`}
            >
              Chat with AI
            </Link>
          )}
          {navLinks.map(link => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-semibold transition-colors ${isActive ? 'text-wedding-gold' : 'text-wedding-brown hover:text-wedding-gold'}`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        
        <div className="flex items-center gap-2">
          {user ? (
            <UserProfileDropdown />
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/auth?mode=signin">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
              <Button asChild>
                <Link to="/auth?mode=signup">Get Started</Link>
              </Button>
            </div>
          )}
          
          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <MenuIcon />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-wedding-cream">
              <div className="flex flex-col h-full py-6">
                <nav className="flex flex-col space-y-4">
                  {navLinks.map(link => {
                    const isActive = location.pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        to={link.href}
                        className={`text-lg font-semibold transition-colors ${isActive ? 'text-wedding-gold' : 'text-wedding-brown hover:text-wedding-gold'}`}
                        onClick={() => setIsOpen(false)}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                  {user && (
                    <Link
                      to="/chat"
                      className={`flex items-center gap-2 px-4 py-2 text-lg font-semibold transition-colors ${location.pathname === '/chat' ? 'text-wedding-gold' : 'text-wedding-brown hover:text-wedding-gold'}`}
                      onClick={() => setIsOpen(false)}
                    >
                      <MessageSquare className="h-5 w-5" />
                      Chat with AI
                    </Link>
                  )}
                  {user && (
                    <>
                      <h3 className="px-4 pt-4 text-xs font-semibold uppercase text-gray-500 tracking-wider">Dashboard</h3>
                      {dashboardLinks.map(link => {
                        const isActive = location.pathname === link.href;
                        return (
                          <Link
                            key={link.href}
                            to={link.href}
                            className={`flex items-center gap-2 px-4 py-2 text-lg font-semibold transition-colors ${isActive ? 'text-wedding-gold' : 'text-wedding-brown hover:text-wedding-gold'}`}
                            onClick={() => setIsOpen(false)}
                          >
                            <link.icon className="h-5 w-5" />
                            {link.name}
                          </Link>
                        );
                      })}
                    </>
                  )}
                </nav>
                <div className="mt-auto space-y-4">
                  {user ? (
                     <UserProfileDropdown />
                  ) : (
                    <>
                      <Button variant="outline" className="w-full" asChild onClick={() => setIsOpen(false)}>
                        <Link to="/auth?mode=signin">Sign In</Link>
                      </Button>
                       <Button className="w-full" asChild onClick={() => setIsOpen(false)}>
                        <Link to="/auth?mode=signup">Get Started</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
