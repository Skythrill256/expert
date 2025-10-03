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
    <div className="animate-fade-in">
      <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-3 sm:mb-4 md:mb-6">Recent Reports</h2>
      <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
        {reports.map((report, index) => {
          const trend = report.change && report.change > 0 ? "up" : "down";
          return (
            <div
              key={report.id}
              className="flex items-center justify-between p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl glass hover:bg-accent/50 smooth-transition cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
                <div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-primary/10 flex-shrink-0">
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-xs sm:text-sm md:text-base truncate">{new Date(report.reportDate).toLocaleDateString()}</p>
                  <p className="text-[0.65rem] sm:text-xs md:text-sm text-muted-foreground">
                    Score: {report.adjustedScore ?? report.baseScore ?? 0}/100
                  </p>
                </div>
              </div>
              {report.change && (
                <div
                  className={cn(
                    "flex items-center gap-0.5 sm:gap-1 px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 rounded-full text-[0.65rem] sm:text-xs md:text-sm font-medium flex-shrink-0",
                    trend === "up" && "bg-green-500/10 text-green-500",
                    trend === "down" && "bg-red-500/10 text-red-500"
                  )}
                >
                  {trend === "up" ? (
                    <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                  ) : (
                    <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                  )}
                  <span className="hidden sm:inline">{Math.abs(report.change)}%</span>
                  <span className="sm:hidden">{Math.abs(report.change)}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}