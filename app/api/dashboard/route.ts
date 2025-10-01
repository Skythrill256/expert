import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { spermReports, lifestyleLogs, recommendations } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/auth";
import { eq, desc, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Sync user with database
    await getOrCreateUser(userId);

    // Get all reports for calculating stats
    const allReports = await db
      .select()
      .from(spermReports)
      .where(eq(spermReports.userId, userId))
      .orderBy(desc(spermReports.reportDate));

    // Calculate stats
    const totalReports = allReports.length;
    const currentScore = allReports[0]?.adjustedScore || 0;
    const averageScore = totalReports > 0
      ? Math.round(allReports.reduce((sum, r) => sum + (r.adjustedScore || 0), 0) / totalReports)
      : 0;

    // Calculate days tracked (from first report to today)
    const daysTracked = allReports.length > 0 && allReports[allReports.length - 1]?.reportDate
      ? Math.floor(
          (new Date().getTime() - new Date(allReports[allReports.length - 1].reportDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

    // Get recent reports (last 3)
    const recentReports = allReports.slice(0, 3).map((report, index) => {
      const previousScore = allReports[index + 1]?.adjustedScore || report.adjustedScore || 0;
      const change = previousScore > 0
        ? (((report.adjustedScore || 0) - previousScore) / previousScore) * 100
        : 0;

      return {
        id: report.id,
        reportDate: report.reportDate,
        baseScore: report.baseScore,
        adjustedScore: report.adjustedScore,
        change: Number(change.toFixed(1)),
      };
    });

    // Get lifestyle logs for trend data
    const lifestyleLogsData = await db
      .select()
      .from(lifestyleLogs)
      .where(eq(lifestyleLogs.userId, userId))
      .orderBy(desc(lifestyleLogs.logDate));

    // Create a map of lifestyle logs by date
    const lifestyleMap = new Map(
      lifestyleLogsData.map(log => [log.logDate, log])
    );

    // Get trend data for chart (last 6 reports) with lifestyle indicators
    const trendData = allReports.slice(0, 6).reverse().map((report) => {
      const reportDate = report.reportDate;
      const lifestyleLog = lifestyleMap.get(reportDate);
      
      // Calculate lifestyle quality based on daily points
      let lifestyleQuality: 'excellent' | 'good' | 'fair' | 'poor' | undefined;
      if (lifestyleLog?.dailyPoints) {
        if (lifestyleLog.dailyPoints >= 7) lifestyleQuality = 'excellent';
        else if (lifestyleLog.dailyPoints >= 5) lifestyleQuality = 'good';
        else if (lifestyleLog.dailyPoints >= 3) lifestyleQuality = 'fair';
        else lifestyleQuality = 'poor';
      }

      return {
        date: new Date(report.reportDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        baseScore: report.baseScore || 0,
        adjustedScore: report.adjustedScore || 0,
        hasLifestyleLog: !!lifestyleLog,
        lifestyleQuality,
      };
    });

    // Get active recommendations (last 3)
    const activeRecommendations = await db
      .select()
      .from(recommendations)
      .where(eq(recommendations.userId, userId))
      .orderBy(desc(recommendations.createdAt))
      .limit(3);

    const recommendationsPreview = activeRecommendations.map((rec) => ({
      id: rec.id,
      title: rec.title,
      recommendationType: rec.recommendationType,
      priority: rec.priority,
    }));

    return NextResponse.json({
      stats: {
        currentScore,
        averageScore,
        totalReports,
        daysTracked,
      },
      trendData,
      recentReports,
      recommendations: recommendationsPreview,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
