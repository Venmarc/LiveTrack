'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  MapPin, 
  Package, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  Clock, 
  Activity,
  CheckCircle2,
  Truck,
  AlertCircle
} from 'lucide-react';

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
  base_location: {
    lat: number;
    lng: number;
    city?: string;
    address: string;
  } | null;
}

interface Shipment {
  id: string;
  tracking_number: string;
  shipper_id: string;
  driver_id: string | null;
  recipient_name: string;
  recipient_email: string;
  recipient_phone: string | null;
  origin: {
    lat: number;
    lng: number;
    city?: string;
    address: string;
  };
  destination: {
    lat: number;
    lng: number;
    city?: string;
    address: string;
  };
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'delayed' | 'cancelled';
  estimated_delivery: string | null;
  actual_delivery: string | null;
  created_at: string;
  updated_at: string;
  driver?: Profile | null;
}

interface ShipmentEvent {
  id: string;
  shipment_id: string;
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'delayed' | 'cancelled';
  message: string | null;
  created_at: string;
  created_by: string | null;
}

interface Props {
  shipment: Shipment;
  events: ShipmentEvent[];
}

type FilterType = 'all' | 'milestones' | 'transit' | 'alerts';

export default function ShipmentDetailsClient({ shipment, events }: Props) {
  const [filter, setFilter] = useState<FilterType>('all');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">Pending</span>;
      case 'assigned':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-950/40 text-blue-400 border border-blue-500/20">Assigned</span>;
      case 'picked_up':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-cyan-950/40 text-cyan-400 border border-cyan-500/20">Picked Up</span>;
      case 'in_transit':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-950/40 text-emerald-450 border border-emerald-500/20">In Transit</span>;
      case 'delivered':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-950/40 text-green-450 border border-green-500/20">Delivered</span>;
      case 'delayed':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-950/40 text-amber-450 border border-amber-500/20">Delayed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-950/40 text-rose-455 border border-rose-500/20">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-zinc-850 text-zinc-400 border border-zinc-800">{status}</span>;
    }
  };

  // Filter logic
  const filteredEvents = events.filter((evt) => {
    if (filter === 'all') return true;
    if (filter === 'milestones') {
      return ['pending', 'assigned', 'delivered', 'cancelled'].includes(evt.status);
    }
    if (filter === 'transit') {
      return ['picked_up', 'in_transit'].includes(evt.status);
    }
    if (filter === 'alerts') {
      return ['delayed'].includes(evt.status);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard/shipper" 
            className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-outfit text-white leading-none">Shipment Status</h1>
              {getStatusBadge(shipment.status)}
            </div>
            <p className="text-xs text-zinc-500 mt-1.5">Tracking Number: {shipment.tracking_number}</p>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid gap-8 lg:grid-cols-3">
        
        {/* Left Column: Shipment Details & Locations */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Card: Recipient Details */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-6">
            <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <Package className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-bold font-outfit text-white">Package & Recipient Details</h2>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-zinc-800/50 text-zinc-400">
                  <User className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Recipient Name</p>
                  <p className="text-sm font-semibold text-zinc-200">{shipment.recipient_name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-zinc-800/50 text-zinc-400">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Recipient Email</p>
                  <p className="text-sm font-semibold text-zinc-200">{shipment.recipient_email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-zinc-800/50 text-zinc-400">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Recipient Phone</p>
                  <p className="text-sm font-semibold text-zinc-200">{shipment.recipient_phone || 'Not provided'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-zinc-800/50 text-zinc-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Estimated Delivery</p>
                  <p className="text-sm font-semibold text-zinc-200">
                    {shipment.estimated_delivery 
                      ? new Date(shipment.estimated_delivery).toLocaleDateString(undefined, { dateStyle: 'long' }) 
                      : 'Not estimated'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Route Origins / Destinations */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-6">
            <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <MapPin className="h-5 w-5 text-emerald-500" />
              <h2 className="text-lg font-bold font-outfit text-white">Route Details</h2>
            </div>
            
            <div className="relative border-l border-dashed border-zinc-800 ml-6 pl-8 space-y-8 py-2">
              
              {/* Origin dot */}
              <div className="relative">
                <div className="absolute -left-[41px] top-1 h-5 w-5 rounded-full bg-zinc-950 border-2 border-emerald-500 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">Origin</span>
                    {shipment.origin.city && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-zinc-800 text-zinc-300">
                        {shipment.origin.city}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-white">{shipment.origin.address}</p>
                  <p className="text-xs text-zinc-500 font-mono">Coordinates: [{shipment.origin.lat.toFixed(4)}, {shipment.origin.lng.toFixed(4)}]</p>
                </div>
              </div>

              {/* Destination dot */}
              <div className="relative">
                <div className="absolute -left-[41px] top-1 h-5 w-5 rounded-full bg-zinc-950 border-2 border-indigo-500 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-indigo-500" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Destination</span>
                    {shipment.destination.city && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-zinc-800 text-zinc-300">
                        {shipment.destination.city}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-white">{shipment.destination.address}</p>
                  <p className="text-xs text-zinc-500 font-mono">Coordinates: [{shipment.destination.lat.toFixed(4)}, {shipment.destination.lng.toFixed(4)}]</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Driver Details & Timeline Events */}
        <div className="space-y-8">
          
          {/* Card: Courier Info */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-6">
            <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
              <User className="h-5 w-5 text-indigo-500" />
              <h2 className="text-lg font-bold font-outfit text-white">Assigned Courier</h2>
            </div>

            {shipment.driver ? (
              <div className="flex items-center gap-4">
                {shipment.driver.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={shipment.driver.avatar_url}
                    alt={shipment.driver.full_name || 'Courier'}
                    className="h-14 w-14 rounded-2xl bg-zinc-800 border border-zinc-800 p-1"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-2xl bg-zinc-800 border border-zinc-850 flex items-center justify-center text-zinc-500">
                    <User className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-white">{shipment.driver.full_name}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Status: Active</p>
                  {shipment.driver.base_location && (
                    <p className="text-[10px] text-zinc-500 mt-1">Base: {shipment.driver.base_location.city || shipment.driver.base_location.address}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-800 p-4 text-center">
                <p className="text-sm text-zinc-500 italic">No courier assigned yet.</p>
                <p className="text-xs text-zinc-650 mt-1">Drivers can claim this job from their portal.</p>
              </div>
            )}
          </div>

          {/* Card: Status Events Timeline */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-zinc-400" />
                <h2 className="text-lg font-bold font-outfit text-white">Status Timeline</h2>
              </div>
            </div>

            {/* Filter Buttons Section */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Filter History</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all duration-200 cursor-pointer ${
                    filter === 'all'
                      ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/10'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-300'
                  }`}
                >
                  <Activity className="h-3 w-3" />
                  All
                </button>
                <button
                  onClick={() => setFilter('milestones')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all duration-200 cursor-pointer ${
                    filter === 'milestones'
                      ? 'bg-emerald-650 border-emerald-600 text-white shadow-md shadow-emerald-650/10'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-300'
                  }`}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  Milestones
                </button>
                <button
                  onClick={() => setFilter('transit')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all duration-200 cursor-pointer ${
                    filter === 'transit'
                      ? 'bg-cyan-650 border-cyan-600 text-white shadow-md shadow-cyan-650/10'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-300'
                  }`}
                >
                  <Truck className="h-3 w-3" />
                  Transit
                </button>
                <button
                  onClick={() => setFilter('alerts')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all duration-200 cursor-pointer ${
                    filter === 'alerts'
                      ? 'bg-amber-600 border-amber-500 text-white shadow-md shadow-amber-650/10'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-300'
                  }`}
                >
                  <AlertCircle className="h-3 w-3" />
                  Alerts
                </button>
              </div>
            </div>

            {/* Timeline Events list */}
            {filteredEvents.length > 0 ? (
              <div className="relative border-l border-zinc-800 ml-4 pl-6 space-y-6 py-1">
                {filteredEvents.map((evt) => (
                  <div key={evt.id} className="relative group">
                    {/* Bullet marker */}
                    <div className="absolute -left-[30px] top-1.5 h-3 w-3 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                      <div className={`h-1 w-1 rounded-full ${
                        evt.status === 'delayed' ? 'bg-amber-550' :
                        evt.status === 'cancelled' ? 'bg-rose-500' :
                        evt.status === 'delivered' ? 'bg-green-500' :
                        evt.status === 'in_transit' ? 'bg-emerald-500' :
                        'bg-zinc-400'
                      }`} />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          evt.status === 'delayed' ? 'text-amber-450' :
                          evt.status === 'cancelled' ? 'text-rose-455' :
                          evt.status === 'delivered' ? 'text-green-455' :
                          evt.status === 'in_transit' ? 'text-emerald-450' :
                          'text-zinc-400'
                        }`}>
                          {evt.status}
                        </span>
                        <span className="text-[10px] text-zinc-550">
                          {new Date(evt.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {evt.message && (
                        <p className="text-sm text-zinc-300">{evt.message}</p>
                      )}
                      <p className="text-[10px] text-zinc-550">
                        {new Date(evt.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 border border-dashed border-zinc-800 rounded-xl">
                <p className="text-xs text-zinc-500 italic">No events found matching this filter.</p>
              </div>
            )}

          </div>

        </div>

      </main>
    </div>
  );
}
