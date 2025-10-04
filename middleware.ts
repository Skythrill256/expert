import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/api/share/view(.*)',  // Public endpoint for viewing shared data
  '/shared(.*)',          // Public shared view pages
  '/login(.*)',
  '/register(.*)',
  '/sign-in(.*)',
]);

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/recommendations(.*)',
  '/settings(.*)',
  '/upload(.*)',
  '/profile(.*)',
  '/onboarding(.*)',
  '/api/dashboard(.*)',
  '/api/recommendations(.*)',
  '/api/reports(.*)',
  '/api/user(.*)',
  '/api/share(.*)',       // Protected: creating/managing share links
  '/api/export(.*)',
  '/api/lifestyle(.*)',
  '/api/onboarding(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow public routes without authentication
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protect routes that require authentication
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};