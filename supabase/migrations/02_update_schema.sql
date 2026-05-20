-- 02_update_schema.sql
-- Add speed_kmh and status to shipment_locations, and create shipment_events table.

-- 1. Alter shipment_locations to add speed_kmh and status columns if not already present
ALTER TABLE public.shipment_locations 
ADD COLUMN IF NOT EXISTS speed_kmh NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS status TEXT;

-- 2. Create shipment_events (timeline tracking)
CREATE TABLE IF NOT EXISTS public.shipment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    message TEXT, -- e.g. "Package picked up", "Delayed due to traffic"
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL -- Clerk IDs are TEXT
);

-- 3. Enable RLS on shipment_events
ALTER TABLE public.shipment_events ENABLE ROW LEVEL SECURITY;

-- 4. Configure RLS Policies for shipment_events
DROP POLICY IF EXISTS "Allow public SELECT shipment_events" ON public.shipment_events;
CREATE POLICY "Allow public SELECT shipment_events" ON public.shipment_events
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow shipper/driver INSERT shipment_events" ON public.shipment_events;
CREATE POLICY "Allow shipper/driver INSERT shipment_events" ON public.shipment_events
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.shipments
            WHERE id = shipment_id AND (
                shipper_id = auth.uid()::text OR 
                driver_id = auth.uid()::text
            )
        )
    );

-- 5. Performance and Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_shipment_events_shipment_id ON public.shipment_events(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_events_created_at ON public.shipment_events(created_at DESC);
