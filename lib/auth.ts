import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

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
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    return null;
  }

  // Check if user exists in database
  const existingUser = await db
    .select()
    .from(user)
    .where(eq(user.id, clerkUserId))
    .limit(1);

  if (existingUser.length > 0) {
    return existingUser[0];
  }

  // Create new user in database
  const newUser = {
    id: clerkUserId,
    name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
    email: clerkUser.emailAddresses[0]?.emailAddress || '',
    emailVerified: clerkUser.emailAddresses[0]?.verification?.status === 'verified',
    image: clerkUser.imageUrl || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(user).values(newUser);

  return newUser;
}

/**
 * Get the authenticated user's ID
 * Returns null if not authenticated
 */
export async function getUserId() {
  const { userId } = await auth();
  return userId;
}
