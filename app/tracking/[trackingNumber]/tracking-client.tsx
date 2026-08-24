'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { 
  Package, 
  MapPin, 
  ArrowRight, 
  User, 
  Calendar, 
  Truck, 
  Compass, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ArrowLeft,
  Navigation,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { CopyableTrackingNumber } from '@/components/copyable-tracking-number';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

const LiveMap = dynamic(() => import('@/components/map/live-map'), {
  ssr: false,
  loading: () => (
    <div className="relative h-[320px] rounded-xl border border-zinc-800 overflow-hidden bg-zinc-950/60 flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
    </div>
  ),
});

type ShipmentRow = Database['public']['Tables']['shipments']['Row'];
type ShipmentLocationRow = Database['public']['Tables']['shipment_locations']['Row'];

interface DriverDetails {
  full_name: string | null;
  avatar_url?: string | null;
}

interface ShipmentData {
  id: string;
  tracking_number: string;
  recipient_name: string;
  recipient_email: string;
  recipient_phone: string | null;
  origin: {
    address: string;
    city?: string;
    lat: number;
    lng: number;
  };
  destination: {
    address: string;
    city?: string;
    lat: number;
    lng: number;
  };
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'delayed' | 'cancelled';
  created_at: string;
  estimated_delivery: string | null;
  actual_delivery: string | null;
  driver?: DriverDetails | null;
}

interface TimelineEvent {
  id: string;
  status: string;
  message: string | null;
  created_at: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  speed_kmh: number;
  timestamp: string;
}

interface TrackingClientProps {
  shipment: ShipmentData;
  events: TimelineEvent[];
  latestLocation: LocationData | null;
}

