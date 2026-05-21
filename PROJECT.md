**PROJECT.md**
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

## Development Phases

See **PHASES.md** for detailed deliverables, success criteria, and quality gates per phase.

**High-level summary:**
- **Phase 0**: Setup & Foundation (Auth + Schema + Skeletons)
- **Phase 1**: Core Data & Shipment CRUD
- **Phase 2**: Driver Flows + Assignment
- **Phase 3**: Live Map + Simulation Engine (the magic)
- **Phase 4**: Polish & Demo Readiness
- **Phase 5**: Stretch goals (post-MVP)

No phase may bleed into the next. Complete and test each phase fully before moving forward.

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
- **PHASES.md** — for detailed deliverables, timelines, and success criteria per phase.
- **NOTES.md** — Personal scratchpad, current phase status, future ideas, lessons
- **SCHEMA.md, DECISIONS.md, CONSTITUTION.md** must be referenced by the AI/agent in every major planning or implementation response.

**Process Rule (Enforced):**
Before starting any new Phase or major feature:
1. Update PROJECT.md with clear goals
2. Reference relevant files (DECISIONS, CONSTITUTION, SCHEMA)
3. Plan happy path + error cases
4. Implement → Manual test → Review code yourself → Commit

New chat per Phase or complex feature. Do not let context bloat.
