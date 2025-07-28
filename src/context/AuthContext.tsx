import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/services/supabase/config";
import { User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from "@/hooks/use-toast";

const USER_CACHE_KEY = 'cached_user';

// Types for our authentication context
type User = {
  supabase_auth_id: string; // This will be the Supabase Auth user ID
  internal_user_id?: string; // This will be the ID from your 'users' table
  email: string | null;
  name?: string;
  wedding_id?: string | null;
  role?: string;
  wedding_status?: string | null; // Added wedding status
  wedding_details_json?: any; // Add this to store the full wedding details JSONB
};

export type AuthContextType = {
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
  // State for the final, combined user profile
  const [user, setUser] = useState<User | null>(null);
  // Temporary state to hold the raw Supabase user object. This is key to the solution.
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  // Loading state for the UI
  const [loading, setLoading] = useState(true);

  // This data-fetching function is perfect as is, with logs.
  const fetchInternalUserAndWeddingId = useCallback(async (sbUser: SupabaseUser): Promise<User | null> => {
    console.log(`[AuthDebug] Starting DB fetch for user: ${sbUser.id}`);
    try {
      const { data: userRow, error: userError } = await supabase
        .from('users')
        .select('user_id')
        .eq('supabase_auth_uid', sbUser.id)
        .single();

      if (userError) {
        console.warn(`[AuthDebug] No row in 'users' table. Using fallback.`);
        return mapSupabaseUser(sbUser, null, sbUser.id, null, null, null); // Pass null for all optional parameters
      }
      
      console.log(`[AuthDebug] Found user row:`, userRow);
      let weddingId: string | null = null;
      let role: string | null = null;
      let weddingStatus: string | null = null; // Initialize weddingStatus
      let weddingDetailsJson: any = null; // Initialize weddingDetailsJson

      // Attempt to find wedding data by checking if user is an existing member
      const { data: memberWeddingData, error: memberWeddingError } = await supabase
        .from('wedding_members')
        .select('wedding_id, role')
        .eq('user_id', userRow.user_id)
        .single();

      if (memberWeddingError && memberWeddingError.code !== 'PGRST116') { // PGRST116 means no rows found
        console.warn(`[AuthDebug] Error checking wedding_members for ${userRow.user_id}:`, memberWeddingError);
      } else if (memberWeddingData) {
        console.log(`[AuthDebug] Found wedding data for existing member:`, memberWeddingData);
        weddingId = memberWeddingData.wedding_id;
        role = memberWeddingData.role;

        const { data: weddingData, error: weddingError } = await supabase
          .from('weddings')
          .select('status, details')
          .eq('wedding_id', weddingId)
          .single();

        if (weddingError) {
          console.warn(`[AuthDebug] Error fetching wedding details for wedding_id ${weddingId}:`, weddingError);
        } else if (weddingData) {
          weddingStatus = weddingData.status;
          weddingDetailsJson = weddingData.details;
        }
      }

      // If no wedding found via membership, check if user's email is an expected partner
      if (!weddingId && sbUser.email) {
        const { data: invitedWeddingData, error: invitedWeddingError } = await supabase
          .from('weddings')
          .select('wedding_id, status, details')
          .contains('details', { other_partner_email_expected: sbUser.email })
          .limit(1)
          .single();
        
        if (invitedWeddingError && invitedWeddingError.code !== 'PGRST116') {
          console.warn(`[AuthDebug] Error checking invited weddings for ${sbUser.email}:`, invitedWeddingError);
        } else if (invitedWeddingData) {
          console.log(`[AuthDebug] Found invited wedding data for ${sbUser.email}:`, invitedWeddingData);
          weddingId = invitedWeddingData.wedding_id;
          weddingStatus = invitedWeddingData.status;
          weddingDetailsJson = invitedWeddingData.details;
          role = 'invited_partner'; // Assign a default role for invited partner
        }
      }

      return mapSupabaseUser(sbUser, weddingId, userRow.user_id, role, weddingStatus, weddingDetailsJson);
    } catch (err) {
      console.error('[AuthDebug] CRITICAL ERROR in fetchInternalUserAndWeddingId:', err);
      // Ensure all arguments are passed, even in error case
      return mapSupabaseUser(sbUser, null, sbUser.id, null, null, null);
    }
  }, []);

  const mapSupabaseUser = (sbUser: SupabaseUser, weddingId: string | null, internalUserId: string, role: string | null, weddingStatus: string | null, weddingDetailsJson: any): User => {
    const finalUser = {
        supabase_auth_id: sbUser.id, // Always use Supabase Auth ID for the primary ID
        internal_user_id: internalUserId, // Store the internal user ID separately
        email: sbUser.email,
        name: sbUser.user_metadata?.name || sbUser.email,
        wedding_id: weddingId,
        role: role || 'guest',
        wedding_status: weddingStatus, // Include wedding status
        wedding_details_json: weddingDetailsJson, // Include wedding details JSONB
    };
    console.log(`[AuthDebug] Mapped final user object:`, finalUser);
    return finalUser;
  };

  // ==================================================================
  // ===== FINAL SOLUTION: DECOUPLING AUTH CHECK FROM DB QUERY ======
  // ==================================================================

  // EFFECT 1: Listens for auth changes. Its ONLY job is to set the basic Supabase user.
  // This makes NO database calls, preventing the deadlock.
  useEffect(() => {
    console.log('[AuthDebug] EFFECT 1: Subscribing to onAuthStateChange.');
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log(`[AuthDebug] EFFECT 1: onAuthStateChange fired. Event: ${_event}. Setting supabaseUser state.`);
      setSupabaseUser(session?.user ?? null);
    });

    return () => {
      console.log('[AuthDebug] EFFECT 1: Unsubscribing from onAuthStateChange.');
      subscription.unsubscribe();
    };
  }, []);

  // EFFECT 2: Listens for the `supabaseUser` state to change.
  // This ONLY runs when `supabaseUser` is updated. It then safely fetches the profile.
  useEffect(() => {
    if (supabaseUser) {
      console.log('[AuthDebug] EFFECT 2: supabaseUser state changed. Checking cache or fetching full profile.');
      // Try to load from cache first
      let cachedUser: User | null = null;
      try {
        const cachedUserString = localStorage.getItem(USER_CACHE_KEY);
        if (cachedUserString) {
          const parsedUser = JSON.parse(cachedUserString);
          // Only use cache if it matches the current Supabase Auth ID
          if (parsedUser.supabase_auth_id === supabaseUser.id) {
            cachedUser = parsedUser;
          } else {
            console.log('[AuthDebug] Cached user Supabase Auth ID mismatch. Discarding cache.');
            localStorage.removeItem(USER_CACHE_KEY); // Clear stale cache
          }
        }
      } catch (error) {
        console.error('[AuthDebug] Error parsing cached user from localStorage:', error);
        localStorage.removeItem(USER_CACHE_KEY); // Clear corrupted cache
      }

      if (cachedUser) {
        console.log('[AuthDebug] Using cached user profile.');
        setUser(cachedUser);
        setLoading(false);
      } else {
        // We are starting a fetch, so set loading to true.
        setLoading(true);
        fetchInternalUserAndWeddingId(supabaseUser)
          .then(fullProfile => {
            console.log('[AuthDebug] EFFECT 2: Profile fetch complete. Setting final user and loading state.');
            setUser(fullProfile);
            localStorage.setItem(USER_CACHE_KEY, JSON.stringify(fullProfile)); // Cache the user
            setLoading(false);
          });
      }
    } else {
      // This handles the initial load (when supabaseUser is null) and logout.
      console.log('[AuthDebug] EFFECT 2: supabaseUser is null. Clearing user profile and cache.');
      setUser(null);
      localStorage.removeItem(USER_CACHE_KEY); // Clear cache on logout
      setLoading(false);
    }
  }, [supabaseUser, fetchInternalUserAndWeddingId]);


  // --- Sign in/up/out functions (no changes needed) ---
  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ variant: "destructive", title: "Sign in failed", description: error.message });
      throw error;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, user_type: 'customer' } },
    });
    if (error) {
      toast({ variant: "destructive", title: "Sign up failed", description: error.message });
      throw error;
    } else {
      toast({ title: "Account created", description: "Please check your email to verify your account." });
    }
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ variant: "destructive", title: "Sign out failed", description: error.message });
      throw error;
    }
  }, []);

  const memoizedValue = React.useMemo(() => ({
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }), [user, loading, signIn, signUp, signOut]);

  return (
    <AuthContext.Provider value={memoizedValue}>
      {children}
    </AuthContext.Provider>
  );
};