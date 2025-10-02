import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendWelcomeEmail } from '@/lib/email/notifications';

/**
 * Get the current authenticated user from Clerk
 * Use this in Server Components, Route Handlers, and Server Actions
 */
export async function getCurrentUser() {
  const clerkUser = await currentUser();
  return clerkUser;
}

/**
 * Get or create user in database
 * Syncs Clerk user with local database
 */
export async function getOrCreateUser(clerkUserId: string) {
  try {
    // Check if user exists in database first (no Clerk API call needed)
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.id, clerkUserId))
      .limit(1);

    if (existingUser.length > 0) {
      return existingUser[0];
    }

    // Only call Clerk API if user doesn't exist in DB
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return null;
    }

    const userEmail = clerkUser.emailAddresses[0]?.emailAddress || '';

    // Check if a user with this email already exists (might have different Clerk ID)
    const existingEmailUser = await db
      .select()
      .from(user)
      .where(eq(user.email, userEmail))
      .limit(1);

    if (existingEmailUser.length > 0) {
      // User exists with this email but different ID
      // Just return the existing user - this handles the case where the email is already in use
      console.log(`User with email ${userEmail} already exists with ID ${existingEmailUser[0].id}, returning existing user`);
      return existingEmailUser[0];
    }

    // Create new user in database
    const newUser = {
      id: clerkUserId,
      name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
      email: userEmail,
      emailVerified: clerkUser.emailAddresses[0]?.verification?.status === 'verified',
      image: clerkUser.imageUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(user).values(newUser);

    // Send welcome email asynchronously (don't block user creation)
    sendWelcomeEmail(clerkUserId).catch(err => 
      console.error('Failed to send welcome email:', err)
    );

    return newUser;
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    
    // Try to return user by ID if it exists (might have been created by another request)
    try {
      const fallbackUser = await db
        .select()
        .from(user)
        .where(eq(user.id, clerkUserId))
        .limit(1);
      
      if (fallbackUser.length > 0) {
        return fallbackUser[0];
      }
      
      // Also try to find by email if ID lookup fails
      const clerkUser = await currentUser();
      if (clerkUser) {
        const userEmail = clerkUser.emailAddresses[0]?.emailAddress || '';
        const emailUser = await db
          .select()
          .from(user)
          .where(eq(user.email, userEmail))
          .limit(1);
        
        if (emailUser.length > 0) {
          return emailUser[0];
        }
      }
    } catch (fallbackError) {
      console.error('Fallback user fetch failed:', fallbackError);
    }
    
    // Return null instead of throwing to prevent 500 errors
    return null;
  }
}

/**
 * Get the authenticated user's ID
 * Returns null if not authenticated
 */
export async function getUserId() {
  const { userId } = await auth();
  return userId;
}
