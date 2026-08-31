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
