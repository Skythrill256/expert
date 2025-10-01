"use client"

import { useUser, useClerk } from '@clerk/nextjs';

/**
 * Client-side hook to get the current user
 * Returns user data, loading state, and authentication status
 */
export function useSession() {
  const { user, isLoaded } = useUser();

  return {
    data: user ? { user: { 
      id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
      email: user.emailAddresses[0]?.emailAddress || '',
      image: user.imageUrl || null,
    }} : null,
    isPending: !isLoaded,
    isLoaded,
    error: null,
  };
}

/**
 * Get Clerk client utilities
 * Use this to access signOut, redirectToSignIn, etc.
 */
export function useAuth() {
  const clerk = useClerk();
  const { user, isLoaded, isSignedIn } = useUser();
  
  return {
    user,
    isLoaded,
    isSignedIn,
    signOut: () => clerk.signOut(),
    clerk,
  };
}