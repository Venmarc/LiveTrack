import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define Custom JWT Claims type safety
declare global {
  interface CustomJwtSessionClaims {
    metadata?: {
      role?: 'shipper' | 'driver' | 'recipient' | 'admin';
    };
  }
}

const isDashboardRoute = createRouteMatcher(['/dashboard(.*)']);
const isOnboardRoute = createRouteMatcher(['/onboard(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // If trying to access dashboard or onboard, user must be signed in
  if (isDashboardRoute(req) || isOnboardRoute(req)) {
    if (!userId) {
      return (await auth()).redirectToSignIn();
    }

    const role = sessionClaims?.metadata?.role;

    // If user is authenticated but has no role, force them to onboard
    if (!role && !isOnboardRoute(req)) {
      return NextResponse.redirect(new URL('/onboard', req.url));
    }

    // If user has a role but tries to go to onboard, send them to dashboard
    if (role && isOnboardRoute(req)) {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
    }

    // Protect specific dashboard paths based on role
    if (role) {
      const path = req.nextUrl.pathname;
      if (path.startsWith('/dashboard/') && !path.startsWith(`/dashboard/${role}`)) {
        return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Protect dashboard and onboard routes, skip Next.js internals
    '/((?!_next|[^?]*\\.(?:html|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
