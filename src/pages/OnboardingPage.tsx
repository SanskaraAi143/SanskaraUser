import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import FirstPartnerOnboardingForm from '@/components/onboarding/FirstPartnerOnboardingForm';
import SecondPartnerOnboardingForm from '@/components/onboarding/SecondPartnerOnboardingForm';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const OnboardingPage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not authenticated
    if (!loading && !user) {
      console.log('User not authenticated, redirecting to landing page');
      navigate('/');
      return;
    }

    // Redirect if fully onboarded
    if (!loading && user?.wedding_id && user.wedding_status === 'active') {
      console.log('User already onboarded, redirecting to dashboard');
      navigate('/dashboard');
      return;
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div>Loading user data...</div>; // Or a loading spinner
  }

  // If user is not authenticated, don't render anything (redirect will happen)
  if (!user) {
    return null;
  }

  // If user is fully onboarded, don't render anything (redirect will happen)
  if (user?.wedding_id && user.wedding_status === 'active') {
    return null;
  }

  // Case 1: No wedding ID - user is brand new or hasn't started onboarding
  if (!user?.wedding_id) {
    return (
      <div className="onboarding-container">
        <h1>Welcome! Let's Plan Your Wedding.</h1>
        <FirstPartnerOnboardingForm />
      </div>
    );
  }

  // Case 2: Wedding ID exists, but onboarding is in progress
  if (user.wedding_id && user.wedding_status === 'onboarding_in_progress') {
    const currentPartnerEmail = user.email;
    const firstPartnerDetails = user.wedding_details_json?.partner_data?.[user.wedding_details_json.current_partner_email as string];
    const invitedPartnerEmail = user.wedding_details_json?.other_partner_email_expected;

    // Check if the current user is the first partner who initiated
    if (firstPartnerDetails && currentPartnerEmail === firstPartnerDetails.email) {
      return (
        <div className="onboarding-container">
          <h1>Thanks for starting!</h1>
          <p>Your wedding plan is awaiting completion by your partner.</p>
          <p>We've sent an invitation to <strong>{invitedPartnerEmail as string}</strong> to complete their part.</p>
          <p>Once they're done, your personalized AI planner will be activated!</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">Go to Dashboard (Waiting)</Button>
        </div>
      );
    }
    // Check if the current user is the invited second partner
    else if (currentPartnerEmail === invitedPartnerEmail) {
      return (
        <div className="onboarding-container">
          <h1>Welcome Back, Partner!</h1>
          <p>Your partner has started the wedding plan. Please complete your details.</p>
          <SecondPartnerOnboardingForm initialWeddingData={user.wedding_details_json} />
        </div>
      );
    }
  }

  // Fallback for unexpected states
  return (
    <div className="onboarding-container">
      <h1>Onboarding Status Unknown</h1>
      <p>We couldn't determine your onboarding status. Please ensure you are logged in correctly or contact support.</p>
    </div>
  );
};

export default OnboardingPage;