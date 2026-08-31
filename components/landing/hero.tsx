'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { DemoStatus, RouteData } from '@/components/map/route-map';
import routeJson from '@/lib/route-data/london-birmingham.json';
import { TrackingSearch } from '@/components/tracking-search';

const RouteMap = dynamic(() => import('@/components/map/route-map'), {
  ssr: false,
});

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
