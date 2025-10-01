"use client";

import { Activity, TrendingUp, Target, Hand, ArrowRight, AlertTriangle, Lightbulb } from "lucide-react";
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
  const { data: session, isPending, isLoaded } = useSession();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!session?.user) return;

      try {
        const response = await fetch("/api/dashboard");
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [session]);

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
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
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
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">Welcome, {firstName}! <Hand className="w-7 h-7 text-primary" /></h1>
            <p className="text-muted-foreground">
              Let's get started by uploading your first report
            </p>
          </div>

          <div className="glass-card rounded-2xl p-12 text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-chart-2/10 flex items-center justify-center mx-auto mb-6">
              <Target className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-4">No Reports Yet</h2>
            <p className="text-muted-foreground mb-8">
              Upload your first sperm analysis report to get personalized insights and recommendations.
            </p>
            <button
              onClick={() => router.push("/upload")}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 smooth-transition"
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
        <div className="mb-8 animate-fade-in flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">Welcome back, {firstName} <Hand className="w-7 h-7 text-primary" /></h1>
            <p className="text-muted-foreground">Here's your health overview for today</p>
          </div>
          <a href="/api/export/pdf" download className="px-4 py-2 glass-card rounded-xl hover-lift flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4" />
            Export PDF
          </a>
        </div>

        <div className="glass-card rounded-3xl p-12 mb-8 text-center animate-scale-in">
          <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wide">Your Sperm Health Score</p>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-8xl font-bold bg-gradient-to-br from-primary to-chart-2 bg-clip-text text-transparent">
              {stats.currentScore}
            </div>
            {scoreChange !== 0 && (
              <div className={`flex items-center gap-2 text-2xl font-semibold ${
                scoreChange > 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {scoreChange > 0 ? (
                  <>
                    <TrendingUp className="w-8 h-8" />
                    <span>+{Math.abs(scoreChange).toFixed(0)}</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-8 h-8 rotate-180" />
                    <span>-{Math.abs(scoreChange).toFixed(0)}</span>
                  </>
                )}
              </div>
            )}
          </div>
          <p className="text-muted-foreground">
            {scoreChange > 0 ? (
              <span className="inline-flex items-center gap-2 text-green-600"><TrendingUp className="w-4 h-4" /> Improving</span>
            ) : scoreChange < 0 ? (
              <span className="inline-flex items-center gap-2 text-red-600"><TrendingUp className="w-4 h-4 rotate-180" /> Needs attention</span>
            ) : (
              <span className="inline-flex items-center gap-2 text-muted-foreground"><ArrowRight className="w-4 h-4" /> Stable</span>
            )}
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Top 3 Actions to Take Today</h2>
          <div className="space-y-3">
            {recommendations.slice(0, 3).map((rec, index) => (
              <div key={rec.id} className="glass-card rounded-xl p-4 flex items-center gap-4 hover-lift">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                  rec.priority === 'critical' ? 'bg-red-500/20 text-red-500' :
                  rec.priority === 'high' ? 'bg-orange-500/20 text-orange-500' :
                  'bg-blue-500/20 text-blue-500'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{rec.title}</p>
                  <p className="text-sm text-muted-foreground capitalize">{rec.recommendationType || 'general'}</p>
                </div>
                {rec.priority === 'critical' || rec.priority === 'high' ? (
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                ) : (
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <TrendChart data={trendData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentReports reports={recentReports} />
          <RecommendationsPreview recommendations={recommendations} />
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button onClick={() => router.push("/lifestyle")} className="glass-card rounded-2xl p-6 hover-lift smooth-transition text-left group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-chart-2/10 flex items-center justify-center mb-4 group-hover:scale-110 smooth-transition">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Log Today's Lifestyle</h3>
            <p className="text-sm text-muted-foreground">Track your daily habits and activities</p>
          </button>

          <button onClick={() => router.push("/upload")} className="glass-card rounded-2xl p-6 hover-lift smooth-transition text-left group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-chart-2/10 to-chart-3/10 flex items-center justify-center mb-4 group-hover:scale-110 smooth-transition">
              <TrendingUp className="w-6 h-6 text-chart-2" />
            </div>
            <h3 className="font-semibold mb-2">Upload New Report</h3>
            <p className="text-sm text-muted-foreground">Add your latest lab results</p>
          </button>

          <button onClick={() => router.push("/recommendations")} className="glass-card rounded-2xl p-6 hover-lift smooth-transition text-left group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-chart-3/10 to-chart-4/10 flex items-center justify-center mb-4 group-hover:scale-110 smooth-transition">
              <Target className="w-6 h-6 text-chart-3" />
            </div>
            <h3 className="font-semibold mb-2">View All Insights</h3>
            <p className="text-sm text-muted-foreground">Explore detailed recommendations</p>
          </button>
        </div>
      </PageLayout>

      <FloatingActionButton />
    </div>
  );
}
