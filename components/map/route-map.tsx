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

interface RouteGeometry {
  points: { lat: number; lng: number }[];
  totalDistanceMeters: number;
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
  const route = useMemo(
    () => createRoute(routeData.points) as RouteGeometry,
    [routeData]
  );
  const latLngs = useMemo(
    () => route.points.map((p) => [p.lat, p.lng] as [number, number]),
    [route]
  );
  const initialTraveled = useMemo(() => [latLngs[0]], [latLngs]);
  const markerRef = useRef<L.Marker | null>(null);
  const traveledRef = useRef<L.Polyline | null>(null);
  const statusCbRef = useRef(onStatus);
  const tileErrors = useRef(0);
  const [tiles, setTiles] = useState(TOPO_TILES);

  useEffect(() => {
    statusCbRef.current = onStatus;
  });

  useEffect(() => {
    let svg: SVGElement | null = null;
    let displayAngle = 0;

    const applyPosition = (marker: L.Marker, distance: number) => {
      const p = positionAtDistance(route, distance);
      marker.setLatLng([p.lat, p.lng]);
      const delta = ((p.bearing - displayAngle + 540) % 360) - 180;
      displayAngle += delta;
      if (!svg) {
        svg = marker.getElement()?.querySelector<SVGElement>('.livetrack-marker svg') ?? null;
      }
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

    let raf = 0;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      const distance = route.totalDistanceMeters * STATIC_PROGRESS;
      const place = () => {
        const marker = markerRef.current;
        if (!marker) {
          raf = requestAnimationFrame(place);
          return;
        }
        const p = applyPosition(marker, distance);
        updateTraveled({ ...p, index: route.points.length - 1 });
        emit('static', distance);
      };
      raf = requestAnimationFrame(place);
      return () => cancelAnimationFrame(raf);
    }

    const start = performance.now();
    let lastTraveledAt = 0;
    let lastEmitAt = 0;
    let lastPhase: DemoStatus['phase'] = 'running';

    const tick = (now: number) => {
      const marker = markerRef.current;
      if (!marker) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const cycle = loopMs + DELIVERED_PAUSE_MS;
      const t = (now - start) % cycle;
      const phase: DemoStatus['phase'] = t < loopMs ? 'running' : 'delivered';
      const distance =
        phase === 'running'
          ? (t / loopMs) * route.totalDistanceMeters
          : route.totalDistanceMeters;
      const p = applyPosition(marker, distance);
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
        positions={initialTraveled}
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
