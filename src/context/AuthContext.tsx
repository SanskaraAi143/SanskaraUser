import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/services/supabase/config";
import { toast } from "@/hooks/use-toast";

// Types for our authentication context
type User = {
  id: string;
  email: string | null;
  name?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
};

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabaseUser, setSupabaseUser] = useState<any>(null);

  // Helper to map Supabase user to our User type
  const mapSupabaseUser = (sbUser: any): User => ({
    id: sbUser.id,
    email: sbUser.email,
    name: sbUser.user_metadata?.name || sbUser.email,
  });

  // Effect to initialize auth state
  useEffect(() => {
    const getSession = async () => {
      setLoading(true);
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setSupabaseUser(data.user);
      } else {
        setSupabaseUser(null);
      }
      setLoading(false);
    };
    getSession();
    // Listen to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
      } else {
        setSupabaseUser(null);
      }
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Remove polling: fetch internal user_id only once at login/signup
  const fetchInternalUserId = async (sbUser: any) => {
    const { data } = await supabase
      .from('users')
      .select('user_id')
      .eq('supabase_auth_uid', sbUser.id)
      .single();
    return data?.user_id || sbUser.id;
  };

  // Sign up function
  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, user_type: 'customer' } },
      });
      if (error) throw error;
      if (data.user) {
        const internalId = await fetchInternalUserId(data.user);
        setUser({
          id: internalId,
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.email,
        });
        setSupabaseUser(data.user);
      }
      toast({
        title: "Account created successfully",
        description: `Welcome, ${name}! Please check your email to verify your account.`,
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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        const internalId = await fetchInternalUserId(data.user);
        setUser({
          id: internalId,
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.email,
        });
        setSupabaseUser(data.user);
      }
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

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSupabaseUser(null);
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

  // Remove polling useEffect for supabaseUser/internal user_id
  useEffect(() => {
    if (!supabaseUser) {
      setUser(null);
      setLoading(false);
      return;
    }
    // Do not fetch user_id here anymore
  }, [supabaseUser]);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
