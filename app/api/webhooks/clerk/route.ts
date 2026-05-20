import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { syncUserProfile } from '@/server/actions/auth-actions';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set in environment');
    return new Response('Webhook secret not configured', { status: 500 });
  }

  // Await headers() — Next.js 16 requirement
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing svix headers in webhook request');
    return new Response('Missing svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    return new Response('Invalid signature', { status: 400 });
  }

  console.log(`✅ Webhook received: ${evt.type} for user ${evt.data.id}`);

  if (evt.type === 'user.created' || evt.type === 'user.updated') {
    try {
      await syncUserProfile(evt.data as unknown as Parameters<typeof syncUserProfile>[0]);
      console.log(`✅ Supabase profile sync successful for user ${evt.data.id}`);
      return new Response('Success', { status: 200 });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Supabase profile sync failed:', message);
      return new Response('Sync failed', { status: 500 });
    }
  }

  return new Response('Event ignored', { status: 200 });
}
