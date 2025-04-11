
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { updateProfile } from "firebase/auth";
import { auth } from "@/config/firebase";
import { Loader2, User as UserIcon, Mail, Calendar, Lock, Save } from "lucide-react";

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setIsLoading(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName,
      });

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
  const formatAccountCreationDate = () => {
    if (!auth.currentUser?.metadata.creationTime) return "N/A";
    return new Date(auth.currentUser.metadata.creationTime).toLocaleDateString();
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="weddingDate">Wedding Date</Label>
                <Input 
                  id="weddingDate" 
                  type="date"
                  placeholder="Select date" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  placeholder="Wedding venue"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tradition">Wedding Tradition</Label>
                <Input 
                  id="tradition" 
                  placeholder="e.g., Hindu, Sikh, Bengali"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="bg-wedding-red hover:bg-wedding-deepred ml-auto"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Details
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
