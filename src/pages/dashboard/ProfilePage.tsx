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
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-playfair font-semibold text-wedding-gold mb-6">My Profile</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1 border-wedding-gold/30 shadow-lg">
          <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-2">
              <AvatarFallback className="bg-wedding-gold/10 text-wedding-gold text-xl">
                {user?.name ? user.name.charAt(0).toUpperCase() : <span><UserIcon className="h-8 w-8" /></span>}
              </AvatarFallback>
            </Avatar>

            <CardTitle className="text-xl text-wedding-gold">{user?.name || "User"}</CardTitle>
            <CardDescription className="text-sm text-gray-600">{user?.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2 text-gray-500" />
              <span>Email: </span>
              <span className="ml-auto font-medium text-wedding-gold">{user?.email}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-gray-500" />
              <span>Account created: </span>
              <span className="ml-auto font-medium text-wedding-gold">N/A</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full border-wedding-gold text-wedding-gold hover:bg-wedding-gold/10">
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </Button>
          </CardFooter>
        </Card>
        {/* Edit Profile Form */}
        <Card className="md:col-span-2 border-wedding-gold/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-wedding-gold">Edit Profile</CardTitle>
            <CardDescription className="text-gray-600">Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  className="border-wedding-gold focus:ring-wedding-gold"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-gray-50 border-wedding-gold text-gray-600"
                />
                <p className="text-xs text-gray-500">Email address cannot be changed</p>
              </div>
              <Button
                type="submit"
                className="bg-gradient-to-r from-[#ffd700] to-[#ffecb3] text-[#8d6e63] hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" />Save Changes</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        {/* Wedding Details Card */}
        <Card className="md:col-span-2 border-wedding-gold/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-wedding-gold">Wedding Details</CardTitle>
            <CardDescription className="text-gray-600">Information about your upcoming ceremony</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label htmlFor="weddingDate">Wedding Date</Label>
                <Input
                  id="weddingDate"
                  type="date"
                  value={weddingDate}
                  onChange={e => setWeddingDate(e.target.value)}
                  placeholder="Select date"
                  className="border-wedding-gold focus:ring-wedding-gold"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Wedding venue"
                  className="border-wedding-gold focus:ring-wedding-gold"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tradition">Wedding Tradition</Label>
                <Input
                  id="tradition"
                  value={tradition}
                  onChange={e => setTradition(e.target.value)}
                  placeholder="e.g., Hindu, Sikh, Bengali"
                  className="border-wedding-gold focus:ring-wedding-gold"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger className="border-wedding-gold focus:ring-wedding-gold">
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
                <Label htmlFor="community">Community</Label>
                <Input
                  id="community"
                  value={community}
                  onChange={e => setCommunity(e.target.value)}
                  placeholder="e.g., Punjabi, Telugu Brahmin"
                  className="border-wedding-gold focus:ring-wedding-gold"
                />
              </div>
            </div>

            <h3 className="font-semibold mb-3 text-wedding-gold">Ceremonies</h3>
            <div className="flex flex-wrap gap-3 mb-4">
              {['Roka', 'Sangeet', 'Haldi', 'Mehendi', 'Wedding', 'Reception'].map(ceremony => (
                <div key={ceremony} className="flex items-center space-x-2">
                  <Checkbox
                    id={ceremony}
                    checked={selectedCeremonies.includes(ceremony)}
                    onCheckedChange={(checked) => handleCeremonyChange(ceremony, checked as boolean)}
                  />
                  <Label htmlFor={ceremony}>{ceremony}</Label>
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-2 mb-4">
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
                className="border-wedding-gold focus:ring-wedding-gold"
              />
              <Button type="button" onClick={addCustomCeremony} variant="outline">Add</Button>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="mt-2"
              onClick={handleSuggestCeremonies}
              disabled={suggestingCeremonies || !region}
            >
              {suggestingCeremonies ? 'Generating Suggestions...' : 'Suggest Ceremonies (AI)'}
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              <i>{suggestingCeremonies ? 'AI is generating ceremony suggestions...' : 'Uses AI to suggest traditional ceremonies based on your region'}</i>
            </p>

          </CardContent>
          <CardFooter>
            <Button
              type="button"
              className="bg-gradient-to-r from-[#ffd700] to-[#ffecb3] text-[#8d6e63] hover:opacity-90 ml-auto"
              onClick={handleSaveWeddingDetails}
              disabled={weddingDetailsLoading}
            >
              {weddingDetailsLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" />Save Details</>
              )}
            </Button>
          </CardFooter>
        </Card>
        {/* Couple Profile Card */}
        <Card className="md:col-span-3 border-wedding-gold/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-wedding-gold">Couple's Profile</CardTitle>
            <CardDescription className="text-gray-600">Introduce your partner and invite them to collaborate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center space-x-4 mb-6">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-wedding-gold/10 text-wedding-gold text-lg">{user?.name ? user.name.charAt(0).toUpperCase() : <span><UserIcon className="h-6 w-6" /></span>}</AvatarFallback>
              </Avatar>
              <span className="text-2xl font-bold text-wedding-gold">{user?.name || "Your Name"}</span>
              <span className="text-2xl font-bold text-gray-500">&</span>
              <span className="text-2xl font-bold text-wedding-gold">{partnerName || "Partner's Name"}</span>
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-wedding-gold/10 text-wedding-gold text-lg">{partnerName ? partnerName.charAt(0).toUpperCase() : <span><UserIcon className="h-6 w-6" /></span>}</AvatarFallback>
              </Avatar>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partnerName">Partner's Name</Label>
                <Input
                  id="partnerName"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="Enter partner's name"
                  className="border-wedding-gold focus:ring-wedding-gold"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="partnerEmail">Partner's Email</Label>
                <Input
                  id="partnerEmail"
                  type="email"
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  placeholder="Enter partner's email"
                  className="border-wedding-gold focus:ring-wedding-gold"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              type="button"
              className="bg-gradient-to-r from-[#ffd700] to-[#ffecb3] text-[#8d6e63] hover:opacity-90"
              onClick={handleInvitePartner}
              disabled={inviteLoading || !partnerEmail}
            >
              {inviteLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Inviting...</>
              ) : (
                <><Mail className="mr-2 h-4 w-4" />Invite Partner</>
              )}
            </Button>
          </CardFooter>
        </Card>
        {/* Wedding Team / Family Card */}
        <Card className="md:col-span-3 border-wedding-gold/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-wedding-gold">Wedding Team / Family</CardTitle>
            <CardDescription className="text-gray-600">Invite family members or planners to collaborate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="font-semibold mb-2">Invite New Team Member</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Name"
                  value={newTeamMemberName}
                  onChange={(e) => setNewTeamMemberName(e.target.value)}
                  className="border-wedding-gold focus:ring-wedding-gold"
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={newTeamMemberEmail}
                  onChange={(e) => setNewTeamMemberEmail(e.target.value)}
                  className="border-wedding-gold focus:ring-wedding-gold"
                />
                <Select value={newTeamMemberRole} onValueChange={setNewTeamMemberRole}>
                  <SelectTrigger className="border-wedding-gold focus:ring-wedding-gold">
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
                className="bg-gradient-to-r from-[#ffd700] to-[#ffecb3] text-[#8d6e63] hover:opacity-90 w-full"
                onClick={handleAddTeamMember}
                disabled={!newTeamMemberName || !newTeamMemberEmail || !newTeamMemberRole}
              >
                <Mail className="mr-2 h-4 w-4" />Invite Team Member
              </Button>

              <h3 className="font-semibold mt-6 mb-2">Current Team Members</h3>
              {teamMembers.length === 0 ? (
                <p className="text-gray-500">No team members invited yet.</p>
              ) : (
                <div className="space-y-3">
                  {teamMembers.map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">{member.name} ({member.role})</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => handleRemoveTeamMember(member.email)}>Remove</Button>
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
