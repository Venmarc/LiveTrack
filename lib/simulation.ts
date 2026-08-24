import { createSupabaseServiceClient } from '@/lib/supabase-server';

/**
 * Runs a background simulation loop for a shipment.
 * Linearly interpolates the coordinates between origin and destination over 10 steps,
 * inserting periodic coordinates into the database.
 * Once complete, automatically transitions the shipment to 'delivered'.
 */
export async function runShipmentSimulation(shipmentId: string) {
  const supabase = createSupabaseServiceClient();

  // 1. Fetch shipment details
  const { data: shipment, error: fetchError } = await supabase
    .from('shipments')
    .select('status, origin, destination')
    .eq('id', shipmentId)
    .single();

  if (fetchError || !shipment) {
    console.error(`[Simulation] Error fetching shipment ${shipmentId}:`, fetchError);
    return;
  }

  if (shipment.status !== 'in_transit') {
    console.log(`[Simulation] Shipment ${shipmentId} is not in_transit (${shipment.status}). Aborting.`);
    return;
  }

  // Parse JSON coordinates
  const origin = shipment.origin as unknown as { lat: number; lng: number };
  const destination = shipment.destination as unknown as { lat: number; lng: number };

  if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
    console.error(`[Simulation] Invalid coordinates for shipment ${shipmentId}:`, { origin, destination });
    return;
  }

  console.log(`[Simulation] Starting simulation loop for ${shipmentId}`);

  const totalSteps = 10;
  const tickIntervalMs = 5000; // 5 seconds per tick

  // Run the loop in the background
  for (let step = 0; step <= totalSteps; step++) {
    // 2. Query current status to verify it wasn't cancelled or manually delivered
    const { data: currentShipment, error: checkError } = await supabase
      .from('shipments')
      .select('status')
      .eq('id', shipmentId)
      .single();

    if (checkError || !currentShipment) {
      console.log(`[Simulation] Stopped simulation for ${shipmentId}: shipment not found.`);
      break;
    }

    // Stop if the status is no longer active (in_transit or delayed)
    if (currentShipment.status !== 'in_transit' && currentShipment.status !== 'delayed') {
      console.log(`[Simulation] Stopped simulation for ${shipmentId}: status changed to ${currentShipment.status}.`);
      break;
    }

    // 3. Interpolate latitude/longitude with jitter
    const progress = step / totalSteps;
    const baseLat = origin.lat + (destination.lat - origin.lat) * progress;
    const baseLng = origin.lng + (destination.lng - origin.lng) * progress;

    // Only apply jitter to intermediate steps, land precisely at edge points
    const isEdge = step === 0 || step === totalSteps;
    const jitterLat = isEdge ? 0 : (Math.random() - 0.5) * 0.0004;
    const jitterLng = isEdge ? 0 : (Math.random() - 0.5) * 0.0004;

    const lat = baseLat + jitterLat;
    const lng = baseLng + jitterLng;

    // Speed: 0 at destination, random between 45 and 68 km/h otherwise
    const speed = step === totalSteps ? 0 : Math.floor(Math.random() * 24) + 45;

    // 4. Log to shipment_locations table
    const { error: locError } = await supabase
      .from('shipment_locations')
      .insert({
        shipment_id: shipmentId,
        latitude: lat,
        longitude: lng,
        speed_kmh: speed,
        status: currentShipment.status,
      });

    if (locError) {
      console.error(`[Simulation] Error writing location tick for ${shipmentId}:`, locError);
    } else {
      console.log(`[Simulation] Tick ${step}/${totalSteps} for ${shipmentId}: [${lat.toFixed(5)}, ${lng.toFixed(5)}] at ${speed} km/h`);
    }

    // 5. Final tick updates status to delivered
    if (step === totalSteps) {
      console.log(`[Simulation] Destination reached for ${shipmentId}. Updating to delivered.`);

      const { error: deliverError } = await supabase
        .from('shipments')
        .update({
          status: 'delivered',
          actual_delivery: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', shipmentId);

      if (deliverError) {
        console.error(`[Simulation] Error auto-delivering ${shipmentId}:`, deliverError);
        break;
      }

      await supabase
        .from('shipment_events')
        .insert({
          shipment_id: shipmentId,
          status: 'delivered',
          message: 'Package successfully delivered to destination by simulation engine.',
        });

      break;
    }

    // 6. Sleep
    await new Promise((resolve) => setTimeout(resolve, tickIntervalMs));
  }
}
