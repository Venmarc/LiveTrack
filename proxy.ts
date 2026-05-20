import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/tracking(.*)',
  '/api/webhooks/clerk(.*)',
]);

const isOnboardRoute = createRouteMatcher(['/onboard(.*)']);
const isShipperRoute = createRouteMatcher(['/dashboard/shipper(.*)']);
const isDriverRoute = createRouteMatcher(['/dashboard/driver(.*)']);
const isRecipientRoute = createRouteMatcher(['/dashboard/recipient(.*)']);
const isDashboardRoute = createRouteMatcher(['/dashboard(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const authObj = await auth();
  const { userId, sessionClaims } = authObj;

  // 1. Allow public routes to proceed
  if (isPublicRoute(req)) {
    return;
  }

  // 2. Force sign-in for all non-public routes
  if (!userId) {
    return authObj.redirectToSignIn({ returnBackUrl: req.url });
  }

  const role = sessionClaims?.role as 'shipper' | 'driver' | 'recipient' | 'admin' | undefined;

  // 3. Force onboarding if the authenticated user does not have a role claim
  if (!role) {
    if (!isOnboardRoute(req)) {
      return Response.redirect(new URL('/onboard', req.url));
    }
    return;
  }

  // 4. Redirect away from onboarding page to dashboard if user already has a role
  if (isOnboardRoute(req)) {
    return Response.redirect(new URL(`/dashboard/${role}`, req.url));
  }

  // 5. Enforce role-based boundaries on dashboard modules
  if (isDashboardRoute(req)) {
    if (role === 'shipper' && !isShipperRoute(req)) {
      return Response.redirect(new URL('/dashboard/shipper', req.url));
    }
    if (role === 'driver' && !isDriverRoute(req)) {
      return Response.redirect(new URL('/dashboard/driver', req.url));
    }
    if (role === 'recipient' && !isRecipientRoute(req)) {
      return Response.redirect(new URL('/dashboard/recipient', req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.[\\w]+$|_next/image|_next/static|favicon.ico|sitemap.xml|robots.txt).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
