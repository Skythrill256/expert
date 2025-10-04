"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Target, Heart, Snowflake, Gift, TrendingUp } from "lucide-react";

interface FertilityGoalProps {
  onNext: (data: { fertility_goal: string }) => void;
  onBack: () => void;
  initialData?: string | null;
}

const goals = [
  { id: "optimize", label: "Optimize Health", icon: TrendingUp, description: "Improve overall sperm quality" },
  { id: "freeze", label: "Freeze Sperm", icon: Snowflake, description: "Preserve for future use" },
  { id: "donate", label: "Sperm Donation", icon: Gift, description: "Help others conceive" },
  { id: "conceive", label: "Conceive Now", icon: Heart, description: "Planning to have children" },
  { id: "maintain", label: "Maintain Health", icon: Target, description: "Keep current health status" }
];

export default function FertilityGoal({ onNext, onBack, initialData }: FertilityGoalProps) {
  const [selected, setSelected] = useState<string | null>(initialData || null);

  const handleSubmit = () => {
    if (selected) {
      onNext({ fertility_goal: selected });
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Your Fertility Goal</h2>
      <p className="text-sm md:text-base text-muted-foreground mb-6">What brings you here today?</p>

      <div className="grid grid-cols-1 gap-3 mb-8">
        {goals.map((goal) => {
          const Icon = goal.icon;
          const isSelected = selected === goal.id;
          return (
            <button
              key={goal.id}
              type="button"
              onClick={() => setSelected(goal.id)}
              className={`border-2 rounded-2xl p-4 text-left smooth-transition shadow-sm hover:shadow-md ${
                isSelected ? 'border-primary bg-primary/5 shadow-lg' : 'border-border hover:border-primary/50 hover:bg-accent/50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center smooth-transition shadow-sm ${
                  isSelected ? 'bg-primary scale-110' : 'bg-muted/50'
                }`}>
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-base mb-0.5">{goal.label}</h3>
                  <p className="text-xs text-muted-foreground">{goal.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          onClick={onBack}
          variant="outline"
          className="flex-1 h-12 font-semibold smooth-transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!selected}
          className="flex-1 h-12 font-semibold smooth-transition"
        >
          Continue
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}