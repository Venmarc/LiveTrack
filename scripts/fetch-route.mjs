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
