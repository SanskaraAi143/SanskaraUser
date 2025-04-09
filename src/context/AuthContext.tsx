
import React, { createContext, useContext, useState, useEffect } from "react";

// Types for our authentication context
type User = {
  id: string;
  email: string;
  name?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Effect to initialize auth state (will connect to Supabase later)
  useEffect(() => {
    // Simulate loading auth state
    const checkAuth = async () => {
      try {
        // We'll replace this with actual Supabase auth check
        const storedUser = localStorage.getItem("sanskara_user");
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Auth error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Sign in function (will integrate with Supabase)
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock sign in - will replace with Supabase
      const mockUser = { id: "1", email };
      localStorage.setItem("sanskara_user", JSON.stringify(mockUser));
      setUser(mockUser);
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out function (will integrate with Supabase)
  const signOut = async () => {
    setLoading(true);
    try {
      // Mock sign out - will replace with Supabase
      localStorage.removeItem("sanskara_user");
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
