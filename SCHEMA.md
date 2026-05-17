# SCHEMA.md

## Database Schema (Supabase PostgreSQL)

### Core Tables

#### `profiles`
```sql
id uuid primary key references auth.users
role text check (role in ('shipper', 'driver', 'recipient', 'admin')) not null
full_name text
avatar_url text
base_location jsonb -- {lat, lng, city} for drivers
max_active_shipments int default 5
created_at timestamptz default now()
```

## `shipments``
```sql
id uuid primary key default gen_random_uuid()
tracking_number text unique not null -- LTK-XXXXXXXXX format

shipper_id uuid references profiles
driver_id uuid references profiles null
recipient_email text
recipient_name text
recipient_phone text

origin jsonb not null -- {address, lat, lng, city}
destination jsonb not null -- {address, lat, lng, city}

status text check (status in ('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'delayed', 'cancelled')) default 'pending'

estimated_delivery timestamptz
actual_delivery timestamptz null

created_at timestamptz default now()
updated_at timestamptz default now()
```

## Indexes & Constraints

- Index on shipments(tracking_number)
- Index on shipments(shipper_id, driver_id, status)
- Index on shipment_locations(shipment_id, timestamp)
- RLS policies per role

## Row Level Security Policies (High Level)

- Shipper: Can see only their own shipments
- Driver: Can see assigned shipments + update location/status
- Recipient: Can view via tracking number (public-ish with token)
- Admin: Full access
- Public tracking: Limited view via tracking number + optional short-lived token

## Mock Data Guidelines

- Max 5 shipments per user
- Pre-seed 2-3 drivers with different base locations
- Generate realistic tracking numbers

