"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import PageLayout from "@/components/PageLayout";
import { CheckCircle2, Circle, Calendar, Salad, CigaretteOff, WineOff, Dumbbell, BedDouble, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const quickChecks = [
  { key: 'healthyEating', label: 'Ate healthy today', icon: <Salad className="w-5 h-5" />, points: 1 },
  { key: 'noSmoking', label: 'No smoking', icon: <CigaretteOff className="w-5 h-5" />, points: 2 },
  { key: 'noAlcohol', label: 'No alcohol', icon: <WineOff className="w-5 h-5" />, points: 1 },
  { key: 'exercise', label: 'Exercised', icon: <Dumbbell className="w-5 h-5" />, points: 1 },
  { key: 'goodSleep', label: 'Slept 7+ hours', icon: <BedDouble className="w-5 h-5" />, points: 2 },
  { key: 'looseUnderwear', label: 'Loose underwear', icon: <Shirt className="w-5 h-5" />, points: 1 },
];

export default function LifestylePage() {
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    logDate: new Date().toISOString().split('T')[0],
    healthyEating: false,
    noSmoking: false,
    noAlcohol: false,
    exercise: false,
    goodSleep: false,
    looseUnderwear: false,
    notes: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleCheck = (key: string) => {
    setFormData({ ...formData, [key]: !formData[key as keyof typeof formData] });
  };

  const calculatePoints = () => {
    return quickChecks.reduce((total, check) => {
      return total + (formData[check.key as keyof typeof formData] ? check.points : 0);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const dailyPoints = calculatePoints();

    try {
      const response = await fetch("/api/lifestyle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, dailyPoints }),
      });

      if (response.ok) {
          toast.success(`Daily log saved! +${dailyPoints} points`);
        router.push("/dashboard");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save lifestyle log");
      }
    } catch (error) {
      console.error("Error saving lifestyle log:", error);
      toast.error("Failed to save lifestyle log");
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null;

  const totalPoints = calculatePoints();

  return (
    <div className="min-h-screen gradient-mesh">
      <Sidebar />
      
      <PageLayout>
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2">Lifestyle Tracking</h1>
          <p className="text-muted-foreground">
            Log your daily habits to track your health journey
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 animate-fade-in">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Quick Daily Check-in</h2>
              <p className="text-muted-foreground">
                Takes less than 10 seconds • Tap to toggle
              </p>
            </div>

            {/* Points Display */}
            <div className="glass rounded-xl p-6 mb-8 text-center">
              <div className="text-5xl font-bold text-primary mb-2">
                +{totalPoints}
              </div>
              <p className="text-sm text-muted-foreground">
                Daily Points (out of 8 possible)
              </p>
            </div>

            {/* Quick Checks */}
            <div className="space-y-3 mb-8">
              {quickChecks.map((check) => {
                const isChecked = formData[check.key as keyof typeof formData] as boolean;
                return (
                  <button
                    key={check.key}
                    type="button"
                    onClick={() => toggleCheck(check.key)}
                    className={cn(
                      "w-full flex items-center gap-4 p-5 rounded-xl transition-all",
                      "hover:scale-[1.02] active:scale-[0.98]",
                      isChecked 
                        ? "glass-card border-2 border-primary/50" 
                        : "glass border-2 border-transparent"
                    )}
                  >
                    <div className="text-primary/80">{check.icon}</div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold">{check.label}</div>
                      <div className="text-xs text-muted-foreground">+{check.points} point{check.points > 1 ? 's' : ''}</div>
                    </div>
                    {isChecked ? (
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Optional Notes */}
            <div className="mb-6">
              <Label className="mb-2 block text-sm text-muted-foreground">
                Optional notes (feeling, changes, etc.)
              </Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Anything else to note today?"
                className="glass min-h-[80px] resize-none"
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.notes.length}/200 characters
              </p>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              size="lg" 
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Save Today's Check-in
                </>
              )}
            </Button>

            {/* Info */}
            <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-xs text-muted-foreground text-center">
                <strong className="text-foreground">Daily scoring:</strong> Healthy eating +1 • No smoking +2 • No alcohol +1 • Exercise +1 • Good sleep +2 • Loose underwear +1
              </p>
            </div>
          </form>
        </div>
      </PageLayout>
    </div>
  );
}