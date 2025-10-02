import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, userSettings, spermReports, lifestyleLogs } from '@/db/schema';
import { eq, desc, and, gte } from 'drizzle-orm';
import { sendWeeklySummary } from '@/lib/email/notifications';

// This endpoint should be called by a cron service (like Vercel Cron, Upstash QStash, etc.)
// Add authentication header check in production
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (add this to .env: CRON_SECRET=your-secret-key)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all users who have weekly reports enabled
    const usersWithWeeklyReports = await db
      .select({
        userId: user.id,
        email: user.email,
        name: user.name,
        weeklyReports: userSettings.weeklyReports,
        emailNotifications: userSettings.emailNotifications,
      })
      .from(user)
      .leftJoin(userSettings, eq(user.id, userSettings.userId))
      .where(
        and(
          eq(userSettings.weeklyReports, true),
          eq(userSettings.emailNotifications, true)
        )
      );

    const weekEnd = new Date();
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
    };

    // Send weekly summary to each user
    for (const userData of usersWithWeeklyReports) {
      try {
        // Get user's reports
        const allReports = await db
          .select()
          .from(spermReports)
          .where(eq(spermReports.userId, userData.userId))
          .orderBy(desc(spermReports.reportDate));

        if (allReports.length === 0) {
          results.skipped++;
          continue;
        }

        // Get lifestyle logs for the week
        const lifestyleLogsData = await db
          .select()
          .from(lifestyleLogs)
          .where(
            and(
              eq(lifestyleLogs.userId, userData.userId),
              gte(lifestyleLogs.logDate, weekStart.toISOString())
            )
          );

        // Calculate health streak
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

        // Calculate stats
        const currentScore = allReports[0]?.adjustedScore || 0;
        const averageScore = Math.round(
          allReports.reduce((sum, r) => sum + (r.adjustedScore || 0), 0) / allReports.length
        );
        
        const daysTracked = allReports.length > 0 && allReports[allReports.length - 1]?.reportDate
          ? Math.floor(
              (new Date().getTime() - new Date(allReports[allReports.length - 1].reportDate).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 0;

        const lifestyleConsistency = daysTracked > 0
          ? Math.min(100, Math.round((lifestyleLogsData.length / daysTracked) * 100))
          : 0;

        // Send weekly summary email
        const sent = await sendWeeklySummary({
          userId: userData.userId,
          weekStart: weekStart.toISOString(),
          weekEnd: weekEnd.toISOString(),
          currentScore,
          averageScore,
          reportsCount: allReports.length,
          healthStreak,
          lifestyleConsistency,
        });

        if (sent) {
          results.success++;
        } else {
          results.failed++;
        }
      } catch (error) {
        console.error(`Failed to send weekly summary to user ${userData.userId}:`, error);
        results.failed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Weekly summaries sent',
      results,
      totalUsers: usersWithWeeklyReports.length,
    });
  } catch (error) {
    console.error('Error sending weekly summaries:', error);
    return NextResponse.json(
      { error: 'Failed to send weekly summaries' },
      { status: 500 }
    );
  }
}
