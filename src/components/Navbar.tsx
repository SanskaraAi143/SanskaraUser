import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MenuIcon, MessageCircle, User, LogIn } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import UserProfileDropdown from "@/components/auth/UserProfileDropdown";
import { Link, useLocation } from "react-router-dom";
import AuthActionButton from './auth/AuthActionButton';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const isLandingPage = location.pathname === '/';
  const navLinks = [
    { href: "/about", label: "About", isRouterLink: true },
    { href: "/features", label: "Features", isRouterLink: true },
    { href: "/blog", label: "Blog", isRouterLink: true },
  ];

  return (
    <nav className="bg-background/80 backdrop-blur-lg border-b sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center h-20">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.jpeg" alt="Sanskara AI Logo" className="h-10 w-10 rounded-full object-cover" />
          <span className="text-2xl font-lora font-bold">Sanskara<span className="text-primary">AI</span></span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link key={link.href} to={link.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <UserProfileDropdown />
          ) : (
            <>
              <Link to="/auth?mode=signin" className="hidden md:block">
                <Button variant="ghost">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </Link>
              <AuthActionButton navigateTo="/dashboard" className="hidden md:flex">
                Start Planning
              </AuthActionButton>
            </>
          )}
          
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <MenuIcon className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <div className="flex flex-col h-full py-6">
                <nav className="flex flex-col space-y-4">
                  {navLinks.map(link => (
                    <Link key={link.href} to={link.href} className="text-lg text-muted-foreground hover:text-primary transition-colors" onClick={() => setIsOpen(false)}>
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto space-y-4">
                  {user ? null : (
                    <Link to="/auth?mode=signin" className="w-full" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In
                      </Button>
                    </Link>
                  )}
                  <AuthActionButton navigateTo="/dashboard" className="w-full">
                    Start Planning
                  </AuthActionButton>
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
