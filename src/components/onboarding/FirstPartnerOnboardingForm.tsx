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
import { BASE_API_URL } from '@/config/api'; // Import BASE_API_URL

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

    const cultural_background = formData.familyRegion + (formData.familyCaste ? ` (${formData.familyCaste})` : '');

    const current_partner_details = {
      name: formData.fullName,
      email: formData.yourEmail,
      phone: formData.phone,
      role: formData.role,
      partner_name: formData.partnerName,
      partner_email: formData.partnerEmail,
      wedding_city: formData.weddingCity,
      wedding_date: formData.weddingDate,
      wedding_style: formData.weddingStyle,
      wedding_tradition: formData.weddingTradition,
      other_style: formData.otherStyle,
      color_theme: formData.colorTheme,
      attire_main: formData.attireMain,
      attire_other: formData.attireOther,
      cultural_background: cultural_background,
      ceremonies: formData.ceremonies,
      custom_instructions: formData.customInstructions,
      teamwork_plan: {
        venue_decor: formData.venueDecor,
        catering: formData.catering,
        guest_list: formData.guestList,
        sangeet_entertainment: formData.sangeetEntertainment,
      },
      guest_estimate: formData.guestEstimate,
      guest_split: formData.guestSplit,
      budget_range: formData.budgetRange,
      budget_flexibility: formData.budgetFlexibility,
      priorities: formData.priorities,
    };

    const wedding_details = {
      name: `${formData.fullName} & ${formData.partnerName}'s Wedding`, // A default naming convention
      wedding_date: formData.weddingDate,
      wedding_location: formData.weddingCity,
      wedding_tradition: formData.weddingTradition,
      wedding_style: formData.weddingStyle, // Keep this as part of wedding details for now
      // Add other relevant wedding-level details here
    };

    const current_user_onboarding_details = {
      name: formData.fullName,
      email: formData.yourEmail,
      phone: formData.phone,
      role: formData.role,
      cultural_background: cultural_background,
      ceremonies: formData.ceremonies,
      custom_instructions: formData.customInstructions,
      teamwork_plan: {
        venue_decor: formData.venueDecor,
        catering: formData.catering,
        guest_list: formData.guestList,
        sangeet_entertainment: formData.sangeetEntertainment,
      },
      guest_estimate: formData.guestEstimate,
      guest_split: formData.guestSplit,
      budget_range: formData.budgetRange,
      budget_flexibility: formData.budgetFlexibility,
      priorities: formData.priorities,
    };

    const partner_onboarding_details = {
      name: formData.partnerName,
      email: formData.partnerEmail,
    };

    const payload = {
      wedding_details: wedding_details,
      current_user_onboarding_details: current_user_onboarding_details,
      partner_onboarding_details: partner_onboarding_details,
    };

    try {
      const response = await fetch(`${BASE_API_URL}/onboarding/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.text();
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
            <Button type="button" variant="secondary" className="mt-4">Suggest Ceremonies based on Region</Button>
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
    <div className="container mx-auto p-4">
      <div className="bg-white p-8 rounded-lg shadow-md">
        {renderStep()}
        <div className="flex justify-between mt-8">
          {currentStep > 0 && (
            <Button onClick={prevStep} variant="outline">
              ← Previous
            </Button>
          )}
          {currentStep < 4 && (
            <Button onClick={nextStep} className="ml-auto">
              Next →
            </Button>
          )}
          {currentStep === 4 && (
            <Button onClick={handleSubmit} className="ml-auto">
              Submit & View Summary
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FirstPartnerOnboardingForm;