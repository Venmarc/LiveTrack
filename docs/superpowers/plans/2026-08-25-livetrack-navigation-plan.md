# LiveTrack Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a stable public and role-aware authenticated navigation system that keeps users oriented across LiveTrack pages.

**Architecture:** Create small shared navigation components for public headers, authenticated role headers, and breadcrumbs. Keep role destinations in a static typed configuration. Use the existing Clerk state for account controls and the existing middleware for authorization. Add a client-side mobile menu only where interaction requires it.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Clerk, `lucide-react`, Node test runner, Playwright with Brave.

## Global Constraints

- Preserve the route middleware as the authority for role access.
- Do not expose cross-role dashboard links.
- Preserve existing booking, tracking, role, dashboard, and account workflows.
- Use semantic `header` and `nav` landmarks.
- Use links for destinations and buttons only for menu disclosure.
- Keep touch targets at least 44px where practical.
- Active navigation state must not depend on color alone.
- Respect `prefers-reduced-motion` for menu transitions.
- Do not add a desktop sidebar or mobile bottom navigation in this stage.
- Do not change Clerk, Supabase, middleware authorization, or persisted role data.
- Do not install dependencies.
- Keep the site-level simulation disclosure in its existing single location.
- Do not modify unrelated local files.

---

## File Map

- Create `lib/navigation.mjs`: public and role navigation configuration plus safe role fallback shared by React components and Node tests.
- Create `lib/navigation.test.mjs`: unit tests for role mappings, active-route behavior inputs, and unknown-role fallback.
- Create `components/mobile-nav.tsx`: client-only disclosure menu with keyboard behavior and reduced-motion-safe classes.
- Create `components/public-header.tsx`: public header with linked mark, tracking entry, auth actions, and signed-in dashboard action.
- Create `components/app-header.tsx`: authenticated role header with overview, role action, public tracking, role label, and account control.
- Create `components/breadcrumbs.tsx`: accessible explicit breadcrumb renderer.
- Modify `components/landing-header.tsx`: replace implementation with the shared public header wrapper or remove the duplicate implementation after consumers migrate.
- Modify `app/layout.tsx`: keep the disclosure and shared providers unchanged; only adjust imports if a shared public shell needs root-level placement.
- Modify `app/page.tsx`: add a stable tracking anchor and use the shared public header.
- Modify `app/tracking/[trackingNumber]/tracking-client.tsx`: use the public header and labeled local tracking context.
- Modify `app/onboard/page.tsx`: add onboarding header and linked mark without dashboard navigation.
- Modify `app/dashboard/shipper/page.tsx`: use the authenticated header and add the `#my-shipments` anchor if needed by local navigation.
- Modify `app/dashboard/shipper/new/page.tsx`: use the authenticated header and breadcrumbs.
- Modify `app/dashboard/shipper/shipments/[trackingNumber]/shipment-details-client.tsx`: use the authenticated header and breadcrumbs.
- Modify `app/dashboard/driver/page.tsx`: use the authenticated header and preserve `#delivery-workspace`.
- Modify `app/dashboard/recipient/page.tsx`: use the authenticated header and add `#my-packages` to the packages section.
- Modify `app/dashboard/admin/page.tsx`: use the authenticated header and preserve `#network-shipments`.
- Modify `app/globals.css`: add only shared menu and navigation styles that cannot be expressed safely through existing tokens.
- Modify `LIVETRACK_REDESIGN_PLAN.md`: mark Stage 1.5 implementation in progress, then ready for review after verification.

---

### Task 1: Add Tested Navigation Configuration

**Files:**
- Create: `lib/navigation.mjs`
- Create: `lib/navigation.test.mjs`

**Interfaces:**
- Produces `type AppRole = 'shipper' | 'driver' | 'recipient' | 'admin'`.
- Produces `type NavItem = { label: string; href: string; match?: (pathname: string) => boolean }`.
- Produces `const roleNavigation: Record<AppRole, { label: string; overviewHref: string; action: NavItem }>`.
- Produces `function getRoleNavigation(role: string | null | undefined): RoleNavigation | null`.
- Produces `function isNavItemActive(item: NavItem, pathname: string): boolean`.

