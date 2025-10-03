"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import PageLayout from "@/components/PageLayout";
import { Bell, Loader2, Save, User, Palette } from "lucide-react";
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
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
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
        console.error("Settings update error:", data);
        toast.error(data.error || "Failed to update settings");
        return;
      }

      toast.success(data.message || "Settings updated successfully");
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
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Settings</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="glass-card mb-6 sm:mb-8 w-full justify-start p-2 rounded-2xl flex flex-wrap gap-2 h-auto">
              <TabsTrigger value="profile" className="flex items-center gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap">
                <User className="w-4 h-4 shrink-0" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap">
                <Bell className="w-4 h-4 shrink-0" />
                <span>Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2.5 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap">
                <Palette className="w-4 h-4 shrink-0" />
                <span>Appearance</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab - Clerk UserProfile */}
            <TabsContent value="profile" className="animate-fade-in">
              <div className="glass-card rounded-3xl p-4 sm:p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
                <div className="relative z-10">
                  <UserProfile 
                    routing="hash"
                    appearance={{
                      baseTheme: systemTheme === "dark" ? dark : undefined,
                      elements: {
                        rootBox: "w-full",
                        card: "shadow-none bg-transparent border-0",
                        navbar: "hidden",
                        navbarMobileMenuButton: "hidden",
                        headerTitle: "text-foreground font-bold text-xl",
                        headerSubtitle: "text-muted-foreground",
                        profileSection: "bg-transparent",
                        profileSectionPrimaryButton: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl",
                        formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl",
                        formFieldInput: "bg-background border-border text-foreground rounded-xl",
                        formFieldLabel: "text-foreground font-medium",
                        badge: "bg-primary/10 text-primary rounded-full",
                        avatarBox: "border-border",
                        userButtonPopoverCard: "bg-card border-border",
                        userButtonPopoverActionButton: "text-foreground hover:bg-accent",
                        userButtonPopoverActionButtonText: "text-foreground",
                        userButtonPopoverFooter: "hidden",
                      },
                    }}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="animate-fade-in">
              <div className="glass-card rounded-3xl p-4 sm:p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-chart-2/10 flex items-center justify-center">
                      <Bell className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Notification Preferences</h2>
                      <p className="text-sm text-muted-foreground">Manage how you receive updates</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Email Notifications */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl glass-card hover-lift smooth-transition border border-border/50">
                      <div className="flex-1 sm:pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">Email Notifications</p>
                          {notifications.emailNotifications && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Active</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">Receive updates and insights via email</p>
                      </div>
                      <Switch
                        checked={notifications.emailNotifications}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                        className="self-end sm:self-auto"
                      />
                    </div>

                    {/* Push Notifications */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl glass-card hover-lift smooth-transition border border-border/50">
                      <div className="flex-1 sm:pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">Push Notifications</p>
                          {notifications.pushNotifications && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Active</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">Get notified about important updates</p>
                      </div>
                      <Switch
                        checked={notifications.pushNotifications}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, pushNotifications: checked })}
                        className="self-end sm:self-auto"
                      />
                    </div>

                    {/* Weekly Reports */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl glass-card hover-lift smooth-transition border border-border/50">
                      <div className="flex-1 sm:pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">Weekly Progress Reports</p>
                          {notifications.weeklyReports && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Active</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">Receive weekly summaries of your health journey</p>
                      </div>
                      <Switch
                        checked={notifications.weeklyReports}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReports: checked })}
                        className="self-end sm:self-auto"
                      />
                    </div>

                    {/* New Recommendations */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl glass-card hover-lift smooth-transition border border-border/50">
                      <div className="flex-1 sm:pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">New Recommendations</p>
                          {notifications.recommendationsNotifications && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Active</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">Get alerted when new recommendations are available</p>
                      </div>
                      <Switch
                        checked={notifications.recommendationsNotifications}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, recommendationsNotifications: checked })}
                        className="self-end sm:self-auto"
                      />
                    </div>

                    <div className="pt-4">
                      <Button
                        className="w-full rounded-xl"
                        size="lg"
                        onClick={handleSaveSettings}
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5 mr-2" />
                            Save Preferences
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>


            {/* Appearance Tab */}
            <TabsContent value="appearance" className="animate-fade-in">
              <div className="glass-card rounded-3xl p-4 sm:p-6 md:p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6 sm:mb-8">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-chart-2/10 flex items-center justify-center shrink-0">
                      <Palette className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-xl sm:text-2xl font-bold">Appearance</h2>
                      <p className="text-xs sm:text-sm text-muted-foreground">Customize your experience</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6 sm:space-y-8">
                    <div>
                      <Label className="mb-3 sm:mb-4 block text-sm sm:text-base font-semibold">Theme</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        <button 
                          className={`group p-4 sm:p-5 rounded-2xl glass-card hover-lift smooth-transition border-2 ${
                            systemTheme === 'light' ? 'border-primary' : 'border-transparent'
                          }`}
                          onClick={() => {
                            setTheme('light');
                            setSettingsData({ ...settingsData, theme: 'light' });
                          }}
                        >
                          <div className="w-full h-20 sm:h-24 rounded-xl bg-gradient-to-br from-white to-gray-100 mb-3 border border-border shadow-inner"></div>
                          <p className="text-sm font-semibold mb-1">Light</p>
                          <p className="text-xs text-muted-foreground">Bright and clear</p>
                        </button>
                        <button 
                          className={`group p-4 sm:p-5 rounded-2xl glass-card hover-lift smooth-transition border-2 ${
                            systemTheme === 'dark' ? 'border-primary' : 'border-transparent'
                          }`}
                          onClick={() => {
                            setTheme('dark');
                            setSettingsData({ ...settingsData, theme: 'dark' });
                          }}
                        >
                          <div className="w-full h-20 sm:h-24 rounded-xl bg-gradient-to-br from-gray-900 to-black mb-3 border border-border shadow-inner"></div>
                          <p className="text-sm font-semibold mb-1">Dark</p>
                          <p className="text-xs text-muted-foreground">Easy on the eyes</p>
                        </button>
                        <button 
                          className={`group p-4 sm:p-5 rounded-2xl glass-card hover-lift smooth-transition border-2 ${
                            systemTheme === 'system' ? 'border-primary' : 'border-transparent'
                          }`}
                          onClick={() => {
                            setTheme('system');
                            setSettingsData({ ...settingsData, theme: 'system' });
                          }}
                        >
                          <div className="w-full h-20 sm:h-24 rounded-xl bg-gradient-to-br from-white via-gray-400 to-black mb-3 border border-border shadow-inner"></div>
                          <p className="text-sm font-semibold mb-1">System</p>
                          <p className="text-xs text-muted-foreground">Matches device</p>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <Label className="mb-3 block text-base font-semibold">Timezone</Label>
                        <Select
                          value={settingsData.timezone}
                          onValueChange={(value) => setSettingsData({ ...settingsData, timezone: value })}
                        >
                          <SelectTrigger className="rounded-xl h-12">
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
                        <Label className="mb-3 block text-base font-semibold">Language</Label>
                        <Select 
                          value={settingsData.language}
                          onValueChange={(value) => setSettingsData({ ...settingsData, language: value })}
                        >
                          <SelectTrigger className="rounded-xl h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">🇺🇸 English</SelectItem>
                            <SelectItem value="es">🇪🇸 Español</SelectItem>
                            <SelectItem value="fr">🇫🇷 Français</SelectItem>
                            <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button 
                        className="w-full rounded-xl" 
                        size="lg"
                        onClick={handleSaveSettings}
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5 mr-2" />
                            Save Preferences
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </div>
  );
}