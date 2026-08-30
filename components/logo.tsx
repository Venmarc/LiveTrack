import { Truck } from 'lucide-react';

type Accent = 'blue' | 'emerald' | 'indigo' | 'zinc';

export default function Logo({ accent = 'blue' }: { accent?: Accent }) {
  void accent;

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-page)]">
        <Truck className="h-4 w-4" aria-hidden="true" />
      </div>
      <span className="font-outfit text-lg font-bold tracking-tight text-[var(--color-text)]">LiveTrack</span>
    </div>
  );
}
