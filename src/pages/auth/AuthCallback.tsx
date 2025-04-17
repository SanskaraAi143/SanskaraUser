
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase/config';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Process the OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        // If authentication successful, redirect to dashboard
        if (data.session) {
          navigate('/dashboard');
        } else {
          // If not authenticated but no error, redirect to home
          navigate('/');
        }
      } catch (err: any) {
        console.error('Error processing OAuth callback:', err);
        setError(err.message || 'An error occurred during sign in');
        // Redirect to homepage after a delay if there's an error
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {error ? (
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-red-600 mb-4">Authentication Error</h1>
          <p className="mb-6 text-gray-600">{error}</p>
          <p className="text-sm text-gray-500">Redirecting you home...</p>
        </div>
      ) : (
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-wedding-red mx-auto mb-6" />
          <h1 className="text-2xl font-semibold text-wedding-maroon mb-4">Completing Sign In</h1>
          <p className="text-gray-600">Please wait while we complete your authentication...</p>
        </div>
      )}
    </div>
  );
};

export default AuthCallback;
