# DECISIONS.md

## Key Decisions Log

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

**Decision**: Clerk metadata for roles + Supabase RLS.  
**Rationale**: Proven pattern from Tempire. Fast and secure.

**Ongoing Rule**: Any feature not required for the 90-second demo script is Phase 4 or later. No exceptions.