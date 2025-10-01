"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import PageLayout from "@/components/PageLayout";
import { Bell, Loader2, Save, User, Lock, Palette } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserProfile } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { theme: systemTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settingsData, setSettingsData] = useState({
    timezone: "America/Los_Angeles",
    language: "en",
    theme: systemTheme || "system",
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    recommendationsNotifications: true,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync theme state with next-themes
  useEffect(() => {
    if (systemTheme) {
      setSettingsData(prev => ({ ...prev, theme: systemTheme }));
    }
  }, [systemTheme]);

  // Auth check
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  // Fetch user settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (!session?.user) return;

      try {
        const response = await fetch("/api/user/settings");

        if (response.ok) {
          const data = await response.json();
          if (data.settings) {
            setSettingsData({
              timezone: data.settings.timezone || "America/Los_Angeles",
              language: data.settings.language || "en",
              theme: data.settings.theme || "system",
            });
            setNotifications({
              emailNotifications: data.settings.emailNotifications ?? true,
              pushNotifications: data.settings.pushNotifications ?? true,
              weeklyReports: data.settings.weeklyReports ?? true,
              recommendationsNotifications: data.settings.recommendationsNotifications ?? true,
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user && mounted) {
      fetchSettings();
    }
  }, [session, mounted]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          timezone: settingsData.timezone,
          language: settingsData.language,
          theme: settingsData.theme,
          ...notifications,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to update settings");
        return;
      }

      toast.success("Settings updated successfully");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || isPending || loading) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="min-h-screen gradient-mesh">
      <Sidebar />
      
      <PageLayout>
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        <div className="max-w-4xl">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="glass mb-6">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Appearance
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab - Clerk UserProfile */}
            <TabsContent value="profile">
              <div className="glass-card rounded-2xl p-6 animate-fade-in">
                <UserProfile 
                  appearance={{
                    baseTheme: systemTheme === "dark" ? dark : undefined,
                    elements: {
                      rootBox: "w-full",
                      card: "shadow-none bg-transparent border-0",
                      navbar: "hidden",
                      navbarMobileMenuButton: "hidden",
                      headerTitle: "text-foreground",
                      headerSubtitle: "text-muted-foreground",
                      profileSection: "bg-transparent",
                      profileSectionPrimaryButton: "bg-primary text-primary-foreground hover:bg-primary/90",
                      formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
                      formFieldInput: "bg-background border-border text-foreground",
                      formFieldLabel: "text-foreground",
                      badge: "bg-primary/10 text-primary",
                      avatarBox: "border-border",
                      userButtonPopoverCard: "bg-card border-border",
                      userButtonPopoverActionButton: "text-foreground hover:bg-accent",
                      userButtonPopoverActionButtonText: "text-foreground",
                      userButtonPopoverFooter: "hidden",
                    },
                  }}
                />
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <div className="glass-card rounded-2xl p-6 animate-fade-in">
                <h2 className="text-2xl font-bold mb-6">Notification Preferences</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-xl glass">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive updates and insights via email
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, emailNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl glass">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified about important updates
                      </p>
                    </div>
                    <Switch
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, pushNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl glass">
                    <div>
                      <p className="font-medium">Weekly Progress Reports</p>
                      <p className="text-sm text-muted-foreground">
                        Receive weekly summaries of your health journey
                      </p>
                    </div>
                    <Switch
                      checked={notifications.weeklyReports}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, weeklyReports: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl glass">
                    <div>
                      <p className="font-medium">New Recommendations</p>
                      <p className="text-sm text-muted-foreground">
                        Get alerted when new recommendations are available
                      </p>
                    </div>
                    <Switch
                      checked={notifications.recommendationsNotifications}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, recommendationsNotifications: checked })
                      }
                    />
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleSaveSettings}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Preferences
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy">
              <div className="glass-card rounded-2xl p-6 animate-fade-in">
                <h2 className="text-2xl font-bold mb-6">Privacy & Security</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Change Password</h3>
                    <div className="space-y-4">
                      <Input
                        type="password"
                        placeholder="Current Password"
                        className="glass"
                        disabled
                      />
                      <Input
                        type="password"
                        placeholder="New Password"
                        className="glass"
                        disabled
                      />
                      <Input
                        type="password"
                        placeholder="Confirm New Password"
                        className="glass"
                        disabled
                      />
                      <Button variant="outline" disabled>Update Password</Button>
                      <p className="text-xs text-muted-foreground">Password change functionality coming soon</p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border/50">
                    <h3 className="font-semibold mb-2 text-red-500">Danger Zone</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Permanent actions that cannot be undone
                    </p>
                    <div className="space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full text-red-500 border-red-500/50 hover:bg-red-500/10"
                        disabled
                      >
                        Delete All Data
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full text-red-500 border-red-500/50 hover:bg-red-500/10"
                        disabled
                      >
                        Delete Account
                      </Button>
                      <p className="text-xs text-muted-foreground">Account deletion functionality coming soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance">
              <div className="glass-card rounded-2xl p-6 animate-fade-in">
                <h2 className="text-2xl font-bold mb-6">Appearance</h2>
                
                <div className="space-y-6">
                  <div>
                    <Label className="mb-3 block">Theme</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <button 
                        className={`p-4 rounded-xl glass hover:ring-2 ring-primary smooth-transition ${systemTheme === 'light' ? 'ring-2' : ''}`}
                        onClick={() => {
                          setTheme('light');
                          setSettingsData({ ...settingsData, theme: 'light' });
                        }}
                      >
                        <div className="w-full h-20 rounded-lg bg-gradient-to-br from-white to-gray-100 mb-2"></div>
                        <p className="text-sm font-medium">Light</p>
                      </button>
                      <button 
                        className={`p-4 rounded-xl glass hover:ring-2 ring-primary smooth-transition ${systemTheme === 'dark' ? 'ring-2' : ''}`}
                        onClick={() => {
                          setTheme('dark');
                          setSettingsData({ ...settingsData, theme: 'dark' });
                        }}
                      >
                        <div className="w-full h-20 rounded-lg bg-gradient-to-br from-gray-900 to-black mb-2"></div>
                        <p className="text-sm font-medium">Dark</p>
                      </button>
                      <button 
                        className={`p-4 rounded-xl glass hover:ring-2 ring-primary smooth-transition ${systemTheme === 'system' ? 'ring-2' : ''}`}
                        onClick={() => {
                          setTheme('system');
                          setSettingsData({ ...settingsData, theme: 'system' });
                        }}
                      >
                        <div className="w-full h-20 rounded-lg bg-gradient-to-br from-white via-gray-400 to-black mb-2"></div>
                        <p className="text-sm font-medium">System</p>
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label className="mb-3 block">Timezone</Label>
                    <Select
                      value={settingsData.timezone}
                      onValueChange={(value) => setSettingsData({ ...settingsData, timezone: value })}
                    >
                      <SelectTrigger className="glass">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                        <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="mb-3 block">Language</Label>
                    <Select 
                      value={settingsData.language}
                      onValueChange={(value) => setSettingsData({ ...settingsData, language: value })}
                    >
                      <SelectTrigger className="glass">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleSaveSettings}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Preferences
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </div>
  );
}