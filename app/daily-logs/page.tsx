"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { Calendar, FlaskConical, CheckCircle, Circle, Droplet, Droplets, Waves, Sparkles, Moon, CloudMoon, Bed, Salad, Apple, Coffee, Pizza, Smile, Meh, Frown, AlertCircle, Check, Zap, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import PageLayout from "@/components/PageLayout";

export default function DailyLogsPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [todayLog, setTodayLog] = useState<any>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    masturbationCount: null as number | null,
    sleepQuality: "",
    sleepHours: "",
    dietQuality: "",
    stressLevel: "",
    exerciseMinutes: "",
    electrolytes: null as boolean | null,
    notes: ""
  });

  useEffect(() => {
    setMounted(true);
    loadTodayLog();
  }, []);

  const loadTodayLog = async () => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const response = await fetch(`/api/daily-logs?date=${today}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.logs) {
          setTodayLog(data.logs);
          setFormData({
            masturbationCount: data.logs.masturbationCount,
            sleepQuality: data.logs.sleepQuality || "",
            sleepHours: data.logs.sleepHours?.toString() || "",
            dietQuality: data.logs.dietQuality || "",
            stressLevel: data.logs.stressLevel || "",
            exerciseMinutes: data.logs.exerciseMinutes?.toString() || "",
            electrolytes: data.logs.electrolytes,
            notes: data.logs.notes || ""
          });
        }
      }
    } catch (error) {
      console.error("Error loading today's log:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      formData.masturbationCount === null ||
      !formData.sleepQuality ||
      !formData.sleepHours ||
      !formData.dietQuality ||
      !formData.stressLevel ||
      !formData.exerciseMinutes ||
      formData.electrolytes === null
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);

    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const response = await fetch("/api/daily-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          logDate: today,
          masturbationCount: formData.masturbationCount,
          sleepQuality: formData.sleepQuality,
          sleepHours: parseFloat(formData.sleepHours),
          dietQuality: formData.dietQuality,
          stressLevel: formData.stressLevel,
          exerciseMinutes: parseInt(formData.exerciseMinutes),
          electrolytes: formData.electrolytes,
          notes: formData.notes
        })
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          router.push("/dashboard");
        }, 2000);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save daily log");
      }
    } catch (error) {
      console.error("Error saving daily log:", error);
      toast.error("Failed to save daily log");
    } finally {
      setSaving(false);
    }
  };

  const isFormComplete = () => {
    return (
      formData.masturbationCount !== null &&
      formData.sleepQuality !== "" &&
      formData.sleepHours !== "" &&
      formData.dietQuality !== "" &&
      formData.stressLevel !== "" &&
      formData.exerciseMinutes !== "" &&
      formData.electrolytes !== null
    );
  };

  const completedCount = [
    formData.masturbationCount !== null,
    !!formData.sleepQuality,
    !!formData.sleepHours,
    !!formData.dietQuality,
    !!formData.stressLevel,
    !!formData.exerciseMinutes,
    formData.electrolytes !== null,
  ].filter(Boolean).length;
  const totalRequired = 7;
  const progressPct = Math.round((completedCount / totalRequired) * 100);

  const CircularButton = ({ selected, onClick, icon: Icon, label }: any) => (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        className={`relative w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-200 hover-lift ${
          selected
            ? 'bg-primary text-primary-foreground shadow-lg'
            : 'bg-muted hover:bg-muted/80 text-muted-foreground'
        }`}
      >
        <Icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2} />
        {selected && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary border-2 border-background rounded-full flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-primary-foreground" strokeWidth={3} />
          </div>
        )}
      </button>
      <span className={`text-[10px] md:text-xs text-center font-medium max-w-[70px] leading-tight ${
        selected ? 'text-foreground' : 'text-muted-foreground'
      }`}>
        {label}
      </span>
    </div>
  );

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center p-4">
        <div className="glass-card rounded-3xl p-12 text-center shadow-xl border border-border/50 max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Saved! 🎉</h2>
          <p className="text-muted-foreground">Your daily check-in is complete</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-mesh">
      <Sidebar />
      
      <PageLayout>
        {/* Header */}
        <div className="mb-6 sm:mb-8 animate-fade-in pl-12 sm:pl-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">Daily Check-in</h1>
              <div className="flex items-center gap-2 text-sm sm:text-base text-muted-foreground">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/60 px-3 py-1">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(), "EEEE, MMMM d, yyyy")}</span>
                </div>
                <span className="text-xs sm:text-sm">Progress</span>
                <div className="h-2 w-28 sm:w-40 rounded-full bg-muted/60 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-foreground">{progressPct}%</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/upload" className="inline-flex">
                <Button variant="outline" className="gap-2">
                  <Upload className="w-4 h-4" /> Upload Test
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Masturbation Frequency */}
            <div className="glass-card rounded-2xl p-6 md:p-8 border border-border/50 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold">Masturbation</h3>
                  <p className="text-sm text-muted-foreground">How many times did you masturbate today?</p>
                </div>
              </div>
              <ToggleGroup
                type="single"
                value={formData.masturbationCount === null ? undefined : String(formData.masturbationCount)}
                onValueChange={(val) => {
                  if (!val) return;
                  setFormData({ ...formData, masturbationCount: val === "3" ? 3 : parseInt(val) });
                }}
                className="w-full"
              >
                <ToggleGroupItem value="0" className="flex-1">
                  <div className="flex items-center justify-center gap-2">
                    <Circle className="w-4 h-4" /> 0
                  </div>
                </ToggleGroupItem>
                <ToggleGroupItem value="1" className="flex-1">
                  <div className="flex items-center justify-center gap-2">
                    <Droplet className="w-4 h-4" /> 1
                  </div>
                </ToggleGroupItem>
                <ToggleGroupItem value="2" className="flex-1">
                  <div className="flex items-center justify-center gap-2">
                    <Droplets className="w-4 h-4" /> 2
                  </div>
                </ToggleGroupItem>
                <ToggleGroupItem value="3" className="flex-1">
                  <div className="flex items-center justify-center gap-2">
                    <Waves className="w-4 h-4" /> 3+
                  </div>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Sleep Quality */}
            <div className="glass-card rounded-2xl p-6 md:p-8 border border-border/50 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold">Sleep</h3>
                  <p className="text-sm text-muted-foreground">How well did you sleep?</p>
                </div>
              </div>
              <ToggleGroup
                type="single"
                value={formData.sleepQuality || undefined}
                onValueChange={(val) => val && setFormData({ ...formData, sleepQuality: val })}
                className="w-full mb-5"
              >
                <ToggleGroupItem value="excellent" className="flex-1">
                  <div className="flex items-center justify-center gap-2"><Sparkles className="w-4 h-4" /> Excellent</div>
                </ToggleGroupItem>
                <ToggleGroupItem value="good" className="flex-1">
                  <div className="flex items-center justify-center gap-2"><Moon className="w-4 h-4" /> Good</div>
                </ToggleGroupItem>
                <ToggleGroupItem value="fair" className="flex-1">
                  <div className="flex items-center justify-center gap-2"><CloudMoon className="w-4 h-4" /> Fair</div>
                </ToggleGroupItem>
                <ToggleGroupItem value="poor" className="flex-1">
                  <div className="flex items-center justify-center gap-2"><Bed className="w-4 h-4" /> Poor</div>
                </ToggleGroupItem>
              </ToggleGroup>
              <div className="pt-4 border-t border-border/50">
                <label className="text-sm font-medium mb-2 block">Hours slept</label>
                <Input
                  type="number"
                  step={0.5}
                  value={formData.sleepHours}
                  onChange={(e) => setFormData({ ...formData, sleepHours: e.target.value })}
                  placeholder="7.5"
                />
              </div>
            </div>

            {/* Diet Quality */}
            <div className="glass-card rounded-2xl p-6 md:p-8 border border-border/50 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold">Diet Quality</h3>
                  <p className="text-sm text-muted-foreground">How was your nutrition today?</p>
                </div>
              </div>
              <ToggleGroup
                type="single"
                value={formData.dietQuality || undefined}
                onValueChange={(val) => val && setFormData({ ...formData, dietQuality: val })}
                className="w-full"
              >
                <ToggleGroupItem value="excellent" className="flex-1">
                  <div className="flex items-center justify-center gap-2"><Salad className="w-4 h-4" /> Excellent</div>
                </ToggleGroupItem>
                <ToggleGroupItem value="good" className="flex-1">
                  <div className="flex items-center justify-center gap-2"><Apple className="w-4 h-4" /> Good</div>
                </ToggleGroupItem>
                <ToggleGroupItem value="average" className="flex-1">
                  <div className="flex items-center justify-center gap-2"><Coffee className="w-4 h-4" /> Average</div>
                </ToggleGroupItem>
                <ToggleGroupItem value="poor" className="flex-1">
                  <div className="flex items-center justify-center gap-2"><Pizza className="w-4 h-4" /> Poor</div>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Stress Level */}
            <div className="glass-card rounded-2xl p-6 md:p-8 border border-border/50 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold">Stress Level</h3>
                  <p className="text-sm text-muted-foreground">How stressed were you today?</p>
                </div>
              </div>
              <ToggleGroup
                type="single"
                value={formData.stressLevel || undefined}
                onValueChange={(val) => val && setFormData({ ...formData, stressLevel: val })}
                className="w-full"
              >
                <ToggleGroupItem value="low" className="flex-1">
                  <div className="flex items-center justify-center gap-2"><Smile className="w-4 h-4" /> Low</div>
                </ToggleGroupItem>
                <ToggleGroupItem value="moderate" className="flex-1">
                  <div className="flex items-center justify-center gap-2"><Meh className="w-4 h-4" /> Moderate</div>
                </ToggleGroupItem>
                <ToggleGroupItem value="high" className="flex-1">
                  <div className="flex items-center justify-center gap-2"><Frown className="w-4 h-4" /> High</div>
                </ToggleGroupItem>
                <ToggleGroupItem value="extreme" className="flex-1">
                  <div className="flex items-center justify-center gap-2"><AlertCircle className="w-4 h-4" /> Extreme</div>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Exercise */}
            <div className="glass-card rounded-2xl p-6 md:p-8 border border-border/50 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold">Exercise</h3>
                  <p className="text-sm text-muted-foreground">Minutes of physical activity</p>
                </div>
              </div>
              <Input
                type="number"
                inputMode="numeric"
                value={formData.exerciseMinutes}
                onChange={(e) => setFormData({ ...formData, exerciseMinutes: e.target.value })}
                placeholder="30"
              />
            </div>

            {/* Electrolytes */}
            <div className="glass-card rounded-2xl p-6 md:p-8 border border-border/50 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold">Electrolytes</h3>
                  <p className="text-sm text-muted-foreground">Did you take electrolytes?</p>
                </div>
              </div>
              <ToggleGroup
                type="single"
                value={
                  formData.electrolytes === null
                    ? undefined
                    : formData.electrolytes
                    ? "yes"
                    : "no"
                }
                onValueChange={(val) => {
                  if (!val) return;
                  setFormData({ ...formData, electrolytes: val === "yes" });
                }}
                className="w-full"
              >
                <ToggleGroupItem value="no" className="flex-1">
                  <div className="flex items-center justify-center gap-2"><Circle className="w-4 h-4" /> No</div>
                </ToggleGroupItem>
                <ToggleGroupItem value="yes" className="flex-1">
                  <div className="flex items-center justify-center gap-2"><Zap className="w-4 h-4" /> Yes</div>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Notes */}
            <div className="glass-card rounded-2xl p-6 md:p-8 border border-border/50 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold">Notes</h3>
                  <p className="text-sm text-muted-foreground">Log a symptom or make a note</p>
                </div>
              </div>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any additional notes..."
                className="min-h-28"
              />
            </div>

            {/* Sticky Footer CTA */}
            <div className="sticky bottom-4 z-10">
              <div className="glass-card border border-border/50 rounded-2xl p-3 sm:p-4 flex items-center gap-3">
                <div className="hidden sm:block flex-1">
                  <div className="text-xs text-muted-foreground mb-1">Completion</div>
                  <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
                    <div className="h-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
                  </div>
                </div>
                <div className="sm:w-auto w-full">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full sm:w-auto"
                    disabled={saving || !isFormComplete()}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" /> Save Check-in
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </PageLayout>
    </div>
  );
}
