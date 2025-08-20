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

    // Redirect rules:
    // - If fully active, go to dashboard
    // - Do NOT auto-redirect during onboarding_in_progress to avoid loops; render correct UI per role
    if (!loading && user?.wedding_id) {
      const status = user.wedding_status;
      if (status === 'active') {
        console.log('User onboarded — redirecting to dashboard');
        navigate('/dashboard', { replace: true });
        return;
      }
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
    const details: any = user.wedding_details_json || {};
    const partnerData = details.partner_data || {};
    const invitedPartnerEmail = details.other_partner_email_expected as string | undefined;
    const isInvitedPartner = invitedPartnerEmail && currentPartnerEmail === invitedPartnerEmail;
    const isInitiator = !isInvitedPartner && !!partnerData[currentPartnerEmail as string];

    // Check if the current user is the first partner who initiated
    if (isInitiator) {
      const weddingName = (details.wedding_name as string) || 'Your Wedding Plan';
      const partnerEmail = invitedPartnerEmail;
      const weddingDate = (details.wedding_date as string) || 'To be decided';
      const weddingLocation = (details.wedding_location as string) || 'To be decided';
      return (
        <div className="onboarding-container">
          <h1 className="text-2xl font-semibold mb-2">You're all set!</h1>
          <p className="mb-4">Your wedding plan <strong>{weddingName}</strong> has been created.</p>
          <div className="bg-white rounded border p-4 mb-4">
            <p><strong>Date:</strong> {weddingDate}</p>
            <p><strong>Location:</strong> {weddingLocation}</p>
            {partnerEmail && <p><strong>Invited Partner:</strong> {partnerEmail}</p>}
          </div>
          <p className="mb-2">We'll notify you when your partner completes their part.</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-2">Go to Dashboard</Button>
        </div>
      );
    }
    // Check if the current user is the invited second partner
  else if (isInvitedPartner) {
      return (
        <div className="onboarding-container">
          <h1>Welcome Back, Partner!</h1>
          <p>Your partner has started the wedding plan. Please complete your details.</p>
      <SecondPartnerOnboardingForm initialWeddingData={details} />
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