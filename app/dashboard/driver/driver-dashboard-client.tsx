'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Truck, 
  MapPin, 
  ArrowRight, 
  User, 
  CheckCircle, 
  AlertTriangle, 
  Play, 
  PackageCheck, 
  Clock, 
  Loader2, 
  Eye
} from 'lucide-react';
import { claimShipmentAction, updateShipmentStatusAction } from '@/server/actions/shipment-actions';
import { toast } from 'sonner';
import Link from 'next/link';

interface ProfileDetails {
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
  shipper?: ProfileDetails | null;
}

interface DriverDashboardClientProps {
  initialMyShipments: ShipmentData[];
  initialAvailableShipments: ShipmentData[];
  maxActiveShipments: number;
}

export default function DriverDashboardClient({
  initialMyShipments,
  initialAvailableShipments,
  maxActiveShipments,
}: DriverDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'available' | 'history'>('active');
  const [isPending, startTransition] = useTransition();
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Group shipments
  const activeMyShipments = initialMyShipments.filter(
    (s) => s.status !== 'delivered' && s.status !== 'cancelled'
  );
  const deliveredMyShipments = initialMyShipments.filter(
    (s) => s.status === 'delivered' || s.status === 'cancelled'
  );

  const isLimitReached = activeMyShipments.length >= maxActiveShipments;

  const handleClaim = (shipmentId: string) => {
    setProcessingId(shipmentId);
    startTransition(async () => {
      const res = await claimShipmentAction(shipmentId);
      setProcessingId(null);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Shipment claimed successfully!');
      }
    });
  };

  const handleStatusUpdate = (
    shipmentId: string,
    status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'delayed' | 'cancelled',
    customMsg?: string
  ) => {
    setProcessingId(shipmentId);
    startTransition(async () => {
      const res = await updateShipmentStatusAction(shipmentId, status, customMsg);
      setProcessingId(null);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Shipment updated to ${status.replace('_', ' ')}!`);
      }
    });
  };

  // Helper to render status badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'assigned':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">Assigned</span>;
      case 'picked_up':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">Picked Up</span>;
      case 'in_transit':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">In Transit</span>;
      case 'delayed':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">Delayed</span>;
      case 'delivered':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/20">Delivered</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-zinc-805 text-zinc-500 border border-zinc-800">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-zinc-800 text-zinc-400">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex border-b border-zinc-900 gap-6">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 text-sm font-semibold transition relative cursor-pointer ${
            activeTab === 'active' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          My Active Deliveries ({activeMyShipments.length})
          {activeTab === 'active' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('available')}
          className={`pb-3 text-sm font-semibold transition relative cursor-pointer ${
            activeTab === 'available' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Available Jobs ({initialAvailableShipments.length})
          {activeTab === 'available' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-sm font-semibold transition relative cursor-pointer ${
            activeTab === 'history' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          History ({deliveredMyShipments.length})
          {activeTab === 'history' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeMyShipments.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-4 bg-zinc-900/10 rounded-2xl border border-zinc-900">
              <div className="p-4 rounded-full bg-zinc-900 text-zinc-600">
                <Truck className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white font-outfit text-base">No active shipments</h4>
                <p className="text-sm text-zinc-500 max-w-sm">
                  You are not transporting any active shipments right now. Go to the <span className="font-semibold text-emerald-400 hover:underline cursor-pointer" onClick={() => setActiveTab('available')}>Available Jobs</span> tab to claim one!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {activeMyShipments.map((shipment) => {
                const isLoading = isPending && processingId === shipment.id;
                return (
                  <div 
                    key={shipment.id} 
                    className="p-6 rounded-2xl bg-zinc-905 border border-zinc-900 backdrop-blur-md flex flex-col justify-between gap-6 transition hover:border-zinc-800"
                  >
                    <div className="space-y-4">
                      {/* Header row */}
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Tracking Code</span>
                          <div className="text-base font-mono font-bold text-white flex items-center gap-2">
                            {shipment.tracking_number}
                          </div>
                        </div>
                        {getStatusBadge(shipment.status)}
                      </div>

                      {/* Route Details */}
                      <div className="space-y-3 bg-zinc-950/40 p-4 rounded-xl border border-zinc-900/50 text-xs">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                          <div className="space-y-0.5">
                            <span className="font-semibold text-white">Origin ({shipment.origin.city || 'Hub'})</span>
                            <p className="text-zinc-500 line-clamp-1">{shipment.origin.address}</p>
                          </div>
                        </div>
                        <div className="h-4 border-l border-zinc-800 ml-2" />
                        <div className="flex items-start gap-3">
                          <MapPin className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                          <div className="space-y-0.5">
                            <span className="font-semibold text-white">Destination ({shipment.destination.city || 'Hub'})</span>
                            <p className="text-zinc-500 line-clamp-1">{shipment.destination.address}</p>
                          </div>
                        </div>
                      </div>

                      {/* Recipient info */}
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-900 text-zinc-400">
                        <div>
                          <span className="block text-[10px] text-zinc-500 font-semibold uppercase">Recipient</span>
                          <span className="text-white font-medium">{shipment.recipient_name}</span>
                        </div>
                        {shipment.shipper && (
                          <div className="text-right">
                            <span className="block text-[10px] text-zinc-500 font-semibold uppercase">Shipper</span>
                            <span className="text-zinc-300 font-medium">{shipment.shipper.full_name || 'System Shipper'}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Step-by-Step Status Controls */}
                    <div className="pt-4 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs text-zinc-500">
                        {shipment.status === 'assigned' && 'Next: Confirm package pickup'}
                        {shipment.status === 'picked_up' && 'Next: Start the transit run'}
                        {shipment.status === 'in_transit' && 'Next: Confirm safe delivery'}
                        {shipment.status === 'delayed' && 'Resolve delay and continue'}
                      </div>

                      <div className="flex gap-2 w-full sm:w-auto justify-end">
                        {/* Resolve Delay / Mark Delay toggles */}
                        {shipment.status !== 'delayed' && (
                          <button
                            disabled={isLoading}
                            onClick={() => handleStatusUpdate(shipment.id, 'delayed', 'Package delayed due to highway route congestion.')}
                            className="px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 hover:text-rose-400 text-zinc-400 border border-zinc-800 text-xs font-semibold transition cursor-pointer"
                          >
                            <AlertTriangle className="h-3.5 w-3.5 inline mr-1" />
                            Delay
                          </button>
                        )}

                        {shipment.status === 'assigned' && (
                          <button
                            disabled={isLoading}
                            onClick={() => handleStatusUpdate(shipment.id, 'picked_up')}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition cursor-pointer hover:shadow-md"
                          >
                            {isLoading ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Clock className="h-3.5 w-3.5" />
                            )}
                            Confirm Pickup
                          </button>
                        )}

                        {(shipment.status === 'picked_up' || shipment.status === 'delayed') && (
                          <button
                            disabled={isLoading}
                            onClick={() => handleStatusUpdate(shipment.id, 'in_transit')}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition cursor-pointer hover:shadow-md"
                          >
                            {isLoading ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Play className="h-3.5 w-3.5" />
                            )}
                            Start Transit
                          </button>
                        )}

                        {shipment.status === 'in_transit' && (
                          <button
                            disabled={isLoading}
                            onClick={() => handleStatusUpdate(shipment.id, 'delivered')}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition cursor-pointer hover:shadow-md"
                          >
                            {isLoading ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <PackageCheck className="h-3.5 w-3.5" />
                            )}
                            Deliver Package
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'available' && (
        <div className="space-y-4">
          {isLimitReached && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-start gap-3">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-amber-300">Active Run Limit Reached</span>
                <p className="text-zinc-400">
                  You are currently transporting {activeMyShipments.length} active shipments (limit: {maxActiveShipments}). Please deliver or cancel your current deliveries before claiming more jobs.
                </p>
              </div>
            </div>
          )}
          {initialAvailableShipments.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-4 bg-zinc-900/10 rounded-2xl border border-zinc-900">
              <div className="p-4 rounded-full bg-zinc-900 text-zinc-600">
                <Clock className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white font-outfit text-base">No available delivery jobs</h4>
                <p className="text-sm text-zinc-500 max-w-sm">
                  There are no pending, unclaimed shipments in the system right now. Shippers can book new shipments to generate jobs here.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-900 bg-zinc-900/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-900 bg-zinc-900/30 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                      <th className="px-6 py-4">Tracking Code</th>
                      <th className="px-6 py-4">Shipper</th>
                      <th className="px-6 py-4">Route</th>
                      <th className="px-6 py-4">Recipient Name</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/50">
                    {initialAvailableShipments.map((shipment) => {
                      const isClaiming = isPending && processingId === shipment.id;
                      return (
                        <tr 
                          key={shipment.id} 
                          className="text-sm text-zinc-300 hover:bg-zinc-900/20 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 font-mono font-bold text-white">
                            {shipment.tracking_number}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="p-1 rounded-full bg-zinc-800 text-zinc-500">
                                <User className="h-3 w-3" />
                              </div>
                              <span className="font-medium">{shipment.shipper?.full_name || 'System Shipper'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-zinc-300">
                              <span>{shipment.origin.city || 'Origin'}</span>
                              <ArrowRight className="h-3 w-3 text-zinc-600" />
                              <span>{shipment.destination.city || 'Destination'}</span>
                            </div>
                            <div className="text-xs text-zinc-500 mt-0.5 truncate max-w-[200px]">
                              {shipment.origin.address}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium">
                            {shipment.recipient_name}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              disabled={isPending || isLimitReached}
                              onClick={() => handleClaim(shipment.id)}
                              className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition ${
                                isLimitReached
                                  ? 'bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                              }`}
                            >
                              {isClaiming ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Truck className="h-3 w-3" />
                              )}
                              Claim Job
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          {deliveredMyShipments.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-4 bg-zinc-900/10 rounded-2xl border border-zinc-900">
              <div className="p-4 rounded-full bg-zinc-900 text-zinc-600">
                <CheckCircle className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white font-outfit text-base">No delivery history</h4>
                <p className="text-sm text-zinc-500 max-w-sm">
                  You have not successfully completed any deliveries yet. Progress your active deliveries to completion to view them here.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-900 bg-zinc-900/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-900 bg-zinc-900/30 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                      <th className="px-6 py-4">Tracking Code</th>
                      <th className="px-6 py-4">Route</th>
                      <th className="px-6 py-4">Recipient Name</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">View Public Tracking</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/50">
                    {deliveredMyShipments.map((shipment) => (
                      <tr 
                        key={shipment.id} 
                        className="text-sm text-zinc-300 hover:bg-zinc-900/20 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 font-mono font-bold text-white">
                          {shipment.tracking_number}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-zinc-300">
                            <span>{shipment.origin.city || 'Origin'}</span>
                            <ArrowRight className="h-3 w-3 text-zinc-600" />
                            <span>{shipment.destination.city || 'Destination'}</span>
                          </div>
                          <div className="text-xs text-zinc-500 mt-0.5 truncate max-w-[200px]">
                            {shipment.origin.address}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {shipment.recipient_name}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(shipment.status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/tracking/${shipment.tracking_number}`}
                            className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white font-semibold text-xs transition cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Public Tracking
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
