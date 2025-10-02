"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import PageLayout from "@/components/PageLayout";
import { Upload, FileText, Plus, X, CheckCircle, AlertCircle, Salad, CigaretteOff, WineOff, Dumbbell, BedDouble, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Lifestyle questions with multiple choice options
const lifestyleQuestions = [
  { 
    key: 'healthyEating', 
    question: 'How would you describe your diet today?', 
    icon: <Salad className="w-5 h-5" />,
    options: [
      { label: 'Excellent - All healthy meals', value: 'excellent', score: 2 },
      { label: 'Good - Mostly healthy', value: 'good', score: 1.5 },
      { label: 'Fair - Some healthy choices', value: 'fair', score: 1 },
      { label: 'Poor - Unhealthy meals', value: 'poor', score: 0 }
    ]
  },
  { 
    key: 'smoking', 
    question: 'Did you smoke today?', 
    icon: <CigaretteOff className="w-5 h-5" />,
    options: [
      { label: 'No, I don\'t smoke', value: 'never', score: 2 },
      { label: 'No, but I usually do', value: 'skipped', score: 1.5 },
      { label: 'Yes, less than usual', value: 'reduced', score: 0.5 },
      { label: 'Yes, normal amount', value: 'normal', score: 0 }
    ]
  },
  { 
    key: 'alcohol', 
    question: 'Did you consume alcohol today?', 
    icon: <WineOff className="w-5 h-5" />,
    options: [
      { label: 'No alcohol', value: 'none', score: 2 },
      { label: '1 drink', value: 'light', score: 1.5 },
      { label: '2-3 drinks', value: 'moderate', score: 0.5 },
      { label: '4+ drinks', value: 'heavy', score: 0 }
    ]
  },
  { 
    key: 'exercise', 
    question: 'How much did you exercise today?', 
    icon: <Dumbbell className="w-5 h-5" />,
    options: [
      { label: '60+ minutes', value: 'intense', score: 2 },
      { label: '30-60 minutes', value: 'moderate', score: 1.5 },
      { label: '10-30 minutes', value: 'light', score: 1 },
      { label: 'No exercise', value: 'none', score: 0 }
    ]
  },
  { 
    key: 'sleep', 
    question: 'How many hours did you sleep last night?', 
    icon: <BedDouble className="w-5 h-5" />,
    options: [
      { label: '7-9 hours (Optimal)', value: 'optimal', score: 2 },
      { label: '6-7 hours (Good)', value: 'good', score: 1.5 },
      { label: '5-6 hours (Fair)', value: 'fair', score: 0.5 },
      { label: 'Less than 5 hours', value: 'poor', score: 0 }
    ]
  },
  { 
    key: 'underwear', 
    question: 'What type of underwear are you wearing?', 
    icon: <Shirt className="w-5 h-5" />,
    options: [
      { label: 'Loose boxers', value: 'loose', score: 2 },
      { label: 'Regular boxers', value: 'moderate', score: 1.5 },
      { label: 'Briefs', value: 'briefs', score: 0.5 },
      { label: 'Tight/restrictive', value: 'tight', score: 0 }
    ]
  },
];

export default function UploadPage() {
  const [mounted, setMounted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const router = useRouter();
  
  const [manualData, setManualData] = useState({
    reportDate: new Date().toISOString().split('T')[0],
    concentration: "",
    motility: "",
    progressiveMotility: "",
    morphology: "",
    volume: "",
    ph: "",
    dfi: "",
  });

  // Lifestyle data state - now supports string values for multiple choice
  const [lifestyleData, setLifestyleData] = useState<Record<string, string | null>>({
    healthyEating: null,
    smoking: null,
    alcohol: null,
    exercise: null,
    sleep: null,
    underwear: null,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload a PDF or image file (PNG, JPG)");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    // Validate lifestyle questions are answered
    const unansweredQuestions = Object.entries(lifestyleData).filter(([_, value]) => value === null);
    if (unansweredQuestions.length > 0) {
      toast.error("Please answer all lifestyle questions before uploading");
      return;
    }

    setUploading(true);
    const loadingToast = toast.loading("Analyzing report with AI...");
    
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("reportDate", manualData.reportDate);
    formData.append("lifestyleData", JSON.stringify(lifestyleData));

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast.dismiss(loadingToast);
        toast.success("Report analyzed successfully!");
        setTimeout(() => router.push("/dashboard"), 500);
      } else {
        const error = await response.json();
        toast.dismiss(loadingToast);
        toast.error(error.details || error.error || "Failed to upload report");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.dismiss(loadingToast);
      toast.error("Failed to upload report. Please try manual entry.");
    } finally {
      setUploading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate lifestyle questions are answered
    const unansweredQuestions = Object.entries(lifestyleData).filter(([_, value]) => value === null);
    if (unansweredQuestions.length > 0) {
      toast.error("Please answer all lifestyle questions before submitting");
      return;
    }

    setUploading(true);

    // Create synthetic PDF text for manual entry
    const manualText = `
Sperm Analysis Report
Date: ${manualData.reportDate}

Concentration: ${manualData.concentration} M/mL
Motility: ${manualData.motility}%
Progressive Motility: ${manualData.progressiveMotility}%
Morphology: ${manualData.morphology}%
Volume: ${manualData.volume} mL
pH: ${manualData.ph}
DFI: ${manualData.dfi}%
    `.trim();

    // Convert to blob/file
    const blob = new Blob([manualText], { type: "text/plain" });
    const file = new File([blob], "manual-entry.txt", { type: "text/plain" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("reportDate", manualData.reportDate);
    formData.append("lifestyleData", JSON.stringify(lifestyleData));

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success("Report created successfully!");
        router.push("/dashboard");
      } else {
        const error = await response.json();
        toast.error(error.details || "Failed to create report");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Failed to create report");
    } finally {
      setUploading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen gradient-mesh">
      <Sidebar />
      
      <PageLayout>
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2">Upload Lab Report</h1>
          <p className="text-muted-foreground">
            Add your latest sperm analysis results and answer lifestyle questions
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Lifestyle Questions Section */}
          <div className="glass-card rounded-2xl p-8 border border-border/50 mb-8 animate-fade-in">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Lifestyle Questions</h2>
              <p className="text-muted-foreground text-sm">
                Answer these quick questions to help our AI provide personalized recommendations
              </p>
            </div>

            <div className="space-y-6">
              {lifestyleQuestions.map((question) => {
                const selectedValue = lifestyleData[question.key as keyof typeof lifestyleData];
                return (
                  <div key={question.key} className="glass-card rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        {question.icon}
                      </div>
                      <Label className="font-semibold text-base">{question.question}</Label>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {question.options.map((option, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setLifestyleData({ 
                            ...lifestyleData, 
                            [question.key]: option.value 
                          })}
                          className={cn(
                            "relative py-4 px-4 rounded-xl border-2 transition-all font-medium text-sm text-left group hover-lift",
                            selectedValue === option.value
                              ? "border-primary bg-primary/10 text-primary shadow-lg"
                              : "border-border/50 hover:border-primary/30 hover:bg-primary/5"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span>{option.label}</span>
                            {selectedValue === option.value && (
                              <CheckCircle className="w-5 h-5 text-primary" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Progress indicator */}
            <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Questions answered:</span>
                <span className="font-bold text-primary">
                  {Object.values(lifestyleData).filter(v => v !== null).length} / {lifestyleQuestions.length}
                </span>
              </div>
            </div>
          </div>
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2 glass-card mb-8 p-1">
              <TabsTrigger value="upload" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Upload className="w-4 h-4 mr-2" />
                Upload PDF
              </TabsTrigger>
              <TabsTrigger value="manual" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FileText className="w-4 h-4 mr-2" />
                Manual Entry
              </TabsTrigger>
            </TabsList>

            {/* PDF Upload Tab */}
            <TabsContent value="upload" className="animate-fade-in">
              <div className="glass-card rounded-2xl p-8 border border-border/50">
                <div className="border-2 border-dashed border-primary/30 rounded-2xl p-16 text-center hover:border-primary/60 hover:bg-primary/5 transition-all duration-300 cursor-pointer">
                  <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-chart-2/20 flex items-center justify-center mb-6 shadow-lg">
                    <Upload className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Upload Lab Report</h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Select your PDF or image file to automatically extract biomarkers using AI
                  </p>
                  
                  {!selectedFile ? (
                    <div className="space-y-4">
                      {/* Hidden native input */}
                      <input
                        id="file-upload"
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      {/* Custom control row */}
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <label 
                          htmlFor="file-upload"
                          className="inline-flex items-center justify-center h-10 px-4 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
                        >
                          Choose File
                        </label>
                        <div className="h-10 w-full max-w-md rounded-lg border border-border/50 bg-background/60 backdrop-blur-sm px-4 flex items-center text-sm text-muted-foreground">
                          No file chosen
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Supports PDF, PNG, JPG • Maximum 10MB
                      </p>
                    </div>
                  ) : (
                    <div className="max-w-lg mx-auto space-y-6">
                      <div className="flex items-center gap-4 p-5 rounded-xl glass-card border border-primary/30">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-semibold text-sm truncate">{selectedFile.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {(selectedFile.size / 1024).toFixed(2)} KB • {selectedFile.type.split('/')[1].toUpperCase()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedFile(null)}
                          disabled={uploading}
                          className="shrink-0"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                      
                      <div className="text-left space-y-2">
                        <Label className="text-sm font-semibold">Report Date</Label>
                        <Input
                          type="date"
                          value={manualData.reportDate}
                          onChange={(e) => setManualData({ ...manualData, reportDate: e.target.value })}
                          className="glass-card border-border/50"
                        />
                      </div>

                      <Button 
                        onClick={handleFileUpload}
                        disabled={uploading}
                        size="lg"
                        className="w-full"
                      >
                        {uploading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Analyzing Report with AI...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Process & Analyze Report
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Manual Entry Tab */}
            <TabsContent value="manual" className="animate-fade-in">
              <form onSubmit={handleManualSubmit} className="glass-card rounded-2xl p-8 border border-border/50">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold mb-2">Enter Lab Results Manually</h2>
                  <p className="text-muted-foreground text-sm">Fill in your sperm analysis parameters below</p>
                </div>
                
                <div className="space-y-6">
                  {/* Report Date */}
                  <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
                    <Label className="mb-2 block font-semibold text-sm">Report Date</Label>
                    <Input
                      type="date"
                      value={manualData.reportDate}
                      onChange={(e) => setManualData({ ...manualData, reportDate: e.target.value })}
                      className="glass-card border-border/50"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Concentration */}
                    <div className="space-y-2">
                      <Label className="font-semibold text-sm flex items-center justify-between">
                        Concentration (million/ml)
                        <span className="text-xs text-primary font-normal">Required</span>
                      </Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="e.g., 45.0"
                        value={manualData.concentration}
                        onChange={(e) => setManualData({ ...manualData, concentration: e.target.value })}
                        className="glass-card border-border/50"
                      />
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Normal: ≥15 million/ml
                      </p>
                    </div>

                    {/* Motility */}
                    <div className="space-y-2">
                      <Label className="font-semibold text-sm">Total Motility (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="e.g., 65.0"
                        value={manualData.motility}
                        onChange={(e) => setManualData({ ...manualData, motility: e.target.value })}
                        className="glass-card border-border/50"
                      />
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Normal: ≥40%
                      </p>
                    </div>

                    {/* Progressive Motility */}
                    <div className="space-y-2">
                      <Label className="font-semibold text-sm">Progressive Motility (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="e.g., 45.0"
                        value={manualData.progressiveMotility}
                        onChange={(e) => setManualData({ ...manualData, progressiveMotility: e.target.value })}
                        className="glass-card border-border/50"
                      />
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Normal: ≥32%
                      </p>
                    </div>

                    {/* Morphology */}
                    <div className="space-y-2">
                      <Label className="font-semibold text-sm">Normal Morphology (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="e.g., 4.5"
                        value={manualData.morphology}
                        onChange={(e) => setManualData({ ...manualData, morphology: e.target.value })}
                        className="glass-card border-border/50"
                      />
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Normal: ≥4%
                      </p>
                    </div>

                    {/* Volume */}
                    <div className="space-y-2">
                      <Label className="font-semibold text-sm">Volume (ml)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="e.g., 3.2"
                        value={manualData.volume}
                        onChange={(e) => setManualData({ ...manualData, volume: e.target.value })}
                        className="glass-card border-border/50"
                      />
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Normal: ≥1.5 ml
                      </p>
                    </div>

                    {/* pH */}
                    <div className="space-y-2">
                      <Label className="font-semibold text-sm">pH Level</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="e.g., 7.4"
                        value={manualData.ph}
                        onChange={(e) => setManualData({ ...manualData, ph: e.target.value })}
                        className="glass-card border-border/50"
                      />
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Normal: 7.2-8.0
                      </p>
                    </div>

                    {/* DFI */}
                    <div className="space-y-2">
                      <Label className="font-semibold text-sm">DNA Fragmentation Index (DFI) (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="e.g., 15.0"
                        value={manualData.dfi}
                        onChange={(e) => setManualData({ ...manualData, dfi: e.target.value })}
                        className="glass-card border-border/50"
                      />
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Normal: &lt;15%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Button type="submit" size="lg" className="flex-1 sm:flex-[2]" disabled={uploading}>
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creating Report...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mr-2" />
                        Save & Analyze Report
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="lg"
                    onClick={() => router.push("/dashboard")}
                    disabled={uploading}
                    className="flex-1"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>

          {/* Info Card */}
          <div className="mt-8 glass-card rounded-2xl p-8 border border-primary/20 bg-gradient-to-br from-primary/5 to-chart-2/5">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Understanding Your Results</h3>
                <p className="text-sm text-muted-foreground">Reference ranges for sperm analysis parameters</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Concentration:</strong>
                  <span className="text-muted-foreground"> Number of sperm per milliliter (≥15 million/ml)</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Motility:</strong>
                  <span className="text-muted-foreground"> Percentage of moving sperm (≥40%)</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Progressive Motility:</strong>
                  <span className="text-muted-foreground"> Sperm moving forward (≥32%)</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Morphology:</strong>
                  <span className="text-muted-foreground"> Normally shaped sperm (≥4%)</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">DFI:</strong>
                  <span className="text-muted-foreground"> DNA damage level - lower is better (&lt;15% optimal)</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Volume & pH:</strong>
                  <span className="text-muted-foreground"> ≥1.5ml volume, 7.2-8.0 pH range</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    </div>
  );
}