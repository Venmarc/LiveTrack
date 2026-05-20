import { Shipment, ShipmentLocation, ShipmentEvent } from './schemas';

export const MOCK_CITIES = [
  { address: 'London Port Logistics', city: 'London', lat: 51.5074, lng: -0.1278 },
  { address: 'Birmingham Distribution Hub', city: 'Birmingham', lat: 52.4862, lng: -1.8904 },
  { address: 'Manchester Cargo Center', city: 'Manchester', lat: 53.4808, lng: -2.2426 },
  { address: 'Bristol Freight Depot', city: 'Bristol', lat: 51.4545, lng: -2.5879 },
  { address: 'Southampton Container Port', city: 'Southampton', lat: 50.9097, lng: -1.4044 },
  { address: 'Liverpool Cargo Terminal', city: 'Liverpool', lat: 53.4084, lng: -2.9916 }
];

export function generateTrackingNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 9; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `LTK-${result}`;
}

export function getInterpolatedPoints(
  origin: { lat: number; lng: number },
  dest: { lat: number; lng: number },
  steps: number
) {
  const points = [];
  for (let i = 1; i <= steps; i++) {
    const t = i / (steps + 1);
    const lat = origin.lat + (dest.lat - origin.lat) * t;
    const lng = origin.lng + (dest.lng - origin.lng) * t;
    points.push({ lat, lng });
  }
  return points;
}

export interface GeneratedMockData {
  shipments: Omit<Shipment, 'id'>[];
  locations: Omit<ShipmentLocation, 'id' | 'shipment_id'>[][];
  events: Omit<ShipmentEvent, 'id' | 'shipment_id'>[][];
}

