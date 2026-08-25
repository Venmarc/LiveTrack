import { UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { Truck, CheckCircle, Clock } from 'lucide-react';
import { ensureProfile } from '@/server/actions/auth-actions';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import DriverDashboardClient, { type ShipmentData } from './driver-dashboard-client';
import Logo from '@/components/logo';
import { RoleOnboarding } from '@/components/role-onboarding';

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

  const supabase = await createSupabaseServerClient();

  // Fetch driver profile limit
  const { data: profile } = await supabase
    .from('profiles')
    .select('max_active_shipments')
    .eq('id', user.id)
    .single();

  const maxActiveLimit = profile?.max_active_shipments ?? 5;

  // 1. Fetch shipments assigned to this driver
  const { data: myShipments, error: myError } = await supabase
    .from('shipments')
    .select('*, shipper:profiles!shipper_id(full_name)')
    .eq('driver_id', user.id)
    .order('created_at', { ascending: false });

  if (myError) {
    console.error('Error fetching driver shipments:', myError);
  }

  // 2. Fetch available shipments (pending, no driver assigned)
  const { data: availableShipments, error: availError } = await supabase
    .from('shipments')
    .select('*, shipper:profiles!shipper_id(full_name)')
    .is('driver_id', null)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (availError) {
    console.error('Error fetching available shipments:', availError);
  }

  const myShipmentList = myShipments || [];
  const availableShipmentList = availableShipments || [];

  // Calculate dynamic stats
  const activeCount = myShipmentList.filter(
    s => s.status !== 'delivered' && s.status !== 'cancelled'
  ).length;
  const deliveredCount = myShipmentList.filter(s => s.status === 'delivered').length;
  const availableCount = availableShipmentList.length;
  const hasTransitShipment = myShipmentList.some(
    s => s.status === 'in_transit' || s.status === 'delivered'
  );

  const stats = [
    { 
      title: 'Active Runs', 
      value: `${activeCount}`, 
      icon: Truck, 
      desc: 'Shipments currently in your queue',
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
      title: 'Available Jobs', 
      value: `${availableCount}`, 
      icon: Clock, 
      desc: 'Deliveries waiting to be claimed',
      colorClass: 'text-amber-400',
      bgClass: 'bg-amber-500/10'
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo accent="emerald" />
          <div>
            <h1 className="text-xl font-bold font-outfit text-white leading-none">Courier Driver Portal</h1>
            <p className="text-xs text-zinc-500 mt-1">Route navigation & GPS simulation metrics</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            DRIVER PORTAL
          </span>
          <UserButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Banner */}
        <div className="rounded-2xl p-6 bg-linear-to-r from-emerald-900/20 via-zinc-900/50 to-zinc-900/50 border border-emerald-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold font-outfit text-white">Real-time Delivery Sim</h2>
            <p className="text-sm text-zinc-400 max-w-xl">
              Claim available jobs, update package statuses as you progress, and stream live coordinate updates to recipients.
            </p>
          </div>
        </div>

        <RoleOnboarding
          role="driver"
          context={{
            shipmentCount: myShipmentList.length,
            availableCount,
            hasShipment: myShipmentList.length > 0,
            hasActiveShipment: activeCount > 0,
            hasTransitShipment,
          }}
          primaryHref="#delivery-workspace"
          primaryLabel="Continue to deliveries"
        />

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

        {/* Interactive Client Component */}
        <div id="delivery-workspace" className="scroll-mt-24">
          <DriverDashboardClient
            initialMyShipments={myShipmentList as ShipmentData[]}
            initialAvailableShipments={availableShipmentList as ShipmentData[]}
            maxActiveShipments={maxActiveLimit}
          />
        </div>
      </main>
    </div>
  );
}
