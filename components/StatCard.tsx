"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  trend?: "up" | "down";
  className?: string;
}

export default function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "glass-card rounded-2xl p-6 hover-lift animate-fade-in",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-chart-2/10">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        {change && (
          <div
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium",
              changeType === "positive" && "bg-green-500/10 text-green-500",
              changeType === "negative" && "bg-red-500/10 text-red-500",
              changeType === "neutral" && "bg-muted text-muted-foreground"
            )}
          >
            {change}
          </div>
        )}
      </div>
      <h3 className="text-sm text-muted-foreground mb-2">{title}</h3>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
    </div>
  );
}