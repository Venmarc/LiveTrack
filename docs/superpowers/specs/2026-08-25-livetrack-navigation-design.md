# LiveTrack Navigation Design

## Status

Approved design. Implementation has not started.

## Purpose

LiveTrack needs a stable navigation layer before individual pages receive further redesign work. The current pages behave like separate destinations. Users depend on browser history, small back arrows, redirects, or links placed far below the main content.

This stage introduces a role-aware top bar and clear detail-page context. It improves orientation and movement without redesigning dashboard content, public tracking records, or the landing page.

## Audit Evidence

The route and browser audit found these problems:

- The public header contains framework information instead of useful destinations.
- Public tracking has a home back button but no clear path to start another tracking search.
- Dashboard headers identify a role but do not provide navigation.
- Shipper booking and shipment details replace the dashboard context.
- Driver work areas depend on long-page scrolling and fragment links.
- Recipient tracking paths are available, but their relationship is unclear.
- Admin home navigation appears only below the main table.
- Onboarding has no clear home or account escape path.
- Mobile pages remove context without providing replacement navigation.
- The product mark is not consistently linked to a useful home destination.

Protected-route inspection without an authenticated browser session confirmed the public boundary. Source inspection established the authenticated route structure and role guards.

## Users And Journey Boundaries

### Portfolio visitor

Start: arrival on the landing page.

End: successful public tracking, sign-in, or account creation.

Primary need: understand where to track a shipment and how to access the application.

### Shipper

Start: authenticated shipper dashboard.

End: book a shipment, review the shipment list, or inspect a shipment record.

Primary need: move between overview, booking, and shipment records without losing dashboard context.

### Driver

Start: authenticated driver dashboard.

End: find available work, review active deliveries, or open public tracking for a shipment.

Primary need: reach the delivery workspace quickly and understand the current role context.

### Recipient

Start: authenticated recipient dashboard or public tracking entry.

End: find a tracking number or inspect a live shipment.

Primary need: distinguish personal inbound shipments from public tracking by number.

### Administrator

Start: authenticated admin dashboard.

End: review the shipment network or apply an available override.

Primary need: reach the shipment table without relying on a bottom-page home link.

## Navigation Model

Use one shared top-bar system with public, authenticated, and onboarding variants.

The route middleware remains the authority for role access. Navigation does not expose cross-role dashboard links.

### Public variant

The public variant appears on the landing page and public tracking pages.

Primary elements:

- Linked LiveTrack mark. It leads to `/`.
- `Track shipment`. On the landing page it links to the tracking form. On public tracking pages it exposes or reaches a compact tracking search.
- `Sign in`.
- `Create account`.

For a signed-in visitor on a public page, replace sign-in and account creation with:

- `Dashboard`, routed through `/onboard` so existing middleware sends users to their assigned dashboard.
- Clerk account control.

### Authenticated variant

The authenticated variant appears on dashboard overview, booking, and shipment-detail pages.

Primary elements:

- Linked LiveTrack mark. It leads to the current role dashboard.
- Visible role label.
- `Overview`, linked to the current role dashboard.
- One role action.
- `Track shipment`, linked to the public tracking entry on the landing page.
- Clerk account control in the utility area.

Role actions:

| Role | Label | Destination |
| --- | --- | --- |
| Shipper | `Book shipment` | `/dashboard/shipper/new` |
| Driver | `Deliveries` | `/dashboard/driver#delivery-workspace` |
| Recipient | `My packages` | `/dashboard/recipient#my-packages` |
| Admin | `Shipments` | `/dashboard/admin#network-shipments` |

### Onboarding variant

The onboarding page shows:

- Linked LiveTrack mark to `/`.
- `Choose role` as the current location.
- Clerk account control.

It does not show a dashboard destination before role setup completes.

## Local Context

Global navigation does not replace local page context.

Booking and shipment-detail pages add a breadcrumb below the shared top bar:

- Booking: `Overview / Book shipment`.
- Shipper shipment detail: `Overview / Shipments / {tracking number}`.
- Public tracking: `Home / Track shipment / {tracking number}` when space permits.

Breadcrumb links use text labels. Icon-only back buttons must not be the sole navigation method.

## Responsive Behavior

### Desktop, 768px and wider

- Show primary navigation links in the top bar.
- Keep utility actions on the right.
- Show the role label near the product mark without making it look like a separate brand.
- Use a visible active indicator that combines weight with a bottom rule or surface treatment.

