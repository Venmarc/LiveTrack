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
