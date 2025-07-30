import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/services/supabase/config";
import { User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from "@/hooks/use-toast";

// ------------ Types -----------------
type User = {
  supabase_auth_id: string;
  internal_user_id?: string;
  email: string | null;
  name?: string;
  wedding_id?: string | null;
  role?: string;
  wedding_status?: string | null; 
  wedding_details_json?: Record<string, unknown>; 
};

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

// ---------- Hook for Access -----------
export const useAuth = () => useContext(AuthContext);

// ----------- Provider -----------------
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionRestored, setSessionRestored] = useState(false);

  // ----- Utility: Final User Mapper -----
  const mapSupabaseUser = (
    sbUser: SupabaseUser, weddingId: string | null, internalUserId: string, role: string | null,
    weddingStatus: string | null, weddingDetailsJson: Record<string, unknown> | null
  ): User => ({
    supabase_auth_id: sbUser.id,
    internal_user_id: internalUserId,
    email: sbUser.email,
    name: sbUser.user_metadata?.name || sbUser.email,
    wedding_id: weddingId,
    role: role || 'guest',
    wedding_status: weddingStatus,
    wedding_details_json: weddingDetailsJson,
  });

  // -------- DB Fetcher ----------
  const fetchInternalUserAndWeddingId = useCallback(async (sbUser: SupabaseUser): Promise<User | null> => {
    try {
      const { data: userRow, error: userError } = await supabase
        .from('users')
        .select('user_id')
        .eq('supabase_auth_uid', sbUser.id)
        .single();

      if (userError) {
        return mapSupabaseUser(sbUser, null, sbUser.id, null, null, null);
      }
      let weddingId: string | null = null;
      let role: string | null = null;
      let weddingStatus: string | null = null;
      let weddingDetailsJson: Record<string, unknown> | null = null;

      // Try primary wedding membership
      const { data: memberWeddingData, error: memberWeddingError } = await supabase
        .from('wedding_members')
        .select('wedding_id, role')
        .eq('user_id', userRow.user_id)
        .single();

      if (!memberWeddingError && memberWeddingData) {
        weddingId = memberWeddingData.wedding_id;
        role = memberWeddingData.role;
        const { data: weddingData } = await supabase
          .from('weddings')
          .select('status, details')
          .eq('wedding_id', weddingId)
          .single();
        if (weddingData) {
          weddingStatus = weddingData.status;
          weddingDetailsJson = weddingData.details;
        }
      }

      // Or check partner invitation
      if (!weddingId && sbUser.email) {
        const { data: invitedWeddingData } = await supabase
          .from('weddings')
          .select('wedding_id, status, details')
          .contains('details', { other_partner_email_expected: sbUser.email })
          .limit(1)
          .single();
        if (invitedWeddingData) {
          weddingId = invitedWeddingData.wedding_id;
          weddingStatus = invitedWeddingData.status;
          weddingDetailsJson = invitedWeddingData.details;
          role = "invited_partner";
        }
      }

      return mapSupabaseUser(sbUser, weddingId, userRow.user_id, role, weddingStatus, weddingDetailsJson);
    } catch (err) {
      return mapSupabaseUser(sbUser, null, sbUser.id, null, null, null);
    }
  }, []);

  // -------- Effect 1: Listen for auth state (fires once) ----------
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') {
        setSessionRestored(true);
      }
      // Only update if the user's auth state truly changes to prevent re-renders on token refresh.
      // We use a functional update to safely access the previous state and avoid stale closures.
      setSupabaseUser(currentSupabaseUser => {
        if (session?.user?.id !== currentSupabaseUser?.id) {
          return session?.user ?? null;
        }
        return currentSupabaseUser;
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  // -------- Effect 2: On supabaseUser change, get app profile ------
  useEffect(() => {
    let ignore = false;
    if (supabaseUser) {
      setLoading(true);
      fetchInternalUserAndWeddingId(supabaseUser).then(data => {
        if (!ignore) {
          setUser(data);
          setLoading(false);
        }
      });
    } else {
      setUser(null);
      setLoading(false);
    }
    return () => { ignore = true; };
  }, [supabaseUser, fetchInternalUserAndWeddingId]);

  // ---------- Auth Methods -----------
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

  const isLoading = loading || !sessionRestored;

  const memoizedValue = React.useMemo(() => ({
    user,
    loading: isLoading,
    signIn,
    signUp,
    signOut,
  }), [user, isLoading, signIn, signUp, signOut]);

  return (
    <AuthContext.Provider value={memoizedValue}>
      {children}
    </AuthContext.Provider>
  );
};
