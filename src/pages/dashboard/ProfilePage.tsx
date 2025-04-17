
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/services/supabase/config";
import { Loader2, User as UserIcon, Mail, Calendar, Lock, Save } from "lucide-react";

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [weddingDate, setWeddingDate] = useState("");
  const [weddingLocation, setWeddingLocation] = useState("");
  const [weddingTradition, setWeddingTradition] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isWeddingDetailsLoading, setIsWeddingDetailsLoading] = useState(false);

  useEffect(() => {
    // Load user's wedding details from the database
    const loadUserDetails = async () => {
      if (!user?.id) return;
      
      try {
        setIsWeddingDetailsLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('wedding_date, wedding_location, wedding_tradition')
          .eq('user_id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          if (data.wedding_date) setWeddingDate(data.wedding_date);
          if (data.wedding_location) setWeddingLocation(data.wedding_location);
          if (data.wedding_tradition) setWeddingTradition(data.wedding_tradition);
        }
      } catch (error) {
        console.error("Error loading user details:", error);
      } finally {
        setIsWeddingDetailsLoading(false);
      }
    };
    
    loadUserDetails();
  }, [user?.id]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: { name: displayName }
      });
      
      if (error) throw error;

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

  const handleUpdateWeddingDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsWeddingDetailsLoading(true);
    try {
      // Update wedding details in the users table
      const { error } = await supabase
        .from('users')
        .update({
          wedding_date: weddingDate || null,
          wedding_location: weddingLocation,
          wedding_tradition: weddingTradition
        })
        .eq('user_id', user.id);
      
      if (error) throw error;

      toast({
        title: "Wedding Details Updated",
        description: "Your wedding information has been successfully updated.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "There was a problem updating your wedding details.",
      });
      console.error("Error updating wedding details:", error);
    } finally {
      setIsWeddingDetailsLoading(false);
    }
  };

  // Calculate when the account was created
  const formatAccountCreationDate = () => {
    if (!user?.id) return "N/A";
    // This would typically come from user metadata
    return new Date().toLocaleDateString(); // Placeholder
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-playfair font-semibold mb-6 text-wedding-maroon">My Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-2">
              {user?.photoURL ? (
                <AvatarImage src={user.photoURL} alt={user.name || "User"} />
              ) : (
                <AvatarFallback className="bg-wedding-red/10 text-wedding-red text-xl">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-8 w-8" />}
                </AvatarFallback>
              )}
            </Avatar>
            <CardTitle className="text-xl">{user?.name || "User"}</CardTitle>
            <CardDescription className="text-sm">{user?.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2 text-gray-500" />
              <span>Email: </span>
              <span className="ml-auto font-medium">{user?.email}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-gray-500" />
              <span>Account created: </span>
              <span className="ml-auto font-medium">{formatAccountCreationDate()}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </Button>
          </CardFooter>
        </Card>

        {/* Edit Profile Form */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
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
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  value={user?.email || ""} 
                  disabled 
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">Email address cannot be changed</p>
              </div>

              <Button 
                type="submit" 
                className="bg-wedding-red hover:bg-wedding-deepred"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Wedding Details Card */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Wedding Details</CardTitle>
            <CardDescription>
              Information about your upcoming ceremony
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateWeddingDetails}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="weddingDate">Wedding Date</Label>
                  <Input 
                    id="weddingDate" 
                    type="date"
                    value={weddingDate}
                    onChange={(e) => setWeddingDate(e.target.value)}
                    placeholder="Select date" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    value={weddingLocation}
                    onChange={(e) => setWeddingLocation(e.target.value)}
                    placeholder="Wedding venue"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tradition">Wedding Tradition</Label>
                  <Input 
                    id="tradition" 
                    value={weddingTradition}
                    onChange={(e) => setWeddingTradition(e.target.value)}
                    placeholder="e.g., Hindu, Sikh, Bengali"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button 
                  type="submit" 
                  className="bg-wedding-red hover:bg-wedding-deepred"
                  disabled={isWeddingDetailsLoading}
                >
                  {isWeddingDetailsLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Details
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
