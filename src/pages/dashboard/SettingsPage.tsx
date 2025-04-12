
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Settings, 
  User, 
  Bell, 
  Key, 
  Lock, 
  HelpCircle, 
  LogOut, 
  Globe, 
  Calendar, 
  Mail, 
  Palette
} from "lucide-react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/context/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SettingsPage = () => {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  
  // Notification settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [reminderNotifications, setReminderNotifications] = useState(true);
  const [guestUpdates, setGuestUpdates] = useState(true);
  
  // Account settings state
  const [username, setUsername] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  
  // Appearance settings state
  const [colorTheme, setColorTheme] = useState("traditional");
  const [language, setLanguage] = useState("english");
  const [dateFormat, setDateFormat] = useState("dd/mm/yyyy");
  
  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "friends",
    guestListVisibility: "private",
    eventDetailsVisibility: "public"
  });

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 max-w-2xl">
          <TabsTrigger value="account" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center">
            <Palette className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center">
            <Lock className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="help" className="flex items-center">
            <HelpCircle className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Help</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Manage your account details and personal information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      placeholder="Your name" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Your email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Password</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" placeholder="••••••••" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" placeholder="••••••••" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" placeholder="••••••••" />
                  </div>
                  <Button className="w-full sm:w-auto" variant="outline">
                    <Key className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Danger Zone</h3>
                <div className="space-y-4">
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                  </Button>
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                    Delete Account
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveSettings}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how you receive notifications and updates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive updates and reminders via email
                    </p>
                  </div>
                  <Switch 
                    id="email-notifications" 
                    checked={emailNotifications} 
                    onCheckedChange={setEmailNotifications} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications on your device
                    </p>
                  </div>
                  <Switch 
                    id="push-notifications" 
                    checked={pushNotifications} 
                    onCheckedChange={setPushNotifications} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reminder-notifications">Event Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive reminders about upcoming events and tasks
                    </p>
                  </div>
                  <Switch 
                    id="reminder-notifications" 
                    checked={reminderNotifications} 
                    onCheckedChange={setReminderNotifications} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="guest-updates">Guest Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about guest RSVPs and updates
                    </p>
                  </div>
                  <Switch 
                    id="guest-updates" 
                    checked={guestUpdates} 
                    onCheckedChange={setGuestUpdates} 
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveSettings}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize the look and feel of your dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Color Theme</Label>
                  <RadioGroup 
                    value={colorTheme} 
                    onValueChange={setColorTheme} 
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="traditional" id="traditional" />
                      <Label htmlFor="traditional">Traditional (Red and Gold)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="modern" id="modern" />
                      <Label htmlFor="modern">Modern (Purple and Silver)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="minimal" id="minimal" />
                      <Label htmlFor="minimal">Minimal (Black and White)</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="hindi">हिन्दी (Hindi)</SelectItem>
                      <SelectItem value="tamil">தமிழ் (Tamil)</SelectItem>
                      <SelectItem value="telugu">తెలుగు (Telugu)</SelectItem>
                      <SelectItem value="bengali">বাংলা (Bengali)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select value={dateFormat} onValueChange={setDateFormat}>
                    <SelectTrigger id="date-format">
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveSettings}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="privacy" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>
                Control who can see your information and how it's used.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-visibility">Profile Visibility</Label>
                  <Select 
                    value={privacySettings.profileVisibility} 
                    onValueChange={(value) => setPrivacySettings({...privacySettings, profileVisibility: value})}
                  >
                    <SelectTrigger id="profile-visibility">
                      <SelectValue placeholder="Who can see your profile" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="guest-list-visibility">Guest List Visibility</Label>
                  <Select 
                    value={privacySettings.guestListVisibility} 
                    onValueChange={(value) => setPrivacySettings({...privacySettings, guestListVisibility: value})}
                  >
                    <SelectTrigger id="guest-list-visibility">
                      <SelectValue placeholder="Who can see your guest list" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">All Guests</SelectItem>
                      <SelectItem value="friends">Close Friends Only</SelectItem>
                      <SelectItem value="private">Only Me</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="event-details-visibility">Event Details Visibility</Label>
                  <Select 
                    value={privacySettings.eventDetailsVisibility} 
                    onValueChange={(value) => setPrivacySettings({...privacySettings, eventDetailsVisibility: value})}
                  >
                    <SelectTrigger id="event-details-visibility">
                      <SelectValue placeholder="Who can see your event details" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="guests">Invited Guests Only</SelectItem>
                      <SelectItem value="private">Only Me</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveSettings}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="help" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Help & Support</CardTitle>
              <CardDescription>
                Need help with your wedding planning? We're here to assist you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-medium mb-2">Frequently Asked Questions</h3>
                  <ul className="space-y-2">
                    <li className="text-sm">
                      <strong>How do I add guests to my list?</strong>
                      <p className="text-muted-foreground mt-1">
                        Go to the Guest List page and click "Add Guest" to add new guests.
                      </p>
                    </li>
                    <li className="text-sm">
                      <strong>Can I export my guest list?</strong>
                      <p className="text-muted-foreground mt-1">
                        Yes, you can export your guest list as a CSV or Excel file from the Guest List page.
                      </p>
                    </li>
                    <li className="text-sm">
                      <strong>How do I track RSVPs?</strong>
                      <p className="text-muted-foreground mt-1">
                        All RSVPs are automatically tracked in the Guest List section when guests respond.
                      </p>
                    </li>
                  </ul>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-medium mb-2">Contact Support</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Need additional help? Our support team is available to assist you.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-wedding-red mr-3" />
                      <span>support@sanskarai.com</span>
                    </div>
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 text-wedding-red mr-3" />
                      <a href="#" className="text-wedding-red hover:underline">
                        www.sanskarai.com/support
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
