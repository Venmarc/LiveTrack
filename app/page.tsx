import { Package, Truck, Map, ShieldCheck, ShieldAlert } from 'lucide-react';
import { TrackingSearch } from '@/components/tracking-search';
import LandingHeader from '@/components/landing-header';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      
      {/* Navigation Header */}
      <LandingHeader />

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
          <TrackingSearch />
          <span className="block text-xs text-zinc-400">
            * Tracking can be viewed publicly without requiring an authenticated account.
          </span>
        </div>

        {/* Core Features Grid */}
        <div className="grid gap-6 md:grid-cols-3 text-left pt-8">
          
          <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800/80 transition duration-300">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/10 w-fit mb-4">
              <Package className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-white font-outfit mb-2">1. Dispatch Shipments</h2>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              As a <strong className="font-semibold text-blue-400">Shipper</strong>, define package weight, carrier drivers, destination waypoints, and dispatch packages up to the demo safety limits.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800/80 transition duration-300">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 w-fit mb-4">
              <Truck className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-white font-outfit mb-2">2. Stream GPS Telemetry</h2>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              As a <strong className="font-semibold text-emerald-400">Driver</strong>, run simulated delivery runs. The engine generates continuous velocity, orientation, and latitude/longitude updates.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-900 hover:border-zinc-800/80 transition duration-300">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 w-fit mb-4">
              <Map className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-white font-outfit mb-2">3. Live Mapping</h2>
            <p className="text-sm text-zinc-400 leading-relaxed font-sans">
              As a <strong className="font-semibold text-indigo-400">Recipient</strong>, track vehicle markers moving in real-time across leaflet maps with milestone timeline notifications.
            </p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900/60 bg-zinc-950/40 py-8 text-center text-xs text-zinc-400 space-y-2">
        <p>© 2026 LiveTrack logistics simulator. For demonstration and portfolio purposes only.</p>
        <div className="flex justify-center gap-4 text-xs">
          <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-blue-500" /> Supabase RLS Active</span>
          <span className="flex items-center gap-1"><ShieldAlert className="h-3.5 w-3.5 text-emerald-500" /> Simulation Sandbox Mode</span>
        </div>
      </footer>

    </div>
  );
}
