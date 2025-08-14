import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import SignInDialog from '../components/auth/SignInDialog';
import SignUpDialog from '../components/auth/SignUpDialog';

const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse query params to determine if this is signin or signup
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const mode = searchParams.get('mode');
    if (mode === 'signin') {
      setIsSignUp(false);
    } else {
      setIsSignUp(true);
    }
  }, [location.search]);

  // Redirect if already authenticated - check onboarding status
  useEffect(() => {
    if (user) {
      // Check if user has completed onboarding
      if (user.wedding_id && user.wedding_status === 'active') {
        console.log('User authenticated and onboarded, redirecting to dashboard');
        navigate('/dashboard', { replace: true });
      } else {
        console.log('User authenticated but onboarding incomplete, redirecting to onboarding');
        navigate('/onboarding', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    const newUrl = isSignUp ? '/auth?mode=signin' : '/auth?mode=signup';
    navigate(newUrl, { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{isSignUp ? 'Sign Up' : 'Sign In'} - Sanskara AI</title>
        <meta
          name="description"
          content={`${isSignUp ? 'Create your account' : 'Sign in to your account'} on Sanskara AI - Your AI-powered Hindu wedding planning assistant.`}
        />
        <link rel="canonical" href={`https://sanskaraai.com/auth?mode=${isSignUp ? 'signup' : 'signin'}`} />
      </Helmet>
      
      <Navbar />

      <main className="flex-grow flex items-center justify-center px-4 py-12 pt-20 md:pt-24 lg:pt-28">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold  mb-4">
              {isSignUp ? 'Join Sanskara AI' : 'Welcome Back'}
            </h1>
            <p className="text-gray-600">
              {isSignUp
                ? 'Start planning your dream Hindu wedding with AI assistance'
                : 'Continue planning your perfect wedding celebration'
              }
            </p>
          </div>          <div className=" p-8 rounded-2xl">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">
                  {isSignUp ? 'Create Your Account' : 'Sign Into Your Account'}
                </h2>
                <p className="text-gray-600 text-sm">
                  {isSignUp
                    ? 'Join thousands of couples planning their perfect wedding'
                    : 'Access your wedding planning dashboard'
                  }
                </p>
              </div>

              {isSignUp ? (
                <SignUpDialog>
                  <button className="cta-button w-full">
                    Get Started Free
                  </button>
                </SignUpDialog>
              ) : (
                <SignInDialog>
                  <button className="cta-button w-full">
                    Sign In to Dashboard
                  </button>
                </SignInDialog>
              )}

              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                  {' '}
                  <button
                    onClick={handleToggleMode}
                    className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              By signing up, you agree to our{' '}
              <a href="/terms" className="text-orange-600 hover:text-orange-700">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="text-orange-600 hover:text-orange-700">Privacy Policy</a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AuthPage;
