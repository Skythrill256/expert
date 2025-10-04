import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { spermReports, recommendations as recommendationsTable, lifestyleLogs } from "@/db/schema";
import { extractBiomarkersFromPDF, calculateBaseScore, generateRecommendations } from "@/lib/services/openai";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/auth";
import { eq, desc, and } from "drizzle-orm";
import { sendNewReportNotification, sendNewRecommendationsNotification } from "@/lib/email/notifications";
import { format } from "date-fns";

// Upload new report
export async function POST(request: NextRequest) {
  try {
    // Get current user session
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure user exists in database
    const dbUser = await getOrCreateUser(userId);
    if (!dbUser) {
      return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
    }

    // Use the database user's ID (in case it's different from Clerk ID)
    const actualUserId = dbUser.id;

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const reportDate = formData.get("reportDate") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Fetch lifestyle data from daily logs for the report date or recent days
    let lifestyleData = null;
    try {
      // Try to get the daily log for the report date or the most recent one
      const logDate = reportDate || format(new Date(), "yyyy-MM-dd");
      const logs = await db
        .select()
        .from(lifestyleLogs)
        .where(eq(lifestyleLogs.userId, actualUserId))
        .orderBy(desc(lifestyleLogs.logDate))
        .limit(7); // Get last 7 days for context

      if (logs.length > 0) {
        // Try to find log for the specific date first
        const dateLog = logs.find(log => log.logDate === logDate);
        const mostRecentLog = dateLog || logs[0];
        
        // Convert daily log data to lifestyle format for recommendations
        lifestyleData = {
          dietQuality: mostRecentLog.dietQuality,
          sleepQuality: mostRecentLog.sleepQuality,
          sleepHours: mostRecentLog.sleepHours,
          stressLevel: mostRecentLog.stressLevel,
          exerciseMinutes: mostRecentLog.exerciseMinutes,
          masturbationCount: mostRecentLog.masturbationCount,
          electrolytes: mostRecentLog.electrolytes,
          notes: mostRecentLog.notes,
          // Calculate averages from recent logs for better context
          recentLogs: logs.map(log => ({
            date: log.logDate,
            dietQuality: log.dietQuality,
            sleepHours: log.sleepHours,
            exerciseMinutes: log.exerciseMinutes,
            stressLevel: log.stressLevel
          }))
        };
      }
    } catch (e) {
      console.error("Error fetching lifestyle data:", e);
      // Continue without lifestyle data
    }

    // Convert file to base64 for OpenAI Vision API
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');
    
    // Determine the mime type
    let mimeType = file.type;
    if (!mimeType || mimeType === 'application/octet-stream') {
      // Try to infer from file extension
      if (file.name.toLowerCase().endsWith('.pdf')) {
        mimeType = 'application/pdf';
      } else if (file.name.toLowerCase().endsWith('.png')) {
        mimeType = 'image/png';
      } else if (file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg')) {
        mimeType = 'image/jpeg';
      }
    }

    // Extract biomarkers using AI vision
    const biomarkers = await extractBiomarkersFromPDF(base64Data, mimeType);

    // Calculate base score
    const baseScore = calculateBaseScore(biomarkers);

    // Calculate lifestyle score adjustment if lifestyle data provided
    let adjustedScore = baseScore;
    if (lifestyleData) {
      let lifestyleBonus = 0;
      
      // Diet quality (0-3 points)
      if (lifestyleData.dietQuality === 'excellent') lifestyleBonus += 3;
      else if (lifestyleData.dietQuality === 'good') lifestyleBonus += 2;
      else if (lifestyleData.dietQuality === 'average') lifestyleBonus += 1;
      
      // Sleep quality (0-2 points)
      if (lifestyleData.sleepQuality === 'excellent') lifestyleBonus += 2;
      else if (lifestyleData.sleepQuality === 'good') lifestyleBonus += 1;
      
      // Exercise (0-3 points based on minutes)
      if (lifestyleData.exerciseMinutes && lifestyleData.exerciseMinutes >= 60) lifestyleBonus += 3;
      else if (lifestyleData.exerciseMinutes && lifestyleData.exerciseMinutes >= 30) lifestyleBonus += 2;
      else if (lifestyleData.exerciseMinutes && lifestyleData.exerciseMinutes >= 10) lifestyleBonus += 1;
      
      // Stress level (0-2 points, inverted - lower stress is better)
      if (lifestyleData.stressLevel === 'low') lifestyleBonus += 2;
      else if (lifestyleData.stressLevel === 'moderate') lifestyleBonus += 1;
      
      // Electrolytes (0-1 point)
      if (lifestyleData.electrolytes === true) lifestyleBonus += 1;
      
      // Masturbation frequency (0-2 points, lower is better for sperm health)
      if (lifestyleData.masturbationCount === 0) lifestyleBonus += 2;
      else if (lifestyleData.masturbationCount === 1) lifestyleBonus += 1;
      
      adjustedScore = Math.min(100, baseScore + lifestyleBonus);
    }

    // Create report in database
    const reportId = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.insert(spermReports).values({
      id: reportId,
      userId: actualUserId,
      reportDate: reportDate || now,
      concentration: biomarkers.concentration,
      motility: biomarkers.motility,
      progressiveMotility: biomarkers.progressiveMotility,
      morphology: biomarkers.morphology,
      volume: biomarkers.volume,
      ph: biomarkers.ph,
      dfi: biomarkers.dfi,
      baseScore,
      adjustedScore,
      pdfUrl: null, // For now, not storing the PDF file
      createdAt: now,
      updatedAt: now,
    });

    // Generate AI recommendations (pass lifestyle data if available)
    const recommendationsData = await generateRecommendations(biomarkers, baseScore, lifestyleData as any);

    // Save recommendations to database
    const recommendationPromises = recommendationsData.recommendations.map((rec) => {
      return db.insert(recommendationsTable).values({
        id: crypto.randomUUID(),
        userId: actualUserId,
        recommendationType: rec.type,
        title: rec.title,
        description: `${rec.description}\n\nReasoning: ${rec.reasoning}`,
        priority: rec.priority,
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
    });

    await Promise.all(recommendationPromises);

    // Get previous report score for comparison
    const previousReports = await db
      .select()
      .from(spermReports)
      .where(eq(spermReports.userId, actualUserId))
      .orderBy(desc(spermReports.reportDate))
      .limit(2);
    
    const previousScore = previousReports.length > 1 ? previousReports[1].adjustedScore : undefined;

    // Send email notifications asynchronously (don't block response)
    Promise.all([
      sendNewReportNotification({
        userId: actualUserId,
        reportDate: reportDate || now,
        currentScore: adjustedScore || 0,
        previousScore: previousScore || undefined,
      }),
      sendNewRecommendationsNotification({
        userId: actualUserId,
        recommendations: recommendationsData.recommendations.map(rec => ({
          title: rec.title,
          description: rec.description,
          priority: rec.priority,
        })),
      }),
    ]).catch(err => console.error('Error sending notification emails:', err));

    return NextResponse.json({
      success: true,
      reportId,
      biomarkers,
      baseScore,
      adjustedScore,
      recommendations: recommendationsData.recommendations,
    });
  } catch (error) {
    console.error("Error processing report:", error);
    
    // Provide user-friendly error messages
    let errorMessage = "Failed to process report";
    let errorDetails = error instanceof Error ? error.message : "Unknown error";
    
    if (errorDetails.includes("OpenAI")) {
      errorMessage = "AI analysis failed";
      errorDetails = "Unable to extract biomarkers from the document. Please try again or use manual entry.";
    } else if (errorDetails.includes("biomarkers")) {
      errorMessage = "Data extraction failed";
      errorDetails = "Could not find sperm analysis data in the document. Please ensure it's a valid lab report.";
    } else if (errorDetails.includes("Unauthorized")) {
      errorMessage = "Authentication failed";
      errorDetails = "Please log in again.";
    }
    
    return NextResponse.json(
      { 
        error: errorMessage, 
        details: errorDetails,
        hint: "Try uploading a clear image or PDF of your lab report, or use manual entry instead."
      },
      { status: 500 }
    );
  }
}

// Get all reports for user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await getOrCreateUser(userId);

    const reports = await db
      .select()
      .from(spermReports)
      .where(eq(spermReports.userId, userId))
      .orderBy(desc(spermReports.reportDate));

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