- [ ] **Step 1: Write the failing tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { getRoleNavigation, isNavItemActive } from './navigation.mjs';

test('returns the correct overview and primary action for each role', () => {
  assert.equal(getRoleNavigation('shipper').overviewHref, '/dashboard/shipper');
  assert.deepEqual(getRoleNavigation('driver').action, {
    label: 'Deliveries',
    href: '/dashboard/driver#delivery-workspace',
  });
  assert.equal(getRoleNavigation('recipient').action.label, 'My packages');
  assert.equal(getRoleNavigation('admin').action.href, '/dashboard/admin#network-shipments');
});

test('returns null for unknown roles', () => {
  assert.equal(getRoleNavigation('manager'), null);
  assert.equal(getRoleNavigation(null), null);
});

test('marks exact and nested destinations active without matching unrelated routes', () => {
  const shipper = getRoleNavigation('shipper');
  assert.equal(isNavItemActive({ label: 'Overview', href: shipper.overviewHref }, '/dashboard/shipper'), true);
  assert.equal(isNavItemActive({ label: 'Overview', href: shipper.overviewHref }, '/dashboard/shipper/new'), true);
  assert.equal(isNavItemActive({ label: 'Overview', href: shipper.overviewHref }, '/dashboard/driver'), false);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test lib/navigation.test.mjs`

Expected: FAIL because `lib/navigation.mjs` does not exist.

- [ ] **Step 3: Implement the minimal configuration**

Create `lib/navigation.mjs` with the tested behavior. Use exact role values and destinations:

```js
const roleNavigation = {
  shipper: {
    label: 'Shipper',
    overviewHref: '/dashboard/shipper',
    action: { label: 'Book shipment', href: '/dashboard/shipper/new' },
  },
  driver: {
    label: 'Driver',
    overviewHref: '/dashboard/driver',
    action: { label: 'Deliveries', href: '/dashboard/driver#delivery-workspace' },
  },
  recipient: {
    label: 'Recipient',
    overviewHref: '/dashboard/recipient',
    action: { label: 'My packages', href: '/dashboard/recipient#my-packages' },
  },
  admin: {
    label: 'Admin',
    overviewHref: '/dashboard/admin',
    action: { label: 'Shipments', href: '/dashboard/admin#network-shipments' },
  },
};

function getRoleNavigation(role) {
  return roleNavigation[role] ?? null;
}

function isNavItemActive(item, pathname) {
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export { roleNavigation, getRoleNavigation, isNavItemActive };
```

Use this one `.mjs` implementation from the React components and Node tests. Do not maintain a second TypeScript mapping.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test lib/navigation.test.mjs`

Expected: all three tests pass.

- [ ] **Step 5: Commit the task**

Do not commit unless Victor explicitly requests a commit. If committing is authorized, stage only the navigation configuration and test files.

---

### Task 2: Build the Shared Mobile Menu

**Files:**
- Create: `components/mobile-nav.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes `items: NavItem[]`, `pathname: string`, and `ariaLabel: string`.
- Produces a menu button with `aria-expanded` and `aria-controls`.
- Produces links with `aria-current="page"` for the active item.
- Escape closes the menu and restores focus to the menu button.

- [ ] **Step 1: Write the failing behavioral test or test harness**

Use the repository's available test setup. If no React component test runner exists, add a small DOM contract test only for the static rendered attributes through the existing approved test tooling. The required assertions are:

```text
menu button starts with aria-expanded="false"
menu button points to the rendered menu id
opening the menu sets aria-expanded="true"
Escape closes the menu
active link has aria-current="page"
```

- [ ] **Step 2: Run the test to verify it fails**

Run the focused menu test. Expected: FAIL because `MobileNav` does not exist.

- [ ] **Step 3: Implement the smallest menu**

Use a client component with `useState`, `useEffect`, and a button ref. Render a solid token-based surface. Close on link selection and Escape. Do not add animation libraries. Use the existing `prefers-reduced-motion` CSS rule.

- [ ] **Step 4: Run the focused test**

Expected: all menu semantics and Escape assertions pass.

- [ ] **Step 5: Commit only if explicitly authorized**

Stage `components/mobile-nav.tsx`, its test, and the minimal CSS change only if committing is authorized.

---

### Task 3: Build Public And Authenticated Headers

**Files:**
- Create: `components/public-header.tsx`
- Create: `components/app-header.tsx`
- Modify: `components/landing-header.tsx`

**Interfaces:**
- `PublicHeader` accepts no required props and reads auth state through Clerk.
- `AppHeader` accepts `{ role: AppRole; pathname?: string }`.
- Both headers use `Logo` and `MobileNav`.

- [ ] **Step 1: Add route-level render checks**

Add or extend a test that confirms the static navigation configuration produces these labels: `Track shipment`, `Sign in`, `Create account`, `Overview`, `Book shipment`, `Deliveries`, `My packages`, and `Shipments`.

- [ ] **Step 2: Run the checks to verify the new headers are absent**

Expected: FAIL until the shared components exist.

- [ ] **Step 3: Implement `PublicHeader`**

Render a semantic `header` containing a `nav`. Link the logo to `/`. Render `Track shipment` to `/#track-shipment`. For signed-out users render Clerk sign-in and sign-up buttons. For signed-in users render `Dashboard` to `/onboard` and `UserButton`.

- [ ] **Step 4: Implement `AppHeader`**

Use `getRoleNavigation(role)`. Link the logo and `Overview` to the role overview. Render the role action, `Track shipment` to `/#track-shipment`, the role label, and `UserButton`. If the role is unknown, render only safe public tracking and account controls without cross-role destinations.

- [ ] **Step 5: Replace the landing-only header**

Make `components/landing-header.tsx` re-export or wrap `PublicHeader` so existing imports do not create two header implementations.

- [ ] **Step 6: Run lint and build type checks**

Run: `npm run lint`

Expected: 0 errors. Existing warnings may remain.

Run: `npm run build`

Expected: Next.js compilation and TypeScript checks pass.

---

### Task 4: Add Breadcrumbs And Migrate Public Routes

**Files:**
- Create: `components/breadcrumbs.tsx`
- Modify: `app/page.tsx`
- Modify: `app/tracking/[trackingNumber]/tracking-client.tsx`
- Modify: `app/onboard/page.tsx`

**Interfaces:**
- `Breadcrumbs` accepts `items: Array<{ label: string; href?: string }>`.
- The final item renders as the current location and has no link.

- [ ] **Step 1: Add the breadcrumb contract test**

Assert that linked items render as links, the final item does not render as a link, and the breadcrumb has `aria-label="Breadcrumb"`.

- [ ] **Step 2: Run the test to verify it fails**

Expected: FAIL because `Breadcrumbs` does not exist.

- [ ] **Step 3: Implement `Breadcrumbs`**

Use an ordered list inside a `nav`. Use text separators that remain readable without color. Keep the component visually quiet and keyboard accessible.

- [ ] **Step 4: Add `id="track-shipment"` to the landing tracking section**

Keep the existing tracking form behavior. Do not redesign the landing content in this task.

- [ ] **Step 5: Replace the public tracking header**

Render `PublicHeader`, then `Breadcrumbs` with `Home` linking to `/`, `Track shipment` linking to `/#track-shipment`, and the current tracking number. Preserve public access and realtime map behavior.

- [ ] **Step 6: Update onboarding**

Add a simple onboarding header with the linked logo, current context `Choose role`, and `UserButton`. Do not show dashboard links before role selection.

- [ ] **Step 7: Run focused tests and build**

Run: `node --test lib/*.test.mjs`

Expected: all focused Node tests pass.

Run: `npm run build`

Expected: build passes.

---

### Task 5: Migrate Authenticated Role Pages

**Files:**
- Modify: `app/dashboard/shipper/page.tsx`
- Modify: `app/dashboard/shipper/new/page.tsx`
- Modify: `app/dashboard/shipper/shipments/[trackingNumber]/shipment-details-client.tsx`
- Modify: `app/dashboard/driver/page.tsx`
- Modify: `app/dashboard/recipient/page.tsx`
- Modify: `app/dashboard/admin/page.tsx`

**Interfaces:**
- Each page uses `AppHeader` with its fixed role.
- Booking and detail pages use `Breadcrumbs` with explicit labels.
- Existing fragment destinations remain stable.

- [ ] **Step 1: Add the required anchors before changing headers**

Use these exact anchors:

```tsx
<section id="my-shipments">...</section>
<div id="delivery-workspace">...</div>
<section id="my-packages">...</section>
<div id="network-shipments">...</div>
```

Do not duplicate an existing `id`.

- [ ] **Step 2: Replace each standalone header**

Remove framework badges, role-specific accent classes, and duplicate logo headers. Render `AppHeader` once at the top of each page. Preserve `UserButton` through `AppHeader`.

- [ ] **Step 3: Add local breadcrumbs**

Use:

```tsx
<Breadcrumbs items={[{ label: 'Overview', href: '/dashboard/shipper' }, { label: 'Book shipment' }]} />
```

For shipment detail use `Overview`, `Shipments`, and the tracking number. Use the correct role overview route.

- [ ] **Step 4: Preserve existing workflow actions**

Keep booking, claiming, transit, delivery, admin override, tracking, and onboarding actions unchanged. Navigation changes must not change server actions or data queries.

- [ ] **Step 5: Run lint and build**

Run: `npm run lint`

Expected: 0 errors and no new warnings caused by removed imports.

Run: `npm run build`

Expected: all current routes compile and static generation completes.

---

### Task 6: Browser And Keyboard Audit

**Files:**
- Modify: `LIVETRACK_REDESIGN_PLAN.md`

- [ ] **Step 1: Start the development server**

Run: `npm run dev -- --port 3001`

Expected: LiveTrack responds at `http://localhost:3001`.

- [ ] **Step 2: Audit public routes with Brave**

Use `/home/redmane/.agents/playwright-core/clean-context.mjs` and inspect `/` and `/tracking/<known-number>` at 375px, 768px, 1024px, and 1440px.

Verify:

- Logo links to `/`.
- Tracking link reaches `#track-shipment`.
- Signed-out auth controls remain visible.
- Mobile menu exposes labels and closes on Escape.
- No horizontal overflow exists.
- Disclosure appears once visually.

- [ ] **Step 3: Audit authenticated routes**

Use an existing safe authenticated test session if available. Inspect each role dashboard, booking, and shipment detail page. Verify overview, role action, tracking, breadcrumbs, active state, and account controls.

- [ ] **Step 4: Run final automated checks**

Run:

```bash
node --test lib/*.test.mjs
npm run lint
npm run build
git diff --check
```

Expected: tests pass, lint has no errors, build passes, and diff check has no output.

- [ ] **Step 5: Update stage status**

Change Stage 1.5 in `LIVETRACK_REDESIGN_PLAN.md` to `Ready for review` only after browser and keyboard checks pass. Do not start Stage 2.

---

## Plan Self-Review

- Spec coverage: public header, authenticated header, onboarding variant, mobile menu, breadcrumbs, active state, keyboard behavior, reduced motion, role boundaries, anchors, testing, and out-of-scope limits are covered by Tasks 1 through 6.
- Placeholder scan: no placeholder or unspecified implementation step remains.
- Type consistency: `AppRole`, `NavItem`, `RoleNavigation`, `getRoleNavigation`, and `isNavItemActive` are defined in Task 1 and consumed consistently in later tasks.
- Approval boundary: implementation must stop before Stage 2 and report Stage 1.5 for review.
