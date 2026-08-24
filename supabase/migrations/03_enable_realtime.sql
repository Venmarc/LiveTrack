-- 03_enable_realtime.sql
-- Add tables to the supabase_realtime publication so clients can subscribe
-- to live changes (moving marker, status updates, timeline events).

ALTER PUBLICATION supabase_realtime ADD TABLE public.shipment_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shipments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shipment_events;