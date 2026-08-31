# LiveTrack Landing Route Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the landing page around a working road-following map demo (Direction A — Night Dispatch), per spec `docs/superpowers/specs/2026-08-31-livetrack-landing-route-map-design.md`.

**Architecture:** A pure geometry module (`lib/route-geometry.mjs`) drives a shared `RouteMap` Leaflet component from stored OSRM route data. A client `LandingHero` overlays the dispatch panel and status line. The tracking form becomes an explicit state machine with a real existence check. All page sections are server-rendered except the hero and the form.

**Tech Stack:** Next.js 16 (App Router, webpack dev), React 19, react-leaflet 5 + Leaflet 1.9.4, Tailwind v4 with CSS custom properties, Supabase (anon client for public lookups, service client for server-side chip statuses), node built-in test runner, Playwright-core with Brave via `~/.agents/playwright-core/clean-context.mjs`.

## Global Constraints

- No new npm dependencies. Everything uses installed packages (`package.json` verified).
- Only existing DESIGN.md tokens: `--color-graphite-*`, `--color-ink-*`, `--color-route-500/400`, `--color-success/warning/danger-500`, `--color-map-500`, and semantic aliases in `app/globals.css`. No blue-500/indigo/zinc Tailwind colors on the landing surface.
- Interactive targets minimum 44px height (`.lt-control` / `.lt-primary-action` already comply).
- No code comments (repo instruction).
- Copy is verbatim from the spec; status values must be computed from real data, never invented.
- `prefers-reduced-motion: reduce` must yield a static truck at 55% route progress with the full route drawn.
- Do not modify `components/map/live-map.tsx`, `app/tracking/*`, or anything under `app/dashboard/*` — those are slice 2+.
- All Playwright runs use `launchCleanBrowser` / `createCleanPage` / `gotoFresh` from `/home/redmane/.agents/playwright-core/clean-context.mjs` with the Brave binary. Never bundled Chromium.
- Dev server runs at `http://localhost:3001`.
- Never print or commit `.env` values. Supabase reads happen via the app's own clients.

---

### Task 1: Route Data And Fetcher

**Files:**
- Create: `scripts/fetch-route.mjs`
- Create: `lib/route-data/london-birmingham.json` (generated)

**Interfaces:**
- Consumes: OSRM public API `https://router.project-osrm.org/route/v1/driving/{lng,lat};{lng,lat}?overview=full&geometries=geojson`
- Produces: JSON file with shape `{ "originName": string, "destinationName": string, "distanceMeters": number, "points": [number, number][] }` where each point is `[lat, lng]` rounded to 5 decimals. Consumed by Tasks 2 and 3.

- [ ] **Step 1: Write the fetcher script**

Create `scripts/fetch-route.mjs`:

```js
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving/';
const ROUTES = [
  {
    origin: { name: 'London', lng: -0.1278, lat: 51.5074 },
    destination: { name: 'Birmingham', lng: -1.8904, lat: 52.4862 },
    outFile: 'london-birmingham.json',
  },
];

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(here, '../lib/route-data');

for (const route of ROUTES) {
  const url = `${OSRM_BASE}${route.origin.lng},${route.origin.lat};${route.destination.lng},${route.destination.lat}?overview=full&geometries=geojson`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`OSRM request failed for ${route.outFile}: HTTP ${response.status}`);
  }
  const body = await response.json();
  if (body.code !== 'Ok' || !body.routes?.length) {
    throw new Error(`OSRM returned no route for ${route.outFile}: ${body.code}`);
  }
  const osrmRoute = body.routes[0];
  const points = osrmRoute.geometry.coordinates.map(([lng, lat]) => [
    Number(lat.toFixed(5)),
    Number(lng.toFixed(5)),
  ]);
  const payload = {
    originName: route.origin.name,
    destinationName: route.destination.name,
    distanceMeters: Math.round(osrmRoute.distance),
    points,
  };
  await mkdir(dataDir, { recursive: true });
  const outPath = resolve(dataDir, route.outFile);
  await writeFile(outPath, `${JSON.stringify(payload)}\n`);
  console.log(`${route.outFile}: ${points.length} points, ${(osrmRoute.distance / 1000).toFixed(1)} km`);
}
```

- [ ] **Step 2: Run the fetcher**

Run: `node scripts/fetch-route.mjs`
Expected: `london-birmingham.json: 2320 points, 189.5 km` (point count within 2300-2340 acceptable; distance within 188-191 km).

- [ ] **Step 3: Verify the data shape**

Run: `node -e "const d=require('./lib/route-data/london-birmingham.json');const p=d.points;console.log('points:',p.length,'first:',p[0],'last:',p[p.length-1],'dist:',d.distanceMeters,'names:',d.originName,'->',d.destinationName)"`
Expected: `points: 2320 first: [ 51.50748, -0.12797 ] last: [ 52.48628, -1.89023 ] dist: 189533 names: London -> Birmingham` (values within rounding tolerance).

- [ ] **Step 4: Commit**

```bash
git add scripts/fetch-route.mjs lib/route-data/london-birmingham.json
git commit -m "feat: add route data fetcher and london-birmingham geometry"
```

---

### Task 2: Route Geometry Module (TDD)

**Files:**
- Create: `lib/route-geometry.mjs`
- Test: `lib/route-geometry.test.mjs`

**Interfaces:**
- Consumes: `lib/route-data/london-birmingham.json` (test only).
- Produces (imported as `@/lib/route-geometry.mjs` in Task 3):

```ts
interface LatLng { lat: number; lng: number }
interface Route {
  points: LatLng[];
  cumulative: number[];      // cumulative[i] = meters from points[0] to points[i]
  totalDistanceMeters: number;
}
interface RoutePosition {
  lat: number;
  lng: number;
  bearing: number;           // degrees, 0 <= bearing < 360, 0 = north
  index: number;             // segment start index: position lies between points[index] and points[index+1]
}
createRoute(points: [number, number][]): Route
positionAtDistance(route: Route, distanceMeters: number): RoutePosition
bearingBetween(a: LatLng, b: LatLng): number
```

- [ ] **Step 1: Write the failing tests**

Create `lib/route-geometry.test.mjs`:

