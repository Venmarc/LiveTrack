'use server';

import { currentUser } from '@clerk/nextjs/server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';
import { createShipmentInputSchema } from '@/lib/schemas';
import { generateTrackingNumber } from '@/lib/mock-data';
import { revalidatePath } from 'next/cache';

export async function createShipmentAction(input: unknown) {
  try {
    const user = await currentUser();
    if (!user) {
      return { error: 'Not authenticated. Please sign in.' };
    }

    // 1. Validate input schema
    const parsed = createShipmentInputSchema.safeParse(input);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { error: `Validation failed: ${errorMsg}` };
    }

    const data = parsed.data;

    // 2. Enforce active shipment cap (max 5 shipments per shipper)
    const supabase = createSupabaseServiceClient();
    const { count, error: countError } = await supabase
      .from('shipments')
      .select('id', { count: 'exact', head: true })
      .eq('shipper_id', user.id);

    if (countError) {
      console.error('Error counting shipper shipments:', countError);
      return { error: `Database error: ${countError.message}` };
    }

    if (count !== null && count >= 5) {
      return { error: 'You have reached the limit of 5 active shipments allowed for demo simulation. Please delete or mark some as delivered/cancelled first.' };
    }

    // 3. Generate unique tracking number
    const trackingNumber = generateTrackingNumber();

    // 4. Insert shipment
    const { data: shipment, error: insertError } = await supabase
      .from('shipments')
      .insert({
        tracking_number: trackingNumber,
        shipper_id: user.id,
        driver_id: null,
        recipient_name: data.recipient_name,
        recipient_email: data.recipient_email,
        recipient_phone: data.recipient_phone || null,
        origin: data.origin,
        destination: data.destination,
        status: 'pending',
        estimated_delivery: data.estimated_delivery ? new Date(data.estimated_delivery).toISOString() : null,
      })
      .select('id')
      .single();

    if (insertError || !shipment) {
      console.error('Error inserting shipment:', insertError);
      return { error: `Failed to create shipment: ${insertError?.message || 'unknown error'}` };
    }

    // 5. Seed initial shipment event
    const { error: eventError } = await supabase
      .from('shipment_events')
      .insert({
        shipment_id: shipment.id,
        status: 'pending',
        message: 'Shipment booked. Awaiting courier assignment.',
        created_by: user.id,
      });

    if (eventError) {
      console.error('Error inserting initial event:', eventError);
      // We don't abort since the shipment was created, but log it
    }

    console.log(`✅ Shipment ${trackingNumber} successfully created by shipper ${user.id}`);
    
    // 6. Revalidate cache
    revalidatePath('/dashboard/shipper');
    return { success: true, trackingNumber };
  } catch (error) {
    console.error('Error in createShipmentAction:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred during creation.';
    return { error: message };
  }
}
