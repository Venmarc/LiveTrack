PROJECT.md
# LiveTrack - Real-Time Package Tracker

## Project Overview
Production-grade logistics demo showing real-time tracking, multi-role workflows, live maps, and clean architecture. Goal: Make recruiters go "this feels alive" in under 60 seconds.

**Core Differentiator**: Convincing live moving markers + instant cross-role updates. Everything else supports this.

**Target**: Tight, polished, 95+ Lighthouse, zero jank on map, easy to demo.

## Tech Stack
- Next.js 16+ App Router + TypeScript (strict)
- Tailwind CSS 4 + shadcn/ui (Nova)
- Clerk (auth + RBAC via metadata/organizations)
- Supabase (Postgres + Realtime)
- Leaflet + React-Leaflet
- TanStack Query + Zod
- Sonner, Lucide React

## User Roles
- **Shipper**: Create shipments, view own shipments
- **Driver**: View assigned packages, update status + trigger location updates
- **Recipient**: View packages sent to them (via tracking number or link)
- **Admin** (minimal): Overview + manual overrides (nice-to-have)

## Non-Negotiables
- Live moving marker on map (the hero feature)
- Distinct, useful dashboards per role
- Real-time updates (Supabase Realtime preferred)
- Clean professional UI (trustworthy logistics feel)
- Simulation layer that can later be swapped for real carrier APIs
- Max 5 shipments per user for demo sanity

## Phases (Strict — no cramming)

**Phase 1: Foundation**
- Repo setup, Clerk auth + role assignment (metadata)
- Supabase schema (shipments, users, locations/history)
- Role-based middleware + dashboard routing
- Basic data models + Zod schemas
- Mock data seeding (max 5 shipments/user)
- Simple dashboard skeletons per role

**Phase 2: Core Flows**
- Shipper: Create shipment (single form first — origin, dest, recipient details)
- Basic shipment detail page (no map yet)
- Driver: List of assigned packages + simple status update
- Public tracking page `/tracking/[number]`
- Status timeline (static for now)

**Phase 3: The Magic (Live Map + Simulation)**
- Leaflet integration on tracking + driver pages
- Mock GPS simulation engine (`lib/simulation.ts`)
- Real-time updates via Supabase Realtime (status + position)
- Moving marker + basic progress
- Clean up on unmount, no memory leaks

**Phase 4: Polish & Demo Power**
- Estimated delivery + simple delay simulation
- Better UX (skeletons, loading states, error handling)
- Admin light view (optional)
- Responsive (especially map on mobile)
- Final performance + Lighthouse
- Demo script + "Demo Mode" banner

## Folder Structure (Start lean)

app/
  (auth)/
  dashboard/shipper/
  dashboard/driver/
  dashboard/recipient/
  tracking/[number]/
  admin/
components/
  ui/
  map/
  shipment/
lib/
  simulation.ts
  mock-data.ts
supabase/
server/
  actions/

## Project Files & Reference Rules

This PROJECT.md is the single source of truth. All other files exist to support it.

- **SCHEMA.md** — Database schema + RLS
- **DECISIONS.md** — Tech stack & versions, simulation engine, and all major decisions/rationale (updated regularly)
- **CONSTITUTION.md** — Non-negotiable rules and quality standards
- **NOTES.md** — Personal scratchpad, current phase status, future ideas, lessons
- **SCHEMA.md, DECISIONS.md, CONSTITUTION.md** must be referenced by the AI/agent in every major planning or implementation response.

**Process Rule (Enforced):**
Before starting any new Phase or major feature:
1. Update PROJECT.md with clear goals
2. Reference relevant files (DECISIONS, CONSTITUTION, SCHEMA)
3. Plan happy path + error cases
4. Implement → Manual test → Review code yourself → Commit

New chat per Phase or complex feature. Do not let context bloat.