```js
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { bearingBetween, createRoute, positionAtDistance } from './route-geometry.mjs';

const realData = JSON.parse(
  readFileSync(new URL('./route-data/london-birmingham.json', import.meta.url))
);
const realRoute = createRoute(realData.points);

test('createRoute returns zero distance for a repeated point', () => {
  const route = createRoute([[51.5, -0.12], [51.5, -0.12]]);
  assert.equal(route.totalDistanceMeters, 0);
});

test('cumulative distances are strictly increasing over distinct points', () => {
  const route = createRoute([[51.0, 0], [51.001, 0], [51.002, 0]]);
  assert.equal(route.cumulative.length, 3);
  assert.equal(route.cumulative[0], 0);
  assert.ok(route.cumulative[1] > 0);
  assert.ok(route.cumulative[2] > route.cumulative[1]);
});

test('positionAtDistance clamps to the start and end of the route', () => {
  const route = createRoute([[51.0, 0], [51.001, 0], [51.002, 0]]);
  const start = positionAtDistance(route, -50);
  assert.equal(start.lat, 51.0);
  assert.equal(start.lng, 0);
  const end = positionAtDistance(route, 1e9);
  assert.equal(end.lat, 51.002);
  assert.equal(end.lng, 0);
});

test('positionAtDistance lands exactly on the midpoint of a 3-point meridian route', () => {
  const route = createRoute([[51.0, 0], [51.001, 0], [51.002, 0]]);
  const mid = positionAtDistance(route, route.totalDistanceMeters / 2);
  assert.ok(Math.abs(mid.lat - 51.001) < 1e-9);
  assert.equal(mid.lng, 0);
  assert.equal(mid.index, 1);
});

test('positionAtDistance interpolates linearly along a meridian', () => {
  const route = createRoute([[51.0, 0], [51.002, 0]]);
  const quarter = positionAtDistance(route, route.totalDistanceMeters / 4);
  assert.ok(Math.abs(quarter.lat - 51.0005) < 1e-6);
  assert.equal(quarter.index, 0);
});

test('bearingBetween returns cardinal bearings', () => {
  const close = (actual, expected) => Math.abs(actual - expected) < 0.5;
  assert.ok(close(bearingBetween({ lat: 0, lng: 0 }, { lat: 1, lng: 0 }), 0), 'north');
  assert.ok(close(bearingBetween({ lat: 0, lng: 0 }, { lat: 0, lng: 1 }), 90), 'east');
  assert.ok(close(bearingBetween({ lat: 0, lng: 0 }, { lat: -1, lng: 0 }), 180), 'south');
  assert.ok(close(bearingBetween({ lat: 0, lng: 0 }, { lat: 0, lng: -1 }), 270), 'west');
});

test('real route: total distance is about 189.5 km', () => {
  assert.ok(realRoute.totalDistanceMeters > 188000, 'above 188 km');
  assert.ok(realRoute.totalDistanceMeters < 191000, 'below 191 km');
});

test('real route: endpoints are exact', () => {
  const first = realRoute.points[0];
  const last = realRoute.points[realRoute.points.length - 1];
  const startPos = positionAtDistance(realRoute, 0);
  const endPos = positionAtDistance(realRoute, realRoute.totalDistanceMeters);
  assert.ok(Math.abs(startPos.lat - first.lat) < 1e-9);
  assert.ok(Math.abs(startPos.lng - first.lng) < 1e-9);
  assert.ok(Math.abs(endPos.lat - last.lat) < 1e-9);
  assert.ok(Math.abs(endPos.lng - last.lng) < 1e-9);
});

test('real route: sampled bearings stay within 0..360 and distances land on the path', () => {
  const samples = 50;
  for (let i = 0; i <= samples; i++) {
    const d = (realRoute.totalDistanceMeters * i) / samples;
    const p = positionAtDistance(realRoute, d);
    assert.ok(p.bearing >= 0 && p.bearing < 360, `bearing out of range at ${d}m: ${p.bearing}`);
    assert.ok(p.index >= 0 && p.index < realRoute.points.length - 1, `index out of range at ${d}m`);
  }
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test lib/route-geometry.test.mjs`
Expected: FAIL — `Cannot find module './route-geometry.mjs'`.

- [ ] **Step 3: Write the module**

Create `lib/route-geometry.mjs`:

```js
const EARTH_RADIUS_METERS = 6371000;
const DEGREES_PER_RADIAN = 180 / Math.PI;

const toRadians = (degrees) => (degrees * Math.PI) / 180;

const haversineMeters = (a, b) => {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat + Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * sinLng * sinLng;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
};

export function bearingBetween(a, b) {
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const dLng = toRadians(b.lng - a.lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const bearing = (Math.atan2(y, x) * DEGREES_PER_RADIAN + 360) % 360;
  return bearing;
}

export function createRoute(points) {
  const pts = points.map(([lat, lng]) => ({ lat, lng }));
  const cumulative = [0];
  for (let i = 1; i < pts.length; i++) {
    cumulative.push(cumulative[i - 1] + haversineMeters(pts[i - 1], pts[i]));
  }
  return {
    points: pts,
    cumulative,
    totalDistanceMeters: cumulative[cumulative.length - 1] ?? 0,
  };
}

export function positionAtDistance(route, distanceMeters) {
  const { points, cumulative, totalDistanceMeters } = route;
  const last = points.length - 1;
  const d = Math.max(0, Math.min(distanceMeters, totalDistanceMeters));
  if (d <= 0) {
    return {
      lat: points[0].lat,
      lng: points[0].lng,
      bearing: bearingBetween(points[0], points[Math.min(1, last)]),
      index: 0,
    };
  }
  if (d >= totalDistanceMeters) {
    return {
      lat: points[last].lat,
      lng: points[last].lng,
      bearing: bearingBetween(points[Math.max(0, last - 1)], points[last]),
      index: Math.max(0, last - 1),
    };
  }
  let lo = 0;
  let hi = last;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (cumulative[mid] <= d) lo = mid;
    else hi = mid;
  }
  const segmentLength = cumulative[lo + 1] - cumulative[lo];
  const t = segmentLength === 0 ? 0 : (d - cumulative[lo]) / segmentLength;
  const a = points[lo];
  const b = points[lo + 1];
  return {
    lat: a.lat + (b.lat - a.lat) * t,
    lng: a.lng + (b.lng - a.lng) * t,
    bearing: bearingBetween(a, b),
    index: lo,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test lib/route-geometry.test.mjs`
