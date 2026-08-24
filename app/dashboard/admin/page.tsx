import { UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { Package, Truck, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { ensureProfile } from '@/server/actions/auth-actions';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { CopyableTrackingNumber } from '@/components/copyable-tracking-number';
import AdminActions from './admin-actions';
import Logo from '@/components/logo';
import Link from 'next/link';

const statusBadge: Record<string, string> = {
  pending: 'bg-zinc-800 text-zinc-300 border border-zinc-700',
  assigned: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  picked_up: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  in_transit: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  delayed: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  delivered: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
  cancelled: 'bg-zinc-800 text-zinc-500 border border-zinc-800',
};

export default async function AdminDashboard() {
  await ensureProfile();

  const user = await currentUser();
  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-sm text-zinc-400">Loading profile data...</p>
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data: shipments, error } = await supabase
    .from('shipments')
    .select('*, shipper:profiles!shipper_id(full_name), driver:profiles!driver_id(full_name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching shipments for admin:', error);
  }

  const shipmentList = shipments || [];

  const stats = [
    { title: 'Total Shipments', value: shipmentList.length, icon: Package, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'In Transit', value: shipmentList.filter((s) => s.status === 'in_transit').length, icon: Truck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Delivered', value: shipmentList.filter((s) => s.status === 'delivered').length, icon: CheckCircle, color: 'text-teal-400', bg: 'bg-teal-500/10' },
    { title: 'Delayed / Exceptions', value: shipmentList.filter((s) => s.status === 'delayed').length, icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo accent="zinc" />
          <div>
            <h1 className="text-xl font-bold font-outfit text-white leading-none">Admin Portal</h1>
            <p className="text-xs text-zinc-500 mt-1">System overview & manual overrides</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-zinc-500/10 text-zinc-300 border border-zinc-500/20">
            ADMIN
          </span>
          <UserButton />
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex items-start gap-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">{stat.title}</span>
                  <div className="text-3xl font-extrabold text-white font-outfit">{stat.value}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-zinc-900 bg-zinc-900/10 overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-900 flex items-center justify-between">
            <h3 className="font-bold text-white font-outfit">All Shipments</h3>
            <span className="text-xs text-zinc-500">{shipmentList.length} total</span>
          </div>

          {shipmentList.length === 0 ? (
            <div className="p-12 text-center text-sm text-zinc-500">
              No shipments in the system yet. Create one as a shipper to populate this view.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-900/30 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">Tracking Code</th>
                    <th className="px-6 py-4">Route</th>
                    <th className="px-6 py-4">Shipper</th>
                    <th className="px-6 py-4">Driver</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Overrides</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/50">
                  {shipmentList.map((shipment) => (
                    <tr key={shipment.id} className="text-sm text-zinc-300 hover:bg-zinc-900/20 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <CopyableTrackingNumber value={shipment.tracking_number} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-zinc-300">
                          <span>{shipment.origin.city || 'Origin'}</span>
                          <ArrowRight className="h-3 w-3 text-zinc-600" />
                          <span>{shipment.destination.city || 'Destination'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {shipment.shipper?.full_name || 'System Shipper'}
                      </td>
                      <td className="px-6 py-4">
                        {shipment.driver?.full_name || <span className="text-zinc-500 text-xs italic">Unassigned</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${statusBadge[shipment.status] || 'bg-zinc-800 text-zinc-400'}`}>
                          {shipment.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <AdminActions shipmentId={shipment.id} status={shipment.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="text-xs text-zinc-500">
          <Link href="/" className="text-blue-400 hover:text-blue-300 cursor-pointer">← Back to home</Link>
        </div>
      </main>
    </div>
  );
}