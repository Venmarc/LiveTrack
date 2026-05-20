import { UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { Package, Calendar, Bell, ArrowRight, User } from 'lucide-react';
import { ensureProfile } from '@/server/actions/auth-actions';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { TrackingSearch } from '@/components/tracking-search';

export default async function RecipientDashboard() {
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

  // Get user's primary email address
  const email = user.emailAddresses?.[0]?.emailAddress || '';

  // Fetch shipments where recipient_email matches user's email
  const supabase = await createSupabaseServerClient();
  const { data: shipments, error } = await supabase
    .from('shipments')
    .select('*, driver:profiles!driver_id(full_name, avatar_url)')
    .eq('recipient_email', email)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching recipient shipments:', error);
  }

  const shipmentList = shipments || [];

  // Calculate dynamic stats
  const activeCount = shipmentList.filter(
    s => s.status !== 'delivered' && s.status !== 'cancelled'
  ).length;
  const delayedCount = shipmentList.filter(s => s.status === 'delayed').length;

  // Count shipments arriving today (simplified: check if estimated_delivery is today)
  const isToday = (dateStr: string | null) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  const todayCount = shipmentList.filter(s => isToday(s.estimated_delivery)).length;

  const stats = [
    { 
      title: 'Inbound Packages', 
      value: `${activeCount}`, 
      icon: Package, 
      desc: 'Deliveries sent to your email or phone',
      colorClass: 'text-indigo-400',
      bgClass: 'bg-indigo-500/10'
    },
    { 
      title: 'Est. Delivery Today', 
      value: `${todayCount}`, 
      icon: Calendar, 
      desc: 'Packages arriving today',
      colorClass: 'text-emerald-400',
      bgClass: 'bg-emerald-500/10'
    },
    { 
      title: 'Alerts', 
      value: `${delayedCount}`, 
      icon: Bell, 
      desc: 'New tracking exceptions or updates',
      colorClass: 'text-rose-400',
      bgClass: 'bg-rose-500/10'
    },
  ];

  // Helper to render status badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700">Pending</span>;
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
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
            LiveTrack
          </div>
          <div>
            <h1 className="text-xl font-bold font-outfit text-white leading-none">Recipient Portal</h1>
            <p className="text-xs text-zinc-500 mt-1">Track inbound packages and deliveries</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            CUSTOMER ACCOUNT
          </span>
          <UserButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Search Tracker Banner */}
        <div className="rounded-2xl p-6 bg-linear-to-r from-indigo-900/20 via-zinc-900/50 to-zinc-900/50 border border-indigo-500/10 space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold font-outfit text-white">Track any shipment ID</h2>
            <p className="text-sm text-zinc-400">
              Enter your tracking number below to view the Leaflet tracking map, real-time vehicle simulation, and statuses.
            </p>
          </div>
          <TrackingSearch />
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

        {/* Inbound Shipments Table */}
        <div className="rounded-2xl border border-zinc-900 bg-zinc-900/10 overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-900 flex items-center justify-between">
            <h3 className="font-bold text-white font-outfit">My Packages</h3>
            <span className="text-xs text-zinc-500">{shipmentList.length} shipments found</span>
          </div>

          {shipmentList.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-4">
              <div className="p-4 rounded-full bg-zinc-900 text-zinc-600">
                <Package className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white font-outfit">No packages tracked</h4>
                <p className="text-sm text-zinc-500 max-w-xs">
                  You do not have any packages listed under your email address ({email}) yet. Shippers can add your email to link deliveries automatically.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-900/30 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">Tracking Number</th>
                    <th className="px-6 py-4">Route</th>
                    <th className="px-6 py-4">Courier / Driver</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
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
                        {shipment.driver ? (
                          <div className="flex items-center gap-2">
                            {shipment.driver.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img 
                                src={shipment.driver.avatar_url} 
                                alt={shipment.driver.full_name} 
                                className="h-6 w-6 rounded-full bg-zinc-800"
                              />
                            ) : (
                              <div className="p-1 rounded-full bg-zinc-800 text-zinc-500">
                                <User className="h-3 w-3" />
                              </div>
                            )}
                            <span className="font-medium">{shipment.driver.full_name}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-500 text-xs italic">Awaiting Courier assignment</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(shipment.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a 
                          href={`/tracking/${shipment.tracking_number}`}
                          className="text-indigo-400 hover:text-indigo-300 font-semibold text-xs cursor-pointer"
                        >
                          Track Live
                        </a>
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
