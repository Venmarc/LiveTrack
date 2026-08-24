'use client';

import { useEffect, useRef, useCallback } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type ShipmentLocationRow = Database['public']['Tables']['shipment_locations']['Row'];

export interface MapPoint {
  lat: number;
  lng: number;
}

interface LiveMapProps {
  shipmentId: string;
  origin: MapPoint;
  destination: MapPoint;
  initialPosition: MapPoint;
  status: string;
  onPositionChange?: (position: MapPoint, speedKmh: number, status: string | null) => void;
}

const truckIcon = L.divIcon({
  className: 'livetrack-marker-wrapper',
  html: `
    <div class="livetrack-marker">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2a3 3 0 0 0 6 0h6a3 3 0 0 0 6 0h2v-5l-3-4zM6 18.5A1.5 1.5 0 1 1 7.5 17 1.5 1.5 0 0 1 6 18.5zm12 0A1.5 1.5 0 1 1 19.5 17 1.5 1.5 0 0 1 18 18.5zM20 8l2.5 3.5H17V8z"/>
      </svg>
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -18],
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

function FitBounds({ origin, destination }: { origin: MapPoint; destination: MapPoint }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(
      [
        [origin.lat, origin.lng],
        [destination.lat, destination.lng],
      ],
      { padding: [50, 50], animate: false }
    );
  }, [map, origin, destination]);
  return null;
}

export default function LiveMap({
  shipmentId,
  origin,
  destination,
  initialPosition,
  status,
  onPositionChange,
}: LiveMapProps) {
  const markerRef = useRef<L.Marker | null>(null);
  const targetRef = useRef<L.LatLng | null>(null);
  const rafRef = useRef<number | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const positionCbRef = useRef(onPositionChange);
  const statusRef = useRef(status);
  const initialRef = useRef<L.LatLng>(L.latLng(initialPosition.lat, initialPosition.lng));
  const targetRefRef = useRef<{ lat: number; lng: number }>({
    lat: initialPosition.lat,
    lng: initialPosition.lng,
  });

  positionCbRef.current = onPositionChange;
  statusRef.current = status;

  const stopAnimation = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const animateStep = useCallback(() => {
    const marker = markerRef.current;
    const target = targetRef.current;
    if (!marker || !target) {
      rafRef.current = null;
      return;
    }

    const current = marker.getLatLng();
    const distance = current.distanceTo(target);

    // Snap when within a metre so the marker lands exactly on the broadcast point.
    if (distance < 1) {
      marker.setLatLng(target);
      rafRef.current = null;
      return;
    }

    // Exponential ease-out: move a fixed fraction of the remaining distance per frame.
    const next = current.toBounds(distance * 0.12).getCenter();
    marker.setLatLng(next);
    rafRef.current = requestAnimationFrame(animateStep);
  }, []);

  const ensureAnimation = useCallback(() => {
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(animateStep);
    }
  }, [animateStep]);

  // Realtime subscription to shipment_locations INSERTs.
  useEffect(() => {
    const channel = supabase
      .channel(`live-map-${shipmentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'shipment_locations',
          filter: `shipment_id=eq.${shipmentId}`,
        },
        (payload) => {
          const row = payload.new as ShipmentLocationRow;
          const position = { lat: Number(row.latitude), lng: Number(row.longitude) };
          targetRef.current = L.latLng(position.lat, position.lng);
          targetRefRef.current = position;
          positionCbRef.current?.(position, Number(row.speed_kmh ?? 0), row.status ?? null);
          ensureAnimation();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shipmentId, ensureAnimation]);

  // Polling fallback so the marker still moves if Realtime is unavailable
  // (e.g. a long-running serverless process was killed mid-route).
  useEffect(() => {
    if (status !== 'in_transit' && status !== 'delayed') return;

    const fetchLatest = async () => {
      try {
        const { data } = await supabase
          .from('shipment_locations')
          .select('latitude, longitude, speed_kmh, status')
          .eq('shipment_id', shipmentId)
          .order('timestamp', { ascending: false })
          .limit(1)
          .single();
        if (data) {
          const position = { lat: Number(data.latitude), lng: Number(data.longitude) };
          targetRef.current = L.latLng(position.lat, position.lng);
          targetRefRef.current = position;
          positionCbRef.current?.(position, Number(data.speed_kmh ?? 0), data.status ?? null);
          ensureAnimation();
        }
      } catch {
        // Ignore transient network failures; the next poll retries.
      }
    };

    pollRef.current = setInterval(fetchLatest, 8000);
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [shipmentId, status, ensureAnimation]);

  // Stop the animation loop on unmount (no memory leaks).
  useEffect(() => stopAnimation, [stopAnimation]);

  const routeLine: [number, number][] = [
    [origin.lat, origin.lng],
    [destination.lat, destination.lng],
  ];

  return (
    <MapContainer
      center={[initialPosition.lat, initialPosition.lng]}
      zoom={7}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <FitBounds origin={origin} destination={destination} />
      <Polyline positions={routeLine} pathOptions={{ color: '#3b82f6', weight: 3, dashArray: '8 8', opacity: 0.7 }} />
      <Marker position={[origin.lat, origin.lng]} icon={originIcon} interactive={false} />
      <Marker position={[destination.lat, destination.lng]} icon={destinationIcon} interactive={false} />
      <Marker
        ref={(marker) => {
          markerRef.current = marker;
          if (marker) {
            marker.setLatLng(initialRef.current);
          }
        }}
        position={[initialPosition.lat, initialPosition.lng]}
        icon={truckIcon}
        zIndexOffset={1000}
      >
        <Popup>
          <span className="text-xs font-semibold text-zinc-900">
            {statusRef.current === 'delivered' ? 'Delivered' : 'Live position'}
          </span>
        </Popup>
      </Marker>
    </MapContainer>
  );
}