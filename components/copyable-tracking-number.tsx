'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CopyableTrackingNumberProps {
  value: string;
  className?: string;
}

export function CopyableTrackingNumber({ value, className = '' }: CopyableTrackingNumberProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error('Failed to copy to clipboard.');
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      className={`lt-control group inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-[var(--color-text)] transition-all duration-200 select-all ${className}`}
      title="Click to copy tracking number"
    >
      <span>{value}</span>
      <span className="relative flex h-3.5 w-3.5 items-center justify-center text-[var(--color-text-subtle)] transition-colors group-hover:text-[var(--color-accent-hover)]">
        {copied ? (
          <Check className="h-3 w-3 text-[var(--color-success)] scale-100 transition-transform duration-200" />
        ) : (
          <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-200" />
        )}
      </span>
      {copied && (
        <span className="shrink-0 font-sans text-xs font-medium text-[var(--color-success)] animate-in fade-in slide-in-from-left-1 duration-200">
          Copied!
        </span>
      )}
    </button>
  );
}
