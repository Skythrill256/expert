import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { shareLinks, spermReports, lifestyleLogs } from "@/db/schema";
import { eq, desc, and, gte } from "drizzle-orm";

// Get shared data by token (public endpoint, no auth required)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Find the share link
    const [shareLink] = await db
      .select()
      .from(shareLinks)
      .where(eq(shareLinks.token, token))
      .limit(1);

    if (!shareLink) {
      return NextResponse.json({ error: "Invalid share link" }, { status: 404 });
    }

    // Check if link is revoked
    if (shareLink.revoked) {
      return NextResponse.json({ error: "This share link has been revoked" }, { status: 403 });
    }

    // Check if link is expired
    if (shareLink.expiresAt && new Date(shareLink.expiresAt) < new Date()) {
      return NextResponse.json({ error: "This share link has expired" }, { status: 403 });
    }

    // Update access count and last accessed time
    await db
      .update(shareLinks)
      .set({ 
        accessCount: shareLink.accessCount + 1,
        lastAccessedAt: new Date()
      })
      .where(eq(shareLinks.id, shareLink.id));

    // Get last 30 days of data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    // Fetch reports (identity-redacted)
    const reports = await db
      .select({
        id: spermReports.id,
        reportDate: spermReports.reportDate,
        concentration: spermReports.concentration,
        motility: spermReports.motility,
        progressiveMotility: spermReports.progressiveMotility,
        morphology: spermReports.morphology,
        volume: spermReports.volume,
        ph: spermReports.ph,
        dfi: spermReports.dfi,
        baseScore: spermReports.baseScore,
        adjustedScore: spermReports.adjustedScore,
      })
      .from(spermReports)
      .where(and(
        eq(spermReports.userId, shareLink.userId),
        gte(spermReports.reportDate, thirtyDaysAgoStr)
      ))
      .orderBy(desc(spermReports.reportDate));

    // Fetch lifestyle logs
    const logs = await db
      .select({
        id: lifestyleLogs.id,
        logDate: lifestyleLogs.logDate,
        healthyEating: lifestyleLogs.healthyEating,
        noSmoking: lifestyleLogs.noSmoking,
        noAlcohol: lifestyleLogs.noAlcohol,
        exercise: lifestyleLogs.exercise,
        goodSleep: lifestyleLogs.goodSleep,
        looseUnderwear: lifestyleLogs.looseUnderwear,
        dailyPoints: lifestyleLogs.dailyPoints,
      })
      .from(lifestyleLogs)
      .where(and(
        eq(lifestyleLogs.userId, shareLink.userId),
        gte(lifestyleLogs.logDate, thirtyDaysAgoStr)
      ))
      .orderBy(desc(lifestyleLogs.logDate));

    // Calculate stats
    const currentScore = reports[0]?.adjustedScore || 0;
    const averageScore = reports.length > 0
      ? Math.round(reports.reduce((sum, r) => sum + (r.adjustedScore || 0), 0) / reports.length)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          currentScore,
          averageScore,
          totalReports: reports.length,
          daysTracked: logs.length,
          dateRange: {
            from: thirtyDaysAgoStr,
            to: new Date().toISOString().split('T')[0]
          }
        },
        reports,
        lifestyleLogs: logs,
        shareInfo: {
          createdAt: shareLink.createdAt,
          expiresAt: shareLink.expiresAt,
          accessCount: shareLink.accessCount + 1, // Include current access
        }
      }
    });
  } catch (error) {
    console.error("Error fetching shared data:", error);
    return NextResponse.json({ error: "Failed to fetch shared data" }, { status: 500 });
  }
}
