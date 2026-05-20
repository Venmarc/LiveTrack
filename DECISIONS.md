# DECISIONS.md

## 1. Core Stack

- **Framework**: Next.js 16+ (App Router) + TypeScript (strict mode)
- **Styling**: Tailwind CSS 4 + shadcn/ui (Nova preset)
- **Auth & RBAC**: Clerk (with user metadata for roles)
- **Database**: Supabase (PostgreSQL + Row Level Security + Realtime)
- **Maps**: Leaflet.js + react-leaflet
- **Data Fetching**: TanStack Query v5
- **Validation**: Zod
- **Notifications**: Sonner
- **Icons**: Lucide React
- **Deployment**: Vercel (primary)

### Key Libraries & Versions (pinned)
- `next`: ^16.x
- `typescript`: ^5.5+
- `tailwindcss`: ^4.0
- `@supabase/supabase-js`: latest
- `@tanstack/react-query`: ^5
- `zod`: ^3.23
- `react-leaflet`: ^4.2+
- `leaflet`: ^1.9
- `@clerk/nextjs`: latest
- `sonner`: latest

### Why This Stack
- Consistent with other portfolio apps (like Tempire) for faster context switching.
- Excellent real-time capabilities (Supabase Realtime is perfect for live location/status).
- Leaflet is lightweight and reliable for this use case.
- Demonstrates modern full-stack patterns recruiters want to see.

---

## 2. Key Decisions Log

**Date**: 2026-05-17  
**Decision**: Use Supabase Realtime + `shipment_locations` table for live updates instead of pure client-side setInterval.  
**Rationale**: Cross-user real-time (Driver → Recipient) is non-negotiable for the hero demo. Supabase Realtime gives production feel and easy future swap to real WebSockets.  
**Alternatives Considered**: Pure client simulation (rejected - breaks multi-tab demo), Pusher/Socket.io (overkill for portfolio).

**Date**: 2026-05-17  
**Decision**: Fake GPS simulation with predefined waypoints + small random jitter. No real routing engine.  
**Rationale**: Leaflet polyline + interpolation is enough to look impressive while keeping scope tight.  
**Status**: Approved for Phase 3.

**Date**: 2026-05-17  
**Decision**: Driver assignment = manual "Claim" button + simple Available Jobs list. No proximity matching in MVP.  
**Rationale**: Proximity adds geo complexity and edge cases not worth it for portfolio impact. Fake base_location + simple list is sufficient.  
**Future**: Can add Haversine distance later.

**Date**: 2026-05-17  
**Decision**: Max 5 shipments per user enforced at application level.  
**Rationale**: Prevents demo bloat and keeps performance predictable.

**Date**: 2026-05-17  
**Decision**: Clerk metadata for roles + Supabase RLS.  
**Rationale**: Proven pattern. Fast and secure.

**Ongoing Rule**: Any feature not required for the 90-second demo script is Phase 4 or later. No exceptions.

---

## 3. Architecture & Patterns

- **Server-first**: All database operations via Server Actions or Route Handlers. No direct client Supabase access except Realtime subscriptions where necessary.
- **RBAC**: Clerk user metadata + Supabase RLS policies. Middleware protects routes.
- **State Management**: TanStack Query for server state. Minimal Zustand only if needed for simulation/UI state.
- **Simulation Layer**: Custom `lib/simulation.ts` (in-memory + Supabase broadcast for cross-user updates).
- **Type Safety**: Full end-to-end types between Supabase → Zod → UI.
- **No bloat**: Avoid unnecessary libraries. Keep bundle size tight.

**Future Swap Path**:
- Simulation → Real carrier WebSocket/API
- Supabase → Any Postgres + Pusher/Socket.io

---

## 4. Simulation Engine

Location + status simulation for shipments. Must feel alive and realistic while being controllable and leak-free.

### Core Requirements
- Marker moves smoothly toward destination.
- Updates every 3-8 seconds.
- Status changes at logical points (e.g. "in_transit" → "delayed").
- Broadcast updates via Supabase Realtime so other roles see changes instantly.
- Easy to start/stop per shipment.
- No memory leaks.

### Architecture
- `lib/simulation.ts` — central engine.
- Uses a `Map<shipmentId, Simulation>` internally.
- Each simulation has:
  - Current position (lat, lng)
  - Waypoints array (origin → 3-4 intermediate → destination)
  - Current waypoint index
  - Progress percentage
  - Status

### How It Works
1. When Driver marks "Picked Up" → simulation starts.
2. Every tick:
   - Move toward next waypoint with small random jitter (±0.001 lat/lng).
   - Update `shipment_locations` table.
   - Broadcast via Supabase Realtime.
   - Occasionally trigger status change + event.
3. When close to destination → auto "Delivered" or allow manual override.

### Technical Details
- Use `requestAnimationFrame` + timestamp for smooth interpolation if needed.
- Store active simulations in a module-level Map.
- `startSimulation(shipmentId)`, `stopSimulation(shipmentId)`, `stopAll()`.
- Clean up on component unmount + page navigation.
- Seed realistic initial waypoints based on origin/destination.

### Future Swap
The interface should allow easy replacement with real carrier WebSocket data.

**Implementation Order**:
1. Basic position updates (static movement first)
2. Realtime broadcast
3. Status + event integration
4. Polish (speed, progress bar, etc.)