### Mobile, below 768px

- Keep the linked product mark visible.
- Keep the account control visible for signed-in users.
- Use one labeled menu control for primary destinations.
- The menu opens a solid surface below the top bar.
- Each menu destination has a minimum 44px target.
- The current destination includes an active marker and `aria-current="page"` where applicable.
- Do not use icon-only navigation labels.

A bottom navigation bar is not part of this stage. The current route count does not justify a second navigation system.

## Interaction And Accessibility

- Use semantic `header` and `nav` landmarks.
- Give each navigation landmark a clear accessible label.
- Use links for destinations and buttons only for menu disclosure.
- The mobile menu button exposes `aria-expanded` and `aria-controls`.
- Escape closes the mobile menu.
- Selecting a destination closes the mobile menu.
- Focus returns to the menu button after Escape.
- Visible focus uses the shared `--color-focus` token.
- Active state does not depend on color alone.
- Touch targets are at least 44px where practical.
- Reduced-motion mode removes non-essential menu transitions.
- Product marks have an accessible name.

## Components And Boundaries

### `PublicHeader`

Owns public destinations and signed-in public utility behavior. It replaces the current landing-only header and is reused by public tracking.

Dependencies:

- Clerk authentication state and account controls.
- Shared `Logo` component.
- Current pathname for active state.

### `AppHeader`

Owns authenticated role navigation. It receives the current role and optional page context. It does not query shipment data.

Dependencies:

- Shared `Logo` component.
- Clerk account control.
- Current pathname for active state.
- Static role-navigation configuration.

### `Breadcrumbs`

Renders labeled local context for booking and detail pages. It receives explicit items. It does not infer labels from URL segments.

### Role navigation configuration

A small static mapping defines role labels, overview routes, and role actions. Middleware remains responsible for authorization.

Do not create a general navigation framework. These components serve the current public and authenticated route families only.

## Content Rules

- Use `Overview`, not `Portal` or `Dashboard Home` in navigation.
- Use `Book shipment`, `Deliveries`, `My packages`, and `Shipments` as role actions.
- Use `Track shipment` for public tracking entry.
- Keep role names visible but quiet.
- Remove framework badges, repeated demo badges, and role-colored navigation palettes.
- Keep the site-level simulation disclosure in its existing single location.

## Error And Boundary Behavior

- If Clerk authentication is still loading, keep the product mark and reserve utility space to prevent layout shift.
- If a signed-in user follows `Dashboard` from a public page, `/onboard` and middleware resolve the correct role destination.
- Unknown roles do not receive cross-role links. The header falls back to the product mark, public tracking, and account control.
- Navigation does not bypass middleware redirects.
- Fragment destinations remain usable when JavaScript is unavailable.

## Acceptance Criteria

- Every main page has a linked LiveTrack mark.
- Public pages expose home, tracking, and authentication paths.
- Every authenticated dashboard exposes overview, one role action, public tracking, and account controls.
- Booking and shipment-detail pages preserve role context through the shared header and breadcrumbs.
- No authenticated header exposes another role's dashboard.
- Public tracking offers a clear way to start another search.
- Navigation labels remain visible or available through a labeled menu at 375px.
- Active location uses more than color.
- Keyboard users can open, traverse, close, and leave the mobile menu.
- Existing booking, role, tracking, and dashboard routes keep working.
- The interface contains no framework badge or repeated demo badge in navigation.

## Verification

- Unit-test role navigation configuration and unknown-role fallback.
- Component-test mobile menu semantics where the existing test setup permits it.
- Run focused existing tests.
- Run `npm run lint`.
- Run `npm run build`.
- Run `git diff --check`.
- Use Brave through the shared clean Playwright context.
- Inspect public routes at 375px, 768px, 1024px, and 1440px.
- Inspect authenticated routes with available test accounts or a safe authenticated test session.
- Complete keyboard-only checks for top-bar links, menu disclosure, Escape behavior, breadcrumbs, and account controls.

## Out Of Scope

- Landing-page content redesign.
- Public tracking record redesign.
- Dashboard content restructuring.
- New role capabilities or routes.
- Cross-role navigation.
- A desktop sidebar.
- A mobile bottom navigation bar.
- Changes to Clerk, Supabase, middleware authorization, or persisted role data.
