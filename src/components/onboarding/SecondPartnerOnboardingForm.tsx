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
import { Info } from 'lucide-react';

// Google Gemini AI configuration
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || ''; // Load from environment variable

interface PartnerDetailsResponse {
  wedding_id: string;
  wedding: {
    wedding_name: string;
    wedding_date: string;
    wedding_location: string;
    wedding_tradition: string;
    wedding_style: string;
    details?: Record<string, unknown>; // For the JSONB details column
  };
  first_partner_name: string;
  first_partner_details: {
    name: string;
    role: string;
    partner_name?: string; // The second partner's name from first partner's submission
    teamwork_plan: {
      venue_decor: string;
      catering: string;
      guest_list: string;
      sangeet_entertainment: string;
    };
  };
}

interface SecondPartnerOnboardingFormProps {
  initialWeddingData?: Record<string, unknown>; // Prop to receive pre-fetched wedding data
}

const SecondPartnerOnboardingForm: React.FC<SecondPartnerOnboardingFormProps> = ({ initialWeddingData }) => {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [unlockEmail, setUnlockEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false); // New loading state for form submission
  const [suggestingCeremonies, setSuggestingCeremonies] = useState(false); // Loading state for ceremony suggestions
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
      console.log('=== Second Partner Auto-Fill Debug ===');
      console.log('Full initialWeddingData:', JSON.stringify(initialWeddingData, null, 2));
      console.log('user.email:', user.email);
      console.log('user.wedding_id:', user?.wedding_id);
      
      const otherPartnerEmailExpected = initialWeddingData.other_partner_email_expected;
      let firstPartnerEmail = '';

      // Find the first partner's email (the one that is NOT other_partner_email_expected)
      for (const email in initialWeddingData.partner_data as Record<string, unknown>) {
        if (email !== otherPartnerEmailExpected) {
          firstPartnerEmail = email;
          break;
        }
      }

      const firstPartnerDetails = initialWeddingData.partner_data?.[firstPartnerEmail] || {};
      console.log('firstPartnerDetails extracted:', firstPartnerDetails);
      console.log('Available wedding data fields:', Object.keys(initialWeddingData));
      console.log('Wedding ID in data:', initialWeddingData.wedding_id);
      
      // Extract wedding details from the initialWeddingData
      // The AuthContext now includes the actual wedding table fields
      
      const weddingDate = initialWeddingData.wedding_date || 'To be decided together';
      const weddingLocation = initialWeddingData.wedding_location || 'To be decided together';
      const weddingTradition = initialWeddingData.wedding_tradition || 'To be decided together';
      const weddingStyle = initialWeddingData.wedding_style || 'To be decided together';
      const weddingName = initialWeddingData.wedding_name || `${firstPartnerDetails.name || 'Partner'}'s Wedding Plan`;
      
      console.log('Wedding details (from AuthContext with wedding table data):', { weddingDate, weddingLocation, weddingTradition, weddingStyle, weddingName });
      console.log('SUCCESS: Wedding table fields now available from AuthContext!');
      
      // Extract wedding_id - it could be directly on initialWeddingData or nested
      const weddingId = initialWeddingData.wedding_id || user?.wedding_id || '';
      console.log('Wedding ID extracted:', weddingId, 'from initialWeddingData.wedding_id:', initialWeddingData.wedding_id, 'user.wedding_id:', user?.wedding_id);
      
      if (!weddingId) {
        console.error('WARNING: No wedding_id found! This will cause submission to fail.');
      }
      
      setWeddingData({
        wedding_id: weddingId,
        wedding: {
          wedding_name: weddingName,
          wedding_date: weddingDate,
          wedding_location: weddingLocation,
          wedding_tradition: weddingTradition,
          wedding_style: weddingStyle,
        },
        first_partner_name: firstPartnerDetails.name || 'Partner',
        first_partner_details: {
          ...firstPartnerDetails,
          partner_name: (initialWeddingData.partner_onboarding_details as any)?.name || firstPartnerDetails.partner_name
        },
      } as PartnerDetailsResponse);

      // Pre-select role based on first partner's role and auto-fill partner name
      const oppositeRole = firstPartnerDetails.role === 'Bride' ? 'Groom' : 'Bride';
      
      // Auto-fill the partner's name - should come from partner_onboarding_details (the second partner's details)
      let partnerName = user.name || '';
      if (otherPartnerEmailExpected === user.email && (initialWeddingData.partner_onboarding_details as any)?.name) {
        // The user is the expected second partner, use their name from partner_onboarding_details
        partnerName = (initialWeddingData.partner_onboarding_details as any).name;
      }
      
      console.log('Auto-filling form with partnerName:', partnerName, 'role:', oppositeRole);
      setFormData(prev => ({ ...prev, fullName: partnerName, role: oppositeRole }));
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

  // Function to add ceremony to the list
  const addCeremonyToList = (ceremonyName: string) => {
    if (!formData.ceremonies.includes(ceremonyName)) {
      setFormData(prev => ({
        ...prev,
        ceremonies: [...prev.ceremonies, ceremonyName]
      }));
    }
  };

  // Function to suggest ceremonies using Google Gemini AI
  const handleSuggestCeremonies = async () => {
    if (!formData.familyRegion) {
      toast({
        variant: "destructive",
        title: "Region Required",
        description: "Please enter your family's region first.",
      });
      return;
    }

    if (!GOOGLE_API_KEY || GOOGLE_API_KEY.includes('YOUR_GOOGLE_API_KEY')) {
      toast({
        variant: "destructive",
        title: "API Key Missing",
        description: "Please configure the Google API Key to use this feature.",
      });
      return;
    }

    setSuggestingCeremonies(true);

    const prompt = `Based on a Hindu wedding for a family from ${formData.familyRegion}, suggest key pre-wedding ceremonies. Provide ONLY comma-separated names without any additional text.`;
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get ceremony suggestions');
      }

      const data = await response.json();
      const suggestedText = data.candidates[0].content.parts[0].text;
      const ceremonies = suggestedText.split(',').map((c: string) => c.trim()).filter((c: string) => c);
      
      ceremonies.forEach((ceremony: string) => addCeremonyToList(ceremony));
      
      toast({
        title: "Ceremonies Suggested!",
        description: `Added ${ceremonies.length} ceremony suggestions for ${formData.familyRegion}.`,
      });
    } catch (error) {
      console.error('Error generating ceremony suggestions:', error);
      toast({
        variant: "destructive",
        title: "Suggestion Failed",
        description: "Could not generate ceremony suggestions. Please try again.",
      });
    } finally {
      setSuggestingCeremonies(false);
    }
  };

  // Function to add custom ceremony
  const handleAddCustomCeremony = (customCeremony: string) => {
    if (customCeremony.trim()) {
      addCeremonyToList(customCeremony.trim());
    }
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
      console.log('Received partner details from API:', data);
      
      // Assuming the backend now returns data in the new structure
      setWeddingData(data);
      
      // Pre-select role based on partner's role and auto-fill partner name
      const oppositeRole = data.first_partner_details.role === 'Bride' ? 'Groom' : 'Bride';
      
      // Extract partner name from the response - this should come from partner_onboarding_details
      let partnerName = user?.name || '';
      if (data.first_partner_details.partner_name) {
        partnerName = data.first_partner_details.partner_name;
      }
      
      console.log('Auto-filling via API with partnerName:', partnerName, 'role:', oppositeRole);
      setFormData(prev => ({ ...prev, fullName: partnerName, role: oppositeRole }));
      
      setLoading(false);
      setCurrentStep(0); // Move to the first step of the form
    } catch (err: unknown) {
      setLoading(false);
      let errorMessage = "An unknown error occurred.";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        errorMessage = String((err as { message: unknown }).message);
      }
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error Finding Plan",
        description: errorMessage,
      });
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

    if (!weddingData.wedding_id) {
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "Wedding ID is missing. Please contact support.",
      });
      console.error('Wedding ID is missing from weddingData:', weddingData);
      return;
    }

    setSubmitting(true); // Start loading state

    const cultural_background = formData.familyRegion + (formData.familyCaste ? `, ${formData.familyCaste}` : '');

    const current_partner_details = {
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
      wedding_id: weddingData.wedding_id,
      current_partner_details: current_partner_details,
    };

    console.log('Second Partner Onboarding Payload:', JSON.stringify(payload, null, 2));

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
      await refreshUser();
      toast({
        title: "Onboarding Complete!",
        description: "Your plan is now active. Redirecting to dashboard...",
      });
      navigate('/dashboard');
    } catch (err: unknown) {
      console.error('Final Submission Error:', err);
      let errorMessage = "An unknown error occurred.";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        errorMessage = String((err as { message: unknown }).message);
      }
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: `There was a critical error: ${errorMessage}`,
      });
    } finally {
      setSubmitting(false); // End loading state
    }
  };

  const renderFormContent = () => {
    if (!weddingData) {
      return (
        <div className="module">
          <h2 className="text-2xl font-bold mb-4">Find Your Wedding Plan</h2>
          <p className="mb-4 text-green-700 font-semibold bg-green-50 p-3 rounded-md border border-green-200">
            <Info size={18} className="inline-block mr-2" />
            This part usually takes about 2 minutes to complete!
          </p>
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
              <h3 className="text-lg font-semibold mb-2">Plan started by {weddingData.first_partner_name}</h3>
              <p><strong>Wedding Name:</strong> {weddingData.wedding.wedding_name}</p>
              <p><strong>Wedding Date:</strong> <span className={weddingData.wedding.wedding_date === 'To be decided together' ? 'text-orange-600 italic' : ''}>{weddingData.wedding.wedding_date}</span></p>
              <p><strong>Wedding Location:</strong> <span className={weddingData.wedding.wedding_location === 'To be decided together' ? 'text-orange-600 italic' : ''}>{weddingData.wedding.wedding_location}</span></p>
              <p><strong>Wedding Tradition:</strong> <span className={weddingData.wedding.wedding_tradition === 'To be decided together' ? 'text-orange-600 italic' : ''}>{weddingData.wedding.wedding_tradition}</span></p>
              {(weddingData.wedding.wedding_date === 'To be decided together' || 
                weddingData.wedding.wedding_location === 'To be decided together' || 
                weddingData.wedding.wedding_tradition === 'To be decided together') && (
                <div className="mt-3 p-2 bg-orange-50 border-l-2 border-orange-200 text-sm">
                  <p className="text-orange-700">💡 <strong>Good news!</strong> You and your partner can finalize these details together in the dashboard after onboarding.</p>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="fullName">Your Full Name:</Label>
              <Input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-500 mt-1 p-2 bg-gray-50 rounded">
                  <p>Debug Info:</p>
                  <p>• formData.fullName: "{formData.fullName}"</p>
                  <p>• user.name: "{user?.name}"</p>
                  <p>• first_partner_details.partner_name: "{weddingData?.first_partner_details?.partner_name}"</p>
                  <p>• initialWeddingData available: {!!initialWeddingData ? 'Yes' : 'No'}</p>
                </div>
              )}
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
            <Button 
              type="button" 
              variant="secondary" 
              className="mt-4" 
              onClick={handleSuggestCeremonies}
              disabled={suggestingCeremonies || !formData.familyRegion}
            >
              {suggestingCeremonies ? 'Generating Suggestions...' : 'Suggest Ceremonies for My Region'}
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              <i>{suggestingCeremonies ? 'AI is generating ceremony suggestions...' : 'Uses AI to suggest traditional ceremonies based on your region'}</i>
            </p>

            <div className="mt-6">
              <Label className="mb-2 block">Ceremonies Your Side Will Host:</Label>
              <div className="grid grid-cols-2 gap-2">
                {formData.ceremonies.map((ceremony, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-blue-50 p-2 rounded">
                    <Checkbox
                      id={`ceremony-${index}`}
                      name="ceremonies"
                      value={ceremony}
                      checked={true}
                      onCheckedChange={(checked) => {
                        if (!checked) {
                          setFormData(prev => ({
                            ...prev,
                            ceremonies: prev.ceremonies.filter(c => c !== ceremony)
                          }));
                        }
                      }}
                    />
                    <Label htmlFor={`ceremony-${index}`}>{ceremony}</Label>
                  </div>
                ))}
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <Input 
                  type="text" 
                  id="customCeremony" 
                  placeholder="Add a custom ritual..." 
                  className="flex-grow" 
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      handleAddCustomCeremony(input.value);
                      input.value = '';
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={() => {
                    const input = document.getElementById('customCeremony') as HTMLInputElement;
                    handleAddCustomCeremony(input.value);
                    input.value = '';
                  }}
                >
                  Add
                </Button>
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
                <p className="text-sm text-gray-500 mb-1">Please note: This budget is specifically for your side's responsibilities, not the overall wedding budget.</p>
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
              <Button onClick={handleSubmit} className="ml-auto" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Confirm & Complete Onboarding'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SecondPartnerOnboardingForm;
