import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { recommendations } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

// Get all recommendations for user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser(userId);
    const actualUserId = user ? user.id : userId;

    const userRecommendations = await db
      .select()
      .from(recommendations)
      .where(eq(recommendations.userId, actualUserId))
      .orderBy(desc(recommendations.createdAt));

    return NextResponse.json({ recommendations: userRecommendations });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
  }
}

// Update recommendation status
export async function PATCH(request: NextRequest) {
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
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify the recommendation belongs to the user
    const existingRec = await db
      .select()
      .from(recommendations)
      .where(eq(recommendations.id, id))
      .limit(1);

    if (existingRec.length === 0) {
      return NextResponse.json({ error: "Recommendation not found" }, { status: 404 });
    }

    if (existingRec[0].userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update the recommendation
    await db
      .update(recommendations)
      .set({ 
        status,
        updatedAt: new Date().toISOString()
      })
      .where(eq(recommendations.id, id));

    return NextResponse.json({ success: true, message: "Status updated successfully" });
  } catch (error) {
    console.error("Error updating recommendation:", error);
    return NextResponse.json({ error: "Failed to update recommendation" }, { status: 500 });
  }
}
