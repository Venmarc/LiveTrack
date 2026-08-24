import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Define Custom JWT Claims type safety
declare global {
  interface CustomJwtSessionClaims {
    metadata?: {
      role?: 'shipper' | 'driver' | 'recipient' | 'admin';
    };
    role?: 'shipper' | 'driver' | 'recipient' | 'admin';
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

    // 1. Try to read the role from the session claims first (fastest)
    // Check both standard location (sessionClaims?.metadata?.role) and root fallback (sessionClaims?.role)
    let role = sessionClaims?.metadata?.role || sessionClaims?.role;

    // 2. If it's missing from session claims, query the profiles table in Supabase directly
    if (!role && supabaseUrl && supabaseServiceKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        });
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        if (!error && data?.role) {
          role = data.role as 'shipper' | 'driver' | 'recipient' | 'admin';
        }
      } catch (err) {
        console.error('Middleware database role fetch error:', err);
      }
    }

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
    // Only run auth on protected routes and APIs so public pages skip the
    // Clerk handshake redirect and stay fast.
    '/dashboard/:path*',
    '/onboard/:path*',
    '/(api|trpc)(.*)',
  ],
};
