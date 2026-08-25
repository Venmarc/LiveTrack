-- Include complete previous and new rows in realtime change events.
-- This keeps filtered subscriptions reliable after a Supabase pause or restore.
ALTER TABLE public.shipments REPLICA IDENTITY FULL;
ALTER TABLE public.shipment_locations REPLICA IDENTITY FULL;
ALTER TABLE public.shipment_events REPLICA IDENTITY FULL;
