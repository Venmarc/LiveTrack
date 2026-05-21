import { createSupabaseServiceClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import TrackingClient from './tracking-client';

interface RouteParams {
  params: Promise<{ trackingNumber: string }>;
}

export default async function PublicTrackingPage({ params }: RouteParams) {
  const { trackingNumber } = await params;

  // We use the service client to bypass RLS for public search by tracking number
  const supabase = createSupabaseServiceClient();

  // 1. Fetch shipment details by tracking number
  const { data: shipment, error } = await supabase
    .from('shipments')
    .select('*, driver:profiles!driver_id(full_name, avatar_url)')
    .eq('tracking_number', trackingNumber)
    .single();

  if (error || !shipment) {
    notFound();
  }

  // 2. Fetch tracking events
  const { data: events } = await supabase
    .from('shipment_events')
    .select('*')
    .eq('shipment_id', shipment.id)
    .order('created_at', { ascending: false });

  // 3. Fetch latest locations (for live tracking indicators)
  const { data: locations } = await supabase
    .from('shipment_locations')
    .select('*')
    .eq('shipment_id', shipment.id)
    .order('timestamp', { ascending: false })
    .limit(1);

  const latestLocation = locations && locations.length > 0 ? locations[0] : null;

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <TrackingClient 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      shipment={shipment as any} 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      events={(events || []) as any} 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      latestLocation={latestLocation as any}
    />
  );
}
