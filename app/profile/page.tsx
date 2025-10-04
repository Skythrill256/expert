"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, useAuth } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { UserCircle, LogOut, Camera, ArrowLeft, User, Heart, Dumbbell, Coffee, Moon, Brain, Activity, Target } from "lucide-react";
import { toast } from "sonner";
import PageLayout from "@/components/PageLayout";
import Sidebar from "@/components/Sidebar";

interface ProfileData {
  id: string;
  userId: string;
  age: number | null;
  heightFeet: number | null;
  heightInches: number | null;
  weight: number | null;
  profilePhoto: string | null;
  fertilityGoal: string | null;
  smoking: string | null;
  alcohol: string | null;
  exercise: string | null;
  dietQuality: string | null;
  sleepHours: number | null;
  stressLevel: string | null;
  masturbationFrequency: string | null;
  sexualActivity: string | null;
  supplements: string | null;
  careerStatus: string | null;
  familyPledge: string | null;
  tightClothing: boolean | null;
  hotBaths: boolean | null;
  onboardingCompleted: boolean;
}

export default function Profile() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
      return;
    }
    
    if (session) {
      loadProfile();
    }
  }, [session, isPending, router]);

  const loadProfile = async () => {
    try {
      const response = await fetch("/api/onboarding");
      if (response.ok) {
        const data = await response.json();
        console.log("Profile data received:", data);
        if (data.profile) {
          console.log("Profile fields:", data.profile);
          console.log("Profile keys:", Object.keys(data.profile));
          console.log("Sample values:", {
            age: data.profile.age,
            heightFeet: data.profile.heightFeet,
            smoking: data.profile.smoking,
            alcohol: data.profile.alcohol,
            exercise: data.profile.exercise
          });
          setProfile(data.profile);
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/login");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const handleEditProfile = () => {
    router.push("/onboarding?edit=true");
  };

  if (loading || isPending) {
    return (
      <>
        <Sidebar />
        <PageLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
          </div>
        </PageLayout>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Sidebar />
        <PageLayout>
          <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <p className="text-muted-foreground">No profile data found</p>
            <Button onClick={handleEditProfile}>Complete Onboarding</Button>
          </div>
        </PageLayout>
      </>
    );
  }

  const goalLabels: Record<string, string> = {
    optimize: "Optimize Health",
    freeze: "Freeze Sperm",
    donate: "Sperm Donation",
    conceive: "Conceive Now",
    maintain: "Maintain Health"
  };

  const smokingLabels: Record<string, string> = {
    never: "Never smoked",
    occasionally: "Occasionally",
    regularly: "Regularly",
    quit: "Quit smoking"
  };

  const alcoholLabels: Record<string, string> = {
    none: "None",
    light: "Light (1-2 drinks/week)",
    moderate: "Moderate (3-7 drinks/week)",
    heavy: "Heavy (8+ drinks/week)"
  };

  const exerciseLabels: Record<string, string> = {
    sedentary: "Sedentary",
    light: "Light (1-2 days/week)",
    moderate: "Moderate (3-4 days/week)",
    intense: "Intense (5+ days/week)"
  };

  const dietLabels: Record<string, string> = {
    poor: "Poor",
    average: "Average",
    good: "Good",
    excellent: "Excellent"
  };

  const stressLabels: Record<string, string> = {
    low: "Low",
    moderate: "Moderate",
    high: "High",
    extreme: "Extreme"
  };

  const supplementLabels: Record<string, string> = {
    none: "No supplements",
    basic: "Basic (multivitamin)",
    fertility: "Fertility-focused",
    comprehensive: "Comprehensive"
  };

  const careerLabels: Record<string, string> = {
    student: "Student",
    entry: "Entry-level professional",
    mid: "Mid-career professional",
    senior: "Senior professional",
    entrepreneur: "Entrepreneur",
    unemployed: "Unemployed"
  };

  const familyPledgeLabels: Record<string, string> = {
    "0": "0 – None",
    "up-to-2": "Up to 2 – Small family",
    "up-to-5": "Up to 5 – Medium family",
    "up-to-10": "Up to 10 – Large family"
  };

  return (
    <>
      <Sidebar />
      <PageLayout>
        <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-muted-foreground">View and manage your information</p>
        </div>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="bg-card rounded-3xl p-6 md:p-8 shadow-sm border border-border">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-muted flex items-center justify-center overflow-hidden border-2 border-border shadow-lg">
                  {profile.profilePhoto ? (
                    <img 
                      src={profile.profilePhoto} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircle className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-foreground mb-1">{session?.user?.name}</h2>
                <p className="text-muted-foreground mb-4">{session?.user?.email}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {profile.age && (
                    <span className="px-3 py-1 bg-muted text-foreground rounded-full text-sm font-medium">
                      Age {profile.age}
                    </span>
                  )}
                  {profile.heightFeet && profile.heightInches !== null && (
                    <span className="px-3 py-1 bg-muted text-foreground rounded-full text-sm font-medium">
                      {profile.heightFeet}'{profile.heightInches}"
                    </span>
                  )}
                  {profile.weight && (
                    <span className="px-3 py-1 bg-muted text-foreground rounded-full text-sm font-medium">
                      {profile.weight} lbs
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleEditProfile} variant="outline">
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>

          {/* Fertility Goal */}
          {profile.fertilityGoal && (
            <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Fertility Goal</h3>
              </div>
              <p className="text-muted-foreground">{goalLabels[profile.fertilityGoal] || profile.fertilityGoal}</p>
            </div>
          )}

          {/* Lifestyle Information */}
          <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Lifestyle Information</h3>
            
            {!profile.smoking && !profile.alcohol && !profile.exercise && !profile.dietQuality && 
             !profile.stressLevel && !profile.supplements && !profile.careerStatus && !profile.familyPledge && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No lifestyle information available</p>
                <Button onClick={handleEditProfile} variant="outline" size="sm">
                  Complete Your Profile
                </Button>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.smoking && profile.smoking !== '' && (
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                  <Coffee className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Smoking</p>
                    <p className="text-sm text-muted-foreground">{smokingLabels[profile.smoking] || profile.smoking}</p>
                  </div>
                </div>
              )}

              {profile.alcohol && profile.alcohol !== '' && (
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                  <Coffee className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Alcohol</p>
                    <p className="text-sm text-muted-foreground">{alcoholLabels[profile.alcohol] || profile.alcohol}</p>
                  </div>
                </div>
              )}

              {profile.exercise && profile.exercise !== '' && (
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                  <Dumbbell className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Exercise</p>
                    <p className="text-sm text-muted-foreground">{exerciseLabels[profile.exercise] || profile.exercise}</p>
                  </div>
                </div>
              )}

              {profile.dietQuality && profile.dietQuality !== '' && (
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                  <Activity className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Diet Quality</p>
                    <p className="text-sm text-muted-foreground">{dietLabels[profile.dietQuality] || profile.dietQuality}</p>
                  </div>
                </div>
              )}

              {profile.sleepHours !== null && profile.sleepHours !== undefined && (
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                  <Moon className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Sleep</p>
                    <p className="text-sm text-muted-foreground">{profile.sleepHours} hours/night</p>
                  </div>
                </div>
              )}

              {profile.stressLevel && profile.stressLevel !== '' && (
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                  <Brain className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Stress Level</p>
                    <p className="text-sm text-muted-foreground">{stressLabels[profile.stressLevel] || profile.stressLevel}</p>
                  </div>
                </div>
              )}

              {profile.masturbationFrequency && profile.masturbationFrequency !== '' && (
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                  <Activity className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Masturbation Frequency</p>
                    <p className="text-sm text-muted-foreground">{profile.masturbationFrequency}/week</p>
                  </div>
                </div>
              )}

              {profile.sexualActivity && profile.sexualActivity !== '' && (
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                  <Heart className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Sexual Activity</p>
                    <p className="text-sm text-muted-foreground">{profile.sexualActivity}/week</p>
                  </div>
                </div>
              )}

              {profile.supplements && profile.supplements !== '' && (
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                  <Activity className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Supplements</p>
                    <p className="text-sm text-muted-foreground">{supplementLabels[profile.supplements] || profile.supplements}</p>
                  </div>
                </div>
              )}

              {profile.careerStatus && profile.careerStatus !== '' && (
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                  <User className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Career Status</p>
                    <p className="text-sm text-muted-foreground">{careerLabels[profile.careerStatus] || profile.careerStatus}</p>
                  </div>
                </div>
              )}

              {profile.familyPledge && profile.familyPledge !== '' && (
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                  <Heart className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Family Pledge</p>
                    <p className="text-sm text-muted-foreground">{familyPledgeLabels[profile.familyPledge] || profile.familyPledge}</p>
                  </div>
                </div>
              )}

              {(profile.tightClothing || profile.hotBaths) && (
                <div className="col-span-full">
                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                    <Activity className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Environmental Factors</p>
                      <div className="text-sm text-muted-foreground space-y-1 mt-1">
                        {profile.tightClothing && (
                          <p>• Frequently wears tight underwear or pants</p>
                        )}
                        {profile.hotBaths && (
                          <p>• Regularly takes hot baths or uses saunas/hot tubs</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Logout */}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full h-12 border-2"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div>
      </div>
      </PageLayout>
    </>
  );
}