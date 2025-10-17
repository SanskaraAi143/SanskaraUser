import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

import { Loader2, User as UserIcon, Mail, Calendar, Lock, Save } from "lucide-react";
import { supabase } from "@/services/supabase/config";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY as string;

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [isLoading, setIsLoading] = useState(false);

  // Wedding details state
  const [weddingId, setWeddingId] = useState<string | null>(null);
  const [weddingDate, setWeddingDate] = useState("");
  const [location, setLocation] = useState("");
  const [tradition, setTradition] = useState("");
  const [region, setRegion] = useState("");
  const [community, setCommunity] = useState("");
  const [selectedCeremonies, setSelectedCeremonies] = useState<string[]>([]);
  const [weddingDetailsLoading, setWeddingDetailsLoading] = useState(false);
  const [suggestingCeremonies, setSuggestingCeremonies] = useState(false);
  const [customCeremonyInput, setCustomCeremonyInput] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<{ name: string; email: string; role: string }[]>([]);
  const [newTeamMemberName, setNewTeamMemberName] = useState("");
  const [newTeamMemberEmail, setNewTeamMemberEmail] = useState("");
  const [newTeamMemberRole, setNewTeamMemberRole] = useState("");


  React.useEffect(() => {
    async function fetchWeddingData() {
      setWeddingDetailsLoading(true);
      try {
        if (!user?.wedding_id) {
          console.log("No wedding_id found for the current user.");
          toast({
            variant: "destructive",
            title: "Access Issue",
            description: "No wedding found. Please complete onboarding first.",
          });
          return;
        }
        console.log("Loading wedding data for ID:", user.wedding_id);
        setWeddingId(user.wedding_id);
        const { data, error } = await supabase
          .from('weddings')
          .select('wedding_date, wedding_location, wedding_tradition, details')
          .eq('wedding_id', user.wedding_id)
          .single();

        if (error) {
          console.error("Database query error:", error);
          throw error;
        }

        if (data) {
          console.log("Wedding data loaded:", data);
          setWeddingDate(data.wedding_date || "");
          setLocation(data.wedding_location || "");
          setTradition(data.wedding_tradition || "");
          // Extract fields from details JSONB
          const details = data.details || {};
          console.log("Current details:", details);

          // Check if we need to migrate data from the actual database structure
          let initialized = false;
          console.log("Partner data in details:", details.partner_data);

          // Extract ceremonies from current user's partner data
          const partnerData = details.partner_data || {};
          const currentUserData = partnerData[user?.email || ''] || {};
          console.log("Current user data:", currentUserData);

          if (!details.wedding_ceremonies && currentUserData.ceremonies) {
            console.log("Migrating ceremonies to details.wedding_ceremonies");
            details.wedding_ceremonies = currentUserData.ceremonies;
            initialized = true;
          }

          if (!details.wedding_region && currentUserData.cultural_background) {
            console.log("Migrating cultural background to details.wedding_region/community");
            const cultural = currentUserData.cultural_background;
            const parts = cultural.split(' (');
            details.wedding_region = parts[0]?.trim() || '';
            details.wedding_community = parts[1] ? parts[1].replace(')', '').trim() : '';
            initialized = true;
          }

          // Partner information is already at the top level in current structure
          // details.partner_email and details.partner_name are already set

          // If we migrated data, save it back to the database
          if (initialized) {
            console.log("Saving migrated data to database...");
            const { error: updateError } = await supabase
              .from('weddings')
              .update({ details })
              .eq('wedding_id', user.wedding_id);
            if (updateError) {
              console.error("Failed to migrate onboarding data:", updateError);
              toast({
                variant: "destructive",
                title: "Migration Error",
                description: "Could not save migrated data. Please refresh and try again.",
              });
            } else {
              console.log("Migration successful");
              toast({
                title: "Data Updated",
                description: "Imported onboarding information to your profile.",
              });
            }
          }

          setRegion(details.wedding_region || "");
          setCommunity(details.wedding_community || "");
          setSelectedCeremonies(details.wedding_ceremonies || []);
          setPartnerEmail(details.partner_email || "");
          setPartnerName(details.partner_name || "");
          setTeamMembers(details.team_members || []);

          console.log("All state updated with final values");
        }
      } catch (e) {
        console.error("Failed to fetch wedding details:", e);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load wedding details. Please refresh the page.",
        });
      } finally {
        setWeddingDetailsLoading(false);
      }
    }
    fetchWeddingData();
  }, [user, toast]);

  const handleAddTeamMember = async () => {
    if (!newTeamMemberName || !newTeamMemberEmail || !newTeamMemberRole) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all fields for the new team member.",
      });
      return;
    }

    const newMember = { name: newTeamMemberName, email: newTeamMemberEmail, role: newTeamMemberRole };
    const updatedTeam = [...teamMembers, newMember];
    setTeamMembers(updatedTeam);
    setNewTeamMemberName("");
    setNewTeamMemberEmail("");
    setNewTeamMemberRole("");

    // Save team members to details JSONB
    try {
      if (!weddingId) {
        throw new Error("No active wedding to save team members for.");
      }

      // First fetch current details to merge with new data
      const { data: currentWedding, error: fetchError } = await supabase
        .from('weddings')
        .select('details')
        .eq('wedding_id', weddingId)
        .single();

      if (fetchError) throw fetchError;

      const currentDetails = currentWedding?.details || {};

      // Update details JSONB with new team members
      const updatedDetails = {
        ...currentDetails,
        team_members: updatedTeam,
      };

      const { error } = await supabase
        .from('weddings')
        .update({ details: updatedDetails })
        .eq('wedding_id', weddingId);

      if (error) {
        throw error;
      }
      toast({
        title: "Team Member Added",
        description: `${newMember.name} has been added as a ${newMember.role}.`,
      });
    } catch (e) {
      console.error("Failed to save team member:", e);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save team member.",
      });
      // Revert UI if save fails
      setTeamMembers(teamMembers);
    }
  };

  const handleRemoveTeamMember = async (emailToRemove: string) => {
    const updatedTeam = teamMembers.filter(member => member.email !== emailToRemove);
    setTeamMembers(updatedTeam);

    // Save team members to details JSONB
    try {
      if (!weddingId) {
        throw new Error("No active wedding to save team members for.");
      }

      // First fetch current details to merge with new data
      const { data: currentWedding, error: fetchError } = await supabase
        .from('weddings')
        .select('details')
        .eq('wedding_id', weddingId)
        .single();

      if (fetchError) throw fetchError;

      const currentDetails = currentWedding?.details || {};

      // Update details JSONB with new team members
      const updatedDetails = {
        ...currentDetails,
        team_members: updatedTeam,
      };

      const { error } = await supabase
        .from('weddings')
        .update({ details: updatedDetails })
        .eq('wedding_id', weddingId);

      if (error) {
        throw error;
      }
      toast({
        title: "Team Member Removed",
        description: "Team member has been removed.",
      });
    } catch (e) {
      console.error("Failed to remove team member:", e);
      toast({
        variant: "destructive",
        title: "Removal Failed",
        description: "Could not remove team member.",
      });
      // Revert UI if save fails
      setTeamMembers(teamMembers);
    }
  };

  const handleCeremonyChange = (ceremony: string, isChecked: boolean) => {
    setSelectedCeremonies(prev =>
      isChecked ? [...prev, ceremony] : prev.filter(c => c !== ceremony)
    );
  };

  const addCustomCeremony = () => {
    if (customCeremonyInput.trim() && !selectedCeremonies.includes(customCeremonyInput.trim())) {
      setSelectedCeremonies(prev => [...prev, customCeremonyInput.trim()]);
      setCustomCeremonyInput("");
    }
  };

  const handleSuggestCeremonies = async () => {
    if (!region) {
      toast({
        variant: "destructive",
        title: "Region Required",
        description: "Please enter a region first.",
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
    const prompt = `Based on a Hindu wedding for a family from ${region}, suggest key pre-wedding ceremonies. Provide ONLY comma-separated names without any additional text.`;
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      if (!response.ok) {
        throw new Error('Failed to get ceremony suggestions');
      }

      const data = await response.json();
      const suggestedText = data.candidates[0].content.parts[0].text;
      const ceremonies = suggestedText.split(',').map((c: string) => c.trim()).filter((c: string) => c);
      
      ceremonies.forEach((ceremony: string) => {
        if (!selectedCeremonies.includes(ceremony)) {
          setSelectedCeremonies(prev => [...prev, ceremony]);
        }
      });
      
      toast({
        title: "Ceremonies Suggested!",
        description: `Added ${ceremonies.length} ceremony suggestions for ${region}.`,
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

  const handleSaveWeddingDetails = async () => {
    setWeddingDetailsLoading(true);
    try {
      if (!weddingId) {
        toast({
          variant: "destructive",
          title: "Save Failed",
          description: "No active wedding to save details for.",
        });
        return;
      }

      // First fetch current details to merge with new data
      const { data: currentWedding, error: fetchError } = await supabase
        .from('weddings')
        .select('details')
        .eq('wedding_id', weddingId)
        .single();

      if (fetchError) throw fetchError;

      const currentDetails = currentWedding?.details || {};

      // Update details JSONB with new values
      const updatedDetails = {
        ...currentDetails,
        wedding_region: region || null,
        wedding_community: community || null,
        wedding_ceremonies: selectedCeremonies,
      };

      const { error } = await supabase
        .from('weddings')
        .update({
          wedding_date: weddingDate || null,
          wedding_location: location || null,
          wedding_tradition: tradition || null,
          details: updatedDetails,
        })
        .eq('wedding_id', weddingId);

      if (error) {
        throw error;
      }

      toast({
        title: "Wedding Details Saved",
        description: "Your wedding details have been updated.",
      });
    } catch (e) {
      console.error("Failed to save wedding details:", e);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Could not save wedding details.",
      });
    } finally {
      setWeddingDetailsLoading(false);
    }
  };

  const handleInvitePartner = async () => {
    setInviteLoading(true);
    try {
      if (!weddingId || !partnerEmail) {
        toast({
          variant: "destructive",
          title: "Invitation Failed",
          description: "Wedding ID or Partner Email is missing.",
        });
        return;
      }

      // First fetch current details to merge with new data
      const { data: currentWedding, error: fetchError } = await supabase
        .from('weddings')
        .select('details')
        .eq('wedding_id', weddingId)
        .single();

      if (fetchError) throw fetchError;

      const currentDetails = currentWedding?.details || {};

      // Update details JSONB with new partner info
      const updatedDetails = {
        ...currentDetails,
        partner_email: partnerEmail,
        partner_name: partnerName,
      };

      const { error } = await supabase
        .from('weddings')
        .update({ details: updatedDetails })
        .eq('wedding_id', weddingId);

      if (error) {
        throw error;
      }

      toast({
        title: "Partner Invited",
        description: `${partnerName} at ${partnerEmail} has been invited to collaborate!`,
      });
    } catch (e) {
      console.error("Failed to invite partner:", e);
      toast({
        variant: "destructive",
        title: "Invitation Failed",
        description: "Could not send partner invitation.",
      });
    } finally {
      setInviteLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.internal_user_id) return;
    setIsLoading(true);
    try {
      await import('@/services/api/userApi').then(m => m.updateCurrentUserProfile(user.internal_user_id, { display_name: displayName }));
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was a problem updating your profile information.",
      });
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };


  // Calculate when the account was created
  // const formatAccountCreationDate = () => {
//   // Supabase user object may have created_at
//   if (!user || !user.created_at) return "N/A";
//   return new Date(user.created_at).toLocaleDateString();
// };
// Account creation date display removed due to missing property on User type.


  return (
    <React.Fragment>
      <div className="w-full space-y-8 p-4">
        <h1 className="text-4xl font-playfair font-semibold text-wedding-gold mb-8">My Profile</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Profile Card */}
            <Card className="border-wedding-gold/30 shadow-lg p-6">
              <CardHeader className="text-center pb-6">
                <Avatar className="w-28 h-28 mx-auto mb-4 border-2 border-wedding-gold">
                  <AvatarFallback className="bg-wedding-gold/10 text-wedding-gold text-3xl font-bold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <span><UserIcon className="h-10 w-10" /></span>}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-3xl text-wedding-gold">{user?.name || "User"}</CardTitle>
                <CardDescription className="text-md text-gray-700">{user?.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-lg">
                <div className="flex items-center">
                  <Mail className="w-6 h-6 mr-3 text-gray-600" />
                  <span>Email: </span>
                  <span className="ml-auto font-semibold text-wedding-gold">{user?.email}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-6 h-6 mr-3 text-gray-600" />
                  <span>Account created: </span>
                  <span className="ml-auto font-semibold text-wedding-gold">N/A</span>
                </div>
              </CardContent>
              <CardFooter className="pt-6">
                <Button variant="outline" className="w-full border-wedding-gold text-wedding-gold hover:bg-wedding-gold/10 text-lg py-3">
                  <Lock className="w-5 h-5 mr-3" />
                  Change Password
                </Button>
              </CardFooter>
            </Card>
            {/* Couple Profile Card */}
            <Card className="border-wedding-gold/30 shadow-lg p-6">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl text-wedding-gold">Couple's Profile</CardTitle>
                <CardDescription className="text-md text-gray-700">Introduce your partner and invite them to collaborate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
                  <div className="flex items-center flex-col">
                    <Avatar className="w-20 h-20 border-2 border-wedding-gold mb-2">
                      <AvatarFallback className="bg-wedding-gold/10 text-wedding-gold text-2xl font-bold">{user?.name ? user.name.charAt(0).toUpperCase() : <span><UserIcon className="h-8 w-8" /></span>}</AvatarFallback>
                    </Avatar>
                    <span className="text-xl font-bold text-wedding-gold">{user?.name || "Your Name"}</span>
                  </div>
                  <span className="text-3xl font-bold text-gray-500">&</span>
                  <div className="flex items-center flex-col">
                    <Avatar className="w-20 h-20 border-2 border-wedding-gold mb-2">
                      <AvatarFallback className="bg-wedding-gold/10 text-wedding-gold text-2xl font-bold">{partnerName ? partnerName.charAt(0).toUpperCase() : <span><UserIcon className="h-8 w-8" /></span>}</AvatarFallback>
                    </Avatar>
                    <span className="text-xl font-bold text-wedding-gold">{partnerName || "Partner's Name"}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="partnerName" className="text-lg">Partner's Name</Label>
                    <Input
                      id="partnerName"
                      value={partnerName}
                      onChange={(e) => setPartnerName(e.target.value)}
                      placeholder="Enter partner's name"
                      className="border-wedding-gold focus:ring-wedding-gold p-3 text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="partnerEmail" className="text-lg">Partner's Email</Label>
                    <Input
                      id="partnerEmail"
                      type="email"
                      value={partnerEmail}
                      onChange={(e) => setPartnerEmail(e.target.value)}
                      placeholder="Enter partner's email"
                      className="border-wedding-gold focus:ring-wedding-gold p-3 text-lg"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end pt-6">
                <Button
                  type="button"
                  className="bg-gradient-to-r from-[#ffd700] to-[#ffecb3] text-[#8d6e63] hover:opacity-90 text-lg py-3 px-6"
                  onClick={handleInvitePartner}
                  disabled={inviteLoading || !partnerEmail}
                >
                  {inviteLoading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Inviting...</>
                  ) : (
                    <><Mail className="mr-2 h-5 w-5" />Invite Partner</>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Edit Profile Form */}
            <Card className="border-wedding-gold/30 shadow-lg p-6">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl text-wedding-gold">Edit Profile</CardTitle>
                <CardDescription className="text-md text-gray-700">Update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-lg">Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your name"
                      className="border-wedding-gold focus:ring-wedding-gold p-3 text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-lg">Email Address</Label>
                    <Input
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-gray-50 border-wedding-gold text-gray-600 p-3 text-lg"
                    />
                    <p className="text-sm text-gray-500 mt-1">Email address cannot be changed</p>
                  </div>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-[#ffd700] to-[#ffecb3] text-[#8d6e63] hover:opacity-90 text-lg py-3 px-6"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Saving...</>
                    ) : (
                      <><Save className="mr-2 h-5 w-5" />Save Changes</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            {/* Wedding Details Card */}
            <Card className="border-wedding-gold/30 shadow-lg p-6">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl text-wedding-gold">Wedding Details</CardTitle>
                <CardDescription className="text-md text-gray-700">Information about your upcoming ceremony</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="weddingDate" className="text-lg">Wedding Date</Label>
                    <Input
                      id="weddingDate"
                      type="date"
                      value={weddingDate}
                      onChange={e => setWeddingDate(e.target.value)}
                      placeholder="Select date"
                      className="border-wedding-gold focus:ring-wedding-gold p-3 text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-lg">Location</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="Wedding venue"
                      className="border-wedding-gold focus:ring-wedding-gold p-3 text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tradition" className="text-lg">Wedding Tradition</Label>
                    <Input
                      id="tradition"
                      value={tradition}
                      onChange={e => setTradition(e.target.value)}
                      placeholder="e.g., Hindu, Sikh, Bengali"
                      className="border-wedding-gold focus:ring-wedding-gold p-3 text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region" className="text-lg">Region</Label>
                    <Select value={region} onValueChange={setRegion}>
                      <SelectTrigger className="border-wedding-gold focus:ring-wedding-gold p-3 text-lg">
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="North Indian">North Indian</SelectItem>
                        <SelectItem value="South Indian">South Indian</SelectItem>
                        <SelectItem value="East Indian">East Indian</SelectItem>
                        <SelectItem value="West Indian">West Indian</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="community" className="text-lg">Community</Label>
                    <Input
                      id="community"
                      value={community}
                      onChange={e => setCommunity(e.target.value)}
                      placeholder="e.g., Punjabi, Telugu Brahmin"
                      className="border-wedding-gold focus:ring-wedding-gold p-3 text-lg"
                    />
                  </div>
                </div>
                <h3 className="font-semibold text-xl mb-4 text-wedding-gold">Ceremonies</h3>
                <div className="flex flex-wrap gap-4 mb-6">
                  {['Roka', 'Sangeet', 'Haldi', 'Mehendi', 'Wedding', 'Reception'].map(ceremony => (
                    <div key={ceremony} className="flex items-center space-x-3">
                      <Checkbox
                        id={ceremony}
                        checked={selectedCeremonies.includes(ceremony)}
                        onCheckedChange={(checked) => handleCeremonyChange(ceremony, checked as boolean)}
                        className="w-5 h-5"
                      />
                      <Label htmlFor={ceremony} className="text-lg">{ceremony}</Label>
                    </div>
                  ))}
                </div>
                <div className="flex items-center space-x-3 mb-6">
                  <Input
                    id="customCeremony"
                    placeholder="Add custom ceremony"
                    value={customCeremonyInput}
                    onChange={(e) => setCustomCeremonyInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCustomCeremony();
                      }
                    }}
                    className="border-wedding-gold focus:ring-wedding-gold p-3 text-lg"
                  />
                  <Button type="button" onClick={addCustomCeremony} variant="outline" className="text-lg py-3 px-6">Add</Button>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-2 text-lg py-3 px-6"
                  onClick={handleSuggestCeremonies}
                  disabled={suggestingCeremonies || !region}
                >
                  {suggestingCeremonies ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Generating Suggestions...</> : 'Suggest Ceremonies (AI)'}
                </Button>
                <p className="text-md text-gray-500 mt-3">
                  <i>{suggestingCeremonies ? 'AI is generating ceremony suggestions...' : 'Uses AI to suggest traditional ceremonies based on your region'}</i>
                </p>
              </CardContent>
              <CardFooter className="pt-6">
                <Button
                  type="button"
                  className="bg-gradient-to-r from-[#ffd700] to-[#ffecb3] text-[#8d6e63] hover:opacity-90 ml-auto text-lg py-3 px-6"
                  onClick={handleSaveWeddingDetails}
                  disabled={weddingDetailsLoading}
                >
                  {weddingDetailsLoading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Saving...</>
                  ) : (
                    <><Save className="mr-2 h-5 w-5" />Save Details</>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Wedding Team / Family Card (Full Width) */}
          <Card className="lg:col-span-2 border-wedding-gold/30 shadow-lg p-6">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl text-wedding-gold">Wedding Team / Family</CardTitle>
              <CardDescription className="text-md text-gray-700">Invite family members or planners to collaborate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <h3 className="font-semibold text-xl mb-4">Invite New Team Member</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input
                    placeholder="Name"
                    value={newTeamMemberName}
                    onChange={(e) => setNewTeamMemberName(e.target.value)}
                    className="border-wedding-gold focus:ring-wedding-gold p-3 text-lg"
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={newTeamMemberEmail}
                    onChange={(e) => setNewTeamMemberEmail(e.target.value)}
                    className="border-wedding-gold focus:ring-wedding-gold p-3 text-lg"
                  />
                  <Select value={newTeamMemberRole} onValueChange={setNewTeamMemberRole}>
                    <SelectTrigger className="border-wedding-gold focus:ring-wedding-gold p-3 text-lg">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="View Only">View Only</SelectItem>
                      <SelectItem value="Editor">Editor</SelectItem>
                      <SelectItem value="Guest Manager">Guest Manager</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  className="bg-gradient-to-r from-[#ffd700] to-[#ffecb3] text-[#8d6e63] hover:opacity-90 w-full text-lg py-3 px-6"
                  onClick={handleAddTeamMember}
                  disabled={!newTeamMemberName || !newTeamMemberName || !newTeamMemberEmail || !newTeamMemberRole}
                >
                  <Mail className="mr-2 h-5 w-5" />Invite Team Member
                </Button>

                <h3 className="font-semibold text-xl mt-8 mb-4">Current Team Members</h3>
                {teamMembers.length === 0 ? (
                  <p className="text-gray-500 text-lg">No team members invited yet.</p>
                ) : (
                  <div className="space-y-4">
                    {teamMembers.map((member, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-md bg-gray-50">
                        <div>
                          <p className="font-medium text-lg">{member.name} ({member.role})</p>
                          <p className="text-md text-gray-600">{member.email}</p>
                        </div>
                        <Button variant="destructive" size="lg" onClick={() => handleRemoveTeamMember(member.email)}>Remove</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </React.Fragment>
  );
};

export default ProfilePage;