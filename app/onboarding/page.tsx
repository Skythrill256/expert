"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import AgeVerification from "@/components/onboarding/AgeVerification";
import LifestyleQuiz from "@/components/onboarding/LifestyleQuiz";
import FertilityGoal from "@/components/onboarding/FertilityGoal";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

interface UserData {
  age: number | null;
  height_feet: number | null;
  height_inches: number | null;
  weight: number | null;
  profile_photo: string;
  lifestyle_data: {
    smoking: string;
    alcohol: string;
    exercise: string;
    diet_quality: string;
    sleep_hours: number;
    stress_level: string;
    masturbation_frequency: string;
    sexual_activity: string;
    supplements: string;
    career_status: string;
    family_pledge: string;
    tight_clothing: boolean;
    hot_baths: boolean;
  };
  fertility_goal: string | null;
}

// Extracted component that uses useSearchParams
function OnboardingInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState<UserData>({
    age: null,
    height_feet: null,
    height_inches: null,
    weight: null,
    profile_photo: "",
    lifestyle_data: {
      smoking: "",
      alcohol: "",
      exercise: "",
      diet_quality: "",
      sleep_hours: 0,
      stress_level: "",
      masturbation_frequency: "",
      sexual_activity: "",
      supplements: "",
      career_status: "",
      family_pledge: "",
      tight_clothing: false,
      hot_baths: false,
    },
    fertility_goal: null,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  // Check if onboarding is already completed (but allow editing via query param)
  useEffect(() => {
    async function checkOnboarding() {
      if (!session?.user) return;

      // Check if user is editing their profile
      const isEditing = searchParams.get("edit") === "true";

      if (isEditing) {
        try {
          const response = await fetch("/api/onboarding");
          if (response.ok) {
            const data = await response.json();
            if (data.profile) {
              setUserData({
                age: data.profile.age,
                height_feet: data.profile.heightFeet,
                height_inches: data.profile.heightInches,
                weight: data.profile.weight,
                profile_photo: data.profile.profilePhoto || "",
                lifestyle_data: {
                  smoking: data.profile.smoking || "",
                  alcohol: data.profile.alcohol || "",
                  exercise: data.profile.exercise || "",
                  diet_quality: data.profile.dietQuality || "",
                  sleep_hours: data.profile.sleepHours || 0,
                  stress_level: data.profile.stressLevel || "",
                  masturbation_frequency: data.profile.masturbationFrequency || "",
                  sexual_activity: data.profile.sexualActivity || "",
                  supplements: data.profile.supplements || "",
                  career_status: data.profile.careerStatus || "",
                  family_pledge: data.profile.familyPledge || "",
                  tight_clothing: data.profile.tightClothing || false,
                  hot_baths: data.profile.hotBaths || false,
                },
                fertility_goal: data.profile.fertilityGoal,
              });
            }
          }
        } catch (error) {
          console.error("Error loading profile for editing:", error);
        }
        return;
      }

      // If not editing, check if already completed and redirect
      try {
        const response = await fetch("/api/onboarding");
        if (response.ok) {
          const data = await response.json();
          if (data.completed) {
            router.push("/dashboard");
          }
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      }
    }

    if (session) {
      checkOnboarding();
    }
  }, [session, router, searchParams]);

  const handleNext = (data: any) => {
    setUserData({ ...userData, ...data });
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleComplete = async (data: any) => {
    try {
      const finalData = { ...userData, ...data };

      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalData),
      });

      if (response.ok) {
        toast.success("Onboarding completed successfully!");
        router.push("/dashboard");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to complete onboarding");
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4 relative">
      {/* Theme Toggle - Top Right */}
      {mounted && (
        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10">
          <Button
            variant="outline"
            size="icon"
            className="glass rounded-full"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      )}

      <div className="max-w-2xl w-full">
        {/* Progress indicator */}
        <div className="mb-6 animate-fade-in">
          <div className="flex justify-between items-center mb-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full mx-1 transition-all duration-500 ${
                  i <= step ? "bg-primary" : "bg-muted/50"
                }`}
              />
            ))}
          </div>
          <p className="text-muted-foreground text-xs md:text-sm text-center font-medium">
            Step {step} of 3
          </p>
        </div>

        {/* Step content */}
        <div
          className="glass-card rounded-3xl p-6 md:p-8 shadow-xl border animate-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          {step === 1 && (
            <AgeVerification
              onNext={handleNext}
              initialData={{
                age: userData.age,
                height_feet: userData.height_feet,
                height_inches: userData.height_inches,
                weight: userData.weight,
                profile_photo: userData.profile_photo,
              }}
            />
          )}
          {step === 2 && (
            <FertilityGoal
              onNext={handleNext}
              onBack={handleBack}
              initialData={userData.fertility_goal}
            />
          )}
          {step === 3 && (
            <LifestyleQuiz
              onNext={handleComplete}
              onBack={handleBack}
              initialData={userData.lifestyle_data}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Export with Suspense wrapper
export default function Onboarding() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OnboardingInner />
    </Suspense>
  );
}
