# LiveTrack

LiveTrack is a real-time logistics workflow demo. It shows how a shipment moves from booking to delivery across shipper, driver, recipient, and admin views.

## Core Flow

1. A shipper books a shipment.
2. A driver claims the available job.
3. The driver confirms pickup and starts transit.
4. A server-side simulation writes GPS positions to Supabase.
5. Supabase Realtime streams positions to the public tracking page.
6. The truck marker moves until the shipment reaches delivered status.

## Stack

- Next.js App Router and TypeScript
- Clerk authentication with role-based dashboards
- Supabase Postgres, Row Level Security, and Realtime
- Leaflet and React-Leaflet for maps
- Server Actions with Zod validation

## Local Development

Create `.env` from `.env.example`, then run:

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000` unless that port is in use.

## Demo

See [`DEMO.md`](./DEMO.md) for the 90-second script and demo accounts.

This project uses simulated location data. It does not connect to a real carrier API.
