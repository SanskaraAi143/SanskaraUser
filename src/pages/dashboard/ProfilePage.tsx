import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getWeddingDetails, updateWeddingDetails } from "@/services/api/sanskaraApi"; // Import new API functions

import { Loader2, User as UserIcon, Mail, Calendar, Lock, Save } from "lucide-react";

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
  const [weddingDetailsLoading, setWeddingDetailsLoading] = useState(false);


  React.useEffect(() => {
    async function fetchWeddingData() {
      setWeddingDetailsLoading(true);
      try {
        if (!user?.wedding_id) {
          console.log("No wedding_id found for the current user.");
          return;
        }
        setWeddingId(user.wedding_id);
        const data = await getWeddingDetails(user.wedding_id);
        if (data) {
          setWeddingDate(data.wedding_date || "");
          setLocation(data.wedding_location || "");
          setTradition(data.wedding_tradition || "");
        }
      } catch (e) {
        console.error("Failed to fetch wedding details:", e);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load wedding details.",
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

      await updateWeddingDetails(weddingId, {
        wedding_date: weddingDate || null,
        wedding_location: location || null,
        wedding_tradition: tradition || null,
      });

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1 border-wedding-gold/30 shadow-lg">
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
      </div>
      {/* Wedding Details Card */}
      <Card className="border-wedding-gold/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-wedding-gold">Wedding Details</CardTitle>
          <CardDescription className="text-gray-600">Information about your upcoming ceremony</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
  );
};

export default ProfilePage;