export default function TrackingClient({
  shipment,
  events,
  latestLocation,
}: TrackingClientProps) {
  const [liveShipment, setLiveShipment] = useState(shipment);
  const [liveEvents, setLiveEvents] = useState(events);
  const [liveLocation, setLiveLocation] = useState<LocationData | null>(latestLocation);

  const refreshTimeline = useCallback(async (shipmentId: string) => {
    const { data } = await supabase
      .from('shipment_events')
      .select('id, status, message, created_at')
      .eq('shipment_id', shipmentId)
      .order('created_at', { ascending: false });
    if (data) {
      setLiveEvents(data as TimelineEvent[]);
    }
  }, []);

  // Live status updates via Supabase Realtime (cross-tab / cross-role).
  useEffect(() => {
    const channel = supabase
      .channel(`tracking-status-${liveShipment.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'shipments',
          filter: `id=eq.${liveShipment.id}`,
        },
        (payload) => {
          const row = payload.new as ShipmentRow;
          setLiveShipment((prev) => ({
            ...prev,
            status: row.status as ShipmentData['status'],
            estimated_delivery: row.estimated_delivery,
            actual_delivery: row.actual_delivery,
          }));
          refreshTimeline(liveShipment.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [liveShipment.id, refreshTimeline]);

  const handlePositionChange = useCallback(
    (position: { lat: number; lng: number }, speedKmh: number, status: string | null) => {
      setLiveLocation({
        latitude: position.lat,
        longitude: position.lng,
        speed_kmh: speedKmh,
        timestamp: new Date().toISOString(),
      });
      if (status) {
        setLiveShipment((prev) =>
          prev.status !== status ? { ...prev, status: status as ShipmentData['status'] } : prev
        );
      }
    },
    []
  );

  const mapPosition = liveLocation
    ? { lat: liveLocation.latitude, lng: liveLocation.longitude }
    : { lat: liveShipment.origin.lat, lng: liveShipment.origin.lng };
  
  // Helper to format dates
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Stepper progress index
  const statusOrder: ShipmentData['status'][] = [
    'pending',
    'assigned',
    'picked_up',
    'in_transit',
    'delivered'
  ];
  
  // Handle delayed and cancelled states by indexing them as equivalent to in_transit / delivered for stepper purposes
  const getStepIndex = (status: ShipmentData['status']) => {
    if (status === 'delayed') return 3; // in_transit equivalent
    if (status === 'cancelled') return -1;
    return statusOrder.indexOf(status);
  };

  const currentStepIdx = getStepIndex(liveShipment.status);

  // Helper to render status badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">Pending Assignment</span>;
      case 'assigned':
        return <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">Driver Assigned</span>;
      case 'picked_up':
        return <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Picked Up</span>;
      case 'in_transit':
        return <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">In Transit</span>;
      case 'delayed':
        return <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Delayed</span>;
      case 'delivered':
        return <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">Delivered</span>;
      case 'cancelled':
        return <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-zinc-805 text-zinc-550 border border-zinc-800">Cancelled</span>;
      default:
        return <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-zinc-800 text-zinc-400">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-450 hover:text-white transition cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold font-outfit text-white leading-none">Public Shipment Tracker</h1>
            <p className="text-xs text-zinc-500 mt-1">Live updates via Supabase Realtime</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            PUBLIC ACCESS
          </span>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid gap-8 lg:grid-cols-3">
        
        {/* Left/Middle Column (Stepper + Map Placeholder) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Overview & Stepper */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Tracking Code</span>
                <div className="mt-0.5">
                  <CopyableTrackingNumber value={liveShipment.tracking_number} className="text-xl sm:text-2xl font-bold tracking-wide" />
                </div>
              </div>
              <div className="flex flex-col sm:items-end gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-550 sm:text-right">Current Status</span>
                {getStatusBadge(liveShipment.status)}
              </div>
            </div>

            {/* Stepper Component */}
            <div className="pt-4 pb-2">
              <div className="relative flex items-center justify-between w-full">
                {/* Background Connecting Line */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-zinc-800" />
                
                {/* Foreground Filled Line */}
                {currentStepIdx >= 0 && (
                  <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-blue-500 transition-all duration-550" 
                    style={{ width: `${(currentStepIdx / 4) * 100}%` }}
                  />
                )}

                {/* Steps */}
                {statusOrder.map((step, idx) => {
                  const isCompleted = currentStepIdx > idx;
                  const isCurrent = currentStepIdx === idx;
                  const isFuture = currentStepIdx < idx;
                  
                  const stepLabels: Record<string, string> = {
                    pending: 'Registered',
                    assigned: 'Assigned',
                    picked_up: 'Picked Up',
                    in_transit: 'In Transit',
                    delivered: 'Delivered'
                  };

                  return (
                    <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                      <div 
                        className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-350 ${
                          isCompleted 
                            ? 'bg-blue-600 border-blue-500 text-white' 
                            : isCurrent 
                              ? 'bg-zinc-950 border-blue-500 ring-4 ring-blue-500/20 text-blue-400 font-bold' 
                              : 'bg-zinc-900 border-zinc-850 text-zinc-500'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span className="text-xs">{idx + 1}</span>
                        )}
                      </div>
                      <span 
                        className={`text-[10px] sm:text-xs font-semibold absolute top-8 whitespace-nowrap ${
                          isCurrent ? 'text-blue-400 font-bold' : isCompleted ? 'text-zinc-300' : 'text-zinc-550'
                        }`}
                      >
                        {stepLabels[step]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Estimated Delivery Banner */}
            <div className="grid gap-4 sm:grid-cols-2 pt-6 border-t border-zinc-900 text-xs">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-950/40 border border-zinc-900">
                <Calendar className="h-4 w-4 text-zinc-500" />
                <div>
                  <span className="block text-[10px] text-zinc-550 font-semibold uppercase">Estimated Delivery</span>
                  <span className="text-white font-medium">{formatDate(liveShipment.estimated_delivery)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-950/40 border border-zinc-900">
                <CheckCircle2 className="h-4 w-4 text-zinc-500" />
                <div>
                  <span className="block text-[10px] text-zinc-550 font-semibold uppercase">Actual Delivery</span>
                  <span className="text-white font-medium">{formatDate(liveShipment.actual_delivery)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Live Map */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-emerald-400" />
                <h3 className="font-bold text-white font-outfit">Live Navigation Map</h3>
              </div>
              {liveLocation && (
                <div className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold animate-pulse">
                  SPEED: {liveLocation.speed_kmh} KM/H
                </div>
              )}
            </div>

            <div className="relative h-[320px] rounded-xl border border-zinc-800 overflow-hidden bg-zinc-950/60">
              <LiveMap
                shipmentId={liveShipment.id}
                origin={{ lat: liveShipment.origin.lat, lng: liveShipment.origin.lng }}
                destination={{ lat: liveShipment.destination.lat, lng: liveShipment.destination.lng }}
                initialPosition={mapPosition}
                status={liveShipment.status}
                onPositionChange={handlePositionChange}
              />
            </div>
          </div>

        </div>

        {/* Right Column (Route Summary + Timeline) */}
        <div className="space-y-6">
          
          {/* Card 3: Route Hubs */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
            <h3 className="font-bold text-white font-outfit border-b border-zinc-900 pb-3">Route Details</h3>
            
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-550 font-bold uppercase">Ship From</span>
                <div className="font-medium text-white">{liveShipment.origin.address}</div>
                <div className="text-zinc-500">City: {liveShipment.origin.city || 'N/A'}</div>
              </div>
              
              <div className="h-px bg-zinc-900" />
              
              <div className="space-y-1">
                <span className="text-[10px] text-zinc-550 font-bold uppercase">Ship To</span>
                <div className="font-medium text-white">{liveShipment.destination.address}</div>
                <div className="text-zinc-500">City: {liveShipment.destination.city || 'N/A'}</div>
              </div>

              {liveShipment.driver && (
                <>
                  <div className="h-px bg-zinc-900" />
                  <div className="space-y-2">
                    <span className="text-[10px] text-zinc-550 font-bold uppercase">Assigned Courier</span>
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-800">
                        <User className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-zinc-200">{liveShipment.driver.full_name || 'System Courier'}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Card 4: Milestone History Timeline */}
          <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-4 flex-1">
            <h3 className="font-bold text-white font-outfit border-b border-zinc-900 pb-3">Status Timeline</h3>
            
            {liveEvents.length === 0 ? (
              <div className="text-center py-6 text-xs text-zinc-550">No events logged yet.</div>
            ) : (
              <div className="relative pl-4 border-l border-zinc-800 space-y-6">
                {liveEvents.map((event, idx) => {
                  const isLatest = idx === 0;
                  return (
                    <div key={event.id} className="relative text-xs">
                      {/* Timeline Node Dot */}
                      <span 
                        className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border ${
                          isLatest 
                            ? 'bg-blue-500 border-blue-400 ring-4 ring-blue-500/20' 
                            : 'bg-zinc-850 border-zinc-800'
                        }`}
                      />
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`font-semibold capitalize ${isLatest ? 'text-blue-400' : 'text-zinc-300'}`}>
                            {event.status.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-zinc-550">{formatDate(event.created_at)}</span>
                        </div>
                        <p className="text-zinc-550 leading-relaxed font-sans">{event.message || 'Status transition logged.'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