export function generateMockShipmentsForUser(userId: string): GeneratedMockData {
  const now = new Date();

  // Helper to get time relative to now
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();
  const hoursAhead = (h: number) => new Date(now.getTime() + h * 60 * 60 * 1000).toISOString();

  // Define 5 different mock shipments:
  
  // 1. Pending Shipment (No driver assigned, no locations, 1 event)
  const shipment1: Omit<Shipment, 'id'> = {
    tracking_number: generateTrackingNumber(),
    shipper_id: userId,
    driver_id: null,
    recipient_name: 'John Doe',
    recipient_email: 'john.doe@example.com',
    recipient_phone: '+44 7700 900077',
    origin: MOCK_CITIES[0], // London
    destination: MOCK_CITIES[1], // Birmingham
    status: 'pending',
    estimated_delivery: hoursAhead(24),
    actual_delivery: null,
    created_at: hoursAgo(1),
    updated_at: hoursAgo(1),
  };
  const locations1: Omit<ShipmentLocation, 'id' | 'shipment_id'>[] = [];
  const events1: Omit<ShipmentEvent, 'id' | 'shipment_id'>[] = [
    {
      status: 'pending',
      message: 'Shipment registered by shipper. Awaiting courier assignment.',
      created_at: hoursAgo(1),
      created_by: userId,
    }
  ];

  // 2. Assigned Shipment (Driver 1 assigned, no locations yet, 2 events)
  const shipment2: Omit<Shipment, 'id'> = {
    tracking_number: generateTrackingNumber(),
    shipper_id: userId,
    driver_id: 'user_driver_1', // Alex Courier
    recipient_name: 'Jane Smith',
    recipient_email: 'jane.smith@example.com',
    recipient_phone: '+44 7700 900088',
    origin: MOCK_CITIES[3], // Bristol
    destination: MOCK_CITIES[2], // Manchester
    status: 'assigned',
    estimated_delivery: hoursAhead(18),
    actual_delivery: null,
    created_at: hoursAgo(4),
    updated_at: hoursAgo(3),
  };
  const locations2: Omit<ShipmentLocation, 'id' | 'shipment_id'>[] = [];
  const events2: Omit<ShipmentEvent, 'id' | 'shipment_id'>[] = [
    {
      status: 'pending',
      message: 'Shipment registered by shipper.',
      created_at: hoursAgo(4),
      created_by: userId,
    },
    {
      status: 'assigned',
      message: 'Courier driver Alex Courier assigned to shipment.',
      created_at: hoursAgo(3),
      created_by: userId,
    }
  ];

  // 3. In Transit Shipment (Driver 1 assigned, has active location tracking history, 4 events)
  const origin3 = MOCK_CITIES[4]; // Southampton
  const dest3 = MOCK_CITIES[0]; // London
  const waypoints3 = getInterpolatedPoints(origin3, dest3, 3);
  
  const shipment3: Omit<Shipment, 'id'> = {
    tracking_number: generateTrackingNumber(),
    shipper_id: userId,
    driver_id: 'user_driver_1', // Alex Courier
    recipient_name: 'Robert Brown',
    recipient_email: 'robert.brown@example.com',
    recipient_phone: '+44 7700 900099',
    origin: origin3,
    destination: dest3,
    status: 'in_transit',
    estimated_delivery: hoursAhead(3),
    actual_delivery: null,
    created_at: hoursAgo(6),
    updated_at: hoursAgo(1.5),
  };
  
  const locations3: Omit<ShipmentLocation, 'id' | 'shipment_id'>[] = [
    {
      latitude: origin3.lat,
      longitude: origin3.lng,
      timestamp: hoursAgo(3),
      speed_kmh: 0,
      status: 'picked_up',
    },
    {
      latitude: waypoints3[0].lat,
      longitude: waypoints3[0].lng,
      timestamp: hoursAgo(2.5),
      speed_kmh: 72,
      status: 'in_transit',
    },
    {
      latitude: waypoints3[1].lat,
      longitude: waypoints3[1].lng,
      timestamp: hoursAgo(2),
      speed_kmh: 88,
      status: 'in_transit',
    },
    {
      latitude: waypoints3[2].lat,
      longitude: waypoints3[2].lng,
      timestamp: hoursAgo(1.5),
      speed_kmh: 64,
      status: 'in_transit',
    }
  ];
  
  const events3: Omit<ShipmentEvent, 'id' | 'shipment_id'>[] = [
    {
      status: 'pending',
      message: 'Shipment registered by shipper.',
      created_at: hoursAgo(6),
      created_by: userId,
    },
    {
      status: 'assigned',
      message: 'Courier driver Alex Courier assigned to shipment.',
      created_at: hoursAgo(5),
      created_by: userId,
    },
    {
      status: 'picked_up',
      message: 'Package picked up from Southampton Container Port.',
      created_at: hoursAgo(3),
      created_by: 'user_driver_1',
    },
    {
      status: 'in_transit',
      message: 'Shipment in transit towards London Port Logistics.',
      created_at: hoursAgo(2.5),
      created_by: 'user_driver_1',
    }
  ];

  // 4. Delivered Shipment (Driver 2 assigned, full history, 5 events)
  const origin4 = MOCK_CITIES[5]; // Liverpool
  const dest4 = MOCK_CITIES[1]; // Birmingham
  const waypoints4 = getInterpolatedPoints(origin4, dest4, 4);

  const shipment4: Omit<Shipment, 'id'> = {
    tracking_number: generateTrackingNumber(),
    shipper_id: userId,
    driver_id: 'user_driver_2', // Sarah Delivery
    recipient_name: 'Emily Davis',
    recipient_email: 'emily.davis@example.com',
    recipient_phone: '+44 7700 900111',
    origin: origin4,
    destination: dest4,
    status: 'delivered',
    estimated_delivery: hoursAgo(2),
    actual_delivery: hoursAgo(2),
    created_at: hoursAgo(24),
    updated_at: hoursAgo(2),
  };

  const locations4: Omit<ShipmentLocation, 'id' | 'shipment_id'>[] = [
    {
      latitude: origin4.lat,
      longitude: origin4.lng,
      timestamp: hoursAgo(8),
      speed_kmh: 0,
      status: 'picked_up',
    },
    {
      latitude: waypoints4[0].lat,
      longitude: waypoints4[0].lng,
      timestamp: hoursAgo(7),
      speed_kmh: 80,
      status: 'in_transit',
    },
    {
      latitude: waypoints4[1].lat,
      longitude: waypoints4[1].lng,
      timestamp: hoursAgo(6),
      speed_kmh: 90,
      status: 'in_transit',
    },
    {
      latitude: waypoints4[2].lat,
      longitude: waypoints4[2].lng,
      timestamp: hoursAgo(5),
      speed_kmh: 75,
      status: 'in_transit',
    },
    {
      latitude: waypoints4[3].lat,
      longitude: waypoints4[3].lng,
      timestamp: hoursAgo(4),
      speed_kmh: 40,
      status: 'in_transit',
    },
    {
      latitude: dest4.lat,
      longitude: dest4.lng,
      timestamp: hoursAgo(2),
      speed_kmh: 0,
      status: 'delivered',
    }
  ];

  const events4: Omit<ShipmentEvent, 'id' | 'shipment_id'>[] = [
    {
      status: 'pending',
      message: 'Shipment registered by shipper.',
      created_at: hoursAgo(24),
      created_by: userId,
    },
    {
      status: 'assigned',
      message: 'Courier driver Sarah Delivery assigned to shipment.',
      created_at: hoursAgo(22),
      created_by: userId,
    },
    {
      status: 'picked_up',
      message: 'Package picked up from Liverpool Cargo Terminal.',
      created_at: hoursAgo(8),
      created_by: 'user_driver_2',
    },
    {
      status: 'in_transit',
      message: 'Shipment in transit towards Birmingham Distribution Hub.',
      created_at: hoursAgo(7),
      created_by: 'user_driver_2',
    },
    {
      status: 'delivered',
      message: 'Package successfully delivered and signed by Emily Davis.',
      created_at: hoursAgo(2),
      created_by: 'user_driver_2',
    }
  ];

  // 5. Delayed Shipment (Driver 3 assigned, has location history, 4 events, status = delayed)
  const origin5 = MOCK_CITIES[0]; // London
  const dest5 = MOCK_CITIES[3]; // Bristol
  const waypoints5 = getInterpolatedPoints(origin5, dest5, 3);

  const shipment5: Omit<Shipment, 'id'> = {
    tracking_number: generateTrackingNumber(),
    shipper_id: userId,
    driver_id: 'user_driver_3', // Dave Transporter
    recipient_name: 'Michael Green',
    recipient_email: 'michael.green@example.com',
    recipient_phone: '+44 7700 900222',
    origin: origin5,
    destination: dest5,
    status: 'delayed',
    estimated_delivery: hoursAhead(4),
    actual_delivery: null,
    created_at: hoursAgo(8),
    updated_at: hoursAgo(1),
  };

  const locations5: Omit<ShipmentLocation, 'id' | 'shipment_id'>[] = [
    {
      latitude: origin5.lat,
      longitude: origin5.lng,
      timestamp: hoursAgo(6),
      speed_kmh: 0,
      status: 'picked_up',
    },
    {
      latitude: waypoints5[0].lat,
      longitude: waypoints5[0].lng,
      timestamp: hoursAgo(5),
      speed_kmh: 60,
      status: 'in_transit',
    },
    {
      latitude: waypoints5[1].lat,
      longitude: waypoints5[1].lng,
      timestamp: hoursAgo(4),
      speed_kmh: 12, // slow traffic
      status: 'delayed',
    }
  ];

  const events5: Omit<ShipmentEvent, 'id' | 'shipment_id'>[] = [
    {
      status: 'pending',
      message: 'Shipment registered by shipper.',
      created_at: hoursAgo(8),
      created_by: userId,
    },
    {
      status: 'assigned',
      message: 'Courier driver Dave Transporter assigned to shipment.',
      created_at: hoursAgo(7.5),
      created_by: userId,
    },
    {
      status: 'picked_up',
      message: 'Package picked up from London Port Logistics.',
      created_at: hoursAgo(6),
      created_by: 'user_driver_3',
    },
    {
      status: 'delayed',
      message: 'Shipment delayed due to heavy accident congestion on M4 corridor.',
      created_at: hoursAgo(4),
      created_by: 'user_driver_3',
    }
  ];

  return {
    shipments: [shipment1, shipment2, shipment3, shipment4, shipment5],
    locations: [locations1, locations2, locations3, locations4, locations5],
    events: [events1, events2, events3, events4, events5]
  };
}
