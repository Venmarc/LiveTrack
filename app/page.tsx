import { auth } from '@clerk/nextjs/server';
import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { Package, Truck, Map, ArrowRight, ShieldCheck, ShieldAlert } from 'lucide-react';

export default async function Home() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      
      {/* Navigation Header */}
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

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 md:py-24 text-center max-w-5xl mx-auto space-y-12">
        
        {/* Banner Tagline */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/25">
          <span>🎯</span>
          <span>SaaS Logistics Simulation Demo Platform</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-outfit leading-tight max-w-4xl">
            Real-time Logistics & <span className="text-blue-500">Package Tracking</span> Simulator
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto font-sans leading-relaxed">
            A high-fidelity logistics simulation engine supporting instant package creation, mock GPS telemetry, and Supabase live map updates.
          </p>
        </div>

        {/* Public Tracker Input */}
        <div className="w-full max-w-lg p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 backdrop-blur-md space-y-4 text-left shadow-2xl shadow-black/50">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
            Track a Shipment
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter tracking ID (e.g. LT-12345)"
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-zinc-100 placeholder-zinc-700 font-sans"
            />
            <button className="px-5 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-sm font-semibold transition cursor-pointer">
              Track
            </button>
          </div>
          <span className="block text-[11px] text-zinc-500">
            * Tracking can be viewed publicly without requiring an authenticated account.
          </span>
        </div>

        {/* Core Features Grid */}
        <div className="grid gap-6 md:grid-cols-3 text-left pt-8">
          
          <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800/80 transition duration-350">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/10 w-fit mb-4">
              <Package className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white font-outfit mb-2">1. Dispatch Shipments</h3>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              As a **Shipper**, define package weight, carrier drivers, destination waypoints, and dispatch packages up to the demo safety limits.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800/80 transition duration-350">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 w-fit mb-4">
              <Truck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white font-outfit mb-2">2. Stream GPS Telemetry</h3>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              As a **Driver**, run simulated delivery runs. The engine generates continuous velocity, orientation, and latitude/longitude updates.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800/80 transition duration-350">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 w-fit mb-4">
              <Map className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white font-outfit mb-2">3. Live Mapping</h3>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              As a **Recipient**, track vehicle markers moving in real-time across leaflet maps with milestone timeline notifications.
            </p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900/60 bg-zinc-950/40 py-8 text-center text-xs text-zinc-500 space-y-2">
        <p>© 2026 LiveTrack logistics simulator. For demonstration and portfolio purposes only.</p>
        <div className="flex justify-center gap-4 text-[11px]">
          <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-blue-500" /> Supabase RLS Active</span>
          <span className="flex items-center gap-1"><ShieldAlert className="h-3.5 w-3.5 text-emerald-500" /> Simulation Sandbox Mode</span>
        </div>
      </footer>

    </div>
  );
}
