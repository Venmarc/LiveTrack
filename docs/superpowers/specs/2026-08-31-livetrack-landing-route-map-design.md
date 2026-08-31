# LiveTrack Landing Page — Route Map Hero Design

Date: 2026-08-31
Status: Approved by Victor (Direction A — Night Dispatch)
Scope: Slice 1 of the page-by-page revamp. Landing page only, plus one shared map core built for reuse.

## Context

Victor rejected the Stage 1.5 landing output as templated and set a new strategy: revamp one page at a time, starting with the landing page, with design defined and approved before implementation. The landing page and tracking page become one continuous public experience (Option 3): the landing page hosts the live tracking experience directly; the tracking page adopts the same shared map core in slice 2.

Wants driving this design (from prompt.md):

- A visual identity that could not be mistaken for anyone else's.
- Map routes follow actual roads, not straight lines.
- The truck moves forward like a real vehicle, never oscillating.
- Green-terrain map, not black/grey.
- Finite state machines for UI behavior; visible available/clicked/disabled states; no button that looks unpushed while working.
- Layered action feedback; inline form validation; clear errors with what-happened / why / what-to-do.
- 44px interactive targets; one skill at a time discipline; subagent-driven build and user-simulation testing.

## Direction: Night Dispatch (A)

The dispatcher's screen at night. The committed Dispatch Ledger system stays (graphite/ink dark shell, route-orange accent) and the green terrain map becomes the hero. The green comes entirely from map tiles; no new palette colors. The dark frame intensifies the terrain.

Rejected alternatives:

- B (Field Office, light theme): discards the committed token system, doubles future work, drifts toward the warm-cream AI-default look.
- C (Split Shift, light public / dark app): fights the one-experience decision; theme flip between landing and tracking is whiplash.

## Page Structure

Four sections, no more:

1. **Sticky borderless topbar** — logo, Track, How it works, Sign in. Existing PublicHeader restyled: `position: sticky`, no bottom border, graphite surface.
2. **Map hero (75dvh desktop / 55dvh mobile)** — full-bleed OpenTopoMap green terrain. Left-docked dispatch panel (desktop) with scrim: status chip, H1 (2 lines max), subtext (≤ 20 words), tracking input, live demo status line. Mobile: panel docks to bottom of map as a sheet; input visible without scroll.
3. **How it works** — a vertical route line with three stops rendered as a shipment timeline (Dispatch / Transit / Delivery), not cards. Rule lines, no equal-width feature grid, no eyebrow labels.
4. **Try a live shipment** — clickable tracking-number chips from the real demo engine; one click navigates to that shipment's map. Footer follows, restyled as a manifest strip.

