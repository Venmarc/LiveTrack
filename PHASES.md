# PHASES.md - LiveTrack Development Phases

This file contains detailed deliverables, success criteria, and quality gates for each phase. PROJECT.md remains the single source of truth.

## Phase 0: Project Setup & Foundation
**Goal**: Production-ready base with auth and data layer.

**Deliverables:**
- Repo initialized with Next.js 16 App Router + TypeScript strict
- Clerk auth + role metadata setup (shipper, driver, recipient, admin)
- Supabase project connected + full schema from SCHEMA.md implemented
- RLS policies drafted and basic testing
- Basic layout + protected route middleware
- Role-based dashboard routing skeleton (`/dashboard/shipper`, `/dashboard/driver`, etc.)
- Mock data seeding script (max 5 shipments per user)
- Tailwind + shadcn/ui (Nova) configured

**Success Criteria:**
- Can log in as different roles and see correct dashboard
- No auth bypass possible
- All tables created and working
- Lighthouse score > 90 on base pages

**Quality Gate**: Manual test all role access. Commit clean.

---

## Phase 1: Core Data & Shipment CRUD
**Goal**: Solid backend flows for shipments.

**Deliverables:**
- Server Actions for:
  - Create shipment (Zod validated)
  - Get user's shipments (role-aware)
  - Get single shipment by ID or tracking number
- Shipper dashboard: List of own shipments + Create button
- Basic shipment detail page (no map)
- Public tracking page `/tracking/[number]` (limited view)
- Status timeline component (using `shipment_events`)
- Driver dashboard: List of assigned + Available Jobs (pending shipments)

**Success Criteria:**
- Full create → view flow works end-to-end
- Data is correctly filtered by role
- Proper error handling and loading states
- Tracking number format enforced

**Quality Gate**: Test with 2+ roles. All happy + basic error paths covered.

---

## Phase 2: Driver Flows + Assignment
**Goal**: Make Driver role functional.

**Deliverables:**
- Driver can claim pending shipments
- Update shipment status
- Basic assignment enforcement (max active shipments)
- Shipment detail page for Driver with action buttons
- Status updates write to both `shipments` and `shipment_events`

**Success Criteria:**
- Claim + status update works
- Other roles see changes (via TanStack Query invalidation)
- UI clearly shows different capabilities per role

**Quality Gate**: Multi-tab test: Shipper creates → Driver claims → status visible.

---

## Phase 3: Live Map + Simulation Engine
**Goal**: The hero feature — make it feel alive.

**Deliverables:**
- Leaflet map integration on tracking + driver pages
- `lib/simulation.ts` fully implemented (from DECISIONS.md)
- Real-time position updates via Supabase Realtime
- Moving marker with smooth animation + jitter
- Basic progress calculation
- Status auto-updates at certain progress points

**Success Criteria:**
- Marker moves convincingly in real-time
- Updates visible across different roles/tabs instantly
- No memory leaks (test 10+ minutes)
- Clean Leaflet cleanup on unmount

**Quality Gate**: Open 3 tabs (Shipper/Driver/Recipient) and watch live movement. Zero jank.

---

## Phase 4: Polish, UX & Demo Readiness
**Goal**: Make it portfolio-worthy.

**Deliverables:**
- Estimated delivery + simple delay simulation
- Professional status colors and timeline UI
- Skeletons, loading states, empty states
- Responsive design (especially map on mobile)
- Admin light view (optional but recommended)
- "DEMO / Simulation Only" banner
- Final performance optimization
- Demo script written and practiced

**Success Criteria:**
- 95+ Lighthouse scores
- Feels like a real logistics product
- 90-second demo flows smoothly

**Quality Gate**: Full end-to-end demo recorded. Code reviewed personally.

---

## Phase 5: Stretch / Future (Post Portfolio)
- Advanced delay + notification system
- Polyline routes
- Proximity-based job suggestions
- Real API swap preparation
- Analytics dashboard
- Tests (if going for senior+ roles)

---

**General Rules Across All Phases**
- Follow CONSTITUTION.md strictly
- Update DECISIONS.md when making architecture choices
- New chat per phase or major feature
- Manual testing before polish
- Review every line of generated code

Last Updated: 2026-05-21
