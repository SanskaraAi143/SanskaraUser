import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MenuIcon, LogIn } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import UserProfileDropdown from "@/components/auth/UserProfileDropdown";
import { Link, useNavigate } from "react-router-dom";
import AuthActionButton from '@/components/auth/AuthActionButton';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { href: "/about", label: "About" },
    { href: "/features", label: "Features" },
    { href: "/blog", label: "Blog" },
    { href: "/pricing", label: "Pricing" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-wedding-cream/80 backdrop-blur-sm border-b border-wedding-gold/20">
      <div className="container mx-auto flex justify-between items-center h-20 px-4">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.jpeg" alt="Sanskara AI Logo" className="h-10 w-10 object-contain rounded-full" />
          <span className="text-2xl font-lora font-bold text-wedding-brown">
            Sanskara<span className="text-wedding-gold">AI</span>
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(link =>
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-semibold text-wedding-brown hover:text-wedding-gold transition-colors"
            >
              {link.label}
            </Link>
          )}
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
                  {navLinks.map(link =>
                    <Link
                      key={link.href}
                      to={link.href}
                      className="text-lg font-semibold text-wedding-brown hover:text-wedding-gold transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
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
