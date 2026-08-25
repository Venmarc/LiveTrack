'use client';

import Link from 'next/link';
import { Check, ChevronRight, Compass, RotateCcw, X } from 'lucide-react';
import { useState, useSyncExternalStore } from 'react';
import { getOnboardingSteps } from '@/lib/onboarding-steps.mjs';

type Role = 'shipper' | 'driver' | 'recipient' | 'admin';

interface OnboardingContext {
  shipmentCount: number;
  availableCount?: number;
  hasShipment: boolean;
  hasActiveShipment: boolean;
  hasTransitShipment?: boolean;
  hasDeliveredShipment?: boolean;
}

interface RoleOnboardingProps {
  role: Role;
  context: OnboardingContext;
  primaryHref: string;
  primaryLabel: string;
}

const copy: Record<Role, { eyebrow: string; title: string; description: string }> = {
  shipper: {
    eyebrow: 'Dispatch manifest',
    title: 'Send your first package into the network',
    description: 'Book a shipment, then watch every handoff appear in the live route.',
  },
  driver: {
    eyebrow: 'Route manifest',
    title: 'Take a delivery from dock to door',
    description: 'Claim a job, start transit, and stream the route to the recipient.',
  },
  recipient: {
    eyebrow: 'Delivery brief',
    title: 'Follow your package in real time',
    description: 'Open a shipment and see its status, driver, and live route together.',
  },
  admin: {
    eyebrow: 'Network brief',
    title: 'See the delivery network at a glance',
    description: 'Review active routes and confirm outcomes across the system.',
  },
};

export function RoleOnboarding({ role, context, primaryHref, primaryLabel }: RoleOnboardingProps) {
  const [replayRequested, setReplayRequested] = useState(false);
  const storageKey = `livetrack-onboarding-${role}`;
  const steps = getOnboardingSteps(role, context);
  const completed = steps.filter((step) => step.complete).length;
  const isComplete = completed === steps.length;
  const storedHidden = useSyncExternalStore(
    (onChange) => {
      window.addEventListener('storage', onChange);
      window.addEventListener('livetrack-onboarding-change', onChange);
      return () => {
        window.removeEventListener('storage', onChange);
        window.removeEventListener('livetrack-onboarding-change', onChange);
      };
    },
    () => window.localStorage.getItem(storageKey) === 'hidden',
    () => true,
  );

  if ((storedHidden || isComplete) && !replayRequested) {
    return (
      <button
        type="button"
        onClick={() => {
          window.localStorage.removeItem(storageKey);
          window.dispatchEvent(new Event('livetrack-onboarding-change'));
          setReplayRequested(true);
        }}
        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-400 transition hover:border-zinc-700 hover:text-white"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        {isComplete ? 'Replay guided demo' : 'Show guided demo'}
      </button>
    );
  }

  const content = copy[role];
  return (
    <section className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-blue-950/20 p-5 sm:p-6" aria-labelledby={`${role}-onboarding-title`}>
      <button
        type="button"
        aria-label="Dismiss guided demo"
        onClick={() => {
          window.localStorage.setItem(storageKey, 'hidden');
          window.dispatchEvent(new Event('livetrack-onboarding-change'));
          setReplayRequested(false);
        }}
        className="absolute right-3 top-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-900 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="max-w-2xl space-y-5">
        <div className="flex items-start gap-3 pr-10">
          <div className="mt-0.5 rounded-lg bg-blue-500/15 p-2 text-blue-300">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-300">{content.eyebrow}</p>
            <h2 id={`${role}-onboarding-title`} className="mt-1 font-outfit text-xl font-bold text-white">{content.title}</h2>
            <p className="mt-1 text-sm text-zinc-400">{content.description}</p>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.id} className="relative flex items-start gap-3 rounded-xl border border-zinc-800/80 bg-zinc-950/45 p-3">
              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${step.complete ? 'border-emerald-400 bg-emerald-400 text-zinc-950' : 'border-zinc-700 text-zinc-500'}`}>
                {step.complete ? <Check className="h-3 w-3" /> : index + 1}
              </span>
              <span className={`text-xs leading-5 ${step.complete ? 'text-zinc-300 line-through decoration-zinc-600' : 'text-white'}`}>{step.label}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-blue-500/10 pt-4">
          <span className="text-xs font-semibold text-zinc-500">{completed} of {steps.length} checkpoints complete</span>
          <Link href={primaryHref} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-500">
            {primaryLabel}
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
