"use client";

import { Lightbulb, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Recommendation {
  id: string;
  title: string;
  recommendationType: string | null;
  priority: string | null;
}

interface RecommendationsPreviewProps {
  recommendations: Recommendation[];
}

const priorityColors = {
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

export default function RecommendationsPreview({ recommendations }: RecommendationsPreviewProps) {
  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Recommended Actions</h2>
        <Link
          href="/recommendations"
          className="text-sm text-primary hover:text-primary/80 smooth-transition flex items-center gap-1"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="space-y-3">
        {recommendations.slice(0, 3).map((rec, index) => (
          <div
            key={rec.id}
            className="p-4 rounded-xl glass hover:bg-accent/50 smooth-transition cursor-pointer"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10 mt-1">
                <Lightbulb className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={cn(
                      "px-2 py-1 rounded-md text-xs font-medium border capitalize",
                      priorityColors[(rec.priority || "low") as keyof typeof priorityColors]
                    )}
                  >
                    {rec.priority || "low"}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {rec.recommendationType || "general"}
                  </span>
                </div>
                <p className="font-medium text-sm">{rec.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}