Expected: 9 tests PASS, 0 fail.

- [ ] **Step 5: Commit**

```bash
git add lib/route-geometry.mjs lib/route-geometry.test.mjs
git commit -m "feat: add route geometry math with tests"
```

---

### Task 3: Shared Route Map Component And Landing Hero

**Files:**
- Create: `components/map/route-map.tsx`
- Create: `components/landing/hero.tsx`
- Modify: `app/page.tsx` (replace hero and feature cards; old footer kept until Task 5)
- Modify: `app/globals.css` (append map, scrim, panel, and marker classes)

**Interfaces:**
- Consumes: `createRoute`, `positionAtDistance` from `@/lib/route-geometry.mjs` (Task 2); `lib/route-data/london-birmingham.json` (Task 1); `TrackingSearch` (existing, reworked in Task 4).
- Produces:
  - `components/map/route-map.tsx` default export `RouteMap`, props `{ source: DemoSource }` where `DemoSource = { kind: 'demo'; routeData: RouteData; loopMs: number; onStatus?: (status: DemoStatus) => void }`, `RouteData = { originName: string; destinationName: string; distanceMeters: number; points: [number, number][] }`, `DemoStatus = { phase: 'running' | 'delivered' | 'static'; kmRemaining: number; percent: number }`. Slice 2 extends `source` with a `{ kind: 'live', ... }` variant.
  - `components/landing/hero.tsx` default export `LandingHero` (no props).

- [ ] **Step 1: Create the RouteMap component**

Create `components/map/route-map.tsx`:

```tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createRoute, positionAtDistance } from '@/lib/route-geometry.mjs';

export interface RouteData {
  originName: string;
  destinationName: string;
  distanceMeters: number;
  points: [number, number][];
}

export interface DemoStatus {
  phase: 'running' | 'delivered' | 'static';
  kmRemaining: number;
  percent: number;
}

export interface DemoSource {
  kind: 'demo';
  routeData: RouteData;
  loopMs: number;
  onStatus?: (status: DemoStatus) => void;
}

const TOPO_TILES = {
  url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  attribution:
    'Map data: © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: © <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
};

const ESRI_TILES = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
  attribution:
    'Tiles © <a href="https://www.esri.com/">Esri</a> — Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
};

const TILE_ERROR_LIMIT = 3;
const STATUS_EMIT_MS = 1000;
const TRAVELED_UPDATE_MS = 250;
const DELIVERED_PAUSE_MS = 4000;
const STATIC_PROGRESS = 0.55;

const truckIcon = L.divIcon({
  className: 'livetrack-marker-wrapper',
  html: `
    <div class="livetrack-marker livetrack-marker--route">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <rect x="9.5" y="2" width="5" height="5" rx="1.4" />
        <rect x="8" y="8.5" width="8" height="13" rx="1.6" />
      </svg>
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const originIcon = L.divIcon({
  className: 'livetrack-marker-wrapper',
  html: `<div class="livetrack-endpoint livetrack-endpoint--origin"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const destinationIcon = L.divIcon({
  className: 'livetrack-marker-wrapper',
  html: `<div class="livetrack-endpoint livetrack-endpoint--destination"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function FitBounds({ latLngs }: { latLngs: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(latLngs, { padding: [50, 50], animate: false });
  }, [map, latLngs]);
  return null;
}

export default function RouteMap({ source }: { source: DemoSource }) {
  const { routeData, loopMs, onStatus } = source;
  const route = useMemo(() => createRoute(routeData.points), [routeData]);
  const latLngs = useMemo(
    () => route.points.map((p) => [p.lat, p.lng] as [number, number]),
    [route]
  );
  const markerRef = useRef<L.Marker | null>(null);
  const traveledRef = useRef<L.Polyline | null>(null);
  const statusCbRef = useRef(onStatus);
  const tileErrors = useRef(0);
  const [tiles, setTiles] = useState(TOPO_TILES);

  useEffect(() => {
    statusCbRef.current = onStatus;
  });

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    const svg = marker.getElement()?.querySelector('.livetrack-marker svg') ?? null;
    let displayAngle = 0;

    const applyPosition = (distance: number) => {
      const p = positionAtDistance(route, distance);
      marker.setLatLng([p.lat, p.lng]);
      const delta = ((p.bearing - displayAngle + 540) % 360) - 180;
      displayAngle += delta;
      if (svg) svg.style.transform = `rotate(${displayAngle.toFixed(1)}deg)`;
      return p;
    };

    const updateTraveled = (p: { lat: number; lng: number; index: number }) => {
      const line = traveledRef.current;
      if (!line) return;
      const pts = route.points
        .slice(0, p.index + 1)
        .map((pt) => [pt.lat, pt.lng] as [number, number]);
      pts.push([p.lat, p.lng]);
      line.setLatLngs(pts);
    };

    const emit = (phase: DemoStatus['phase'], distance: number) => {
      statusCbRef.current?.({
        phase,
        kmRemaining: Math.max(0, (route.totalDistanceMeters - distance) / 1000),
        percent: Math.min(100, (distance / route.totalDistanceMeters) * 100),
      });
    };

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      const distance = route.totalDistanceMeters * STATIC_PROGRESS;
      const p = applyPosition(distance);
      updateTraveled({ ...p, index: route.points.length - 1 });
      emit('static', distance);
      return;
    }

    let raf = 0;
    const start = performance.now();
    let lastTraveledAt = 0;
    let lastEmitAt = 0;
    let lastPhase: DemoStatus['phase'] = 'running';

    const tick = (now: number) => {
      const cycle = loopMs + DELIVERED_PAUSE_MS;
      const t = (now - start) % cycle;
      const phase: DemoStatus['phase'] = t < loopMs ? 'running' : 'delivered';
      const distance =
        phase === 'running'
          ? (t / loopMs) * route.totalDistanceMeters
          : route.totalDistanceMeters;
      const p = applyPosition(distance);
      const phaseChanged = phase !== lastPhase;
      if (phaseChanged || now - lastTraveledAt >= TRAVELED_UPDATE_MS) {
        updateTraveled(p);
        lastTraveledAt = now;
      }
      if (phaseChanged || now - lastEmitAt >= STATUS_EMIT_MS) {
        emit(phase, distance);
        lastEmitAt = now;
        lastPhase = phase;
      }
      raf = requestAnimationFrame(tick);
    };

    emit('running', 0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [route, loopMs]);

  const handleTileError = () => {
    tileErrors.current += 1;
    if (tileErrors.current >= TILE_ERROR_LIMIT && tiles !== ESRI_TILES) {
      setTiles(ESRI_TILES);
    }
  };

  return (
    <MapContainer
      center={latLngs[0]}
      zoom={7}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        key={tiles.url}
        url={tiles.url}
        attribution={tiles.attribution}
        eventHandlers={{ tileerror: handleTileError }}
      />
      <FitBounds latLngs={latLngs} />
      <Polyline
        positions={latLngs}
        pathOptions={{ color: '#f28a24', weight: 3, dashArray: '6 8', opacity: 0.4 }}
      />
      <Polyline
        ref={traveledRef}
        positions={[latLngs[0]]}
        pathOptions={{ color: '#f28a24', weight: 4, opacity: 1 }}
      />
      <Marker position={latLngs[0]} icon={originIcon} interactive={false} />
      <Marker
        position={latLngs[latLngs.length - 1]}
        icon={destinationIcon}
        interactive={false}
      />
      <Marker
        ref={markerRef}
        position={latLngs[0]}
        icon={truckIcon}
        zIndexOffset={1000}
        interactive={false}
      />
    </MapContainer>
  );
}
```

- [ ] **Step 2: Create the landing hero**

Create `components/landing/hero.tsx`:

```tsx
'use client';

