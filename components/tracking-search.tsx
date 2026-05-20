'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export function TrackingSearch() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    router.push(`/tracking/${trackingNumber.trim()}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex max-w-lg gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="e.g. LTK-A1B2C3D4E"
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-indigo-500 transition text-sm text-zinc-100 placeholder-zinc-600"
        />
      </div>
      <button 
        type="submit"
        className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-indigo-600/20 whitespace-nowrap cursor-pointer"
      >
        Track package
      </button>
    </form>
  );
}
