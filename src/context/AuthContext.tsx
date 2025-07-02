import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/services/supabase/config";
import { toast } from "@/hooks/use-toast";

// Types for our authentication context
type User = {
  id: string; // Internal application user_id from public.users table
  email: string | null;
  name?: string;
};

type VendorProfile = {
  vendorId: string; // Corresponds to vendor_id in vendors table
  vendorName?: string;
};

type AuthContextType = {
  user: User | null;
  vendorProfile: VendorProfile | null;
  loading: boolean;
  isVendorLoading: boolean; // Separate loading state for vendor profile
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
};

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  vendorProfile: null,
  loading: true,
  isVendorLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVendorLoading, setIsVendorLoading] = useState(true);
  // const [supabaseUser, setSupabaseUser] = useState<any>(null); // We might not need to store the full supabase user in state

  const fetchAndSetUserAndVendorProfile = async (sbUser: any) => {
    if (!sbUser) {
      setUser(null);
      setVendorProfile(null);
      setLoading(false);
      setIsVendorLoading(false);
      return;
    }

    // Fetch internal user_id (from public.users)
    const { data: userRow, error: userError } = await supabase
      .from('users')
      .select('user_id, display_name') // Assuming display_name is in users table
      .eq('supabase_auth_uid', sbUser.id)
      .single();

    if (userError && userError.code !== 'PGRST116') { // PGRST116: no rows found
      console.error("Error fetching internal user:", userError);
      // Potentially handle this error, e.g. by signing out the user or setting a default
    }

    const internalUserId = userRow?.user_id || sbUser.id; // Fallback to supabase id if internal not found (should be rare with trigger)
    const userName = userRow?.display_name || sbUser.user_metadata?.name || sbUser.email;

    setUser({
      id: internalUserId,
      email: sbUser.email,
      name: userName,
    });
    setLoading(false); // User loading is done

    // Fetch vendor profile
    setIsVendorLoading(true);
    const { data: vendorRow, error: vendorError } = await supabase
      .from('vendors')
      .select('vendor_id, vendor_name')
      .eq('supabase_auth_uid', sbUser.id) // Assuming vendors table has supabase_auth_uid
      .single();

    if (vendorError && vendorError.code !== 'PGRST116') { // PGRST116: no rows found
      console.error("Error fetching vendor profile:", vendorError);
    }

    if (vendorRow) {
      setVendorProfile({
        vendorId: vendorRow.vendor_id,
        vendorName: vendorRow.vendor_name,
      });
    } else {
      setVendorProfile(null);
    }
    setIsVendorLoading(false); // Vendor profile loading is done
  };


  // Effect to initialize auth state and restore user on reload
  useEffect(() => {
    const getSessionAndProfiles = async () => {
      setLoading(true);
      setIsVendorLoading(true);
      const { data: { user: sbUser } } = await supabase.auth.getUser();
      await fetchAndSetUserAndVendorProfile(sbUser);
    };

    getSessionAndProfiles();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoading(true);
      setIsVendorLoading(true);
      await fetchAndSetUserAndVendorProfile(session?.user || null);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);


  // Sign up function
  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      setIsVendorLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, user_type: 'customer' } }, // raw_user_meta_data for trigger
      });
      if (error) throw error;
      // onAuthStateChange will handle setting user and vendor profile due to the trigger
      // and subsequent user creation in `users` table.
      // We might need to manually call fetchAndSetUserAndVendorProfile if onAuthStateChange is not fast enough
      // or if the public.users table is not populated immediately by the trigger for the vendor query.
      if (data.user) {
         await fetchAndSetUserAndVendorProfile(data.user); // Explicitly fetch after signup
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
