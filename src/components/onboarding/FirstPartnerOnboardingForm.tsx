import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BASE_API_URL } from '@/config/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

// Google Gemini AI configuration
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY as string; // Use environment variable for security

const FirstPartnerOnboardingForm: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    yourEmail: user?.email || '',
    phone: '',
    role: '',
    partnerName: '',
    partnerEmail: '',
    weddingCity: '',
    weddingDate: '',
    weddingStyle: '',
    weddingTradition: '',
    otherStyle: '',
    colorTheme: '',
    attireMain: '',
    attireOther: '',
    familyRegion: '',
    familyCaste: '',
    ceremonies: [] as string[],
    customInstructions: '',
    venueDecor: 'Joint Effort',
    catering: 'Joint Effort',
    guestList: 'Joint Effort',
    sangeetEntertainment: 'Joint Effort',
    guestEstimate: '',
    guestSplit: '',
    budgetRange: '',
    budgetFlexibility: '',
    priorities: [] as string[],
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [suggestingCeremonies, setSuggestingCeremonies] = useState(false);

  const steps = [
    "Core Foundation",
    "Vision & Vibe",
    "Cultural Heartbeat",
    "Teamwork Plan",
    "Budget & Priorities"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prevData => ({ ...prevData, [name]: value }));
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

  const validateStep = (step: number) => {
    // Basic validation for required fields in each step
    switch (step) {
      case 0: // Step 1: Core Foundation
        return formData.fullName && formData.yourEmail && formData.role &&
               formData.partnerName && formData.partnerEmail &&
               formData.weddingCity && formData.weddingDate;
      case 1: // Step 2: Vision & Vibe
        return formData.weddingStyle && (formData.weddingStyle !== 'Other' || formData.otherStyle);
      case 2: // Step 3: Cultural Heartbeat
        return formData.familyRegion;
      case 3: // Step 4: Teamwork Plan (all have default values)
        return true;
      case 4: // Step 5: Budget & Priorities
        return formData.budgetFlexibility;
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

    setSubmitting(true); // Start loading state

    // Helper function to clean strings for JSON
    const cleanString = (str: string) => {
      return str.trim().replace(/[^\w\s\-&.,()]/g, ''); // Remove special chars except common ones
    };

    const cultural_background = formData.familyRegion + (formData.familyCaste ? ` (${formData.familyCaste})` : '');

    // Clean and validate data to avoid JSON parsing issues
    const cleanWeddingName = `${cleanString(formData.fullName)} & ${cleanString(formData.partnerName)} Wedding`;
    const cleanWeddingTradition = cleanString(formData.weddingTradition) || "Hindu Traditional";
    
    const wedding_details = {
      wedding_name: cleanWeddingName, // Remove apostrophe to avoid JSON issues
      wedding_date: formData.weddingDate,
      wedding_location: cleanString(formData.weddingCity), // Use wedding_location instead of wedding_city
      wedding_tradition: cleanWeddingTradition, // Provide default if empty
      wedding_style: formData.weddingStyle,
    };

    const current_user_onboarding_details = {
      name: formData.fullName.trim(),
      email: formData.yourEmail.trim(),
      phone: formData.phone.trim() || null, // Convert empty string to null
      role: formData.role,
      cultural_background: cultural_background.trim(),
      ceremonies: formData.ceremonies,
      custom_instructions: formData.customInstructions.trim(),
      teamwork_plan: {
        venue_decor: formData.venueDecor,
        catering: formData.catering,
        guest_list: formData.guestList,
        sangeet_entertainment: formData.sangeetEntertainment,
      },
      guest_estimate: formData.guestEstimate.trim(),
      guest_split: formData.guestSplit.trim(),
      budget_range: formData.budgetRange.trim(),
      budget_flexibility: formData.budgetFlexibility,
      priorities: formData.priorities,
    };

    const partner_onboarding_details = {
      name: formData.partnerName.trim(),
      email: formData.partnerEmail.trim(),
    };

    const payload = {
      wedding_details: wedding_details,
      current_user_onboarding_details: current_user_onboarding_details,
      partner_onboarding_details: partner_onboarding_details,
    };

    console.log('First Partner Onboarding Payload:', JSON.stringify(payload, null, 2));

    try {
      const response = await fetch(`${BASE_API_URL}/onboarding/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Server error response:', errorData);
        throw new Error(`Server responded with ${response.status}: ${errorData}`);
      }

      const result = await response.json();
      console.log('Submission successful:', result);
      toast({
        title: "Onboarding Complete!",
        description: "Your wedding plan has been initiated. Your partner will be invited to complete their part.",
      });
      navigate('/dashboard'); // Redirect to dashboard after successful submission
    } catch (error: unknown) {
      console.error('Submission Error:', error);
      let errorMessage = "An unknown error occurred.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        // Fallback for cases where error might be an object with a message property but not an instance of Error
        errorMessage = (error as { message: string }).message;
      }
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: `There was an error submitting your data: ${errorMessage}`,
      });
    } finally {
      setSubmitting(false); // End loading state
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Setting the Stage</h2>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="fullName">Your Full Name:</Label>
                <Input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="yourEmail">Your Email Address:</Label>
                <Input type="email" id="yourEmail" name="yourEmail" value={formData.yourEmail} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="phone">Your Phone Number (Optional):</Label>
                <Input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="e.g., 111-222-3333" />
              </div>
              <div>
                <Label>Are you the Bride or the Groom?</Label>
                <RadioGroup name="role" value={formData.role} onValueChange={(value) => handleRadioChange('role', value)} className="flex space-x-4">
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
              <div>
                <Label htmlFor="partnerName">Partner's Full Name:</Label>
                <Input type="text" id="partnerName" name="partnerName" value={formData.partnerName} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="partnerEmail">Partner's Email Address:</Label>
                <Input type="email" id="partnerEmail" name="partnerEmail" value={formData.partnerEmail} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="weddingCity">Wedding City and Country:</Label>
                <Input type="text" id="weddingCity" name="weddingCity" value={formData.weddingCity} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="weddingDate">Preferred Wedding Date:</Label>
                <Input type="date" id="weddingDate" name="weddingDate" value={formData.weddingDate} onChange={handleChange} required />
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">The Look and Feel</h2>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="weddingStyle">Overall Style:</Label>
                <Select name="weddingStyle" value={formData.weddingStyle} onValueChange={(value) => handleSelectChange('weddingStyle', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Grand & Traditional">Grand & Traditional</SelectItem>
                    <SelectItem value="Modern & Minimalist">Modern & Minimalist</SelectItem>
                    <SelectItem value="Bohemian & Rustic">Bohemian & Rustic</SelectItem>
                    <SelectItem value="Intimate & Elegant">Intimate & Elegant</SelectItem>
                    <SelectItem value="Other">Other (please specify)</SelectItem>
                  </SelectContent>
                </Select>
                {formData.weddingStyle === 'Other' && (
                  <Input type="text" id="otherStyle" name="otherStyle" value={formData.otherStyle} onChange={handleChange} placeholder="Describe your unique vision" className="mt-2" />
                )}
              </div>
              <div>
                <Label htmlFor="weddingTradition">Wedding Tradition/Culture:</Label>
                <Input type="text" id="weddingTradition" name="weddingTradition" value={formData.weddingTradition} onChange={handleChange} placeholder="e.g., North Indian, South Indian, Bengali, etc." />
              </div>
              <div>
                <Label htmlFor="colorTheme">Specific Colors or Themes:</Label>
                <Input type="text" id="colorTheme" name="colorTheme" value={formData.colorTheme} onChange={handleChange} placeholder="e.g., Maroon, gold, and ivory" />
              </div>
              <div>
                <Label htmlFor="attireMain">Main Ceremony Attire Style/Designer:</Label>
                <Input type="text" id="attireMain" name="attireMain" value={formData.attireMain} onChange={handleChange} placeholder="e.g., Sabyasachi lehenga, classic sherwani" />
              </div>
              <div>
                <Label htmlFor="attireOther">Attire for Other Events (Sangeet, Reception, etc.):</Label>
                <Input type="text" id="attireOther" name="attireOther" value={formData.attireOther} onChange={handleChange} placeholder="e.g., Manish Malhotra gown, Indo-western suit" />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Rituals & Ceremonies</h2>
            <p className="mb-4 text-sm italic">Please enter the details for <strong>your side</strong> of the family. Your partner will be invited to fill out their own form for their family's traditions.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="familyRegion">Family's Region/State in India:</Label>
                <Input type="text" id="familyRegion" name="familyRegion" value={formData.familyRegion} onChange={handleChange} placeholder="e.g., Punjab, Tamil Nadu, Gujarat" required />
              </div>
              <div>
                <Label htmlFor="familyCaste">Caste/Community (Optional):</Label>
                <Input type="text" id="familyCaste" name="familyCaste" value={formData.familyCaste} onChange={handleChange} placeholder="e.g., Brahmin, Kshatriya, Marwari" />
              </div>
            </div>
            <Button 
              type="button" 
              variant="secondary" 
              className="mt-4" 
              onClick={handleSuggestCeremonies}
              disabled={suggestingCeremonies || !formData.familyRegion}
            >
              {suggestingCeremonies ? 'Generating Suggestions...' : 'Suggest Ceremonies based on Region'}
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
            <div className="mt-4">
              <Label htmlFor="customInstructions">Family-Specific Needs or Custom Instructions:</Label>
              <Textarea id="customInstructions" name="customInstructions" value={formData.customInstructions} onChange={handleChange} rows={4} placeholder="e.g., 'We have a family tradition of a special puja before the Haldi ceremony.'" />
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Roles & Responsibilities</h2>
            <p className="mb-4 text-sm">Discussing these roles early prevents confusion. Assign who will take the lead on decisions for each category.</p>
            <div className="grid gap-4">
              <div>
                <Label>Venue & Decor Selection:</Label>
                <Select name="venueDecor" value={formData.venueDecor} onValueChange={(value) => handleSelectChange('venueDecor', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Joint Effort">Joint Effort</SelectItem>
                    <SelectItem value="Bride's Side">Bride's Side</SelectItem>
                    <SelectItem value="Groom's Side">Groom's Side</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Catering & Menu Decisions:</Label>
                <Select name="catering" value={formData.catering} onValueChange={(value) => handleSelectChange('catering', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Joint Effort">Joint Effort</SelectItem>
                    <SelectItem value="Bride's Side">Bride's Side</SelectItem>
                    <SelectItem value="Groom's Side">Groom's Side</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Guest List & Invitations:</Label>
                <Select name="guestList" value={formData.guestList} onValueChange={(value) => handleSelectChange('guestList', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Joint Effort">Joint Effort</SelectItem>
                    <SelectItem value="Bride's Side">Bride's Side</SelectItem>
                    <SelectItem value="Groom's Side">Groom's Side</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sangeet & Entertainment:</Label>
                <Select name="sangeetEntertainment" value={formData.sangeetEntertainment} onValueChange={(value) => handleSelectChange('sangeetEntertainment', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Joint Effort">Joint Effort</SelectItem>
                    <SelectItem value="Bride's Side">Bride's Side</SelectItem>
                    <SelectItem value="Groom's Side">Groom's Side</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-4">Budget & Priorities</h2>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="guestEstimate">Estimated Total Number of Guests (range):</Label>
                <Input type="text" id="guestEstimate" name="guestEstimate" value={formData.guestEstimate} onChange={handleChange} placeholder="e.g., 200-250" />
              </div>
              <div>
                <Label htmlFor="guestSplit">Guest Split (Your Side vs. Partner's Side):</Label>
                <Input type="text" id="guestSplit" name="guestSplit" value={formData.guestSplit} onChange={handleChange} placeholder="e.g., 150 from my side, 150 from theirs, or 'Not Sure'" />
              </div>
              <div>
                <Label htmlFor="budgetRange">Estimated Budget for Your Side (range):</Label>
                <Input type="text" id="budgetRange" name="budgetRange" value={formData.budgetRange} onChange={handleChange} placeholder="e.g., $20,000 - $30,000 or 15-20 Lakhs" />
              </div>
              <div>
                <Label>Is this budget strict or flexible?</Label>
                <RadioGroup name="budgetFlexibility" value={formData.budgetFlexibility} onValueChange={(value) => handleRadioChange('budgetFlexibility', value)} className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Strict" id="strict" />
                    <Label htmlFor="strict">Strict</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Flexible" id="flexible" />
                    <Label htmlFor="flexible">Flexible</Label>
                  </div>
                </RadioGroup>
              </div>
              <div>
                <Label className="mb-2 block">Top 2-3 Priorities for Your Side:</Label>
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
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Tell Us About Your Wedding</CardTitle>
        <CardDescription>
          Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
        </CardDescription>
        <div className="w-full bg-muted rounded-full h-2.5 mt-4">
          <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
        </div>
      </CardHeader>
      <CardContent>
        <form>
          {renderStep()}
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        {currentStep > 0 ? (
          <Button onClick={prevStep} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
        ) : <div />}

        {currentStep < steps.length - 1 && (
          <Button onClick={nextStep} type="button">
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
        {currentStep === steps.length - 1 && (
          <Button onClick={handleSubmit} type="submit" disabled={submitting}>
            {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : 'Submit & Create Plan'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default FirstPartnerOnboardingForm;