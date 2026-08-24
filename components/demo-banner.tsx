import { FlaskConical } from 'lucide-react';

export default function DemoBanner() {
  return (
    <div className="w-full bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-center">
      <p className="inline-flex items-center gap-1.5 text-xs sm:text-xs font-semibold text-amber-400">
        <FlaskConical className="h-3.5 w-3.5" />
        DEMO / SIMULATION ONLY — All tracking data is simulated. Not a live logistics service.
      </p>
    </div>
  );
}