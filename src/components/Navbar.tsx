import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MenuIcon, MessageCircle, User } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import SignInDialog from "@/components/auth/SignInDialog";
import UserProfileDropdown from "@/components/auth/UserProfileDropdown";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Hide main nav links on blog pages
  const isBlogPage = location.pathname.startsWith('/blog');

  const navLinks = isBlogPage
    ? [{ href: "/blog", label: "Blog", isRouterLink: true }]
    : [
        { href: "#features", label: "Features" },
        { href: "#how-it-works", label: "How It Works" },
        { href: "#pricing", label: "Pricing" },
        { href: "#testimonials", label: "Testimonials" },
        { href: "/blog", label: "Blog", isRouterLink: true },
      ];

  const handleStartPlanning = () => {
    navigate('/dashboard/chat');
    setIsOpen(false); // Also close mobile menu if open
  };

  return (
    <nav className="glass-nav">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-12 w-12 flex items-center justify-center bg-gradient-primary rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300">
              <img src="/logo.jpeg" alt="Site Logo" className="h-10 w-10 object-contain rounded-full" />
            </div>
            <div className="text-2xl font-playfair font-semibold title-gradient">
              Sanskara<span className="font-bold">AI</span>
            </div>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => 
            link.isRouterLink ? (
              <Link 
                key={link.href}
                to={link.href} 
                className="nav-link"
              >
                {link.label}
              </Link>
            ) : (
              <a 
                key={link.href}
                href={link.href} 
                className="nav-link"
              >
                {link.label}
              </a>
            )
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button
                variant="ghost"
                className="nav-link hidden md:flex items-center gap-2"
                onClick={handleStartPlanning}
              >
                <MessageCircle className="h-5 w-5" />
                Chat
              </Button>
              <UserProfileDropdown />
            </>
          ) : (
            <>
              <SignInDialog>
                <Button variant="ghost" className="nav-link hidden md:flex items-center gap-2">
                  <User size={18} />
                  Sign In
                </Button>
              </SignInDialog>
              <Button 
                className="cta-button hidden md:flex"
                onClick={handleStartPlanning}
              >
                <MessageCircle size={18} className="mr-2" />
                Start Chatting
              </Button>
            </>
          )}
          
          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="ml-2">
                <MenuIcon className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[75vw] sm:w-[350px] glass-card border-0">
              <div className="flex flex-col h-full py-6">
                <div className="mb-8">
                  <Link to="/" className="flex items-center gap-3 mb-6" onClick={() => setIsOpen(false)}>
                    <div className="h-12 w-12 flex items-center justify-center bg-gradient-primary rounded-full shadow-lg">
                      <img src="/logo.jpeg" alt="Site Logo" className="h-10 w-10 object-contain rounded-full" />
                    </div>
                    <h2 className="text-2xl font-playfair font-semibold title-gradient">
                      Sanskara<span className="font-bold">AI</span>
                    </h2>
                  </Link>
                  <nav className="flex flex-col space-y-4">
                    {navLinks.map(link => 
                      link.isRouterLink ? (
                        <Link
                          key={link.href}
                          to={link.href}
                          className="nav-link py-2"
                          onClick={() => setIsOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          key={link.href}
                          href={link.href}
                          className="nav-link py-2"
                          onClick={() => setIsOpen(false)}
                        >
                          {link.label}
                        </a>
                      )
                    )}
                  </nav>
                </div>
                <div className="mt-auto space-y-4">
                  {user ? (
                    <Button 
                      variant="ghost" 
                      className="nav-link w-full justify-start"
                      onClick={() => { signOut(); setIsOpen(false); }}
                    >
                      <User size={18} className="mr-2" />
                      Sign Out
                    </Button>
                  ) : (
                    <SignInDialog>
                      <Button variant="ghost" className="nav-link w-full justify-start" onClick={() => setIsOpen(false)}>
                        <User size={18} className="mr-2" />
                        Sign In
                      </Button>
                    </SignInDialog>
                  )}
                  <Button 
                    className="cta-button w-full justify-start"
                    onClick={handleStartPlanning}
                  >
                    <MessageCircle size={18} className="mr-2" />
                    Start Chatting
                  </Button>
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