import { useState } from 'react';
import RouteMap, { type DemoStatus, type RouteData } from '@/components/map/route-map';
import routeJson from '@/lib/route-data/london-birmingham.json';
import { TrackingSearch } from '@/components/tracking-search';

const routeData = routeJson as unknown as RouteData;
const LOOP_MS = 60_000;

function statusText(status: DemoStatus) {
  if (status.phase === 'delivered') {
    return `Delivered to ${routeData.destinationName} · restarting demo`;
  }
  if (status.phase === 'static') {
    return 'Demo paused · reduced motion is on';
  }
  return `In transit · ${Math.round(status.kmRemaining)} km to ${routeData.destinationName} · ${Math.floor(status.percent)}% of route`;
}

export default function LandingHero() {
  const [status, setStatus] = useState<DemoStatus>({
    phase: 'running',
    kmRemaining: routeData.distanceMeters / 1000,
    percent: 0,
  });

  return (
    <section className="relative h-[75dvh] min-h-[560px]">
      <div className="absolute inset-0 isolate z-0">
        <RouteMap
          source={{ kind: 'demo', routeData, loopMs: LOOP_MS, onStatus: setStatus }}
        />
      </div>
      <div className="lt-map-scrim" aria-hidden="true" />
      <div className="relative z-[2] mx-auto flex h-full w-full max-w-[1440px] items-end justify-start px-3 pb-3 md:items-center md:px-5 md:pb-0 lg:px-6">
        <div id="track-shipment" className="lt-map-panel scroll-mt-24">
          <p className="lt-status-chip">
            <span className="lt-status-dot" aria-hidden="true" />
            Live demo · engine running
          </p>
          <h1 className="lt-display">Watch freight move, door to door.</h1>
          <p className="lt-lede">
            LiveTrack simulates dispatch, GPS telemetry, and live maps. Follow a delivery
            from depot to doorstep.
          </p>
          <TrackingSearch />
          <p className="lt-status-line" data-testid="demo-status">
            {statusText(status)}
          </p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Wire the hero into the page (interim)**

Replace the entire content of `app/page.tsx` with:

```tsx
import PublicHeader from '@/components/public-header';
import LandingHero from '@/components/landing/hero';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-page)] font-sans text-[var(--color-text)]">
      <PublicHeader />
      <main className="grow flex flex-col">
        <LandingHero />
      </main>
      <footer className="lt-footer">
        <p>
          © 2026 LiveTrack logistics simulator. For demonstration and portfolio purposes
          only.
        </p>
      </footer>
    </div>
  );
}
```

- [ ] **Step 4: Add the supporting CSS**

Append to `app/globals.css` (inside the file, after the existing `.livetrack-endpoint--destination` block and before the `@media (prefers-reduced-motion: reduce)` block):

```css
/* Landing route map */
.lt-map-scrim {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--color-graphite-950) 72%, transparent) 0%,
    transparent 45%
  );
}

.lt-map-panel {
  width: min(440px, calc(100% - 1rem));
  padding: var(--space-6);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-panel);
  background: color-mix(in srgb, var(--color-graphite-950) 86%, transparent);
}

.lt-status-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  padding: var(--space-1) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  color: var(--color-text-subtle);
  font-size: 0.75rem;
  font-weight: 500;
}

.lt-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: var(--color-success);
  animation: lt-dot-pulse 2s ease-out infinite;
}

@keyframes lt-dot-pulse {
  0% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-success) 60%, transparent);
  }
  100% {
    box-shadow: 0 0 0 6px transparent;
  }
}

.lt-display {
  margin-bottom: var(--space-4);
  font-family: var(--font-outfit);
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: -0.04em;
  color: var(--color-text);
  text-wrap: balance;
}

.lt-lede {
  margin-bottom: var(--space-6);
  max-width: 36ch;
  color: var(--color-text-subtle);
  font-size: 1rem;
  line-height: 1.5;
}

.lt-status-line {
  margin-top: var(--space-4);
  color: var(--color-text-muted);
  font-size: 0.875rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.leaflet-container .leaflet-control-attribution {
  background: color-mix(in srgb, var(--color-graphite-950) 75%, transparent);
  color: var(--color-text-subtle);
  font-size: 10px;
}

.leaflet-container .leaflet-control-attribution a {
  color: var(--color-text-muted);
}

.livetrack-marker--route {
  color: var(--color-accent);
}

.livetrack-marker--route svg {
  width: 26px;
  height: 26px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4));
  transition: transform 150ms linear;
  will-change: transform;
}

.livetrack-marker--route::before {
  background: color-mix(in srgb, var(--color-accent) 35%, transparent);
}

.lt-footer {
  border-top: 1px solid var(--color-border);
  padding: var(--space-8) var(--space-4);
  text-align: center;
  color: var(--color-text-subtle);
  font-size: 0.75rem;
}

@media (max-width: 767px) {
  .lt-map-scrim {
    background: linear-gradient(
      0deg,
      color-mix(in srgb, var(--color-graphite-950) 78%, transparent) 0%,
      transparent 55%
    );
  }

  .lt-map-panel {
    width: auto;
  }
}
```

so the panel docks to the bottom of the map on mobile and centers vertically from `md` up. (This class is already in the Step 2 code; no later edit needed.)

- [ ] **Step 5: Verify in the browser**

Ensure the dev server is running (`curl -s -o /dev/null -w "%{http_code}" http://localhost:3001` returns 200; if not, start it in the background with `npm run dev` on port 3001 and wait for readiness).

Then run this one-off check:

```bash
node --input-type=module -e "
import { launchCleanBrowser, createCleanPage, gotoFresh } from '/home/redmane/.agents/playwright-core/clean-context.mjs';
const browser = await launchCleanBrowser();
const { page } = await createCleanPage(browser);
await gotoFresh(page, 'http://localhost:3001');
await page.waitForSelector('.livetrack-marker--route', { timeout: 30000 });
const t0 = await page.\$eval('.livetrack-marker-wrapper', (el) => el.style.transform ?? el.getAttribute('style'));
await page.waitForTimeout(5000);
const t1 = await page.\$eval('.livetrack-marker-wrapper', (el) => el.style.transform ?? el.getAttribute('style'));
const tiles = await page.\$\$('img.leaflet-tile');
console.log('marker moved:', t0 !== t1, '| tile elements:', tiles.length);
await browser.close();
"
```

Expected: `marker moved: true | tile elements:` a number greater than 0.

- [ ] **Step 6: Run lint and typecheck**

Run: `npm run lint` then `npx tsc --noEmit`
Expected: no new errors (pre-existing warnings acceptable; zero errors).

- [ ] **Step 7: Commit**

```bash
git add components/map/route-map.tsx components/landing/hero.tsx app/page.tsx app/globals.css
git commit -m "feat: add shared route map and landing hero"
```

---

### Task 4: Tracking Search State Machine

**Files:**
- Modify: `components/tracking-search.tsx` (full rework)
- Modify: `app/globals.css` (append form classes)

**Interfaces:**
- Consumes: `supabase` browser client from `@/lib/supabase` (existing); `useRouter` from `next/navigation`.
- Produces: same named export `TrackingSearch` with identical usage (`<TrackingSearch />`), so Task 3's hero needs no change.

- [ ] **Step 1: Rework the component**

Replace the entire content of `components/tracking-search.tsx` with:

```tsx
'use client';

import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const TRACKING_PATTERN = /^LTK-[A-Z0-9]{9}$/;

const EMPTY_ERROR =
  'Enter a tracking number to search. Tracking numbers look like LTK-A1B2C3D4E.';
const FORMAT_ERROR =
  'That number does not match the tracking format. Tracking numbers look like LTK-A1B2C3D4E. Check the number and try again.';
const NOT_FOUND_ERROR =
  'No shipment was found for that tracking number. The number may be mistyped, or the shipment was removed. Try one of the live demo shipments below.';
const NETWORK_ERROR =
  'The tracking service could not be reached. Check the connection and try again.';

type SubmitStatus = 'idle' | 'submitting' | 'not-found' | 'error';

export function TrackingSearch() {
  const [value, setValue] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const router = useRouter();
  const inputId = useId();
  const errorId = useId();

  const submitting = submitStatus === 'submitting';
  const message = fieldError ?? (submitStatus === 'not-found'
    ? NOT_FOUND_ERROR
    : submitStatus === 'error'
      ? NETWORK_ERROR
      : null);

  const normalize = (raw: string) => raw.trim().toUpperCase();

  const handleBlur = () => {
    if (value.trim() === '') return;
    setFieldError(TRACKING_PATTERN.test(normalize(value)) ? null : FORMAT_ERROR);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    if (fieldError) setFieldError(null);
    if (submitStatus !== 'idle') setSubmitStatus('idle');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    const candidate = normalize(value);
    if (candidate === '') {
      setFieldError(EMPTY_ERROR);
      return;
    }
    if (!TRACKING_PATTERN.test(candidate)) {
      setFieldError(FORMAT_ERROR);
      return;
    }
    setFieldError(null);
    setSubmitStatus('submitting');
    const { data, error } = await supabase
      .from('shipments')
      .select('tracking_number')
      .eq('tracking_number', candidate)
      .maybeSingle();
    if (error) {
      setSubmitStatus('error');
      return;
    }
    if (!data) {
      setSubmitStatus('not-found');
      return;
    }
    router.push(`/tracking/${candidate}`);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="lt-search">
      <label htmlFor={inputId} className="lt-search-label">
        Tracking number
      </label>
      <div className="lt-search-row">
        <div className="lt-search-field">
          <Search aria-hidden="true" className="lt-search-icon" />
          <input
            id={inputId}
            type="text"
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="LTK-A1B2C3D4E"
            autoComplete="off"
            spellCheck={false}
            className="lt-search-input"
            aria-invalid={message ? true : undefined}
            aria-describedby={message ? errorId : undefined}
          />
        </div>
        <button
          type="submit"
          className="lt-primary-action lt-search-submit"
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? <span className="lt-spinner" aria-hidden="true" /> : null}
          <span>{submitting ? 'Checking…' : 'Track shipment'}</span>
        </button>
      </div>
      {message ? (
        <p id={errorId} className="lt-form-error" role="alert">
          {message}
        </p>
      ) : null}
    </form>
  );
}
```

- [ ] **Step 2: Append the form CSS**

Append to `app/globals.css` (before the `@media (prefers-reduced-motion: reduce)` block):

```css
/* Tracking search */
.lt-search {
  display: grid;
  gap: var(--space-2);
}

.lt-search-label {
  color: var(--color-text-muted);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.lt-search-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.lt-search-field {
  position: relative;
  flex: 1 1 200px;
}

.lt-search-icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  width: 16px;
  height: 16px;
  transform: translateY(-50%);
  color: var(--color-text-placeholder);
  pointer-events: none;
}

.lt-search-input {
  width: 100%;
  min-height: 44px;
  padding: 0 var(--space-4) 0 var(--space-9);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  background: var(--color-surface-raised);
  color: var(--color-text);
  font-size: 0.9375rem;
  font-variant-numeric: tabular-nums;
}

.lt-search-input::placeholder {
  color: var(--color-text-placeholder);
}

.lt-search-input:focus {
  outline: 2px solid var(--color-focus);
  outline-offset: 1px;
  border-color: var(--color-border-strong);
}

.lt-search-input[aria-invalid='true'] {
  border-color: var(--color-danger);
}

.lt-search-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: 0 var(--space-4);
  font-size: 0.875rem;
}

.lt-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid color-mix(in srgb, var(--color-graphite-950) 35%, transparent);
  border-top-color: var(--color-graphite-950);
  border-radius: 9999px;
  animation: lt-spin 0.8s linear infinite;
}

@keyframes lt-spin {
  to {
    transform: rotate(360deg);
  }
}

.lt-form-error {
  color: var(--color-danger);
  font-size: 0.8125rem;
  line-height: 1.45;
}
```

- [ ] **Step 3: Verify the form states in the browser**

With the dev server running:

```bash
node --input-type=module -e "
import { launchCleanBrowser, createCleanPage, gotoFresh } from '/home/redmane/.agents/playwright-core/clean-context.mjs';
const browser = await launchCleanBrowser();
const { page } = await createCleanPage(browser);
await gotoFresh(page, 'http://localhost:3001');
await page.waitForSelector('.lt-search-input', { timeout: 30000 });
await page.click('.lt-search-submit');
const emptyError = await page.waitForSelector('.lt-form-error', { timeout: 5000 });
console.log('empty error shown:', !!emptyError);
await page.fill('.lt-search-input', 'abc');
await page.evaluate(() => document.activeElement?.blur());
const formatError = await page.waitForSelector('.lt-form-error', { timeout: 5000 });
console.log('format error shown:', !!formatError);
await page.fill('.lt-search-input', 'LTK-ZZZZZZZZZ');
await page.evaluate(() => document.activeElement?.blur());
const cleared = await page.\$('.lt-form-error');
console.log('format error cleared on change:', cleared === null);
await page.click('.lt-search-submit');
const notFound = await page.waitForFunction(
  () => document.querySelector('.lt-form-error')?.textContent.includes('No shipment was found'),
  null,
  { timeout: 15000 }
);
console.log('not-found error shown:', !!notFound);
const button = await page.\$eval('.lt-search-submit', (el) => ({ disabled: el.disabled, busy: el.getAttribute('aria-busy') }));
console.log('button re-enabled after error:', button.disabled === false, '| aria-busy reset:', button.busy !== 'true');
await browser.close();
"
```

Expected: `empty error shown: true`, `format error shown: true`, `format error cleared on change: true`, `not-found error shown: true`, `button re-enabled after error: true true`.

- [ ] **Step 4: Run lint and typecheck**

Run: `npm run lint` then `npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step 5: Commit**

```bash
git add components/tracking-search.tsx app/globals.css
git commit -m "feat: rework tracking search with state machine"
```

---

### Task 5: Page Assembly And Demo Banner Removal

**Files:**
- Modify: `app/page.tsx` (full sections)
- Modify: `components/public-header.tsx` (borderless sticky, add How it works link)
- Modify: `app/layout.tsx` (remove DemoBanner)
- Delete: `components/demo-banner.tsx`
- Modify: `app/globals.css` (append section and chip classes)

**Interfaces:**
- Consumes: `LandingHero` (Task 3), `TrackingSearch` (Task 4), `createSupabaseServiceClient` from `@/lib/supabase-server` (existing), `NavItem` from `@/components/mobile-nav` (existing).
- Produces: final landing page; nothing downstream consumes these files in slice 1.

- [ ] **Step 1: Rebuild the page with all sections**

Replace the entire content of `app/page.tsx` with:

```tsx
import { createSupabaseServiceClient } from '@/lib/supabase-server';
import PublicHeader from '@/components/public-header';
import LandingHero from '@/components/landing/hero';

export const revalidate = 30;

interface DemoShipment {
  tracking_number: string;
  status: string;
}

async function getDemoShipments(): Promise<DemoShipment[]> {
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase
    .from('shipments')
    .select('tracking_number, status')
    .order('created_at', { ascending: false })
    .limit(4);
  return (data as DemoShipment[] | null) ?? [];
}

function statusVariant(status: string) {
  if (status === 'in_transit') return { label: 'In transit', variant: 'live' };
  if (status === 'delayed') return { label: 'Delayed', variant: 'delayed' };
  return { label: 'Delivered', variant: 'done' };
}

export default async function Home() {
  const shipments = await getDemoShipments();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-page)] font-sans text-[var(--color-text)]">
      <PublicHeader />
      <main className="grow flex flex-col">
        <LandingHero />

        <section id="how-it-works" className="lt-section scroll-mt-20">
          <div className="lt-section-inner">
            <h2 className="lt-section-title">How it works</h2>
            <ol className="lt-stops">
              <li className="lt-stop">
                <h3>Dispatch</h3>
                <p>A shipper books the load.</p>
              </li>
              <li className="lt-stop">
                <h3>Transit</h3>
                <p>The engine streams GPS, speed, and heading.</p>
              </li>
              <li className="lt-stop">
                <h3>Delivery</h3>
                <p>The recipient follows every mile, no account needed.</p>
              </li>
            </ol>
          </div>
        </section>

        <section id="try-shipment" className="lt-section lt-section--raised scroll-mt-20">
          <div className="lt-section-inner">
            <h2 className="lt-section-title">Try a live shipment</h2>
            <p className="lt-section-lede">
              Real shipments from the demo engine. Open one to follow its route.
            </p>
            <ul className="lt-chip-row">
              {shipments.map((shipment) => {
                const { label, variant } = statusVariant(shipment.status);
                return (
                  <li key={shipment.tracking_number}>
                    <a
                      href={`/tracking/${shipment.tracking_number}`}
                      className="lt-route-chip"
                    >
                      <span className="lt-chip-code">{shipment.tracking_number}</span>
                      <span className={`lt-chip-status lt-chip-status--${variant}`}>
                        <span className="lt-status-dot" aria-hidden="true" />
                        {label}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      </main>

      <footer className="lt-footer">
        <p>
          © 2026 LiveTrack logistics simulator. For demonstration and portfolio purposes
          only. Location and carrier data are simulated.
        </p>
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: Restyle the public header**

In `components/public-header.tsx`, make two changes.

Change the nav items (replace the `trackShipmentItem` const and both `primaryItems` assignments):

```tsx
const trackShipmentItem: NavItem = { label: 'Track shipment', href: '/#track-shipment' };
const howItWorksItem: NavItem = { label: 'How it works', href: '/#how-it-works' };

function PublicHeaderInner() {
  const { isSignedIn } = useAuth();
  const pathname = usePathname();

  const primaryItems: NavItem[] = isSignedIn
    ? [trackShipmentItem, howItWorksItem, { label: 'Dashboard', href: '/onboard' }]
    : [trackShipmentItem, howItWorksItem];
```

Change the header element classes from:

```tsx
    <header className="relative sticky top-0 z-[var(--layer-sticky)] border-b border-[var(--color-border)] bg-[var(--color-page)]">
```

to:

```tsx
    <header className="relative sticky top-0 z-[var(--layer-sticky)] bg-[var(--color-page)]">
```

- [ ] **Step 3: Remove the DemoBanner**

In `app/layout.tsx`, delete the import line:

```tsx
import DemoBanner from "@/components/demo-banner";
```

and delete the render line inside `<main>`:

```tsx
            <DemoBanner />
```

Then delete the file:

```bash
git rm components/demo-banner.tsx
```

- [ ] **Step 4: Append the section CSS**

Append to `app/globals.css` (before the `@media (prefers-reduced-motion: reduce)` block):

```css
/* Landing sections */
.lt-section {
  padding: var(--space-16) var(--space-4);
}

.lt-section--raised {
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.lt-section-inner {
  max-width: 1440px;
  margin: 0 auto;
}

.lt-section-title {
  margin-bottom: var(--space-8);
  font-family: var(--font-outfit);
  font-size: 1.875rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.lt-section-lede {
  margin-bottom: var(--space-6);
  max-width: 52ch;
  color: var(--color-text-subtle);
}

.lt-stops {
  position: relative;
  margin-left: 7px;
  border-left: 2px solid var(--color-border);
  display: grid;
  gap: var(--space-8);
  padding-left: var(--space-6);
  max-width: 560px;
  list-style: none;
}

.lt-stop {
  position: relative;
}

.lt-stop::before {
  content: "";
  position: absolute;
  left: calc(-1 * var(--space-6) - 8px);
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 9999px;
  background: var(--color-surface-raised);
  border: 2px solid var(--color-accent);
}

.lt-stop h3 {
  margin-bottom: var(--space-1);
  font-size: 1.125rem;
  font-weight: 600;
}

.lt-stop p {
  color: var(--color-text-subtle);
  font-size: 0.9375rem;
}

.lt-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  list-style: none;
}

.lt-route-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-4);
  min-height: 44px;
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  background: var(--color-surface-raised);
  transition: background-color 150ms ease-out, border-color 150ms ease-out;
}

.lt-route-chip:hover {
  border-color: var(--color-border-strong);
  background: var(--color-surface-hover);
}

.lt-chip-code {
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

.lt-chip-status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.75rem;
  font-weight: 500;
}

.lt-chip-status--live {
  color: var(--color-success);
}

.lt-chip-status--delayed {
  color: var(--color-warning);
}

.lt-chip-status--delayed .lt-status-dot {
  background: var(--color-warning);
}

.lt-chip-status--done {
  color: var(--color-text-subtle);
}

.lt-chip-status--done .lt-status-dot {
  background: var(--color-text-placeholder);
  animation: none;
}
```

- [ ] **Step 5: Verify structure in the browser**

```bash
node --input-type=module -e "
import { launchCleanBrowser, createCleanPage, gotoFresh } from '/home/redmane/.agents/playwright-core/clean-context.mjs';
const browser = await launchCleanBrowser();
const { page } = await createCleanPage(browser);
await gotoFresh(page, 'http://localhost:3001');
await page.waitForSelector('.lt-route-chip', { timeout: 30000 });
const chips = await page.\$\$('.lt-route-chip');
const bannerGone = await page.evaluate(() => !document.body.innerText.includes('Location data and carrier events are simulated'));
const emojiGone = await page.evaluate(() => !document.body.innerText.includes('🎯'));
const stops = await page.\$\$('.lt-stop');
const howLink = await page.\$('a[href=\"/#how-it-works\"]');
console.log('chips:', chips.length, '| banner removed:', bannerGone, '| emoji pill removed:', emojiGone, '| stops:', stops.length, '| how-it-works nav link:', !!howLink);
await browser.close();
"
```

Expected: `chips: 4 | banner removed: true | emoji pill removed: true | stops: 3 | how-it-works nav link: true`.

- [ ] **Step 6: Run lint and typecheck**

Run: `npm run lint` then `npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx components/public-header.tsx app/layout.tsx app/globals.css
git commit -m "feat: rebuild landing page sections and remove demo banner"
```

---

### Task 6: Final Verification

**Files:**
- Create: `/tmp/opencode/landing-audit.mjs` (scratch, not committed)

**Interfaces:**
- Consumes: the finished landing page at `http://localhost:3001`.

- [ ] **Step 1: Write the full audit script**

Create `/tmp/opencode/landing-audit.mjs`:

```js
import { launchCleanBrowser, createCleanPage, gotoFresh } from '/home/redmane/.agents/playwright-core/clean-context.mjs';

const BASE = 'http://localhost:3001';
const results = [];
const check = (name, condition) => {
  results.push({ name, pass: Boolean(condition) });
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}`);
};

const browser = await launchCleanBrowser();

const { page } = await createCleanPage(browser, { width: 1440, height: 900 });
await gotoFresh(page, BASE);
await page.waitForSelector('.livetrack-marker--route', { timeout: 45000 });

check('h1 copy', (await page.textContent('h1'))?.trim() === 'Watch freight move, door to door.');
check('green tiles loaded', (await page.$$eval('img.leaflet-tile', (tiles) => tiles.filter((t) => t.naturalWidth > 0).length)) > 0);
check('opentopomap attribution', (await page.getAttribute('.leaflet-control-attribution a[href*="opentopomap"], .leaflet-control-attribution a[href*="esri"]', 'href')) !== null);
check('route polylines exist', (await page.$$('path[stroke="#f28a24"]')).length >= 2);

const markerStyle = () => page.$eval('.livetrack-marker-wrapper:has(.livetrack-marker--route)', (el) => el.style.transform);
const t0 = await markerStyle();
await page.waitForTimeout(5000);
const t1 = await markerStyle();
check('truck marker moves', t0 !== t1);

const s0 = await page.textContent('[data-testid="demo-status"]');
await page.waitForTimeout(3000);
const s1 = await page.textContent('[data-testid="demo-status"]');
check('status line updates', s0 !== s1);

check('demo banner absent', !(await page.evaluate(() => document.body.innerText.includes('Location data and carrier events are simulated'))));
check('emoji pill absent', !(await page.evaluate(() => document.body.innerText.includes('🎯'))));

await page.click('.lt-search-submit');
check('empty submit error', (await page.waitForSelector('.lt-form-error', { timeout: 5000 })) !== null);

await page.fill('.lt-search-input', 'abc');
await page.evaluate(() => document.activeElement?.blur());
check('blur format error', (await page.waitForFunction(() => document.querySelector('.lt-form-error')?.textContent.includes('tracking format'), null, { timeout: 5000 })) !== null);

await page.fill('.lt-search-input', 'LTK-ZZZZZZZZZ');
await page.click('.lt-search-submit');
check('not-found error', (await page.waitForFunction(() => document.querySelector('.lt-form-error')?.textContent.includes('No shipment was found'), null, { timeout: 15000 })) !== null);

await page.fill('.lt-search-input', 'LTK-6RTQUQHS7');
await page.click('.lt-search-submit');
await page.waitForURL('**/tracking/LTK-6RTQUQHS7', { timeout: 15000 });
check('valid number navigates to tracking', page.url().includes('/tracking/LTK-6RTQUQHS7'));

const mobile = await createCleanPage(browser, { width: 375, height: 667 });
await gotoFresh(mobile.page, BASE);
await mobile.page.waitForSelector('.lt-search-input', { timeout: 45000 });
const inputBox = await mobile.page.$eval('.lt-search-input', (el) => {
  const r = el.getBoundingClientRect();
  return { top: r.top, bottom: r.bottom, vh: window.innerHeight };
});
check('375px input visible without scroll', inputBox.top >= 0 && inputBox.bottom <= inputBox.vh);
await mobile.context.close();

const reduced = await createCleanPage(browser, { width: 1440, height: 900 });
await reduced.page.emulateMedia({ reducedMotion: 'reduce' });
await gotoFresh(reduced.page, BASE);
await reduced.page.waitForSelector('.livetrack-marker--route', { timeout: 45000 });
const r0 = await reduced.page.$eval('.livetrack-marker--route svg', (el) => el.style.transform);
await reduced.page.waitForTimeout(2500);
const r1 = await reduced.page.$eval('.livetrack-marker--route svg', (el) => el.style.transform);
check('reduced motion: static truck', r0 === r1);
check('reduced motion: route drawn', (await reduced.page.$$('path[stroke="#f28a24"]')).length >= 1);
check('reduced motion: status says paused', (await reduced.page.textContent('[data-testid="demo-status"]'))?.includes('reduced motion'));
await reduced.context.close();

const focus = await createCleanPage(browser, { width: 1440, height: 900 });
await gotoFresh(focus.page, BASE);
await focus.page.waitForSelector('.lt-search-input', { timeout: 45000 });
await focus.page.focus('.lt-search-input');
const outline = await focus.page.$eval('.lt-search-input', (el) => getComputedStyle(el).outlineStyle);
check('input focus outline visible', outline !== 'none');
await focus.context.close();

await page.keyboard.press('Tab');
const firstTabStop = await page.evaluate(() => document.activeElement?.tagName ?? '');
check('keyboard navigation active', typeof firstTabStop === 'string' && firstTabStop.length > 0);

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length > 0) {
  process.exit(1);
}
```

- [ ] **Step 2: Run the audit**

Run: `node /tmp/opencode/landing-audit.mjs`
Expected: all checks print PASS, final line `18/18 checks passed` (count may differ by one if the tab-stop check is counted differently; all named checks must PASS).

- [ ] **Step 3: Take review screenshots**

```bash
node --input-type=module -e "
import { launchCleanBrowser, createCleanPage, gotoFresh } from '/home/redmane/.agents/playwright-core/clean-context.mjs';
const browser = await launchCleanBrowser();
for (const vp of [{ width: 375, height: 667 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }]) {
  const { page, context } = await createCleanPage(browser, vp);
  await gotoFresh(page, 'http://localhost:3001');
  await page.waitForSelector('.livetrack-marker--route', { timeout: 45000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/tmp/opencode/landing-' + vp.width + '.png', fullPage: true });
  await context.close();
}
await browser.close();
console.log('screenshots saved');
"
```

Review `/tmp/opencode/landing-375.png`, `landing-768.png`, `landing-1440.png` yourself before reporting completion.

- [ ] **Step 4: Run the gates**

Run: `npm run lint` then `npx tsc --noEmit` then `npm run build`
Expected: lint zero errors (pre-existing warnings acceptable), typecheck clean, build succeeds.

- [ ] **Step 5: Fix and re-run if any check fails**

If any audit check fails, diagnose the root cause, fix the component (not the check, unless the check itself is wrong), re-run the full audit until all checks pass, and commit the fix:

```bash
git add app components lib
git commit -m "fix: landing audit findings"
```

Only commit when a fix was actually needed.

- [ ] **Step 6: Report**

Report to Victor with: final audit score, gate results, screenshot paths, files changed, and any deviations from the plan. Do not claim success without fresh evidence.
