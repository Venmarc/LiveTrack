import { Truck } from 'lucide-react';

type Accent = 'blue' | 'emerald' | 'indigo' | 'zinc';

const accentStyles: Record<Accent, string> = {
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  zinc: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20',
};

export default function Logo({ accent = 'blue' }: { accent?: Accent }) {
  return (
    <div className={`flex items-center gap-2.5`}>
      <div className={`p-2 rounded-xl border font-bold ${accentStyles[accent]}`}>
        <Truck className="h-4 w-4" />
      </div>
      <span className="text-lg font-bold font-outfit text-white tracking-tight">LiveTrack</span>
    </div>
  );
}