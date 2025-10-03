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
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
        <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold">Recommended Actions</h2>
        <Link
          href="/recommendations"
          className="text-[0.65rem] sm:text-xs md:text-sm text-primary hover:text-primary/80 smooth-transition flex items-center gap-0.5 sm:gap-1"
        >
          <span className="hidden sm:inline">View All</span>
          <span className="sm:hidden">All</span>
          <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
        </Link>
      </div>
      <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
        {recommendations.slice(0, 3).map((rec, index) => (
          <div
            key={rec.id}
            className="p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl glass hover:bg-accent/50 smooth-transition cursor-pointer"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
              <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-primary/10 mt-0.5 sm:mt-1 flex-shrink-0">
                <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 md:mb-2 flex-wrap">
                  <span
                    className={cn(
                      "px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[0.65rem] sm:text-xs font-medium border capitalize flex-shrink-0",
                      priorityColors[(rec.priority || "low") as keyof typeof priorityColors]
                    )}
                  >
                    {rec.priority || "low"}
                  </span>
                  <span className="text-[0.65rem] sm:text-xs text-muted-foreground capitalize truncate">
                    {rec.recommendationType || "general"}
                  </span>
                </div>
                <p className="font-medium text-xs sm:text-sm leading-snug">{rec.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}