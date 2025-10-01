import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { spermReports, recommendations as recommendationsTable } from "@/db/schema";
import { extractBiomarkersFromPDF, calculateBaseScore, generateRecommendations } from "@/lib/services/openai";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

// Upload new report
export async function POST(request: NextRequest) {
  try {
    // Get current user session
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await getOrCreateUser(userId);

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const reportDate = formData.get("reportDate") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
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

    // Get user's lifestyle data to calculate adjusted score
    // For now, we'll use base score as adjusted score
    // Later this can be enhanced with lifestyle data
    const adjustedScore = baseScore;

    // Create report in database
    const reportId = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.insert(spermReports).values({
      id: reportId,
      userId: userId,
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

    // Generate AI recommendations
    const recommendationsData = await generateRecommendations(biomarkers, baseScore);

    // Save recommendations to database
    const recommendationPromises = recommendationsData.recommendations.map((rec) => {
      return db.insert(recommendationsTable).values({
        id: crypto.randomUUID(),
        userId: userId,
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
