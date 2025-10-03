import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userSettings, user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Validate authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED' 
      }, { status: 401 });
    }

    await getOrCreateUser(userId);

    // Query existing settings
    const existingSettings = await db.select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);

    if (existingSettings.length > 0) {
      return NextResponse.json({ settings: existingSettings[0] }, { status: 200 });
    }

    // Create default settings if none exist
    const defaultSettings = await db.insert(userSettings)
      .values({
        userId,
        timezone: 'America/Los_Angeles',
        language: 'en',
        theme: 'dark',
        emailNotifications: true,
        pushNotifications: true,
        weeklyReports: true,
        recommendationsNotifications: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return NextResponse.json({ settings: defaultSettings[0] }, { status: 200 });

  } catch (error) {
    console.error('GET user settings error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR' 
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Validate authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED' 
      }, { status: 401 });
    }

    await getOrCreateUser(userId);
    const requestBody = await request.json();

    // Security check: prevent userId manipulation
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Extract and validate allowed fields
    const allowedFields = [
      'timezone', 
      'language', 
      'theme', 
      'emailNotifications', 
      'pushNotifications', 
      'weeklyReports', 
      'recommendationsNotifications'
    ];

    const updates: any = {};
    let hasValidUpdates = false;

    for (const field of allowedFields) {
      if (field in requestBody) {
        const value = requestBody[field];
        
        // Validate field types
        if (field === 'timezone' || field === 'language' || field === 'theme') {
          if (typeof value !== 'string' || value.trim() === '') {
            return NextResponse.json({ 
              error: `${field} must be a non-empty string`,
              code: 'INVALID_FIELD_TYPE' 
            }, { status: 400 });
          }
          updates[field] = value.trim();
        } else if (field.includes('Notifications') || field === 'weeklyReports') {
          if (typeof value !== 'boolean') {
            return NextResponse.json({ 
              error: `${field} must be a boolean`,
              code: 'INVALID_FIELD_TYPE' 
            }, { status: 400 });
          }
          updates[field] = value;
        }
        hasValidUpdates = true;
      }
    }

    if (!hasValidUpdates) {
      return NextResponse.json({ 
        error: 'No valid fields provided for update',
        code: 'NO_VALID_FIELDS' 
      }, { status: 400 });
    }

    // Always update timestamp
    updates.updatedAt = new Date();

    // Check if settings exist
    const existingSettings = await db.select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);

    if (existingSettings.length > 0) {
      // Update existing settings
      const updatedSettings = await db.update(userSettings)
        .set(updates)
        .where(eq(userSettings.userId, userId))
        .returning();

      return NextResponse.json({ 
        success: true,
        settings: updatedSettings[0],
        message: 'Settings updated successfully'
      }, { status: 200 });
    } else {
      // Create new settings with updates
      const newSettings = await db.insert(userSettings)
        .values({
          userId,
          timezone: updates.timezone || 'America/Los_Angeles',
          language: updates.language || 'en',
          theme: updates.theme || 'dark',
          emailNotifications: updates.emailNotifications !== undefined ? updates.emailNotifications : true,
          pushNotifications: updates.pushNotifications !== undefined ? updates.pushNotifications : true,
          weeklyReports: updates.weeklyReports !== undefined ? updates.weeklyReports : true,
          recommendationsNotifications: updates.recommendationsNotifications !== undefined ? updates.recommendationsNotifications : true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      return NextResponse.json({ 
        success: true,
        settings: newSettings[0],
        message: 'Settings created successfully'
      }, { status: 200 });
    }

  } catch (error) {
    console.error('PATCH user settings error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      code: 'INTERNAL_ERROR' 
    }, { status: 500 });
  }
}