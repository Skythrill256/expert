import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { lifestyleLogs } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/auth";
import { eq, desc, and } from "drizzle-orm";
import { randomUUID } from "crypto";

// GET - Fetch daily logs for the current user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateUser(userId);
    if (!dbUser) {
      return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
    }

    const actualUserId = dbUser.id;

    // Get date parameter if provided
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    let logs;
    if (date) {
      // Get log for specific date
      logs = await db
        .select()
        .from(lifestyleLogs)
        .where(and(
          eq(lifestyleLogs.userId, actualUserId),
          eq(lifestyleLogs.logDate, date)
        ))
        .limit(1);
    } else {
      // Get all logs
      logs = await db
        .select()
        .from(lifestyleLogs)
        .where(eq(lifestyleLogs.userId, actualUserId))
        .orderBy(desc(lifestyleLogs.logDate));
    }

    return NextResponse.json({ logs: date ? logs[0] || null : logs });
  } catch (error) {
    console.error("Error fetching daily logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily logs" },
      { status: 500 }
    );
  }
}

// POST - Create or update a daily log
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateUser(userId);
    if (!dbUser) {
      return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
    }

    const actualUserId = dbUser.id;

    const body = await request.json();
    const {
      logDate,
      masturbationCount,
      sleepQuality,
      sleepHours,
      dietQuality,
      stressLevel,
      exerciseMinutes,
      electrolytes,
      notes
    } = body;

    if (!logDate) {
      return NextResponse.json(
        { error: "Log date is required" },
        { status: 400 }
      );
    }

    // Check if a log already exists for this date
    const existingLog = await db
      .select()
      .from(lifestyleLogs)
      .where(and(
        eq(lifestyleLogs.userId, actualUserId),
        eq(lifestyleLogs.logDate, logDate)
      ))
      .limit(1);

    const now = new Date().toISOString();

    if (existingLog.length > 0) {
      // Update existing log
      await db
        .update(lifestyleLogs)
        .set({
          masturbationCount,
          sleepQuality,
          sleepHours,
          dietQuality,
          stressLevel,
          exerciseMinutes,
          electrolytes,
          notes,
          updatedAt: now
        })
        .where(eq(lifestyleLogs.id, existingLog[0].id));

      return NextResponse.json({
        message: "Daily log updated successfully",
        log: { ...existingLog[0], ...body }
      });
    } else {
      // Create new log
      const newLog = {
        id: randomUUID(),
        userId: actualUserId,
        logDate,
        masturbationCount,
        sleepQuality,
        sleepHours,
        dietQuality,
        stressLevel,
        exerciseMinutes,
        electrolytes,
        notes,
        createdAt: now,
        updatedAt: now
      };

      await db.insert(lifestyleLogs).values(newLog);

      return NextResponse.json({
        message: "Daily log created successfully",
        log: newLog
      });
    }
  } catch (error) {
    console.error("Error creating/updating daily log:", error);
    return NextResponse.json(
      { error: "Failed to save daily log" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a daily log
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getOrCreateUser(userId);
    if (!dbUser) {
      return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
    }

    const actualUserId = dbUser.id;

    const { searchParams } = new URL(request.url);
    const logId = searchParams.get('id');

    if (!logId) {
      return NextResponse.json(
        { error: "Log ID is required" },
        { status: 400 }
      );
    }

    // Delete the log (only if it belongs to the user)
    await db
      .delete(lifestyleLogs)
      .where(and(
        eq(lifestyleLogs.id, logId),
        eq(lifestyleLogs.userId, actualUserId)
      ));

    return NextResponse.json({ message: "Daily log deleted successfully" });
  } catch (error) {
    console.error("Error deleting daily log:", error);
    return NextResponse.json(
      { error: "Failed to delete daily log" },
      { status: 500 }
    );
  }
}
