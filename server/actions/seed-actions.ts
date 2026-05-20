'use server';

import { currentUser } from '@clerk/nextjs/server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';
import { generateMockShipmentsForUser } from '@/lib/mock-data';
import { revalidatePath } from 'next/cache';

export async function seedMockShipmentsAction() {
  try {
    const user = await currentUser();
    if (!user) {
      return { error: 'Not authenticated. Please sign in.' };
    }

    const serviceClient = createSupabaseServiceClient();

    // 1. Check if the user already has shipments in the database
    const { data: existingShipments, error: checkError } = await serviceClient
      .from('shipments')
      .select('id')
      .eq('shipper_id', user.id)
      .limit(1);

    if (checkError) {
      console.error('Error checking existing shipments:', checkError);
      return { error: `Database check failed: ${checkError.message}` };
    }

    if (existingShipments && existingShipments.length > 0) {
      return { error: 'You already have active shipments. Seeding is only available for clean accounts.' };
    }

    // 2. Generate the mock data using our utility
    const mockData = generateMockShipmentsForUser(user.id);

    console.log(`🌱 Seeding 5 mock shipments for user ${user.id}...`);

    // 3. Insert each shipment and its related records sequentially to link IDs
    for (let i = 0; i < mockData.shipments.length; i++) {
      const shipment = mockData.shipments[i];
      const locations = mockData.locations[i];
      const events = mockData.events[i];

      // Insert shipment
      const { data: insertedShipment, error: shipmentError } = await serviceClient
        .from('shipments')
        .insert(shipment)
        .select('id')
        .single();

      if (shipmentError || !insertedShipment) {
        console.error(`Error inserting shipment ${i}:`, shipmentError);
        throw new Error(`Failed to insert shipment: ${shipmentError?.message || 'unknown error'}`);
      }

      const shipmentId = insertedShipment.id;

      // Insert locations if there are any
      if (locations.length > 0) {
        const locationsToInsert = locations.map(loc => ({
          ...loc,
          shipment_id: shipmentId
        }));

        const { error: locError } = await serviceClient
          .from('shipment_locations')
          .insert(locationsToInsert);

        if (locError) {
          console.error(`Error inserting locations for shipment ${shipmentId}:`, locError);
          throw new Error(`Failed to insert locations: ${locError.message}`);
        }
      }

      // Insert events if there are any
      if (events.length > 0) {
        const eventsToInsert = events.map(evt => ({
          ...evt,
          shipment_id: shipmentId
        }));

        const { error: evtError } = await serviceClient
          .from('shipment_events')
          .insert(eventsToInsert);

        if (evtError) {
          console.error(`Error inserting events for shipment ${shipmentId}:`, evtError);
          throw new Error(`Failed to insert events: ${evtError.message}`);
        }
      }
    }

    console.log(`✅ Successfully seeded 5 mock shipments, locations, and events for user ${user.id}`);
    
    // Revalidate the dashboard page to reflect updates
    revalidatePath('/dashboard/shipper');
    return { success: true };
  } catch (error) {
    console.error('Error in seedMockShipmentsAction:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred during seeding.';
    return { error: message };
  };
}
