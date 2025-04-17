
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/services/supabase/config";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";

// Types for our authentication context
type User = {
  id: string;
  email: string | null;
  name?: string;
  photoURL?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Transform Supabase user data to our User type
  const formatUser = (session: Session | null): User | null => {
    if (!session?.user) return null;
    
    const supaUser = session.user;
    return {
      id: supaUser.id,
      email: supaUser.email,
      name: supaUser.user_metadata?.name || supaUser.user_metadata?.full_name,
      photoURL: supaUser.user_metadata?.avatar_url,
    };
  };

  // Effect to initialize auth state
  useEffect(() => {
    // Set initial session data
    const initializeAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
        setLoading(false);
        return;
      }
      
      setUser(formatUser(data.session));
      setLoading(false);
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(formatUser(session));
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign up function
  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) throw error;
      
      toast({
        title: "Account created successfully",
        description: `Welcome, ${name}!`,
      });
    } catch (error: any) {
      const errorMessage = error.message || "An unknown error occurred";
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast({
        title: "Signed in successfully",
        description: "Welcome back!",
      });
    } catch (error: any) {
      const errorMessage = error.message || "An unknown error occurred";
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google function
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
      
      // Note: For OAuth with redirect flow, the success toast will be shown
      // when the user returns to the app after authentication
    } catch (error: any) {
      const errorMessage = error.message || "An unknown error occurred";
      toast({
        variant: "destructive",
        title: "Google sign in failed",
        description: errorMessage,
      });
      setLoading(false);
      throw error;
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast({
        title: "Signed out successfully",
        description: "You have been logged out.",
      });
    } catch (error: any) {
      const errorMessage = error.message || "An unknown error occurred";
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
