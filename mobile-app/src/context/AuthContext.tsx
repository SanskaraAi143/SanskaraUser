import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/services/api/supabaseClient"; // Adjusted import path
import { toast } from "@/hooks/use-toast"; // Uncommented

// Types for our authentication context
type User = {
  id: string; // This will be our internal user_id
  email: string | null;
  name?: string;
  supabase_auth_uid?: string; // Store the actual Supabase auth UID
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  // isAuthenticated: boolean; // Added for convenience, derived from user
};

// Create the context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);


// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // No need for supabaseUser state if we map directly

  // Helper to map Supabase user and fetch internal ID
  const mapAndFetchUser = async (sbUser: any): Promise<User | null> => {
    if (!sbUser) return null;

    // Fetch internal user_id mapping from 'users' table
    const { data: userRow, error: userError } = await supabase
      .from('users') // Assuming your public table is 'users'
      .select('user_id, name') // Select name from users table if available
      .eq('supabase_auth_uid', sbUser.id)
      .single();

    if (userError && userError.code !== 'PGRST116') { // PGRST116: 'single row not found' which is ok if user not in users table yet
      console.error("Error fetching internal user ID:", userError);
      toast({ variant: "destructive", title: "Error", description: "Could not fetch user profile." });
    }

    return {
      id: userRow?.user_id || sbUser.id, // Fallback to supabase id if not found, though ideally should exist
      email: sbUser.email,
      name: userRow?.name || sbUser.user_metadata?.name || sbUser.email, // Prioritize name from users table
      supabase_auth_uid: sbUser.id,
    };
  };

  // Effect to initialize auth state and restore user on reload
  useEffect(() => {
    const getSession = async () => {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error getting session:", sessionError);
        // toast({ variant: "destructive", title: "Auth Error", description: "Failed to retrieve session." });
        setUser(null);
      } else if (session?.user) {
        const mappedUser = await mapAndFetchUser(session.user);
        setUser(mappedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoading(true); // Set loading true during auth state change processing
      if (session?.user) {
        const mappedUser = await mapAndFetchUser(session.user);
        setUser(mappedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);


  // Sign up function
  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }, // user_type: 'customer' can be handled by a trigger or post-signup function if needed
      });

      if (error) throw error;

      // After successful Supabase auth sign-up, the onAuthStateChange listener should handle setting the user.
      // However, the users table might not be populated yet by the trigger.
      // For a better UX, we might want to optimistically set the user or wait for the trigger.
      // For now, relying on onAuthStateChange. A manual user profile insert might be needed here if no trigger.

      toast({
        title: "Account created successfully",
        description: `Welcome, ${name}! Please check your email to verify your account.`,
      });
      // console.log("Sign up successful for:", name); // Toast provides feedback

    } catch (error: any) {
      const errorMessage = error.message || "An unknown error occurred";
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: errorMessage,
      });
      // console.error("Sign up failed:", errorMessage); // Toast provides feedback
      throw error; // Re-throw to be caught by UI if needed
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

      // onAuthStateChange will handle setting the user state
      // const mappedUser = await mapAndFetchUser(data.user);
      // setUser(mappedUser); // This would be redundant if onAuthStateChange is quick

      toast({
        title: "Signed in successfully",
        description: "Welcome back!",
      });
      // console.log("Sign in successful for:", email); // Toast provides feedback

    } catch (error: any) {
      const errorMessage = error.message || "An unknown error occurred";
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: errorMessage,
      });
      // console.error("Sign in failed:", errorMessage); // Toast provides feedback
      throw error; // Re-throw
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
      // onAuthStateChange will set user to null
      toast({
        title: "Signed out successfully",
        description: "You have been logged out.",
      });
      // console.log("Sign out successful"); // Toast provides feedback
    } catch (error: any)
     {
      const errorMessage = error.message || "An unknown error occurred";
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: errorMessage,
      });
      // console.error("Sign out failed:", errorMessage); // Toast provides feedback
      throw error; // Re-throw
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
