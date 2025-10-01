import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { weddingRegions, weddingCommunities, weddingCeremonies } from "@/config/weddingOptions";


import { Loader2, User as UserIcon, Mail, Calendar, Lock, Save, Users, Trash2 } from "lucide-react";
import { supabase } from "@/services/supabase/config";

interface WeddingMember {
  role: string;
  users: {
    display_name: string | null;
    email: string;
  };
}

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [isLoading, setIsLoading] = useState(false);

  // Wedding details state
  const [weddingId, setWeddingId] = useState<string | null>(null);
  const [weddingDate, setWeddingDate] = useState("");
  const [location, setLocation] = useState("");
  const [region, setRegion] = useState("");
  const [community, setCommunity] = useState("");
  const [selectedCeremonies, setSelectedCeremonies] = useState<string[]>([]);
  const [weddingDetailsLoading, setWeddingDetailsLoading] = useState(false);

  // Wedding team state
  const [members, setMembers] = useState<WeddingMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [isInviting, setIsInviting] = useState(false);


  React.useEffect(() => {
    async function fetchWeddingData() {
      if (!user?.wedding_id) {
        console.log("No wedding_id found for the current user.");
        return;
      }
      setWeddingId(user.wedding_id);
      setWeddingDetailsLoading(true);

      try {
        // Fetch wedding details
        const weddingDetailsPromise = supabase
          .from('weddings')
          .select('wedding_date, wedding_location, wedding_tradition, details')
          .eq('wedding_id', user.wedding_id)
          .single();

        // Fetch wedding members
        const weddingMembersPromise = supabase
          .from('wedding_members')
          .select('role, users(display_name, email)')
          .eq('wedding_id', user.wedding_id);

        const [detailsResult, membersResult] = await Promise.all([
          weddingDetailsPromise,
          weddingMembersPromise,
        ]);

        if (detailsResult.error) throw detailsResult.error;
        if (membersResult.error) throw membersResult.error;

        if (detailsResult.data) {
          setWeddingDate(detailsResult.data.wedding_date || "");
          setLocation(detailsResult.data.wedding_location || "");
          const details = detailsResult.data.details || {};
          setRegion(details.region || "");
          setCommunity(details.community || "");
          setSelectedCeremonies(details.ceremonies || []);
        }

        if (membersResult.data) {
          setMembers(membersResult.data);
        }
      } catch (e) {
        console.error("Failed to fetch wedding data:", e);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load your wedding information.",
        });
      } finally {
        setWeddingDetailsLoading(false);
      }
    }
    fetchWeddingData();
  }, [user, toast]);

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

      const traditionString = community
        ? `${weddingCommunities[region]?.find(c => c.value === community)?.label}, ${weddingRegions.find(r => r.value === region)?.label}`
        : weddingRegions.find(r => r.value === region)?.label || "";

      const { error } = await supabase
        .from('weddings')
        .update({
          wedding_date: weddingDate || null,
          wedding_location: location || null,
          wedding_tradition: traditionString,
          details: {
            region,
            community,
            ceremonies: selectedCeremonies,
          },
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

  const handleCeremonyChange = (ceremonyId: string) => {
    setSelectedCeremonies(prev =>
      prev.includes(ceremonyId)
        ? prev.filter(id => id !== ceremonyId)
        : [...prev, ceremonyId]
    );
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteRole) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide both an email and a role to send an invitation.",
      });
      return;
    }
    setIsInviting(true);
    try {
      // Placeholder for actual invitation logic
      console.log(`Inviting ${inviteEmail} as ${inviteRole}`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      toast({
        title: "Invitation Sent",
        description: `${inviteEmail} has been invited to join your wedding team.`,
      });
      setInviteEmail("");
      setInviteRole("");
    } catch (error) {
      console.error("Failed to send invitation:", error);
      toast({
        variant: "destructive",
        title: "Invitation Failed",
        description: "Could not send the invitation. Please try again.",
      });
    } finally {
      setIsInviting(false);
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
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-playfair font-semibold text-wedding-gold mb-6">My Profile</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile & Wedding Team */}
        <div className="lg:col-span-1 space-y-8">
          {/* Profile Card */}
          <Card className="border-wedding-gold/30 shadow-lg">
            <CardHeader className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-2">
                <AvatarFallback className="bg-wedding-gold/10 text-wedding-gold text-xl">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-8 w-8" />}
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

          {/* Wedding Team Card */}
          <Card className="border-wedding-gold/30 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-wedding-gold">
                <Users className="mr-2" /> Wedding Team & Family
              </CardTitle>
              <CardDescription className="text-gray-600">Invite and manage your wedding team.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInviteMember} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inviteEmail">Member Email</Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    placeholder="partner@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="border-wedding-gold focus:ring-wedding-gold"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inviteRole">Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger className="border-wedding-gold focus:ring-wedding-gold">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="partner">Partner (Bride/Groom)</SelectItem>
                      <SelectItem value="planner">Wedding Planner</SelectItem>
                      <SelectItem value="family_bride">Bride's Family</SelectItem>
                      <SelectItem value="family_groom">Groom's Family</SelectItem>
                      <SelectItem value="friend">Friend</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#ffd700] to-[#ffecb3] text-[#8d6e63] hover:opacity-90"
                  disabled={isInviting}
                >
                  {isInviting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending Invite...</>
                  ) : (
                    "Send Invite"
                  )}
                </Button>
              </form>
              <Separator className="my-6" />
              <div>
                <h4 className="text-sm font-medium text-gray-800 mb-2">Current Members</h4>
                <div className="space-y-3">
                  {members.length > 0 ? (
                    members.map((member: WeddingMember) => (
                      <div key={member.users.email} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-3">
                            <AvatarFallback className="bg-wedding-gold/20 text-wedding-gold text-xs">
                              {member.users.display_name ? member.users.display_name.charAt(0).toUpperCase() : 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-semibold">{member.users.display_name}</p>
                            <p className="text-xs text-gray-500">{member.users.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                           <span className="text-xs font-medium text-gray-600 mr-3 px-2 py-1 rounded-full bg-gray-200">
                            {member.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-100" onClick={() => console.log('Remove member')}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">No members have been added yet.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Edit Profile & Wedding Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Edit Profile Form */}
          <Card className="border-wedding-gold/30 shadow-lg">
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
          <Card className="border-wedding-gold/30 shadow-lg">
            <CardHeader>
              <CardTitle className="text-wedding-gold">Wedding Details</CardTitle>
              <CardDescription className="text-gray-600">This is the core of your planning. This information will be used by the AI to customize your experience.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    placeholder="e.g., Hyderabad"
                    className="border-wedding-gold focus:ring-wedding-gold"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Select value={region} onValueChange={value => { setRegion(value); setCommunity(''); }}>
                    <SelectTrigger className="border-wedding-gold focus:ring-wedding-gold">
                      <SelectValue placeholder="Select a region" />
                    </SelectTrigger>
                    <SelectContent>
                      {weddingRegions.map(r => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="community">Community</Label>
                  <Select value={community} onValueChange={setCommunity} disabled={!region}>
                    <SelectTrigger className="border-wedding-gold focus:ring-wedding-gold">
                      <SelectValue placeholder="Select a community" />
                    </SelectTrigger>
                    <SelectContent>
                      {region && weddingCommunities[region] ? (
                        weddingCommunities[region].map(c => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>Select a region first</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-base">Ceremonies & Events</Label>
                <p className="text-sm text-gray-500 mb-4">Select all the events that will be part of your wedding celebration.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {weddingCeremonies.map((ceremony) => (
                    <div key={ceremony.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={ceremony.id}
                        checked={selectedCeremonies.includes(ceremony.id)}
                        onCheckedChange={() => handleCeremonyChange(ceremony.id)}
                      />
                      <label
                        htmlFor={ceremony.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {ceremony.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
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
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
