import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Bell, LogOut, Moon, Shield, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { getCurrentUserProfile, updateCurrentUserProfile } from '@/services/api/userApi';
import ChangePasswordSection from './ChangePasswordSection';

const defaultPreferences = {
  email_notifications: true,
  task_reminders: true,
  vendor_updates: true,
  data_collection: true,
  third_party_sharing: false,
  dark_mode: false,
};

const SettingsPage = () => {
  const { signOut, user } = useAuth();
  const [settings, setSettings] = useState(defaultPreferences);
  const [settingsLoading, setSettingsLoading] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      setSettingsLoading(true);
      try {
        const data = await getCurrentUserProfile();
        if (data && data.preferences) {
          setSettings({ ...defaultPreferences, ...data.preferences });
        }
      } catch (e: any) {
        toast({
          variant: "destructive",
          title: "Failed to load settings",
          description: e?.message || "Could not fetch user settings.",
        });
      }
      setSettingsLoading(false);
    }
    fetchSettings();
    // eslint-disable-next-line
  }, [user.id]);

  const handleSaveChanges = async () => {
    setSettingsLoading(true);
    try {
      await updateCurrentUserProfile({ preferences: settings });
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: e?.message || "Could not save settings.",
      });
    }
    setSettingsLoading(false);
  };


  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update password.",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
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
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Email Address</label>
              <Input
                value={user?.email || ''}
                disabled
                className="bg-gray-100 cursor-not-allowed"
                placeholder="you@example.com"
              />
              <p className="text-xs text-muted-foreground">We'll use this email to contact you about your wedding planning.</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Display Name</label>
              <Input
                value={user?.name || ''}
                disabled
                className="bg-gray-100 cursor-not-allowed"
                placeholder="Your Name"
              />
            </div>
            <ChangePasswordSection />
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
              <Switch id="email-notifications" checked={settings.email_notifications} onCheckedChange={v => setSettings(s => ({ ...s, email_notifications: v }))} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="task-reminders">Task Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminded of upcoming tasks and deadlines.
                </p>
              </div>
              <Switch id="task-reminders" checked={settings.task_reminders} onCheckedChange={v => setSettings(s => ({ ...s, task_reminders: v }))} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="vendor-updates">Vendor Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications when vendors respond or update details.
                </p>
              </div>
              <Switch id="vendor-updates" checked={settings.vendor_updates} onCheckedChange={v => setSettings(s => ({ ...s, vendor_updates: v }))} />
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
              <Switch id="data-collection" checked={settings.data_collection} onCheckedChange={v => setSettings(s => ({ ...s, data_collection: v }))} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="third-party">Third-Party Sharing</Label>
                <p className="text-sm text-muted-foreground">
                  Share your information with trusted vendors.
                </p>
              </div>
              <Switch id="third-party" checked={settings.third_party_sharing} onCheckedChange={v => setSettings(s => ({ ...s, third_party_sharing: v }))} />
            </div>
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
              <Switch id="dark-mode" checked={settings.dark_mode} onCheckedChange={v => setSettings(s => ({ ...s, dark_mode: v }))} />
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
            <Button variant="destructive" className="w-full">
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
        <Button onClick={handleSaveChanges} disabled={settingsLoading}>
          {settingsLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
