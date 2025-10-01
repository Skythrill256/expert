import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateUser } from '@/lib/auth';

export async function PATCH(request: NextRequest) {
  try {
    // Authentication validation
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ 
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED' 
      }, { status: 401 });
    }

    await getOrCreateUser(userId);

    // Parse request body
    const body = await request.json();
    const { name, email, image } = body;

    // Validate that no system-managed fields are being updated
    if ('id' in body || 'emailVerified' in body || 'createdAt' in body) {
      return NextResponse.json({ 
        error: 'Cannot update system-managed fields',
        code: 'SYSTEM_FIELDS_NOT_ALLOWED' 
      }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    };

    // Validate and process name
    if (name !== undefined) {
      if (typeof name !== 'string') {
        return NextResponse.json({ 
          error: 'Name must be a string',
          code: 'INVALID_NAME_TYPE' 
        }, { status: 400 });
      }
      
      const trimmedName = name.trim();
      if (trimmedName === '') {
        return NextResponse.json({ 
          error: 'Name cannot be empty',
          code: 'EMPTY_NAME' 
        }, { status: 400 });
      }
      
      updateData.name = trimmedName;
    }

    // Validate and process email
    if (email !== undefined) {
      if (typeof email !== 'string') {
        return NextResponse.json({ 
          error: 'Email must be a string',
          code: 'INVALID_EMAIL_TYPE' 
        }, { status: 400 });
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const normalizedEmail = email.toLowerCase().trim();
      
      if (!emailRegex.test(normalizedEmail)) {
        return NextResponse.json({ 
          error: 'Invalid email format',
          code: 'INVALID_EMAIL_FORMAT' 
        }, { status: 400 });
      }
      
      updateData.email = normalizedEmail;
    }

    // Process image
    if (image !== undefined) {
      if (image !== null && typeof image !== 'string') {
        return NextResponse.json({ 
          error: 'Image must be a string or null',
          code: 'INVALID_IMAGE_TYPE' 
        }, { status: 400 });
      }
      
      updateData.image = image;
    }

    // Check if there are any fields to update
    if (Object.keys(updateData).length === 1) { // Only updatedAt
      return NextResponse.json({ 
        error: 'No valid fields provided for update',
        code: 'NO_UPDATE_FIELDS' 
      }, { status: 400 });
    }

    // Update user profile
    const updatedUser = await db.update(user)
      .set(updateData)
      .where(eq(user.id, userId))
      .returning();

    if (updatedUser.length === 0) {
      return NextResponse.json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND' 
      }, { status: 404 });
    }

    // Return updated profile (exclude sensitive fields)
    const { emailVerified, ...profileData } = updatedUser[0];
    
    return NextResponse.json(profileData, { status: 200 });

  } catch (error: any) {
    console.error('PATCH /api/user/profile error:', error);
    
    // Handle unique constraint violation for email
    if (error.message && error.message.includes('UNIQUE constraint failed: user.email')) {
      return NextResponse.json({ 
        error: 'Email address is already in use',
        code: 'EMAIL_ALREADY_EXISTS' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}