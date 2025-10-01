"use client";

import { FileText, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Report {
  id: string;
  reportDate: string;
  baseScore: number | null;
  adjustedScore: number | null;
  change?: number;
}

interface RecentReportsProps {
  reports: Report[];
}

export default function RecentReports({ reports }: RecentReportsProps) {
  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in">
      <h2 className="text-xl font-bold mb-6">Recent Reports</h2>
      <div className="space-y-3">
        {reports.map((report, index) => {
          const trend = report.change && report.change > 0 ? "up" : "down";
          return (
            <div
              key={report.id}
              className="flex items-center justify-between p-4 rounded-xl glass hover:bg-accent/50 smooth-transition cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{new Date(report.reportDate).toLocaleDateString()}</p>
                  <p className="text-sm text-muted-foreground">
                    Score: {report.adjustedScore ?? report.baseScore ?? 0}/100
                  </p>
                </div>
              </div>
              {report.change && (
                <div
                  className={cn(
                    "flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium",
                    trend === "up" && "bg-green-500/10 text-green-500",
                    trend === "down" && "bg-red-500/10 text-red-500"
                  )}
                >
                  {trend === "up" ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {Math.abs(report.change)}%
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}