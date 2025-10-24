import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, User, MessageSquare, CheckSquare, Calendar, Image, DollarSign, Users, Briefcase, Settings, Clock, ChevronDown } from "lucide-react";

const DashboardDropdown: React.FC = () => {
  const location = useLocation();

  const sidebarLinks = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Profile", icon: User, href: "/dashboard/profile" },
    { name: "Chat with AI", icon: MessageSquare, href: "/chat" },
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="text-sm font-semibold text-wedding-brown hover:text-wedding-gold transition-colors">
          Dashboard
          <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white shadow-lg z-50">
        {sidebarLinks.map((link) => {
          const isActive = location.pathname === link.href;
          return (
            <DropdownMenuItem key={link.name} asChild>
              <Link
                to={link.href}
                className={`flex items-center gap-2 ${isActive ? 'text-wedding-gold font-medium' : 'text-wedding-brown'}`}
              >
                <link.icon className="h-4 w-4" />
                <span>{link.name}</span>
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DashboardDropdown;