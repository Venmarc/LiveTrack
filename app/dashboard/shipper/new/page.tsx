'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, PlusCircle, Loader2, MapPin, Package, Calendar } from 'lucide-react';
import { createShipmentAction } from '@/server/actions/shipment-actions';

const PRESET_HUBS = [
  { address: 'London Port Logistics', city: 'London', lat: 51.5074, lng: -0.1278 },
  { address: 'Birmingham Distribution Hub', city: 'Birmingham', lat: 52.4862, lng: -1.8904 },
  { address: 'Manchester Cargo Center', city: 'Manchester', lat: 53.4808, lng: -2.2426 },
  { address: 'Bristol Freight Depot', city: 'Bristol', lat: 51.4545, lng: -2.5879 },
  { address: 'Southampton Container Port', city: 'Southampton', lat: 50.9097, lng: -1.4044 },
  { address: 'Liverpool Cargo Terminal', city: 'Liverpool', lat: 53.4084, lng: -2.9916 }
];

export default function BookShipmentPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form states
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  // Location selections
  const [originType, setOriginType] = useState<'preset' | 'custom'>('preset');
  const [originPresetIdx, setOriginPresetIdx] = useState('0');
  const [originCustom, setOriginCustom] = useState({ address: '', city: '', lat: '', lng: '' });

  const [destType, setDestType] = useState<'preset' | 'custom'>('preset');
  const [destPresetIdx, setDestPresetIdx] = useState('1');
  const [destCustom, setDestCustom] = useState({ address: '', city: '', lat: '', lng: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Build origin
    let origin;
    if (originType === 'preset') {
      const hub = PRESET_HUBS[parseInt(originPresetIdx)];
      origin = { ...hub };
    } else {
      const latVal = parseFloat(originCustom.lat);
      const lngVal = parseFloat(originCustom.lng);
      if (!originCustom.address.trim() || isNaN(latVal) || isNaN(lngVal)) {
        toast.error('Please enter a valid custom origin address and coordinates.');
        return;
      }
      origin = {
        address: originCustom.address,
        city: originCustom.city || undefined,
        lat: latVal,
        lng: lngVal
      };
    }

    // Build destination
    let destination;
    if (destType === 'preset') {
      const hub = PRESET_HUBS[parseInt(destPresetIdx)];
      destination = { ...hub };
    } else {
      const latVal = parseFloat(destCustom.lat);
      const lngVal = parseFloat(destCustom.lng);
      if (!destCustom.address.trim() || isNaN(latVal) || isNaN(lngVal)) {
        toast.error('Please enter a valid custom destination address and coordinates.');
        return;
      }
      destination = {
        address: destCustom.address,
        city: destCustom.city || undefined,
        lat: latVal,
        lng: lngVal
      };
    }

    // Check that origin and destination are not identical presets
    if (originType === 'preset' && destType === 'preset' && originPresetIdx === destPresetIdx) {
      toast.error('Origin and Destination presets cannot be the same hub.');
      return;
    }

    const payload = {
      recipient_name: recipientName,
      recipient_email: recipientEmail,
      recipient_phone: recipientPhone || undefined,
      origin,
      destination,
      estimated_delivery: estimatedDelivery || undefined
    };

    startTransition(async () => {
      const result = await createShipmentAction(payload);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Shipment registered successfully! Tracking Number: ${result.trackingNumber}`);
        router.push('/dashboard/shipper');
      }
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/shipper" className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold font-outfit text-white leading-none">Book Shipment</h1>
            <p className="text-xs text-zinc-500 mt-1">Register new package delivery details</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section: Recipient Details */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-6">
            <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <Package className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-bold font-outfit text-white">Recipient Details</h2>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Recipient Name</label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-blue-500 transition text-sm text-zinc-100 placeholder-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Recipient Email</label>
                <input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="e.g. john.doe@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-blue-500 transition text-sm text-zinc-100 placeholder-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Recipient Phone (Optional)</label>
                <input
                  type="tel"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="e.g. +44 7700 900077"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-blue-500 transition text-sm text-zinc-100 placeholder-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Estimated Delivery (Optional)</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500 pointer-events-none" />
                  <input
                    type="date"
                    value={estimatedDelivery}
                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-blue-500 transition text-sm text-zinc-100 placeholder-zinc-700 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Origin Address & Coordinates */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-500" />
                <h2 className="text-lg font-bold font-outfit text-white">Origin Location</h2>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOriginType('preset')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md border transition ${
                    originType === 'preset'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : 'bg-zinc-900 text-zinc-500 border-zinc-850 hover:text-zinc-300'
                  }`}
                >
                  Presets
                </button>
                <button
                  type="button"
                  onClick={() => setOriginType('custom')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md border transition ${
                    originType === 'custom'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : 'bg-zinc-900 text-zinc-500 border-zinc-850 hover:text-zinc-300'
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            {originType === 'preset' ? (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Select UK Logistics Hub</label>
                <select
                  value={originPresetIdx}
                  onChange={(e) => setOriginPresetIdx(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-blue-500 transition text-sm text-zinc-100 cursor-pointer"
                >
                  {PRESET_HUBS.map((hub, idx) => (
                    <option key={idx} value={idx}>
                      {hub.address} ({hub.city}) — Coordinates: [{hub.lat}, {hub.lng}]
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Address / Facility Name</label>
                  <input
                    type="text"
                    required={originType === 'custom'}
                    value={originCustom.address}
                    onChange={(e) => setOriginCustom({ ...originCustom, address: e.target.value })}
                    placeholder="e.g. West London Air Cargo"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-blue-500 transition text-sm text-zinc-100 placeholder-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">City</label>
                  <input
                    type="text"
                    value={originCustom.city}
                    onChange={(e) => setOriginCustom({ ...originCustom, city: e.target.value })}
                    placeholder="e.g. London"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-blue-500 transition text-sm text-zinc-100 placeholder-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    required={originType === 'custom'}
                    value={originCustom.lat}
                    onChange={(e) => setOriginCustom({ ...originCustom, lat: e.target.value })}
                    placeholder="e.g. 51.5074"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-blue-500 transition text-sm text-zinc-100 placeholder-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    required={originType === 'custom'}
                    value={originCustom.lng}
                    onChange={(e) => setOriginCustom({ ...originCustom, lng: e.target.value })}
                    placeholder="e.g. -0.1278"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-blue-500 transition text-sm text-zinc-100 placeholder-zinc-700"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section: Destination Address & Coordinates */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-indigo-500" />
                <h2 className="text-lg font-bold font-outfit text-white">Destination Location</h2>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDestType('preset')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md border transition ${
                    destType === 'preset'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : 'bg-zinc-900 text-zinc-500 border-zinc-850 hover:text-zinc-300'
                  }`}
                >
                  Presets
                </button>
                <button
                  type="button"
                  onClick={() => setDestType('custom')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md border transition ${
                    destType === 'custom'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : 'bg-zinc-900 text-zinc-500 border-zinc-850 hover:text-zinc-300'
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            {destType === 'preset' ? (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Select UK Logistics Hub</label>
                <select
                  value={destPresetIdx}
                  onChange={(e) => setDestPresetIdx(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-blue-500 transition text-sm text-zinc-100 cursor-pointer"
                >
                  {PRESET_HUBS.map((hub, idx) => (
                    <option key={idx} value={idx}>
                      {hub.address} ({hub.city}) — Coordinates: [{hub.lat}, {hub.lng}]
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Address / Facility Name</label>
                  <input
                    type="text"
                    required={destType === 'custom'}
                    value={destCustom.address}
                    onChange={(e) => setDestCustom({ ...destCustom, address: e.target.value })}
                    placeholder="e.g. Manchester Airport Freight"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-blue-500 transition text-sm text-zinc-100 placeholder-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">City</label>
                  <input
                    type="text"
                    value={destCustom.city}
                    onChange={(e) => setDestCustom({ ...destCustom, city: e.target.value })}
                    placeholder="e.g. Manchester"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-blue-500 transition text-sm text-zinc-100 placeholder-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    required={destType === 'custom'}
                    value={destCustom.lat}
                    onChange={(e) => setDestCustom({ ...destCustom, lat: e.target.value })}
                    placeholder="e.g. 53.4808"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-blue-500 transition text-sm text-zinc-100 placeholder-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    required={destType === 'custom'}
                    value={destCustom.lng}
                    onChange={(e) => setDestCustom({ ...destCustom, lng: e.target.value })}
                    placeholder="e.g. -2.2426"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-blue-500 transition text-sm text-zinc-100 placeholder-zinc-700"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Form Submit Row */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-zinc-900">
            <Link
              href="/dashboard/shipper"
              className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 font-semibold text-sm transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm transition hover:shadow-lg hover:shadow-blue-600/20 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Shipment...
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4" />
                  Book Shipment
                </>
              )}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}
