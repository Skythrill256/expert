"use client";

import { Activity, TrendingUp, Target, ArrowRight, AlertTriangle, Lightbulb, Award, TrendingDown, Flame, Calendar, Star, BarChart3 } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import PageLayout from "@/components/PageLayout";
import TrendChart from "@/components/TrendChart";
import RecentReports from "@/components/RecentReports";
import RecommendationsPreview from "@/components/RecommendationsPreview";
import FloatingActionButton from "@/components/FloatingActionButton";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type DashboardData = {
  stats: {
    currentScore: number;
    averageScore: number;
    totalReports: number;
    daysTracked: number;
    bestScore: number;
    worstScore: number;
    improvementRate: number;
    lifestyleConsistency: number;
    healthStreak: number;
    avgLifestylePoints: number;
  };
  trendData: Array<{
    date: string;
    baseScore: number;
    adjustedScore: number;
    hasLifestyleLog?: boolean;
    lifestyleQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  }>;
  recentReports: Array<{
    id: string;
    reportDate: string;
    baseScore: number | null;
    adjustedScore: number | null;
    change: number;
  }>;
  recommendations: Array<{
    id: string;
    title: string;
    recommendationType: string | null;
    priority: string | null;
  }>;
};

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, isPending, isLoaded } = useSession();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let isMounted = true;
    let retryTimeout: NodeJS.Timeout;

    async function fetchDashboardData() {
      if (!session?.user || !isMounted) return;

      try {
        const response = await fetch("/api/dashboard", {
          cache: 'no-store',
        });
        
        if (!isMounted) return;

        if (response.ok) {
          const data = await response.json();
          console.log('Dashboard data received:', data);
          console.log('Stats:', data.stats);
          if (isMounted) {
            setDashboardData(data);
            setError(null);
          }
        } else if (response.status === 500) {
          // Retry once after 2 seconds if we get a 500 error
          console.warn('Dashboard API error, retrying...');
          retryTimeout = setTimeout(() => {
            if (isMounted) {
              fetchDashboardData();
            }
          }, 2000);
        } else {
          throw new Error(`API returned ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        if (isMounted) {
          setError("Failed to load dashboard data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (session?.user && isLoaded) {
      fetchDashboardData();
    }

    return () => {
      isMounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, [session?.user?.id, isLoaded]); // Only depend on user ID, not entire session object

  if (!mounted || !isLoaded) {
    return null;
  }

  if (!session?.user) {
    router.push("/login");
    return null;
  }

  const firstName = session.user.name?.split(" ")[0] || "there";

  if (loading) {
    return (
      <div className="min-h-screen gradient-mesh">
        <Sidebar />
        <PageLayout>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center px-4">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-muted-foreground">Loading your dashboard...</p>
            </div>
          </div>
        </PageLayout>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-mesh">
        <Sidebar />
        <PageLayout>
          <div className="flex items-center justify-center h-screen px-4">
            <div className="text-center max-w-md">
              <AlertTriangle className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-destructive mx-auto mb-3 sm:mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Unable to Load Dashboard</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-5 py-2 sm:px-6 sm:py-2 text-sm sm:text-base bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          </div>
        </PageLayout>
      </div>
    );
  }

  if (!dashboardData || dashboardData.stats.totalReports === 0) {
    return (
      <div className="min-h-screen gradient-mesh">
        <Sidebar />
        <PageLayout>
          <div className="mb-6 sm:mb-8 animate-fade-in pl-12 sm:pl-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">Welcome, {firstName}!</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Let's get started by uploading your first report
            </p>
          </div>

          <div className="glass-card rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 text-center max-w-2xl mx-auto">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary/10 to-chart-2/10 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Target className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">No Reports Yet</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
              Upload your first sperm analysis report to get personalized insights and recommendations.
            </p>
            <button
              onClick={() => router.push("/upload")}
              className="px-5 py-2.5 sm:px-6 sm:py-3 bg-primary text-primary-foreground rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:opacity-90 smooth-transition"
            >
              Upload Your First Report
            </button>
          </div>
        </PageLayout>
        <FloatingActionButton />
      </div>
    );
  }

  const { stats, trendData, recentReports, recommendations } = dashboardData;
  const scoreChange = recentReports.length > 1 && recentReports[0]
    ? recentReports[0].change
    : 0;

  return (
    <div className="min-h-screen gradient-mesh">
      <Sidebar />

      <PageLayout>
        <div className="dashboard-shell">
        {/* Header */}
  <div className="mb-4 sm:mb-6 md:mb-8 animate-fade-in flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pl-12 sm:pl-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 flex items-center gap-2 flex-wrap">
              <span className="truncate">Welcome back, {firstName}</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Here's your health overview for today</p>
          </div>
          <a 
            href="/api/export/pdf" 
            download 
            className="px-3 py-1.5 sm:px-4 sm:py-2 glass-card rounded-lg sm:rounded-xl hover-lift flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap self-start sm:self-auto"
          >
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Export PDF</span>
            <span className="sm:hidden">Export</span>
          </a>
  </div>

        {/* Bento Grid Layout */}
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 lg:grid-cols-12 gap-2.5 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 auto-rows-auto">
          
          {/* Hero Score Card - Spans 2 rows & 6 columns */}
          <div className="sm:col-span-2 md:col-span-6 lg:col-span-6 lg:row-span-2 glass-card rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 text-center animate-scale-in flex flex-col justify-center relative overflow-hidden min-h-[240px] sm:min-h-[280px] md:min-h-[320px]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5 pointer-events-none"></div>
            <div className="relative z-10">
              <p className="text-[0.65rem] sm:text-xs md:text-sm text-muted-foreground mb-1.5 sm:mb-2 md:mb-3 uppercase tracking-wide">
                Your Sperm Health Score
              </p>
              <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3 md:mb-4">
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold bg-gradient-to-br from-primary to-chart-2 bg-clip-text text-transparent">
                  {stats.currentScore}
                </div>
                {scoreChange !== 0 && (
                  <div className={`flex flex-col items-center gap-0.5 sm:gap-1 text-sm sm:text-base md:text-lg lg:text-2xl font-semibold ${
                    scoreChange > 0 ? 'text-primary' : 'text-destructive'
                  }`}>
                    <TrendingUp className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 ${scoreChange < 0 ? 'rotate-180' : ''}`} />
                    <span className="text-[0.65rem] sm:text-xs md:text-sm lg:text-xl">{scoreChange > 0 ? '+' : ''}{scoreChange.toFixed(0)}</span>
                  </div>
                )}
              </div>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-3 sm:mb-4 md:mb-0">
                {scoreChange > 0 ? (
                  <span className="inline-flex items-center gap-1 sm:gap-2 text-primary">
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" /> Improving
                  </span>
                ) : scoreChange < 0 ? (
                  <span className="inline-flex items-center gap-1 sm:gap-2 text-destructive">
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 rotate-180" /> Needs attention
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 sm:gap-2 text-muted-foreground">
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" /> Stable
                  </span>
                )}
              </p>
              <div className="mt-3 sm:mt-4 md:mt-6 grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 md:pt-6 border-t border-border/30">
                <div>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">{stats.averageScore}</p>
                  <p className="text-[0.65rem] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">Avg Score</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-chart-2">{stats.totalReports}</p>
                  <p className="text-[0.65rem] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">Reports</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-chart-3">{stats.daysTracked}</p>
                  <p className="text-[0.65rem] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">Days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Cards */}
          <button 
            onClick={() => router.push("/lifestyle")} 
            className="sm:col-span-1 md:col-span-3 lg:col-span-3 glass-card rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 hover-lift smooth-transition text-left group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
            <div className="relative z-10">
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/20 to-chart-2/10 flex items-center justify-center mb-2 sm:mb-3 md:mb-4 group-hover:scale-110 smooth-transition">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5 lg:w-6 lg:h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-0.5 sm:mb-1 md:mb-2 text-xs sm:text-sm md:text-base">Log Lifestyle</h3>
              <p className="text-[0.65rem] sm:text-xs md:text-sm text-muted-foreground">Track daily habits</p>
            </div>
          </button>

          <button 
            onClick={() => router.push("/upload")} 
            className="sm:col-span-1 md:col-span-3 lg:col-span-3 glass-card rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 hover-lift smooth-transition text-left group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-chart-2/5 to-transparent pointer-events-none"></div>
            <div className="relative z-10">
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-chart-2/20 to-chart-3/10 flex items-center justify-center mb-2 sm:mb-3 md:mb-4 group-hover:scale-110 smooth-transition">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5 lg:w-6 lg:h-6 text-chart-2" />
              </div>
              <h3 className="font-semibold mb-0.5 sm:mb-1 md:mb-2 text-xs sm:text-sm md:text-base">Upload Report</h3>
              <p className="text-[0.65rem] sm:text-xs md:text-sm text-muted-foreground">Add lab results</p>
            </div>
          </button>

          {/* Stats Row - 3 cards spanning equal width */}
          {/* Best Score Card */}
          <div className="sm:col-span-1 md:col-span-2 lg:col-span-2 glass-card rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 animate-fade-in relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
            <div className="relative z-10">
              <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/20 to-chart-2/10 flex items-center justify-center mb-1.5 sm:mb-2 md:mb-3">
                <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <p className="text-lg sm:text-xl md:text-2xl font-bold">{stats.bestScore ?? 0}</p>
              <p className="text-[0.65rem] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">Best Score</p>
            </div>
          </div>

          {/* Health Streak Card */}
          <div className="sm:col-span-1 md:col-span-2 lg:col-span-2 glass-card rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 animate-fade-in relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
            <div className="relative z-10">
              <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/20 to-chart-2/10 flex items-center justify-center mb-1.5 sm:mb-2 md:mb-3">
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <p className="text-lg sm:text-xl md:text-2xl font-bold">{stats.healthStreak ?? 0}</p>
              <p className="text-[0.65rem] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">Day Streak</p>
            </div>
          </div>

          {/* Improvement Rate Card */}
          <div className="sm:col-span-2 md:col-span-2 lg:col-span-2 glass-card rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 animate-fade-in relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
            <div className="relative z-10">
              <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/20 to-chart-2/10 flex items-center justify-center mb-1.5 sm:mb-2 md:mb-3">
                {(stats.improvementRate ?? 0) >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary" />
                )}
              </div>
              <p className="text-lg sm:text-xl md:text-2xl font-bold">
                {(stats.improvementRate ?? 0) > 0 ? '+' : ''}{stats.improvementRate ?? 0}%
              </p>
              <p className="text-[0.65rem] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">Overall Change</p>
            </div>
          </div>

          {/* Lifestyle Consistency Card */}
          <div className="sm:col-span-1 md:col-span-3 lg:col-span-3 glass-card rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 animate-fade-in relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
            <div className="relative z-10">
              <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/20 to-chart-2/10 flex items-center justify-center mb-1.5 sm:mb-2 md:mb-3">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">{stats.lifestyleConsistency ?? 0}%</p>
              <p className="text-[0.65rem] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">Lifestyle Consistency</p>
            </div>
          </div>

          {/* Average Lifestyle Points Card */}
          <div className="sm:col-span-1 md:col-span-3 lg:col-span-3 glass-card rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 animate-fade-in relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
            <div className="relative z-10">
              <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/20 to-chart-2/10 flex items-center justify-center mb-1.5 sm:mb-2 md:mb-3">
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">{stats.avgLifestylePoints ?? 0}/8</p>
              <p className="text-[0.65rem] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">Avg Daily Points</p>
            </div>
          </div>

          {/* Top Actions - Spans full width */}
          <div className="sm:col-span-2 md:col-span-6 lg:col-span-6 glass-card rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4 gap-2">
              <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold flex items-center gap-1.5 sm:gap-2">
                <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                <span className="truncate">Top Actions Today</span>
              </h2>
              <button 
                onClick={() => router.push("/recommendations")}
                className="text-[0.65rem] sm:text-xs md:text-sm text-primary hover:underline flex items-center gap-0.5 sm:gap-1 shrink-0"
              >
                <span className="hidden sm:inline">View All</span>
                <span className="sm:hidden">All</span>
                <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
              </button>
            </div>
            <div className="space-y-2 sm:space-y-2.5 md:space-y-3">
              {recommendations.slice(0, 3).map((rec, index) => (
                <div key={rec.id} className="glass rounded-lg sm:rounded-xl p-2 sm:p-2.5 md:p-3 flex items-center gap-2 sm:gap-2.5 md:gap-3 hover:bg-accent/50 smooth-transition cursor-pointer">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0 bg-primary/20 text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs sm:text-sm truncate">{rec.title}</p>
                    <p className="text-[0.65rem] sm:text-xs text-muted-foreground capitalize">{rec.recommendationType || 'general'}</p>
                  </div>
                  {rec.priority === 'critical' || rec.priority === 'high' ? (
                    <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-destructive flex-shrink-0" />
                  ) : (
                    <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Trend Chart - Spans full width, 2 rows */}
          <div className="sm:col-span-2 md:col-span-6 lg:col-span-12 lg:row-span-2 glass-card rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 animate-fade-in">
            <TrendChart data={trendData} />
          </div>

          {/* Recent Reports - Half width */}
          <div className="sm:col-span-2 md:col-span-6 lg:col-span-6 glass-card rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 animate-fade-in">
            <RecentReports reports={recentReports} />
          </div>

          {/* Recommendations Preview - Half width */}
          <div className="sm:col-span-2 md:col-span-6 lg:col-span-6 glass-card rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 animate-fade-in">
            <RecommendationsPreview recommendations={recommendations} />
          </div>

        </div>
        </div>
      </PageLayout>

      <FloatingActionButton />
    </div>
  );
}