Banner removal (Victor's explicit request): the global `DemoBanner` strip is deleted — remove import and render from `app/layout.tsx`, delete `components/demo-banner.tsx`. Honesty disclosure lives in the landing footer text, which already states portfolio/demo purpose.

The hero pill badge (emoji + "SaaS Logistics Simulation Demo Platform") is removed with the rebuild. Emoji branding is banned by DESIGN.md.

## Map Behavior And Vehicle Mechanics

**Route data.** Fetched once from OSRM (public router) via `scripts/fetch-route.mjs`, stored as `lib/route-data/london-birmingham.json`. Verified: 2,320 GeoJSON coordinate points, 189.5 km, London→Birmingham. No runtime routing API calls, no new dependencies, deterministic demo. The fetcher script is rerunnable for other demo routes later.

**Geometry math (pure module `lib/route-geometry.ts`).**

- Cumulative distance precomputed along the polyline.
- Position: elapsed time × constant speed → distance → interpolated point on the road.
- Heading: atan2 bearing per segment; truck icon rotates along the shortest arc.
- Motion is always forward. Never backward, never oscillating.

**Demo timing.** Landing demo loops the full route in ~60 seconds at constant speed, pauses at destination with a Delivered state, then restarts.

**Route line.** Traveled portion solid route-orange; remaining portion dashed at 40% opacity. Existing endpoint markers for origin/destination.

**Tiles.** OpenTopoMap primary (verified reachable). If ≥ 3 tile loads error, automatically swap to Esri World Topo fallback (verified reachable). Dark-styled attribution control retained.

**Camera.** Fit to route bounds on load, then static. No camera follow.

**Live demo status line.** Text under the input, tabular numerals, computed from real route data: `In transit · 47 km to Birmingham · 63% of route`. No speed value: the demo compresses 189.5 km into 60 s (~11,370 km/h real), so any shown speed is either absurd or invented. Distance-to-go and completion percent are real.

**Map FSM:** `loading → ready → running → delivered → (restart) running`. With `prefers-reduced-motion: reduce`: skip `running`; static truck at a fixed point; full route drawn; status line still updates as text.

## Component Architecture

One shared map core, two thin position sources (the slice-2 seam):

```
RouteMap (shared: tiles, route line, markers, bearing, FSM)
  ├── DemoRouteSource   → client timer over stored geometry (landing hero)
  └── LiveRouteSource   → Supabase realtime feed (tracking page, slice 2)
```

Slice 1 builds `RouteMap` + `DemoRouteSource` only. Existing `LiveMap` is absorbed into `RouteMap` in slice 2. Supabase realtime is untouched in slice 1.

## Search Form FSM

`idle → validating (on blur) → submitting → found | not-found`

- Format check on blur, not keystroke. Error text near the field, explains the fix, persists until corrected.
- Submit locks the button into a visibly engaged state (spinner, "Checking…", disabled pointer). It cannot look unpushed while working.
- Not found: inline persistent error, what-happened / what-to-do copy, link down to the demo chips.
- Found: navigate to `/tracking/[trackingNumber]`.
- Try-it chips navigate directly on click.

## Copy

Operational voice per DESIGN.md. No "unlock", "next-generation", "enterprise-grade".

- Status chip: `Live demo · engine running`
- H1: `Watch freight move, door to door.`
- Subtext: `LiveTrack simulates dispatch, GPS telemetry, and live maps. Follow a delivery from depot to doorstep.`
- How it works stops: `Dispatch — a shipper books the load.` / `Transit — the engine streams GPS, speed, and heading.` / `Delivery — the recipient follows every mile, no account needed.`
- Try-it intro: `Real shipments from the demo engine. Open one to follow its route.` Each chip shows its true status label (In transit / Delayed / Delivered) with a status dot and text — color never carries meaning alone. Statuses are fetched server-side at request time (`revalidate = 30`) so chips never lie about a shipment's state.

## Tokens And Styles

No new palette colors. Graphite, ink, route-orange, existing semantic status colors. One functional scrim on the panel's map edge for text legibility — tight, quiet. New `.lt-map-*` classes for route, scrim, and attribution styling. Existing `.lt-control` / `.lt-primary-action` state matrices reused for all controls. Radius scale unchanged (4px controls, 8px panels).

Typography: existing Inter body + Outfit display per DESIGN.md; tabular numerals for the status line and tracking codes.

## Files

| File | Action |
|---|---|
| `lib/route-data/london-birmingham.json` | create (OSRM fetch output) |
| `scripts/fetch-route.mjs` | create (rerunnable fetcher) |
| `lib/route-geometry.ts` | create (pure math: distance, position, bearing) |
| `lib/route-geometry.test.mjs` | create (node tests) |
| `components/map/route-map.tsx` | create (shared core) |
| `components/map/demo-route-map.tsx` | create (hero wrapper) |
| `components/tracking-search.tsx` | rework (form FSM) |
| `components/public-header.tsx` | restyle (sticky, borderless) |
| `app/page.tsx` | rebuild |
| `app/globals.css` | extend (map, scrim, panel classes) |
| `app/layout.tsx` | edit (remove DemoBanner) |
| `components/demo-banner.tsx` | delete |

## Verification

- **Node tests** (`lib/route-geometry.test.mjs`): cumulative distance strictly increasing; endpoints exact; bearings within 0–360; position at t=0 is origin; position at t=total is destination.
- **Playwright (Brave clean context, load + delay + retry-click pattern):** tiles render; route path exists in DOM; truck marker position changes over 5 seconds; empty and invalid submissions show inline errors; valid tracking number navigates; chips navigate; reduced-motion yields static truck; 375px layout keeps input visible without scroll; keyboard focus rings visible.
- **Gates:** lint, build, typecheck. Screenshots at 375 / 768 / 1440 reviewed before handoff.

## Out Of Scope (Slice 1)

Tracking page restyle, app dashboard sidebar, heatmap, onboarding, Supabase realtime changes, `LiveMap` absorption.
