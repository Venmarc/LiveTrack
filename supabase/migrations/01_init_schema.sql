-- 01_init_schema.sql
-- Create initial schema for LiveTrack application in public schema.

-- Enable pgcrypto extension for gen_random_uuid() if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables to ensure a clean run if they exist
DROP TABLE IF EXISTS public.shipment_locations CASCADE;
DROP TABLE IF EXISTS public.shipments CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. Create Profiles Table (Clerk Identity Pattern)
CREATE TABLE public.profiles (
    id TEXT PRIMARY KEY, -- Clerk User ID (e.g. user_...)
    role TEXT NOT NULL CHECK (role IN ('shipper', 'driver', 'recipient', 'admin')),
    full_name TEXT,
    avatar_url TEXT,
    base_location JSONB, -- { "lat": float, "lng": float, "address": string }
    max_active_shipments INT DEFAULT 5 CHECK (max_active_shipments >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create Shipments Table
CREATE TABLE public.shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_number TEXT UNIQUE NOT NULL,
    shipper_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    driver_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    recipient_name TEXT,
    recipient_email TEXT,
    recipient_phone TEXT,
    origin JSONB NOT NULL, -- { "lat": float, "lng": float, "address": string }
    destination JSONB NOT NULL, -- { "lat": float, "lng": float, "address": string }
    status TEXT NOT NULL CHECK (status IN ('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'delayed', 'cancelled')) DEFAULT 'pending',
    estimated_delivery TIMESTAMPTZ,
    actual_delivery TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create Shipment Locations Table (Real-time GPS tracking)
CREATE TABLE public.shipment_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_locations ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies to prevent conflict errors
DROP POLICY IF EXISTS "Allow public SELECT on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow user INSERT own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow user UPDATE own profile" ON public.profiles;

DROP POLICY IF EXISTS "Allow public SELECT shipments" ON public.shipments;
DROP POLICY IF EXISTS "Allow shipper INSERT own shipments" ON public.shipments;
DROP POLICY IF EXISTS "Allow shipper/driver UPDATE shipments" ON public.shipments;

DROP POLICY IF EXISTS "Allow public SELECT shipment_locations" ON public.shipment_locations;
DROP POLICY IF EXISTS "Allow driver INSERT shipment_locations" ON public.shipment_locations;

-- 6. Configure RLS Policies
-- Profiles Policies
CREATE POLICY "Allow public SELECT on profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Allow user INSERT own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Allow user UPDATE own profile" ON public.profiles
    FOR UPDATE USING (auth.uid()::text = id) WITH CHECK (auth.uid()::text = id);

-- Shipments Policies
-- Everyone can select shipments (so recipients/drivers can search via tracking number)
CREATE POLICY "Allow public SELECT shipments" ON public.shipments
    FOR SELECT USING (true);

-- Shippers can create shipments where they are the shipper
CREATE POLICY "Allow shipper INSERT own shipments" ON public.shipments
    FOR INSERT WITH CHECK (auth.uid()::text = shipper_id);

-- Shippers or assigned drivers can update the shipment
CREATE POLICY "Allow shipper/driver UPDATE shipments" ON public.shipments
    FOR UPDATE USING (
        auth.uid()::text = shipper_id OR 
        auth.uid()::text = driver_id OR 
        (status = 'pending' AND auth.uid()::text IS NOT NULL) -- allow driver onboarding self-assignment
    );

-- Shipment Locations Policies
-- Map tracking is publicly readable
CREATE POLICY "Allow public SELECT shipment_locations" ON public.shipment_locations
    FOR SELECT USING (true);

-- Only the assigned driver can insert GPS tracking coordinates for a shipment
CREATE POLICY "Allow driver INSERT shipment_locations" ON public.shipment_locations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.shipments
            WHERE id = shipment_id AND driver_id = auth.uid()::text
        )
    );

-- 7. Performance and Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking_number ON public.shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_shipper_id ON public.shipments(shipper_id);
CREATE INDEX IF NOT EXISTS idx_shipments_driver_id ON public.shipments(driver_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON public.shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipment_locations_shipment_id ON public.shipment_locations(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_locations_timestamp ON public.shipment_locations(timestamp DESC);
