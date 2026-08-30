import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { Package, Truck, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { ensureProfile } from '@/server/actions/auth-actions';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { CopyableTrackingNumber } from '@/components/copyable-tracking-number';
import AdminActions from './admin-actions';
import AppHeader from '@/components/app-header';
import { RoleOnboarding } from '@/components/role-onboarding';
import { getShipmentStatusPresentation } from '@/lib/shipment-status.mjs';

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
  const hasActiveShipment = shipmentList.some((s) => s.status === 'in_transit');
  const hasDeliveredShipment = shipmentList.some((s) => s.status === 'delivered');

  const stats = [
    { title: 'Total Shipments', value: shipmentList.length, icon: Package, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'In Transit', value: shipmentList.filter((s) => s.status === 'in_transit').length, icon: Truck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'Delivered', value: shipmentList.filter((s) => s.status === 'delivered').length, icon: CheckCircle, color: 'text-teal-400', bg: 'bg-teal-500/10' },
    { title: 'Delayed / Exceptions', value: shipmentList.filter((s) => s.status === 'delayed').length, icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <AppHeader role="admin" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        <RoleOnboarding
          role="admin"
          context={{
            shipmentCount: shipmentList.length,
            hasShipment: shipmentList.length > 0,
            hasActiveShipment,
            hasDeliveredShipment,
          }}
          primaryHref="#network-shipments"
          primaryLabel="Review shipments"
        />

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

        <div id="network-shipments" className="scroll-mt-24 rounded-2xl border border-zinc-900 bg-zinc-900/10 overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-900 flex items-center justify-between">
            <h1 className="font-bold text-white font-outfit">All Shipments</h1>
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
                        <span className={`inline-flex rounded-[var(--radius-pill)] border px-2.5 py-1 text-xs font-semibold ${getShipmentStatusPresentation(shipment.status).className}`}>
                          {getShipmentStatusPresentation(shipment.status).label}
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
