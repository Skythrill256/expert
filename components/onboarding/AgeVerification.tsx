"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowRight, Camera, UserCircle } from "lucide-react";

interface AgeVerificationProps {
  onNext: (data: {
    age: number;
    height_feet: number;
    height_inches: number;
    weight: number;
    profile_photo: string;
  }) => void;
  initialData?: {
    age: number | null;
    height_feet: number | null;
    height_inches: number | null;
    weight: number | null;
    profile_photo: string;
  };
}

export default function AgeVerification({ onNext, initialData }: AgeVerificationProps) {
  const [formData, setFormData] = useState({
    age: initialData?.age?.toString() || "",
    height_feet: initialData?.height_feet?.toString() || "",
    height_inches: initialData?.height_inches?.toString() || "",
    weight: initialData?.weight?.toString() || "",
    profile_photo: initialData?.profile_photo || ""
  });
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const { url } = await response.json();
        setFormData(prev => ({ ...prev, profile_photo: url }));
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
    setUploading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ageNum = parseInt(formData.age);
    const heightFeet = parseInt(formData.height_feet);
    const heightInches = parseInt(formData.height_inches);
    const weight = parseInt(formData.weight);
    
    if (!formData.age || ageNum < 18) {
      setError("You must be 18 or older to use this app");
      return;
    }
    
    if (ageNum > 100) {
      setError("Please enter a valid age");
      return;
    }

    if (!formData.height_feet || heightFeet < 3 || heightFeet > 8) {
      setError("Please enter a valid height");
      return;
    }

    if (!formData.height_inches || heightInches < 0 || heightInches > 11) {
      setError("Inches must be between 0 and 11");
      return;
    }

    if (!formData.weight || weight < 50 || weight > 500) {
      setError("Please enter a valid weight");
      return;
    }

    onNext({ 
      age: ageNum,
      height_feet: heightFeet,
      height_inches: heightInches,
      weight: weight,
      profile_photo: formData.profile_photo
    });
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Basic Information</h2>
      <p className="text-sm md:text-base text-muted-foreground mb-6">Let's start with some basic information about you</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Profile Photo */}
        <div className="flex flex-col items-center mb-4">
          <button
            type="button"
            onClick={() => document.getElementById('profile-upload')?.click()}
            disabled={uploading}
            className="relative group transition-all hover:scale-105"
          >
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-chart-2/20 flex items-center justify-center overflow-hidden border-2 border-border hover:border-primary transition-all shadow-lg">
              {formData.profile_photo ? (
                <img src={formData.profile_photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserCircle className="w-12 h-12 text-primary" />
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-background shadow-lg group-hover:scale-110 transition-transform">
              {uploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <Camera className="w-4 h-4 text-primary-foreground" />
              )}
            </div>
          </button>
          <input
            id="profile-upload"
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
            disabled={uploading}
          />
          <p className="text-xs text-muted-foreground mt-2 font-medium">Upload photo (optional)</p>
        </div>

        <div>
          <Label className="text-foreground text-sm font-medium mb-1.5 block">
            What is your age?
          </Label>
          <Input
            type="number"
            value={formData.age}
            onChange={(e) => {
              setFormData({ ...formData, age: e.target.value });
              setError("");
            }}
            placeholder="Enter your age"
            className="h-11 md:h-12 text-base"
          />
        </div>

        <div>
          <Label className="text-foreground text-sm font-medium mb-1.5 block">
            Height
          </Label>
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                type="number"
                value={formData.height_feet}
                onChange={(e) => {
                  setFormData({ ...formData, height_feet: e.target.value });
                  setError("");
                }}
                placeholder="Feet"
                min="3"
                max="8"
                className="h-11 md:h-12 text-base"
              />
            </div>
            <div className="flex-1">
              <Input
                type="number"
                value={formData.height_inches}
                onChange={(e) => {
                  setFormData({ ...formData, height_inches: e.target.value });
                  setError("");
                }}
                placeholder="Inches"
                min="0"
                max="11"
                className="h-11 md:h-12 text-base"
              />
            </div>
          </div>
        </div>

        <div>
          <Label className="text-foreground text-sm font-medium mb-1.5 block">
            Weight (lbs)
          </Label>
          <Input
            type="number"
            value={formData.weight}
            onChange={(e) => {
              setFormData({ ...formData, weight: e.target.value });
              setError("");
            }}
            placeholder="Enter your weight"
            className="h-11 md:h-12 text-base"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-12 font-semibold smooth-transition"
        >
          Continue
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </form>
    </div>
  );
}