import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import UserProfileDropdown from '@/components/auth/UserProfileDropdown';
import {
  LayoutDashboard,
  MessageCircle,
  CheckSquare,
  PieChart,
  Users,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navLinks = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Chat with AI', icon: MessageCircle, href: '/dashboard/chat' },
  { name: 'Tasks', icon: CheckSquare, href: '/dashboard/tasks' },
  { name: 'Budget', icon: PieChart, href: '/dashboard/budget' },
  { name: 'Guest List', icon: Users, href: '/dashboard/guests' },
];

const moreLinks = [
    { name: "Profile", href: "/dashboard/profile" },
    { name: "Timeline", href: "/dashboard/timeline" },
    { name: "Mood Board", href: "/dashboard/moodboard" },
    { name: "Vendors", href: "/dashboard/vendors" },
    { name: "Settings", href: "/dashboard/settings" },
    { name: "Rituals", href: "/dashboard/rituals" },
];

const TopNavBar = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <img src="/logo.jpeg" alt="Sanskara AI Logo" className="h-8 w-8 object-contain rounded-full" />
            <span className="hidden font-bold sm:inline-block">SanskaraAI</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`transition-colors hover:text-foreground/80 ${
                    isActive ? 'text-foreground' : 'text-foreground/60'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-foreground/60">
                  <MoreHorizontal className="h-5 w-5" />
                  <span className="ml-2">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {moreLinks.map((link) => (
                  <DropdownMenuItem key={link.name} asChild>
                    <Link to={link.href}>{link.name}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Can add a search bar here later if needed */}
          </div>
          <nav className="flex items-center">
            <UserProfileDropdown />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;