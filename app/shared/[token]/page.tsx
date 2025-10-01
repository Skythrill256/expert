"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Activity, TrendingUp, TrendingDown, Calendar, CheckCircle2, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type SharedData = {
  stats: {
    currentScore: number;
    averageScore: number;
    totalReports: number;
    daysTracked: number;
    dateRange: {
      from: string;
      to: string;
    };
  };
  reports: Array<{
    id: string;
    reportDate: string;
    concentration: number | null;
    motility: number | null;
    progressiveMotility: number | null;
    morphology: number | null;
    volume: number | null;
    ph: number | null;
    dfi: number | null;
    baseScore: number | null;
    adjustedScore: number | null;
  }>;
  lifestyleLogs: Array<{
    id: string;
    logDate: string;
    healthyEating: boolean | null;
    noSmoking: boolean | null;
    noAlcohol: boolean | null;
    exercise: boolean | null;
    goodSleep: boolean | null;
    looseUnderwear: boolean | null;
    dailyPoints: number | null;
  }>;
  shareInfo: {
    createdAt: Date;
    expiresAt: Date | null;
    accessCount: number;
  };
};

export default function SharedViewPage() {
  const params = useParams();
  const token = params.token as string;
  
  const [data, setData] = useState<SharedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSharedData();
  }, [token]);

  const fetchSharedData = async () => {
    try {
      const response = await fetch(`/api/share/view?token=${token}`);
      
      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      } else {
        const error = await response.json();
        setError(error.error || "Failed to load shared data");
      }
    } catch (err) {
      console.error("Error fetching shared data:", err);
      setError("Failed to load shared data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading shared data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center p-4">
        <div className="glass-card rounded-2xl p-12 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">
            {error || "This link is invalid, expired, or has been revoked."}
          </p>
        </div>
      </div>
    );
  }

  const { stats, reports, lifestyleLogs } = data;
  const scoreChange = reports.length > 1 && reports[0] && reports[1]
    ? reports[0].adjustedScore! - reports[1].adjustedScore!
    : 0;

  return (
    <div className="min-h-screen gradient-mesh">
      <div className="max-w-6xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Identity Protected View
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Last 30 Days
            </Badge>
          </div>
          <h1 className="text-4xl font-bold mb-2">Patient Health Summary</h1>
          <p className="text-muted-foreground">
            Sperm health analysis and lifestyle tracking data
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-primary" />
              <p className="text-sm text-muted-foreground">Current Score</p>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold">{stats.currentScore}</p>
              {scoreChange !== 0 && (
                <div className={`flex items-center text-sm ${scoreChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {scoreChange > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{Math.abs(scoreChange)}</span>
                </div>
              )}
            </div>
          </Card>

          <Card className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <p className="text-sm text-muted-foreground">Average Score</p>
            </div>
            <p className="text-3xl font-bold">{stats.averageScore}</p>
          </Card>

          <Card className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-purple-500" />
              <p className="text-sm text-muted-foreground">Total Reports</p>
            </div>
            <p className="text-3xl font-bold">{stats.totalReports}</p>
          </Card>

          <Card className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              <p className="text-sm text-muted-foreground">Days Tracked</p>
            </div>
            <p className="text-3xl font-bold">{stats.daysTracked}</p>
          </Card>
        </div>

        {/* Reports */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Sperm Analysis Reports</h2>
          
          {reports.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No reports in this period</p>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="glass rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-semibold">
                        {new Date(report.reportDate).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Score: {report.adjustedScore}/100
                      </p>
                    </div>
                    <Badge variant="outline" className="text-lg">
                      {report.adjustedScore}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {report.concentration !== null && (
                      <div>
                        <p className="text-muted-foreground">Concentration</p>
                        <p className="font-semibold">{report.concentration} M/mL</p>
                      </div>
                    )}
                    {report.progressiveMotility !== null && (
                      <div>
                        <p className="text-muted-foreground">Progressive Motility</p>
                        <p className="font-semibold">{report.progressiveMotility}%</p>
                      </div>
                    )}
                    {report.morphology !== null && (
                      <div>
                        <p className="text-muted-foreground">Morphology</p>
                        <p className="font-semibold">{report.morphology}%</p>
                      </div>
                    )}
                    {report.volume !== null && (
                      <div>
                        <p className="text-muted-foreground">Volume</p>
                        <p className="font-semibold">{report.volume} mL</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lifestyle Tracking */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Lifestyle Adherence</h2>
          
          {lifestyleLogs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No lifestyle data in this period</p>
          ) : (
            <div className="space-y-3">
              {lifestyleLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="glass rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold">
                      {new Date(log.logDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                    <Badge variant="outline">
                      +{log.dailyPoints || 0} points
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {log.healthyEating && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Healthy eating</span>
                      </div>
                    )}
                    {log.noSmoking && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>No smoking</span>
                      </div>
                    )}
                    {log.noAlcohol && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>No alcohol</span>
                      </div>
                    )}
                    {log.exercise && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Exercise</span>
                      </div>
                    )}
                    {log.goodSleep && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Good sleep</span>
                      </div>
                    )}
                    {log.looseUnderwear && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Loose underwear</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="glass-card rounded-2xl p-6 border-l-4 border-primary text-sm">
          <p className="text-muted-foreground">
            <strong className="text-foreground">Secure Share:</strong> This is a privacy-protected view that does not reveal patient identity. 
            Data shown covers {new Date(stats.dateRange.from).toLocaleDateString()} to {new Date(stats.dateRange.to).toLocaleDateString()}.
            This link has been accessed {data.shareInfo.accessCount} time{data.shareInfo.accessCount !== 1 ? 's' : ''}.
            {data.shareInfo.expiresAt && ` Expires on ${new Date(data.shareInfo.expiresAt).toLocaleDateString()}.`}
          </p>
        </div>
      </div>
    </div>
  );
}
