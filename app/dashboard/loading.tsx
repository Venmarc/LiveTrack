import { Loader2 } from 'lucide-react';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <div className="border-b border-zinc-900 bg-zinc-950/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-800 animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-4 w-40 bg-zinc-800 rounded animate-pulse" />
            <div className="h-3 w-52 bg-zinc-800/60 rounded animate-pulse" />
          </div>
        </div>
      </div>
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        <div className="h-24 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 animate-pulse" />
        <div className="grid gap-6 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 animate-pulse" />
      </main>
      <div className="fixed bottom-6 right-6 p-3 rounded-full bg-zinc-900 border border-zinc-800">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
      </div>
    </div>
  );
}