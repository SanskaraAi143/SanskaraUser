import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BASE_API_URL } from '@/config/api'; // Import BASE_API_URL

interface PartnerDetailsResponse {
  wedding_id: string;
  first_partner_name: string;
  first_partner_details: {
    name: string;
    role: string;
    wedding_city: string;
    wedding_date: string;
    teamwork_plan: {
      venue_decor: string;
      catering: string;
      guest_list: string;
      sangeet_entertainment: string;
    };
  };
}

interface SecondPartnerOnboardingFormProps {
  initialWeddingData?: any; // Prop to receive pre-fetched wedding data
}

const SecondPartnerOnboardingForm: React.FC<SecondPartnerOnboardingFormProps> = ({ initialWeddingData }) => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [unlockEmail, setUnlockEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [weddingData, setWeddingData] = useState<PartnerDetailsResponse | null>(null);

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    role: '', // Will be pre-selected
    familyRegion: '',
    familyCaste: '',
    ceremonies: [] as string[],
    budgetRange: '',
    priorities: [] as string[],
    teamworkAgreement: '',
  });

  // Pre-fill email from auth context if available
  useEffect(() => {
    if (user?.email) {
      setUnlockEmail(user.email);
    }
  }, [user]);

  // Use initialWeddingData if provided, skipping the unlock screen
  useEffect(() => {
    if (initialWeddingData && user?.email) {
      const otherPartnerEmailExpected = initialWeddingData.other_partner_email_expected;
      let firstPartnerEmail = '';

      // Find the first partner's email (the one that is NOT other_partner_email_expected)
      for (const email in initialWeddingData.partner_data) {
        if (email !== otherPartnerEmailExpected) {
          firstPartnerEmail = email;
          break;
        }
      }

      const firstPartnerDetails = initialWeddingData.partner_data?.[firstPartnerEmail] || {};
      
      setWeddingData({
        wedding_id: user.wedding_id || '', // Use wedding_id from auth context
        first_partner_name: firstPartnerDetails.name || 'Partner',
        first_partner_details: firstPartnerDetails,
      } as PartnerDetailsResponse);

      // Pre-select role based on first partner's role
      const oppositeRole = firstPartnerDetails.role === 'Bride' ? 'Groom' : 'Bride';
      setFormData(prev => ({ ...prev, fullName: user.name || '', role: oppositeRole }));
      setCurrentStep(0); // Directly show the first step of the form
    }
  }, [initialWeddingData, user]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prevData => ({
        ...prevData,
        [name]: checked
          ? [...(prevData[name as keyof typeof prevData] as string[]), value]
          : (prevData[name as keyof typeof prevData] as string[]).filter(item => item !== value),
      }));
    } else {
      setFormData(prevData => ({ ...prevData, [name]: value }));
    }
  };

  const handleRadioChange = (name: string, value: string) => {
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 0: // Confirm Details & Your Info
        return formData.fullName && formData.role;
      case 1: // Your Cultural Heartbeat
        return formData.familyRegion;
      case 2: // Your Budget & Priorities
        return formData.budgetRange;
      case 3: // Confirm Teamwork & Submit
        return formData.teamworkAgreement;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    } else {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill out all required fields.",
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleFindPlan = async () => {
    setError('');
    if (!unlockEmail) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_API_URL}/onboarding/partner-details?email=${encodeURIComponent(unlockEmail)}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`We couldn't find a pending wedding plan for this email. Please check with your partner or contact support. (Status: ${response.status}) - ${errorText}`);
      }
      const data: PartnerDetailsResponse = await response.json();
      setWeddingData(data);
      // Pre-select role based on partner's role
      const oppositeRole = data.first_partner_details.role === 'Bride' ? 'Groom' : 'Bride';
      setFormData(prev => ({ ...prev, role: oppositeRole }));
      setCurrentStep(0); // Move to the first step of the form
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Error Finding Plan",
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill out all required fields before submitting.",
      });
      return;
    }

    if (!weddingData) {
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "Wedding data not loaded. Please find your plan first.",
      });
      return;
    }

    const cultural_background = formData.familyRegion + (formData.familyCaste ? `, ${formData.familyCaste}` : '');

    const second_partner_details = {
      name: formData.fullName,
      email: unlockEmail, // Use the verified email
      role: formData.role,
      cultural_background: cultural_background,
      ceremonies: formData.ceremonies,
      budget_range: formData.budgetRange || 'Not specified',
      priorities: formData.priorities,
      teamwork_agreement: formData.teamworkAgreement === 'agree', // boolean
    };

    const payload = {
      wedding_id: weddingData?.wedding_id || user?.wedding_id, // Ensure wedding_id is always available
      current_partner_email: second_partner_details.email,
      other_partner_email: null, // Critical for identifying this as the second partner submission
      current_partner_details: second_partner_details,
    };

    try {
      const response = await fetch(`${BASE_API_URL}/onboarding/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }
      const result = await response.json();
      console.log('Final submission success:', result);
      toast({
        title: "Onboarding Complete!",
        description: "Your plan is now active. You will be redirected to the dashboard.",
      });
      navigate('/dashboard'); // Redirect to dashboard after successful submission
    } catch (err: any) {
      console.error('Final Submission Error:', err);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: `There was a critical error: ${err.message}`,
      });
    }
  };

  const renderFormContent = () => {
    if (!weddingData) {
      return (
        <div className="module">
          <h2 className="text-2xl font-bold mb-4">Find Your Wedding Plan</h2>
          <p className="mb-4">Please enter your email address to load the plan started by your partner.</p>
          <Label htmlFor="unlockEmail">Your Email Address:</Label>
          <Input
            type="email"
            id="unlockEmail"
            value={unlockEmail}
            onChange={(e) => setUnlockEmail(e.target.value)}
            required
            className="mb-4"
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <Button onClick={handleFindPlan} disabled={loading}>
            {loading ? 'Finding...' : 'Find Plan'}
          </Button>
        </div>
      );
    }

    switch (currentStep) {
      case 0:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Details & Plan Confirmation</h2>
            <div className="bg-blue-50 p-4 rounded-md border-l-4 border-blue-200 mb-4">
              <h3 className="text-lg font-semibold mb-2">Plan started by {weddingData.first_partner_details.name}</h3>
              <p><strong>Wedding City:</strong> {weddingData.first_partner_details.wedding_city}</p>
              <p><strong>Wedding Date:</strong> {weddingData.first_partner_details.wedding_date}</p>
            </div>
            <div>
              <Label htmlFor="fullName">Your Full Name:</Label>
              <Input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
            </div>
            <div className="mt-4">
              <Label>Confirm your role:</Label>
              <RadioGroup name="role" value={formData.role} onValueChange={(value) => handleRadioChange('role', value)} className="flex space-x-4 mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Bride" id="bride" />
                  <Label htmlFor="bride">Bride</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Groom" id="groom" />
                  <Label htmlFor="groom">Groom</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Family's Traditions</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="familyRegion">Your Family's Region/State:</Label>
                <Input type="text" id="familyRegion" name="familyRegion" value={formData.familyRegion} onChange={handleChange} placeholder="e.g., Punjab, Tamil Nadu" required />
              </div>
              <div>
                <Label htmlFor="familyCaste">Your Caste/Community (Optional):</Label>
                <Input type="text" id="familyCaste" name="familyCaste" value={formData.familyCaste} onChange={handleChange} placeholder="e.g., Brahmin, Shetty" />
              </div>
            </div>
            <Button type="button" variant="secondary" className="mt-4">Suggest Ceremonies for My Region</Button>
            <p className="text-sm text-gray-500 mt-2"><i>Generating suggestions... (Feature Coming Soon)</i></p>

            <div className="mt-6">
              <Label className="mb-2 block">Ceremonies Your Side Will Host:</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="mehendi" name="ceremonies" value="Mehendi" checked={formData.ceremonies.includes('Mehendi')} onCheckedChange={(checked) => handleChange({ target: { name: 'ceremonies', value: 'Mehendi', type: 'checkbox', checked: checked as boolean } } as React.ChangeEvent<HTMLInputElement>)} />
                  <Label htmlFor="mehendi">Mehendi</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="haldi" name="ceremonies" value="Haldi" checked={formData.ceremonies.includes('Haldi')} onCheckedChange={(checked) => handleChange({ target: { name: 'ceremonies', value: 'Haldi', type: 'checkbox', checked: checked as boolean } } as React.ChangeEvent<HTMLInputElement>)} />
                  <Label htmlFor="haldi">Haldi</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="sangeet" name="ceremonies" value="Sangeet" checked={formData.ceremonies.includes('Sangeet')} onCheckedChange={(checked) => handleChange({ target: { name: 'ceremonies', value: 'Sangeet', type: 'checkbox', checked: checked as boolean } } as React.ChangeEvent<HTMLInputElement>)} />
                  <Label htmlFor="sangeet">Sangeet</Label>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <Input type="text" id="customCeremony" placeholder="Add a custom ritual..." className="flex-grow" />
                <Button type="button" variant="secondary">Add</Button>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Your Side's Budget & Priorities</h2>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="budgetRange">Estimated Budget for Your Side's Responsibilities:</Label>
                <Input type="text" id="budgetRange" name="budgetRange" value={formData.budgetRange} onChange={handleChange} placeholder="e.g., $10,000 or 8 Lakhs" />
              </div>
              <div>
                <Label className="mb-2 block">Top 1-2 Priorities for Your Side:</Label>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="venueAmbiance" name="priorities" value="Venue & Ambiance" checked={formData.priorities.includes('Venue & Ambiance')} onCheckedChange={(checked) => handleChange({ target: { name: 'priorities', value: 'Venue & Ambiance', type: 'checkbox', checked: checked as boolean } } as React.ChangeEvent<HTMLInputElement>)} />
                    <Label htmlFor="venueAmbiance">Venue & Ambiance</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="foodCatering" name="priorities" value="Food & Catering" checked={formData.priorities.includes('Food & Catering')} onCheckedChange={(checked) => handleChange({ target: { name: 'priorities', value: 'Food & Catering', type: 'checkbox', checked: checked as boolean } } as React.ChangeEvent<HTMLInputElement>)} />
                    <Label htmlFor="foodCatering">Food & Catering</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="photography" name="priorities" value="Photography & Videography" checked={formData.priorities.includes('Photography & Videography')} onCheckedChange={(checked) => handleChange({ target: { name: 'priorities', value: 'Photography & Videography', type: 'checkbox', checked: checked as boolean } } as React.ChangeEvent<HTMLInputElement>)} />
                    <Label htmlFor="photography">Photography</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="guestExperience" name="priorities" value="Guest Experience" checked={formData.priorities.includes('Guest Experience')} onCheckedChange={(checked) => handleChange({ target: { name: 'priorities', value: 'Guest Experience', type: 'checkbox', checked: checked as boolean } } as React.ChangeEvent<HTMLInputElement>)} />
                    <Label htmlFor="guestExperience">Guest Experience</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Confirm Teamwork Plan</h2>
            <div className="bg-blue-50 p-4 rounded-md border-l-4 border-blue-200 mb-4">
              <h3 className="text-lg font-semibold mb-2">Proposed Task Delegation</h3>
              <p><strong>Venue & Decor:</strong> {weddingData.first_partner_details.teamwork_plan.venue_decor}</p>
              <p><strong>Catering & Menu:</strong> {weddingData.first_partner_details.teamwork_plan.catering}</p>
              <p><strong>Guest List & Invitations:</strong> {weddingData.first_partner_details.teamwork_plan.guest_list}</p>
              <p><strong>Sangeet & Entertainment:</strong> {weddingData.first_partner_details.teamwork_plan.sangeet_entertainment}</p>
            </div>
            <div>
              <Label>Do you agree with this breakdown?</Label>
              <RadioGroup name="teamworkAgreement" value={formData.teamworkAgreement} onValueChange={(value) => handleRadioChange('teamworkAgreement', value)} className="flex space-x-4 mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="agree" id="agree" />
                  <Label htmlFor="agree">Yes, this looks good.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="disagree" id="disagree" />
                  <Label htmlFor="disagree">No, I'd like to discuss changes.</Label>
                </div>
              </RadioGroup>
              {formData.teamworkAgreement === 'disagree' && (
                <p className="text-blue-600 text-sm mt-2">That's okay! Please submit and our AI assistant will help you both discuss and finalize the plan together.</p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (authLoading) {
    return <div>Loading user authentication...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white p-8 rounded-lg shadow-md">
        {renderFormContent()}
        {weddingData && (
          <div className="flex justify-between mt-8">
            {currentStep > 0 && (
              <Button onClick={prevStep} variant="outline">
                ← Previous
              </Button>
            )}
            {currentStep < 3 && (
              <Button onClick={nextStep} className="ml-auto">
                Next →
              </Button>
            )}
            {currentStep === 3 && (
              <Button onClick={handleSubmit} className="ml-auto">
                Confirm & Complete Onboarding
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SecondPartnerOnboardingForm;