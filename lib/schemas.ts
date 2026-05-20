import { z } from 'zod';

export const roleEnumSchema = z.enum(['shipper', 'driver', 'recipient', 'admin']);

export const locationCoordSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  address: z.string().min(3, 'Address must be at least 3 characters'),
  city: z.string().optional(),
});

export const profileSchema = z.object({
  id: z.string(),
  role: roleEnumSchema,
  full_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  base_location: locationCoordSchema.nullable(),
  max_active_shipments: z.number().default(5),
  created_at: z.string().or(z.date()),
});

export const shipmentStatusSchema = z.enum([
  'pending',
  'assigned',
  'picked_up',
  'in_transit',
  'delivered',
  'delayed',
  'cancelled'
]);

export const shipmentSchema = z.object({
  id: z.string().uuid(),
  tracking_number: z.string().regex(/^LTK-[A-Z0-9]{9}$/, 'Invalid tracking number format'),
  shipper_id: z.string(),
  driver_id: z.string().nullable(),
  recipient_name: z.string().min(2, 'Name must be at least 2 characters'),
  recipient_email: z.string().email('Invalid email address'),
  recipient_phone: z.string().optional().nullable(),
  origin: locationCoordSchema,
  destination: locationCoordSchema,
  status: shipmentStatusSchema,
  estimated_delivery: z.string().or(z.date()).nullable(),
  actual_delivery: z.string().or(z.date()).nullable(),
  created_at: z.string().or(z.date()),
  updated_at: z.string().or(z.date()),
});

export const shipmentLocationSchema = z.object({
  id: z.string().uuid(),
  shipment_id: z.string().uuid(),
  latitude: z.number(),
  longitude: z.number(),
  timestamp: z.string().or(z.date()),
  speed_kmh: z.number().default(0),
  status: z.string().nullable(),
});

export const shipmentEventSchema = z.object({
  id: z.string().uuid(),
  shipment_id: z.string().uuid(),
  status: shipmentStatusSchema,
  message: z.string().nullable(),
  created_at: z.string().or(z.date()),
  created_by: z.string().nullable(),
});

// Input Schemas for Mutations
export const createShipmentInputSchema = z.object({
  recipient_name: z.string().min(2, 'Name must be at least 2 characters'),
  recipient_email: z.string().email('Invalid email address'),
  recipient_phone: z.string().optional().or(z.literal('')),
  origin: locationCoordSchema,
  destination: locationCoordSchema,
  estimated_delivery: z.string().optional().or(z.literal('')),
});

export type Profile = z.infer<typeof profileSchema>;
export type Shipment = z.infer<typeof shipmentSchema>;
export type ShipmentLocation = z.infer<typeof shipmentLocationSchema>;
export type ShipmentEvent = z.infer<typeof shipmentEventSchema>;
export type CreateShipmentInput = z.infer<typeof createShipmentInputSchema>;
