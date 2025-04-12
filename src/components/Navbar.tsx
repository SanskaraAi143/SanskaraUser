
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MenuIcon, MessageCircle, User, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import SignInDialog from "@/components/auth/SignInDialog";
import UserProfileDropdown from "@/components/auth/UserProfileDropdown";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#pricing", label: "Pricing" },
    { href: "#testimonials", label: "Testimonials" },
  ];

  const handleStartPlanning = () => {
    if (user) {
      navigate('/dashboard/chat');
    } else {
      navigate('/dashboard/chat');
    }
  };

  return (
    <nav className="bg-white/90 backdrop-blur-sm fixed w-full top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-10 w-10 flex items-center justify-center">
              <img src="/lovable-uploads/7d1ca230-11c7-4edb-9419-d5847fd86028.png" alt="Ganesha Logo" className="h-full w-full object-contain" />
            </div>
            <h1 className="text-2xl font-playfair font-semibold text-wedding-maroon">
              Sanskara<span className="text-wedding-red">AI</span>
            </h1>
          </Link>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <a 
              key={link.href}
              href={link.href} 
              className="font-medium text-gray-700 hover:text-wedding-red transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          {user ? (
            <UserProfileDropdown />
          ) : (
            <SignInDialog>
              <Button variant="outline" className="hidden sm:flex">
                <User size={18} className="mr-2" />
                Sign In
              </Button>
            </SignInDialog>
          )}
          
          <Button 
            className="bg-wedding-red hover:bg-wedding-deepred"
            onClick={handleStartPlanning}
          >
            <MessageCircle size={18} className="mr-2" />
            Chat Now
          </Button>
          
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="ml-2">
                <MenuIcon className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[75vw] sm:w-[350px]">
              <div className="flex flex-col h-full py-6">
                <div className="mb-8">
                  <Link to="/" className="flex items-center gap-2 mb-6">
                    <div className="h-10 w-10 bg-wedding-red rounded-full flex items-center justify-center">
                      <span className="text-white font-playfair text-xl font-bold">S</span>
                    </div>
                    <h2 className="text-xl font-playfair font-semibold text-wedding-maroon">
                      Sanskara<span className="text-wedding-red">AI</span>
                    </h2>
                  </Link>
                  <nav className="flex flex-col space-y-4">
                    {navLinks.map(link => (
                      <a
                        key={link.href}
                        href={link.href}
                        className="font-medium text-gray-700 hover:text-wedding-red transition-colors py-2"
                      >
                        {link.label}
                      </a>
                    ))}
                  </nav>
                </div>
                <div className="mt-auto space-y-4">
                  {user ? (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => signOut()}
                    >
                      <User size={18} className="mr-2" />
                      Sign Out
                    </Button>
                  ) : (
                    <SignInDialog>
                      <Button variant="outline" className="w-full justify-start">
                        <User size={18} className="mr-2" />
                        Sign In
                      </Button>
                    </SignInDialog>
                  )}
                  <Button 
                    className="w-full justify-start bg-wedding-red hover:bg-wedding-deepred"
                    onClick={handleStartPlanning}
                  >
                    <MessageCircle size={18} className="mr-2" />
                    Chat Now
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
