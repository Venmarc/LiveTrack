'use client';

import { ClerkProvider, useAuth, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { ArrowRight } from 'lucide-react';

export default function LandingHeader() {
  return (
    <ClerkProvider>
      <LandingHeaderInner />
    </ClerkProvider>
  );
}

function LandingHeaderInner() {
  const { isSignedIn } = useAuth();

  return (
    <header className="border-b border-zinc-900/60 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold tracking-tight">
          🚚 LiveTrack
        </div>
        <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
          Next.js 16 + Supabase Realtime
        </span>
      </div>

      <div className="flex items-center gap-4">
        {!isSignedIn ? (
          <>
            <SignInButton mode="modal">
              <button className="px-4 py-2 text-sm font-semibold hover:bg-zinc-900 rounded-xl transition-colors border border-zinc-800 whitespace-nowrap cursor-pointer">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors whitespace-nowrap cursor-pointer hover:shadow-lg hover:shadow-blue-600/20">
                Sign Up
              </button>
            </SignUpButton>
          </>
        ) : (
          <>
            <a
              href="/onboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors cursor-pointer"
            >
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </a>
            <UserButton />
          </>
        )}
      </div>
    </header>
  );
}