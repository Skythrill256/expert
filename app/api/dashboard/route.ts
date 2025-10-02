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

    // Sync user with database (with error handling)
    const user = await getOrCreateUser(userId);
    
    // Use the database user's ID, fallback to Clerk ID if sync failed
    const actualUserId = user ? user.id : userId;
    
    if (!user) {
      // If user sync fails, still continue with userId from Clerk
      console.warn('User sync failed, continuing with Clerk userId');
    }

    // Get all reports for calculating stats
    const allReports = await db
      .select()
      .from(spermReports)
      .where(eq(spermReports.userId, actualUserId))
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

    // Calculate best and worst scores
    const bestScore = totalReports > 0
      ? Math.max(...allReports.map(r => r.adjustedScore || 0))
      : 0;
    const worstScore = totalReports > 0
      ? Math.min(...allReports.map(r => r.adjustedScore || 0))
      : 0;

    // Calculate improvement rate (percentage change from first to latest)
    const improvementRate = totalReports >= 2 && allReports[allReports.length - 1]?.adjustedScore
      ? Math.round(
          ((currentScore - (allReports[allReports.length - 1].adjustedScore || 0)) / 
          (allReports[allReports.length - 1].adjustedScore || 1)) * 100
        )
      : 0;

    // Calculate lifestyle consistency (percentage of days with logs)
    const lifestyleLogsData = await db
      .select()
      .from(lifestyleLogs)
      .where(eq(lifestyleLogs.userId, actualUserId))
      .orderBy(desc(lifestyleLogs.logDate));

    const lifestyleConsistency = daysTracked > 0
      ? Math.min(100, Math.round((lifestyleLogsData.length / daysTracked) * 100))
      : 0;

    // Calculate current health streak (consecutive days with lifestyle logs)
    let healthStreak = 0;
    if (lifestyleLogsData.length > 0) {
      const sortedLogs = [...lifestyleLogsData].sort((a, b) => 
        new Date(b.logDate).getTime() - new Date(a.logDate).getTime()
      );
      
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      for (const log of sortedLogs) {
        const logDate = new Date(log.logDate);
        logDate.setHours(0, 0, 0, 0);
        
        const diffDays = Math.floor((currentDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === healthStreak) {
          healthStreak++;
        } else if (diffDays > healthStreak) {
          break;
        }
      }
    }

    // Calculate average lifestyle points
    const avgLifestylePoints = lifestyleLogsData.length > 0
      ? Math.round(
          lifestyleLogsData.reduce((sum, log) => sum + (log.dailyPoints || 0), 0) / 
          lifestyleLogsData.length
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
      .where(eq(recommendations.userId, actualUserId))
      .orderBy(desc(recommendations.createdAt))
      .limit(3);

    const recommendationsPreview = activeRecommendations.map((rec) => ({
      id: rec.id,
      title: rec.title,
      recommendationType: rec.recommendationType,
      priority: rec.priority,
    }));

    const statsResponse = {
      currentScore,
      averageScore,
      totalReports,
      daysTracked,
      bestScore,
      worstScore,
      improvementRate,
      lifestyleConsistency,
      healthStreak,
      avgLifestylePoints,
    };

    console.log('Dashboard stats:', statsResponse);

    return NextResponse.json({
      stats: statsResponse,
      trendData,
      recentReports,
      recommendations: recommendationsPreview,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
