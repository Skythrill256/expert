import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { spermReports, lifestyleLogs } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/auth";
import { eq, desc, gte } from "drizzle-orm";

// Export 30-day summary
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await getOrCreateUser(userId);

    // Get last 30 days of data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    // Fetch reports
    const reports = await db
      .select()
      .from(spermReports)
      .where(eq(spermReports.userId, userId))
      .orderBy(desc(spermReports.reportDate));

    // Fetch lifestyle logs
    const logs = await db
      .select()
      .from(lifestyleLogs)
      .where(eq(lifestyleLogs.userId, userId))
      .orderBy(desc(lifestyleLogs.logDate));

    // Calculate stats
    const currentScore = reports[0]?.adjustedScore || 0;
    const averageScore = reports.length > 0
      ? Math.round(reports.reduce((sum, r) => sum + (r.adjustedScore || 0), 0) / reports.length)
      : 0;

    // Create CSV content
    const csvRows = [];
    
    // Header
    csvRows.push('30-Day Sperm Health Summary');
    csvRows.push(`Generated: ${new Date().toISOString()}`);
    csvRows.push('');
    
    // Stats
    csvRows.push('SUMMARY STATISTICS');
    csvRows.push(`Current Score,${currentScore}`);
    csvRows.push(`Average Score,${averageScore}`);
    csvRows.push(`Total Reports,${reports.length}`);
    csvRows.push(`Days Tracked,${logs.length}`);
    csvRows.push('');
    
    // Reports
    csvRows.push('SPERM ANALYSIS REPORTS');
    csvRows.push('Date,Score,Base Score,Concentration,Motility,Progressive Motility,Morphology,Volume,pH,DFI');
    reports.forEach(report => {
      csvRows.push([
        report.reportDate,
        report.adjustedScore || '',
        report.baseScore || '',
        report.concentration || '',
        report.motility || '',
        report.progressiveMotility || '',
        report.morphology || '',
        report.volume || '',
        report.ph || '',
        report.dfi || ''
      ].join(','));
    });
    csvRows.push('');
    
    // Lifestyle logs
    csvRows.push('LIFESTYLE TRACKING');
    csvRows.push('Date,Daily Points,Healthy Eating,No Smoking,No Alcohol,Exercise,Good Sleep,Loose Underwear');
    logs.forEach(log => {
      csvRows.push([
        log.logDate,
        log.dailyPoints || 0,
        log.healthyEating ? 'Yes' : 'No',
        log.noSmoking ? 'Yes' : 'No',
        log.noAlcohol ? 'Yes' : 'No',
        log.exercise ? 'Yes' : 'No',
        log.goodSleep ? 'Yes' : 'No',
        log.looseUnderwear ? 'Yes' : 'No'
      ].join(','));
    });

    const csvContent = csvRows.join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="sperm-health-summary-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting data:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
