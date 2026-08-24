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
      className={`inline-flex items-center gap-1.5 font-mono text-zinc-100 hover:text-blue-400 bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/60 hover:border-blue-500/30 px-2 py-0.5 rounded-md transition-all duration-200 cursor-pointer active:scale-95 group select-all ${className}`}
      title="Click to copy tracking number"
    >
      <span>{value}</span>
      <span className="relative flex items-center justify-center w-3.5 h-3.5 text-zinc-500 group-hover:text-blue-400 transition-colors">
        {copied ? (
          <Check className="h-3 w-3 text-emerald-400 scale-100 transition-transform duration-200" />
        ) : (
          <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-200" />
        )}
      </span>
      {copied && (
        <span className="text-[10px] text-emerald-400 font-sans font-medium animate-in fade-in slide-in-from-left-1 duration-200 shrink-0">
          Copied!
        </span>
      )}
    </button>
  );
}
