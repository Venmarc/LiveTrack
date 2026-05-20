import { createSupabaseServerClient } from '@/lib/supabase-server';
import { currentUser } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import ShipmentDetailsClient from './shipment-details-client';

interface RouteParams {
  params: Promise<{ trackingNumber: string }>;
}

export default async function ShipmentDetailPage({ params }: RouteParams) {
  const user = await currentUser();
  if (!user) {
    redirect('/sign-in');
  }

  const { trackingNumber } = await params;

  const supabase = await createSupabaseServerClient();
  
  // 1. Fetch shipment detail with joined driver profile by tracking number
  const { data: shipment, error } = await supabase
    .from('shipments')
    .select('*, driver:profiles!driver_id(full_name, avatar_url, base_location)')
    .eq('tracking_number', trackingNumber)
    .eq('shipper_id', user.id)
    .single();

  if (error || !shipment) {
    notFound();
  }

  // 2. Fetch associated shipment events for the status timeline using shipment ID
  const { data: events } = await supabase
    .from('shipment_events')
    .select('*')
    .eq('shipment_id', shipment.id)
    .order('created_at', { ascending: false });

  // Map database format to matches component props
  const formattedShipment = {
    ...shipment,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    driver: shipment.driver as any
  };

  return (
    <ShipmentDetailsClient 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      shipment={formattedShipment as any} 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      events={(events || []) as any} 
    />
  );
}
