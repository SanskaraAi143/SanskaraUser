import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import FirstPartnerOnboardingForm from '@/components/onboarding/FirstPartnerOnboardingForm';
import SecondPartnerOnboardingForm from '@/components/onboarding/SecondPartnerOnboardingForm';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const OnboardingPage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
      return;
    }
    if (!loading && user?.wedding_id && user.wedding_status === 'active') {
      navigate('/dashboard');
      return;
    }
  }, [user, loading, navigate]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading your details...</p>
        </div>
      );
    }

    if (!user) return null;

    if (!user.wedding_id) {
      return <FirstPartnerOnboardingForm />;
    }

    if (user.wedding_id && user.wedding_status === 'onboarding_in_progress') {
      const currentPartnerEmail = user.email;
      const firstPartnerDetails = user.wedding_details_json?.partner_data?.[user.wedding_details_json.current_partner_email as string];
      const invitedPartnerEmail = user.wedding_details_json?.other_partner_email_expected;

      if (firstPartnerDetails && currentPartnerEmail === firstPartnerDetails.email) {
        return (
          <Card>
            <CardHeader>
              <CardTitle>Invitation Sent!</CardTitle>
              <CardDescription>Your part is done. We're just waiting for your partner.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p>An invitation has been sent to <strong>{invitedPartnerEmail as string}</strong>.</p>
              <p className="mt-2 text-sm text-muted-foreground">Once they complete their part, your personalized AI planner will be activated!</p>
              <Button onClick={() => navigate('/dashboard')} className="mt-6">
                Go to Your Dashboard
              </Button>
            </CardContent>
          </Card>
        );
      } else if (currentPartnerEmail === invitedPartnerEmail) {
        return <SecondPartnerOnboardingForm initialWeddingData={user.wedding_details_json} />;
      }
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Status Unknown</CardTitle>
        </CardHeader>
        <CardContent>
          <p>We couldn't determine your onboarding status. Please try logging in again or contact support if the issue persists.</p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-3xl">
        {renderContent()}
      </div>
    </div>
  );
};

export default OnboardingPage;