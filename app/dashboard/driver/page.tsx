import { UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { Truck, Navigation, CheckCircle, Clock, ArrowRight, User } from 'lucide-react';
import { ensureProfile } from '@/server/actions/auth-actions';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export default async function DriverDashboard() {
  // Ensure profile is synced in Supabase
  await ensureProfile();

  const user = await currentUser();
  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-sm text-zinc-400">Loading profile data...</p>
      </div>
    );
  }

  // Fetch shipments assigned to this driver
  const supabase = await createSupabaseServerClient();
  const { data: shipments, error } = await supabase
    .from('shipments')
    .select('*, shipper:profiles!shipper_id(full_name)')
    .eq('driver_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching driver shipments:', error);
  }

  const shipmentList = shipments || [];

  // Calculate dynamic stats
  const activeCount = shipmentList.filter(
    s => s.status === 'assigned' || s.status === 'picked_up' || s.status === 'in_transit' || s.status === 'delayed'
  ).length;
  const deliveredCount = shipmentList.filter(s => s.status === 'delivered').length;
  const pendingPickupCount = shipmentList.filter(s => s.status === 'assigned').length;

  const stats = [
    { 
      title: 'Assigned Shipments', 
      value: `${activeCount}`, 
      icon: Truck, 
      desc: 'Shipments currently assigned for transport',
      colorClass: 'text-emerald-400',
      bgClass: 'bg-emerald-500/10'
    },
    { 
      title: 'Delivered', 
      value: `${deliveredCount}`, 
      icon: CheckCircle, 
      desc: 'Total successful delivery outcomes',
      colorClass: 'text-blue-400',
      bgClass: 'bg-blue-500/10'
    },
    { 
      title: 'Pending Pickup', 
      value: `${pendingPickupCount}`, 
      icon: Clock, 
      desc: 'Deliveries waiting to be claimed/onboarded',
      colorClass: 'text-amber-400',
      bgClass: 'bg-amber-500/10'
    },
  ];

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
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-zinc-800 text-zinc-500 border border-zinc-800">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-zinc-800 text-zinc-400">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
            LiveTrack
          </div>
          <div>
            <h1 className="text-xl font-bold font-outfit text-white leading-none">Courier Driver Portal</h1>
            <p className="text-xs text-zinc-500 mt-1">Route navigation & GPS simulation metrics</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            DRIVER LIVE
          </span>
          <UserButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Banner */}
        <div className="rounded-2xl p-6 bg-linear-to-r from-emerald-900/20 via-zinc-900/50 to-zinc-900/50 border border-emerald-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold font-outfit text-white">GPS Waypoint Simulator</h2>
            <p className="text-sm text-zinc-400 max-w-xl">
              Turn on simulated route runs to feed real-time coordinates to recipients. View active mapping nodes or update statuses.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-emerald-600/20 whitespace-nowrap cursor-pointer">
              <Navigation className="h-4 w-4" />
              Start Route Run
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-3">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex items-start gap-4">
                <div className={`p-3 rounded-xl ${stat.bgClass} ${stat.colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">{stat.title}</span>
                  <div className="text-3xl font-extrabold text-white font-outfit">{stat.value}</div>
                  <p className="text-xs text-zinc-400">{stat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Assignments Table */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-900/10 overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-900 flex items-center justify-between">
            <h3 className="font-bold text-white font-outfit">Assigned Shipments</h3>
            <span className="text-xs text-zinc-500">{shipmentList.length} shipments found</span>
          </div>

          {shipmentList.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-4">
              <div className="p-4 rounded-full bg-zinc-900 text-zinc-600">
                <Truck className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white font-outfit">No active assignments</h4>
                <p className="text-sm text-zinc-500 max-w-xs">
                  You do not have any delivery shipments assigned yet. Ask a Shipper profile user to assign deliveries to your account.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-900/30 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">Tracking Number</th>
                    <th className="px-6 py-4">Shipper</th>
                    <th className="px-6 py-4">Route</th>
                    <th className="px-6 py-4">Recipient</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/50">
                  {shipmentList.map((shipment) => (
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
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{shipment.recipient_name}</div>
                        <div className="text-xs text-zinc-500">{shipment.recipient_phone || 'No phone'}</div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(shipment.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-emerald-400 hover:text-emerald-300 font-semibold text-xs cursor-pointer">
                          Manage Run
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
