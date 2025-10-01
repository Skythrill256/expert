import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { lifestyleLogs } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

// Create lifestyle log entry
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser(userId);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      logDate,
      healthyEating,
      noSmoking,
      noAlcohol,
      exercise,
      goodSleep,
      looseUnderwear,
      dailyPoints,
      notes,
      // Legacy fields (still supported)
      sleepHours,
      exerciseMinutes,
      dietQuality,
      stressLevel,
      smoking,
      alcoholDrinks,
    } = body;

    if (!logDate) {
      return NextResponse.json({ error: "logDate is required" }, { status: 400 });
    }

    const logId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Insert the lifestyle log
    await db.insert(lifestyleLogs).values({
      id: logId,
      userId: user.id,
      logDate,
      // Quick check fields
      healthyEating: healthyEating || false,
      noSmoking: noSmoking || false,
      noAlcohol: noAlcohol || false,
      exercise: exercise || false,
      goodSleep: goodSleep || false,
      looseUnderwear: looseUnderwear || false,
      dailyPoints: dailyPoints || 0,
      // Legacy fields
      sleepHours: sleepHours || null,
      exerciseMinutes: exerciseMinutes || null,
      dietQuality: dietQuality || null,
      stressLevel: stressLevel || null,
      smoking: smoking || false,
      alcoholDrinks: alcoholDrinks || null,
      notes: notes || null,
      createdAt: now,
    });

    return NextResponse.json({ 
      success: true, 
      logId, 
      dailyPoints,
      message: "Lifestyle log created successfully"
    });
  } catch (error) {
    console.error("Error creating lifestyle log:", error);
    return NextResponse.json({ error: "Failed to create lifestyle log" }, { status: 500 });
  }
}

// Get lifestyle logs for user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await getOrCreateUser(userId);

    const logs = await db
      .select()
      .from(lifestyleLogs)
      .where(eq(lifestyleLogs.userId, userId))
      .orderBy(desc(lifestyleLogs.logDate));

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Error fetching lifestyle logs:", error);
    return NextResponse.json({ error: "Failed to fetch lifestyle logs" }, { status: 500 });
  }
}
