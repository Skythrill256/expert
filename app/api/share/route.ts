import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { shareLinks } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/auth";
import { eq, desc, and } from "drizzle-orm";
import crypto from "crypto";

// Create a new share link
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await getOrCreateUser(userId);

    const body = await request.json();
    const { expiresInDays } = body;

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('base64url');
    const linkId = crypto.randomUUID();
    
    // Calculate expiry date if provided
    let expiresAt = null;
    if (expiresInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    }

    await db.insert(shareLinks).values({
      id: linkId,
      userId: userId,
      token,
      expiresAt,
      revoked: false,
      accessCount: 0,
      createdAt: new Date(),
      lastAccessedAt: null,
    });

    // Generate shareable URL
    const shareUrl = `${request.nextUrl.origin}/shared/${token}`;

    return NextResponse.json({ 
      success: true, 
      linkId,
      token,
      shareUrl,
      expiresAt 
    });
  } catch (error) {
    console.error("Error creating share link:", error);
    return NextResponse.json({ error: "Failed to create share link" }, { status: 500 });
  }
}

// Get all share links for user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await getOrCreateUser(userId);

    const links = await db
      .select()
      .from(shareLinks)
      .where(eq(shareLinks.userId, userId))
      .orderBy(desc(shareLinks.createdAt));

    return NextResponse.json({ links });
  } catch (error) {
    console.error("Error fetching share links:", error);
    return NextResponse.json({ error: "Failed to fetch share links" }, { status: 500 });
  }
}

// Revoke a share link
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await getOrCreateUser(userId);

    const body = await request.json();
    const { linkId } = body;

    if (!linkId) {
      return NextResponse.json({ error: "linkId is required" }, { status: 400 });
    }

    // Update the link to revoke it
    await db
      .update(shareLinks)
      .set({ revoked: true })
      .where(and(
        eq(shareLinks.id, linkId),
        eq(shareLinks.userId, userId)
      ));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error revoking share link:", error);
    return NextResponse.json({ error: "Failed to revoke share link" }, { status: 500 });
  }
}
