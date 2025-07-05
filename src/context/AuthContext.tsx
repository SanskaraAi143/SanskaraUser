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
  });  // Effect to initialize auth state and restore user on reload
  useEffect(() => {
    const getSession = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.getUser();
        if (data?.user) {
          setSupabaseUser(data.user);
          // Restore internal user_id mapping
          try {
            const { data: userRow } = await supabase
              .from('users')
              .select('user_id')
              .eq('supabase_auth_uid', data.user.id)
              .single();
            setUser({
              id: userRow?.user_id || data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.name || data.user.email,
            });
          } catch (userError) {
            // If user table query fails, still set the user with Supabase ID
            setUser({
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.name || data.user.email,
            });
          }
        } else {
          setSupabaseUser(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setSupabaseUser(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('Auth initialization timeout - proceeding without auth');
        setLoading(false);
      }
    }, 5000);
    
    getSession().finally(() => {
      clearTimeout(timeoutId);
    });// Listen to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {      if (session?.user) {
        setSupabaseUser(session.user);
        // Restore internal user_id mapping
        const fetchUserData = async () => {
          try {
            const { data: userRow } = await supabase
              .from('users')
              .select('user_id')
              .eq('supabase_auth_uid', session.user.id)
              .single();
            setUser({
              id: userRow?.user_id || session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.name || session.user.email,
            });
          } catch (error) {
            console.error('User table query error:', error);
            // Fallback to Supabase user ID if user table query fails
            setUser({
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.name || session.user.email,
            });
          }
        };
        fetchUserData();
      } else {
        setSupabaseUser(null);
        setUser(null);
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

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
