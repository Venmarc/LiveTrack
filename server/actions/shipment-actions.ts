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

export async function claimShipmentAction(shipmentId: string) {
  try {
    const user = await currentUser();
    if (!user) {
      return { error: 'Not authenticated. Please sign in.' };
    }

    const role = (user.publicMetadata as Record<string, unknown>)?.role;
    if (role !== 'driver') {
      return { error: 'Unauthorized. Only courier drivers can claim shipments.' };
    }

    const supabase = createSupabaseServiceClient();

    // 1. Check driver's active shipments cap
    const { data: driverProfile, error: profileError } = await supabase
      .from('profiles')
      .select('max_active_shipments')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching driver profile for limit check:', profileError);
      return { error: 'Failed to verify driver profile.' };
    }

    const maxActive = driverProfile?.max_active_shipments ?? 5;

    const { count: activeCount, error: countError } = await supabase
      .from('shipments')
      .select('id', { count: 'exact', head: true })
      .eq('driver_id', user.id)
      .not('status', 'in', '("delivered","cancelled")');

    if (countError) {
      console.error('Error checking driver active shipments count:', countError);
      return { error: 'Failed to verify active deliveries count.' };
    }

    if (activeCount !== null && activeCount >= maxActive) {
      return { error: `You have reached your limit of ${maxActive} active shipments. Please complete or deliver your active runs before claiming more.` };
    }

    // 2. Check if the shipment exists and is unclaimed
    const { data: shipment, error: fetchError } = await supabase
      .from('shipments')
      .select('status, driver_id, tracking_number')
      .eq('id', shipmentId)
      .single();

    if (fetchError || !shipment) {
      return { error: 'Shipment not found.' };
    }

    if (shipment.driver_id) {
      return { error: 'This shipment has already been claimed by another driver.' };
    }

    const driverName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Courier Driver';

    // 2. Assign the driver and update status to 'assigned'
    const { error: updateError } = await supabase
      .from('shipments')
      .update({
        driver_id: user.id,
        status: 'assigned',
        updated_at: new Date().toISOString(),
      })
      .eq('id', shipmentId);

    if (updateError) {
      console.error('Error claiming shipment:', updateError);
      return { error: `Failed to claim shipment: ${updateError.message}` };
    }

    // 3. Log timeline event
    const { error: eventError } = await supabase
      .from('shipment_events')
      .insert({
        shipment_id: shipmentId,
        status: 'assigned',
        message: `Courier driver ${driverName} assigned to shipment.`,
        created_by: user.id,
      });

    if (eventError) {
      console.error('Error logging assignment event:', eventError);
    }

    console.log(`🚚 Driver ${user.id} claimed shipment ${shipment.tracking_number}`);

    revalidatePath('/dashboard/driver');
    revalidatePath('/dashboard/shipper');
    return { success: true };
  } catch (error) {
    console.error('Error in claimShipmentAction:', error);
    return { error: error instanceof Error ? error.message : 'An unexpected error occurred.' };
  }
}

export async function updateShipmentStatusAction(
  shipmentId: string,
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'delayed' | 'cancelled',
  message?: string
) {
  try {
    const user = await currentUser();
    if (!user) {
      return { error: 'Not authenticated. Please sign in.' };
    }

    const role = (user.publicMetadata as Record<string, unknown>)?.role;
    if (role !== 'driver') {
      return { error: 'Unauthorized. Only assigned drivers can update shipment status.' };
    }

    const supabase = createSupabaseServiceClient();

    // 1. Verify this driver is assigned to the shipment
    const { data: shipment, error: fetchError } = await supabase
      .from('shipments')
      .select('driver_id, tracking_number')
      .eq('id', shipmentId)
      .single();

    if (fetchError || !shipment) {
      return { error: 'Shipment not found.' };
    }

    if (shipment.driver_id !== user.id) {
      return { error: 'Unauthorized. You are not the driver assigned to this shipment.' };
    }

    // 2. Prepare update payload
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatePayload: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'delivered') {
      updatePayload.actual_delivery = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('shipments')
      .update(updatePayload)
      .eq('id', shipmentId);

    if (updateError) {
      console.error('Error updating shipment status:', updateError);
      return { error: `Failed to update status: ${updateError.message}` };
    }

    // 3. Log timeline event
    let eventMessage = message;
    if (!eventMessage) {
      switch (status) {
        case 'picked_up':
          eventMessage = 'Package picked up at origin location.';
          break;
        case 'in_transit':
          eventMessage = 'Package is in transit.';
          break;
        case 'delivered':
          eventMessage = 'Package successfully delivered.';
          break;
        case 'delayed':
          eventMessage = 'Package delivery is delayed.';
          break;
        case 'cancelled':
          eventMessage = 'Package delivery cancelled.';
          break;
        default:
          eventMessage = `Package status updated to ${status}.`;
      }
    }

    const { error: eventError } = await supabase
      .from('shipment_events')
      .insert({
        shipment_id: shipmentId,
        status,
        message: eventMessage,
        created_by: user.id,
      });

    if (eventError) {
      console.error('Error logging status transition event:', eventError);
    }

    console.log(`✅ Shipment ${shipment.tracking_number} status updated to ${status} by driver ${user.id}`);

    revalidatePath('/dashboard/driver');
    revalidatePath('/dashboard/shipper');
    // If we have a tracking page path, revalidate it as well
    revalidatePath(`/tracking/${shipment.tracking_number}`);
    return { success: true };
  } catch (error) {
    console.error('Error in updateShipmentStatusAction:', error);
    return { error: error instanceof Error ? error.message : 'An unexpected error occurred.' };
  }
}
