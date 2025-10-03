"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import PageLayout from "@/components/PageLayout";
import { Lightbulb, CheckCircle2, Circle, Utensils, Pill, BedDouble, Dumbbell, HeartPulse, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Recommendation = {
  id: string;
  recommendationType: string | null;
  title: string;
  description: string;
  priority: string | null;
  status: string | null;
};

const priorityColors = {
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

const typeIcons: Record<string, React.ReactNode> = {
  diet: <Utensils className="w-6 h-6" />,
  supplements: <Pill className="w-6 h-6" />,
  stress: <Wind className="w-6 h-6" />,
  sleep: <BedDouble className="w-6 h-6" />,
  lifestyle: <HeartPulse className="w-6 h-6" />,
  exercise: <Dumbbell className="w-6 h-6" />,
};

export default function RecommendationsPage() {
  const [mounted, setMounted] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const response = await fetch("/api/recommendations");
        if (response.ok) {
          const data = await response.json();
          setRecommendations(data.recommendations);
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        toast.error("Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    }

    if (mounted) {
      fetchRecommendations();
    }
  }, [mounted]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch("/api/recommendations", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (response.ok) {
        setRecommendations(recommendations.map(rec => 
          rec.id === id ? { ...rec, status: newStatus } : rec
        ));
        toast.success("Status updated successfully");
      } else {
        const errorData = await response.json();
        console.error("Error updating status:", errorData);
        toast.error(errorData.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen gradient-mesh">
        <Sidebar />
        <PageLayout>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading recommendations...</p>
            </div>
          </div>
        </PageLayout>
      </div>
    );
  }

  const filteredRecommendations = filter === "all" 
    ? recommendations 
    : recommendations.filter(rec => rec.recommendationType === filter);

  return (
    <div className="min-h-screen gradient-mesh">
      <Sidebar />
      
      <PageLayout>
        {/* Header */}
        <div className="mb-6 md:mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Personalized Recommendations</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Evidence-based strategies to improve your health
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="glass-card rounded-lg md:rounded-xl p-3 md:p-4">
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Total Actions</p>
            <p className="text-xl md:text-2xl font-bold">{recommendations.length}</p>
          </div>
          <div className="glass-card rounded-lg md:rounded-xl p-3 md:p-4">
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Active</p>
            <p className="text-xl md:text-2xl font-bold text-primary">
              {recommendations.filter(r => r.status === 'active').length}
            </p>
          </div>
          <div className="glass-card rounded-lg md:rounded-xl p-3 md:p-4">
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Completed</p>
            <p className="text-xl md:text-2xl font-bold text-green-500">
              {recommendations.filter(r => r.status === 'completed').length}
            </p>
          </div>
          <div className="glass-card rounded-lg md:rounded-xl p-3 md:p-4">
            <p className="text-xs md:text-sm text-muted-foreground mb-1">High Priority</p>
            <p className="text-xl md:text-2xl font-bold text-orange-500">
              {recommendations.filter(r => r.priority === 'high').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <Tabs defaultValue="all" value={filter} onValueChange={setFilter}>
            <TabsList className="glass h-auto flex-wrap gap-2 p-2">
              <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
              <TabsTrigger value="diet" className="text-xs sm:text-sm">Diet</TabsTrigger>
              <TabsTrigger value="supplements" className="text-xs sm:text-sm">Supplements</TabsTrigger>
              <TabsTrigger value="exercise" className="text-xs sm:text-sm">Exercise</TabsTrigger>
              <TabsTrigger value="sleep" className="text-xs sm:text-sm">Sleep</TabsTrigger>
              <TabsTrigger value="stress" className="text-xs sm:text-sm">Stress</TabsTrigger>
              <TabsTrigger value="lifestyle" className="text-xs sm:text-sm">Lifestyle</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Recommendations List */}
        <div className="space-y-3 md:space-y-4">
          {filteredRecommendations.map((rec, index) => (
            <div
              key={rec.id}
              className="glass-card rounded-xl md:rounded-2xl p-4 md:p-6 hover-lift animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col sm:flex-row items-start gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  {typeIcons[rec.recommendationType || "lifestyle"]}
                </div>
                
                <div className="flex-1 w-full">
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg md:text-xl font-semibold mb-2">{rec.title}</h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize text-xs",
                            priorityColors[(rec.priority || "low") as keyof typeof priorityColors]
                          )}
                        >
                          {rec.priority || "low"} priority
                        </Badge>
                        <Badge variant="outline" className="capitalize text-xs">
                          {rec.recommendationType || "general"}
                        </Badge>
                      </div>
                    </div>
                    
                    {rec.status === "completed" ? (
                      <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-green-500 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground shrink-0" />
                    )}
                  </div>
                  
                  <p className="text-sm md:text-base text-muted-foreground mb-4 leading-relaxed whitespace-pre-line">
                    {rec.description}
                  </p>
                  
                  <div className="flex gap-3">
                    <Button 
                      size="sm" 
                      variant={rec.status === "completed" ? "outline" : "default"}
                      onClick={() => handleStatusChange(rec.id, rec.status === "completed" ? "active" : "completed")}
                      className="text-xs md:text-sm"
                    >
                      {rec.status === "completed" ? "Mark as Active" : "Mark as Completed"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRecommendations.length === 0 && (
          <div className="glass-card rounded-xl md:rounded-2xl p-8 md:p-12 text-center animate-fade-in">
            <Lightbulb className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg md:text-xl font-semibold mb-2">No recommendations yet</h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Upload a report to get personalized recommendations
            </p>
          </div>
        )}
      </PageLayout>
    </div>
  );
}
