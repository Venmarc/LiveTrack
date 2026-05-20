'use server';

import { currentUser, clerkClient } from '@clerk/nextjs/server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

type ClerkWebhookUser = {
  id: string;
  email_addresses?: Array<{ email_address: string }>;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
  public_metadata?: { role?: 'shipper' | 'driver' | 'recipient' | 'admin' };
};

/**
 * Webhook handler to sync Clerk profile creations/updates to Supabase profiles table.
 */
export async function syncUserProfile(clerkData: ClerkWebhookUser) {
  const serviceClient = createSupabaseServiceClient();

  const fullName = `${clerkData.first_name || ''} ${clerkData.last_name || ''}`.trim() || null;
  const avatarUrl = clerkData.image_url || null;
  const role = clerkData.public_metadata?.role || 'recipient'; // Default new signups to recipient

  console.log(`💾 Syncing Clerk profile for ${clerkData.id} (Role: ${role})`);

  const { error } = await serviceClient
    .from('profiles')
    .upsert({
      id: clerkData.id,
      role,
      full_name: fullName,
      avatar_url: avatarUrl,
    }, { onConflict: 'id' });

  if (error) {
    console.error('Supabase profile sync error:', error);
    throw new Error(`Failed to sync profile: ${error.message}`);
  }

  console.log(`✅ Profile successfully synced for ${clerkData.id}`);
  return { success: true };
}

/**
 * Onboarding server action for new users to pick their custom role.
 */
export async function selectUserRoleAction(role: 'shipper' | 'driver' | 'recipient') {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    console.log(`👤 User ${user.id} selecting role: ${role}`);

    // 1. Update user public metadata in Clerk
    const client = await clerkClient();
    await client.users.updateUserMetadata(user.id, {
      publicMetadata: {
        role: role,
      },
    });

    // 2. Update user profile in Supabase using service client
    const serviceClient = createSupabaseServiceClient();
    const { error } = await serviceClient
      .from('profiles')
      .update({
        role: role,
      })
      .eq('id', user.id);

    if (error) {
      console.error('Failed to update role in Supabase:', error);
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    console.log(`✅ User ${user.id} role successfully updated to ${role}`);
    return { success: true };
  } catch (error) {
    console.error('Error in selectUserRoleAction:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return { error: message };
  }
}

/**
 * Fallback server action to guarantee a profile exists in Supabase.
 * Call this at dashboard and onboarding page entrances to catch cases
 * where the local Clerk webhook sync failed to run/deliver.
 */
export async function ensureProfile() {
  const user = await currentUser();
  if (!user) return null;

  const role = (user.publicMetadata as Record<string, unknown>)?.role as 'shipper' | 'driver' | 'recipient' | 'admin' || 'recipient';
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || null;
  const avatarUrl = user.imageUrl || null;

  const serviceClient = createSupabaseServiceClient();
  const { error } = await serviceClient
    .from('profiles')
    .upsert({
      id: user.id,
      role,
      full_name: fullName,
      avatar_url: avatarUrl,
    }, { onConflict: 'id' });

  if (error) {
    console.error('ensureProfile Supabase upsert error:', error);
  } else {
    console.log(`✅ ensureProfile verified/registered profile in Supabase for user ${user.id}`);
  }

  return { id: user.id, role };
}

