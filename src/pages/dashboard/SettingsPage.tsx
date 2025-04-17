
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Bell, Lock, LogOut, Moon, Shield, User, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/services/supabase/config";

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    taskReminders: true,
    vendorUpdates: true,
    dataCollection: true,
    thirdPartySharing: false,
    darkMode: false,
  });

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleToggleChange = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveChanges = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    try {
      // Save preferences to user's record in the database
      const { error } = await supabase
        .from('users')
        .update({
          preferences: preferences
        })
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        variant: "destructive",
        title: "Save failed",
        description: "There was a problem saving your preferences.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Account</CardTitle>
            </div>
            <CardDescription>Manage your account details and email preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={user?.email || ""} disabled />
              <p className="text-sm text-muted-foreground">
                We'll use this email to contact you about your wedding planning.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Display Name</Label>
              <Input id="name" placeholder="Your Name" value={user?.name || ""} disabled />
              <p className="text-sm text-muted-foreground">
                To change your profile details, go to the Profile page.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Configure how you receive notifications and updates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive important updates via email.
                </p>
              </div>
              <Switch 
                id="email-notifications" 
                checked={preferences.emailNotifications}
                onCheckedChange={() => handleToggleChange('emailNotifications')}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="task-reminders">Task Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminded of upcoming tasks and deadlines.
                </p>
              </div>
              <Switch 
                id="task-reminders" 
                checked={preferences.taskReminders}
                onCheckedChange={() => handleToggleChange('taskReminders')}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="vendor-updates">Vendor Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications when vendors respond or update details.
                </p>
              </div>
              <Switch 
                id="vendor-updates" 
                checked={preferences.vendorUpdates}
                onCheckedChange={() => handleToggleChange('vendorUpdates')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Privacy</CardTitle>
            </div>
            <CardDescription>Manage your privacy settings and data usage.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="data-collection">Data Collection</Label>
                <p className="text-sm text-muted-foreground">
                  Allow us to collect anonymous usage data to improve the app.
                </p>
              </div>
              <Switch 
                id="data-collection" 
                checked={preferences.dataCollection}
                onCheckedChange={() => handleToggleChange('dataCollection')}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="third-party">Third-Party Sharing</Label>
                <p className="text-sm text-muted-foreground">
                  Share your information with trusted vendors.
                </p>
              </div>
              <Switch 
                id="third-party" 
                checked={preferences.thirdPartySharing}
                onCheckedChange={() => handleToggleChange('thirdPartySharing')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>Manage your account security.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full" onClick={async () => {
              const { error } = await supabase.auth.resetPasswordForEmail(user?.email || '', {
                redirectTo: `${window.location.origin}/reset-password`,
              });
              if (!error) {
                toast({
                  title: "Password reset email sent",
                  description: "Check your email for the password reset link"
                });
              } else {
                toast({
                  variant: "destructive",
                  title: "Failed to send password reset email",
                  description: error.message
                });
              }
            }}>
              Change Password
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Appearance</CardTitle>
            </div>
            <CardDescription>Customize how the app looks and feels.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark mode.
                </p>
              </div>
              <Switch 
                id="dark-mode" 
                checked={preferences.darkMode}
                onCheckedChange={() => handleToggleChange('darkMode')}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-red-500">Danger Zone</CardTitle>
            </div>
            <CardDescription>
              Actions in this section can't be undone. Be careful.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={async () => {
                const confirmDelete = window.confirm("Are you sure you want to delete your account? This cannot be undone.");
                if (confirmDelete) {
                  const { error } = await supabase.auth.admin.deleteUser(user?.id || '');
                  if (!error) {
                    toast({
                      title: "Account deleted",
                      description: "Your account has been permanently deleted"
                    });
                    // Redirect to home page after account deletion
                    window.location.href = "/";
                  } else {
                    toast({
                      variant: "destructive",
                      title: "Failed to delete account",
                      description: error.message
                    });
                  }
                }
              }}
            >
              Delete Account
            </Button>
            <Button 
              variant="outline" 
              className="w-full text-red-500 border-red-200 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              Deleting your account will permanently remove all your data including wedding plans, guest lists, and vendor contacts.
            </p>
          </CardFooter>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSaveChanges}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
