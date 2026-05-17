# STACK.md

## Core Stack

- **Framework**: Next.js 16+ (App Router) + TypeScript (strict mode)
- **Styling**: Tailwind CSS 4 + shadcn/ui (Nova preset)
- **Auth & RBAC**: Clerk (with organizations or user metadata for roles)
- **Database**: Supabase (PostgreSQL + Row Level Security + Realtime)
- **Maps**: Leaflet.js + react-leaflet
- **Data Fetching**: TanStack Query v5
- **Validation**: Zod
- **Notifications**: Sonner
- **Icons**: Lucide React
- **Deployment**: Vercel (primary)

## Key Libraries & Versions (pin these)

- next: ^16.x
- typescript: ^5.5+
- tailwindcss: ^4.0
- @supabase/supabase-js: latest
- @tanstack/react-query: ^5
- zod: ^3.23
- react-leaflet: ^4.2+
- leaflet: ^1.9
- @clerk/nextjs: latest
- sonner: latest

## Architecture Decisions

- **Server-first**: All database operations via Server Actions or Route Handlers. No direct client Supabase access except Realtime subscriptions where necessary.
- **RBAC**: Clerk user metadata + Supabase RLS policies. Middleware protects routes.
- **State Management**: TanStack Query for server state. Minimal Zustand only if needed for simulation/UI state.
- **Simulation Layer**: Custom `lib/simulation.ts` (in-memory + Supabase broadcast for cross-user updates).
- **Type Safety**: Full end-to-end types between Supabase → Zod → UI.
- **No bloat**: Avoid unnecessary libraries. Keep bundle size tight.

## Why This Stack

- Consistent with Tempire → faster context switching.
- Excellent real-time capabilities (Supabase Realtime is perfect for live location/status).
- Leaflet is lightweight and reliable for this use case.
- Demonstrates modern full-stack patterns recruiters want to see.

**Future Swap Path**:
- Simulation → Real carrier WebSocket/API
- Supabase → Any Postgres + Pusher/Socket.io

Last Updated: [Add date]