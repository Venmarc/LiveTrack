# LiveTrack Product Redesign And Hardening Plan

> **For agentic workers:** Implement this plan one stage at a time. Mark each stage complete only after its checks pass and Victor reviews it. Use the relevant installed skill before each stage. Do not start the next stage while review changes remain open.

**Status:** Stage 1.5 navigation implemented and verified. Ready for review.

**Next action:** Victor reviews the Stage 1.5 navigation implementation. After approval, start Stage 2 (landing page).

**Goal:** Turn LiveTrack from a credible functional prototype into a coherent, handcrafted portfolio product without false production claims.

**Architecture:** Preserve the working Next.js, Clerk, Supabase, Realtime, Leaflet, and server-action architecture. Build a small semantic visual system first, then apply it to each surface in workflow order. Harden backend behavior after the visual workflow is coherent, and finish with full cross-role verification.

**Tech stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Clerk, Supabase Postgres and Realtime, Leaflet, Zod, Sonner.

## Product Truth

LiveTrack is a portfolio demonstration of a real-time logistics workflow. It supports booking, driver assignment, pickup, transit simulation, public tracking, and delivery across four roles.

Use one restrained disclosure:

> LiveTrack is a portfolio demonstration. Location data and carrier events are simulated.

Place this disclosure once in a quiet site-level location, such as the footer. Do not repeat demo badges throughout the interface.

Never add fake customers, fake testimonials, fake carrier integrations, fake performance figures, or fake production claims. The working workflow is the proof.

## Approved Visual Direction

**Name:** Dispatch Ledger

**Scene:** A dispatcher or technical reviewer studies a live route and shipment record in a dim operations room. The interface must remain readable, controlled, and calm.

**Design dials:**

- Design variance: 7/10
- Motion intensity: 5/10
- Visual density: 6/10

**Visual language:**

- Deep graphite background.
- Warm white primary text.
- One safety-orange or route-amber primary accent.
- Restrained green for successful delivery states.
- Blue only for map and navigation information.
- Thin route lines and tabular details used as structure.
- Practical sans-serif body type with a restrained display face.
- Tabular numbers for tracking codes, times, speeds, and counts.
- Fewer cards and stronger use of split panels, route records, tables, and timelines.
- One consistent radius scale.
- Clear focus states and WCAG AA contrast.
- Motion only for hierarchy, feedback, live state, and route progression.

**Remove these generated-interface signals:**

- Centered generic SaaS hero.
- Three equal feature cards.
- Emoji branding.
- Blue, purple, emerald, and indigo role palettes.
- Repeated translucent rounded cards.
- Repeated uppercase tracked labels.
- Decorative technology badges.
- Broad glow shadows.
- Repeated demo and portal badges.

## Global Constraints

- Preserve the proven booking-to-delivery workflow.
- Preserve realtime public marker movement.
- Keep public tracking available without authentication.
- Keep role access for shipper, driver, recipient, and admin.
- Make the smallest correct change in each stage.
- Do not add a component abstraction without a second real use.
- Do not install a dependency unless existing tools cannot meet the requirement.
- Use semantic HTML and complete keyboard behavior.
- Respect `prefers-reduced-motion` for every animation.
- Keep body text contrast at 4.5:1 or higher.
- Keep large text and UI component contrast at 3:1 or higher.
- Keep touch targets at least 44 by 44 CSS pixels where practical.
- Test desktop, tablet, and mobile layouts.
- Do not modify unrelated local files.
- Keep `next-env.d.ts`, `tsconfig.tsbuildinfo`, `supabase/.gitignore`, and `supabase/config.toml` unstaged unless a later approved task requires them.
- Do not push, commit, or deploy unless Victor explicitly approves that action.

## Review Protocol

For each stage:

1. Load the listed skills before work.
2. Inspect the affected source and current browser output.
3. State the stage goal, acceptance criteria, assumptions, files, and checks.
4. Wait for Victor's approval before editing when the stage is standard, risky, or incident work.
5. Implement only that stage.
6. Run the listed automated checks.
7. Inspect the result in a real browser at desktop and mobile sizes.
8. Mark the stage `Ready for review`.
9. Report changed files, evidence, limitations, and review points.
10. Wait for Victor's review before the next stage.

## Progress

- [x] Stage 0: Product and design foundation — Approved by Victor
- [x] Stage 1: Shared visual primitives — Ready for review
- [ ] Stage 1.5: Journey and navigation architecture — Ready for review
- [ ] Stage 2: Landing page
- [ ] Stage 3: Public tracking experience
- [ ] Stage 4: Shared authenticated shell
- [ ] Stage 5: Shipper workspace
- [ ] Stage 6: Driver workspace
- [ ] Stage 7: Recipient and admin workspaces
- [ ] Stage 8: Backend and reliability hardening
- [ ] Stage 9: Final quality and release pass

---

## Stage 0: Product And Design Foundation

**Status:** Complete — Approved by Victor

**Required skills:** `impeccable`, `design-principles`, `color-system`, `typography-scale`, `spacing-system`, `layout-grid`, `content-strategy`, `writing-for-agents`.

**Goal:** Create the product and visual sources of truth before changing interface code.

**Files:**

- Create `PRODUCT.md`.
- Create `DESIGN.md`.
- Create `docs/superpowers/specs/2026-08-25-livetrack-dispatch-ledger-design.md`.
- Modify this plan only to update Stage 0 status.

**PRODUCT.md must define:**

- Product promise and working workflow.
- Primary audience: technical reviewers, hiring managers, and portfolio visitors.
- Four role jobs and their main actions.
- Supported claims and prohibited claims.
- Public tracking behavior.
- Simulation disclosure.
- Core success criteria.
- Known demo constraints.

**DESIGN.md must define:**

- Dispatch Ledger direction and physical scene.
- Semantic color tokens and contrast targets.
- Typography families, scale, weights, line heights, and number styling.
- Spacing scale and container widths.
- Radius, border, and shadow rules.
- Button, input, status, table, panel, timeline, and map rules.
- Responsive rules for all main page families.
- Motion rules and reduced-motion behavior.
- Accessibility requirements.
- Copy voice and terminology.
- Examples of patterns to use and patterns to reject.

**Acceptance criteria:**

- Product claims match the implemented workflow.
- The single disclosure text appears verbatim in the documents.
- All status colors have defined semantic roles.
- The design rules can guide landing, tracking, and dashboard surfaces.
- No placeholder text, unresolved choice, or contradictory rule remains.
- Victor approves all three documents.

**Checks:**

- Search for `TBD`, `TODO`, and ambiguous alternatives.
- Compare product claims with `README.md`, `DEMO.md`, routes, and server actions.
- Check every proposed foreground and background color pair for contrast.
- Review the files directly with Victor.

**Completion:** Approved by Victor. Stage 1 may begin.

---

## Stage 1: Shared Visual Primitives

**Status:** Ready for review

**Required skills:** `impeccable`, `theming-system`, `color-system`, `typography-scale`, `spacing-system`, `component-spec`, `accessibility-audit`, `test-driven-development`.

**Goal:** Replace scattered visual decisions with a small semantic system used by all later stages.

**Files to inspect and likely modify:**

- `app/globals.css`
- `app/layout.tsx`
- `components/logo.tsx`
- `components/demo-banner.tsx`
- `components/copyable-tracking-number.tsx`
- Shared components created only when two or more current surfaces need them.

**Work:**

- Add semantic CSS tokens for page, surface, text, border, accent, map, success, warning, danger, and focus.
- Add typography, spacing, radius, and layer tokens.
- Create one status presentation map shared by pages that duplicate status styles.
- Standardize buttons, inputs, tables, panels, and focus indicators.
- Replace emoji branding with a simple text or geometric brand mark.
- Replace the loud global demo banner with the single quiet disclosure.
- Remove decorative stack labels and broad glow shadows.
- Add reduced-motion defaults.

**Acceptance criteria:**

- Shared states look consistent across a small reference surface.
- No role owns a separate accent palette.
- All controls have visible hover, active, focus, disabled, and loading states.
- The disclosure appears once.
- Existing workflows still build and run.

**Checks:**

- Focused unit tests for any extracted status or formatting logic.
- `npm run lint`
- `npm run build`
- Browser review in desktop and mobile widths.
- Keyboard-only review.
- Contrast review.

**Completion:** Ready for review. Do not begin Stage 2 until Victor reviews this stage.

---

## Stage 1.5: Journey And Navigation Architecture

**Status:** Specification ready for review

**Required skills:** `journey-map`, `information-architecture`, `navigation-patterns`, `accessibility-audit`, `test-driven-development`.

**Goal:** Give public and authenticated users a stable, role-aware navigation system before individual page redesigns continue.

**Specification:** `docs/superpowers/specs/2026-08-25-livetrack-navigation-design.md`

**Scope:**

- Add one shared public header.
- Add one shared authenticated role header.
- Add labeled local breadcrumbs to booking and detail pages.
- Add a labeled mobile navigation menu.
- Preserve middleware role protection and existing workflows.

**Completion:** Mark `Ready for review`. Do not begin Stage 2 until Victor reviews the implemented navigation.

---

## Stage 2: Landing Page

**Status:** Blocked by Stage 1 approval

**Required skills:** `brainstorming` if the approved spec needs revision, `frontend-design`, `design-taste-frontend`, `impeccable`, `content-strategy`, `information-architecture`, `design-motion-principles`, `accessibility-audit`, `test-driven-development`.

**Goal:** Make the landing page a clear, memorable entry to the working logistics flow.

**Files to inspect and likely modify:**

- `app/page.tsx`
- `components/landing-header.tsx`
- `components/tracking-search.tsx`
- `app/layout.tsx` metadata
- New landing-only visual components when they have a clear isolated purpose.

**Work:**

- Replace the centered SaaS hero with an asymmetric dispatch composition.
- Make public tracking the primary action.
- Show a real application-derived shipment or route state as product proof.
- Explain the lifecycle: book, assign, move, deliver.
- Keep copy short and factual.
- Remove framework badges and unsupported enterprise language.
- Add purposeful route progression and live-state motion.
- Keep all useful hero content in the initial viewport.
- Keep the footer disclosure quiet and readable.

**Acceptance criteria:**

- A first-time visitor understands the product and primary action within five seconds.
- The page uses at least four distinct section compositions if it has six or more sections.
- No three-equal-card feature row remains.
- The hero contains no more than four text elements.
- Public tracking works from the hero.
- Desktop and mobile layouts remain intentional.

**Checks:**

- `npm run lint`
- `npm run build`
- Browser screenshots at 1440, 1024, 768, and 390 CSS pixels.
- Keyboard, contrast, reduced-motion, and copy review.
- Lighthouse measurement for performance, accessibility, best practices, and SEO.

**Completion:** Mark `Ready for review`. Do not begin Stage 3.

---

## Stage 3: Public Tracking Experience

**Status:** Blocked by Stage 2 approval

**Required skills:** `impeccable`, `data-visualization`, `state-machine`, `loading-states`, `error-handling-ux`, `feedback-patterns`, `design-motion-principles`, `accessibility-audit`, `systematic-debugging`, `test-driven-development`.

**Goal:** Make public tracking the strongest proof of LiveTrack's realtime behavior.

**Files to inspect and likely modify:**

- `app/tracking/[trackingNumber]/tracking-client.tsx`
- `app/tracking/[trackingNumber]/page.tsx`
- `app/tracking/[trackingNumber]/loading.tsx`
- `components/map/live-map.tsx`
- Shared status and shell components from Stage 1.

**Work:**

- Give current status, tracking number, route, and last update clear priority.
- Improve progress for normal, delayed, cancelled, and delivered states.
- Add visible realtime connection state without technical clutter.
- Improve map hierarchy and responsive height.
- Make timeline events easier to scan.
- Add accessible live announcements for important status changes.
- Improve loading, invalid tracking, unavailable data, and connection failure states.
- Preserve map deferral and marker movement performance.

**Acceptance criteria:**

- A live shipment updates without a manual reload.
- Marker movement remains visible during transit.
- Delayed, cancelled, and delivered states cannot be confused.
- Invalid tracking has a useful recovery path.
- Screen readers receive important status changes without excessive announcements.
- Mobile users can read progress and use the map without horizontal overflow.

**Checks:**

- Focused tests for status progression and state mapping.
- Existing realtime watcher or equivalent browser automation.
- `npm run lint`
- `npm run build`
- Valid, invalid, delayed, cancelled, and delivered browser checks.
- Keyboard, reduced-motion, contrast, and mobile checks.

**Completion:** Mark `Ready for review`. Do not begin Stage 4.

---

## Stage 4: Shared Authenticated Shell

**Status:** Blocked by Stage 3 approval

**Required skills:** `impeccable`, `navigation-patterns`, `information-architecture`, `component-spec`, `onboarding-design`, `accessibility-audit`, `test-driven-development`.

**Goal:** Give all four roles one coherent operations shell while preserving distinct jobs.

**Files to inspect and likely modify:**

- `app/dashboard/layout.tsx`
- `app/dashboard/loading.tsx`
- `components/role-onboarding.tsx`
- Role page headers.
- New shared dashboard shell components only when used by multiple roles.

**Work:**

- Establish one dashboard header, page frame, content width, and mobile navigation pattern.
- Express role identity through title, task, and navigation instead of role color.
- Integrate mission guidance into the page hierarchy.
- Preserve dismiss and replay behavior.
- Standardize loading, empty, error, and permission states.
- Remove repeated portal and demo badges.

**Acceptance criteria:**

- All roles look like one product.
- Each role's main task is clear within one viewport.
- Mission guidance does not block normal use.
- Header and navigation fit at desktop and mobile widths.
- Loading states match final layout geometry.

**Checks:**

- Existing onboarding unit tests.
- New tests for shared presentation logic where needed.
- `npm run lint`
- `npm run build`
- Browser review for all four role accounts at desktop and mobile widths.

**Completion:** Mark `Ready for review`. Do not begin Stage 5.

---

## Stage 5: Shipper Workspace

**Status:** Blocked by Stage 4 approval

**Required skills:** `impeccable`, `form-design`, `error-handling-ux`, `state-machine`, `feedback-patterns`, `loading-states`, `accessibility-audit`, `test-driven-development`.

**Goal:** Make shipment booking and outbound management feel like a deliberate dispatch workflow.

**Files to inspect and likely modify:**

- `app/dashboard/shipper/page.tsx`
- `app/dashboard/shipper/new/page.tsx`
- `app/dashboard/shipper/shipments/[trackingNumber]/page.tsx`
- `app/dashboard/shipper/shipments/[trackingNumber]/shipment-details-client.tsx`
- `components/seed-button.tsx`

**Work:**

- Replace decorative statistics with useful dispatch summaries.
- Improve shipment list hierarchy and mobile behavior.
- Group booking fields by recipient, origin, destination, and delivery details.
- Improve validation, errors, loading, confirmation, and duplicate-submit protection.
- Present shipment detail as a route record.
- Keep seed data clearly separate from the primary booking action.

**Acceptance criteria:**

- A reviewer can book a shipment quickly without explanation.
- Field labels and errors remain visible and clear.
- The new shipment appears in shipper, driver, and public flows.
- Tables have a deliberate mobile fallback.
- Empty and limit states explain the next valid action.

**Checks:**

- Action and validation tests where feasible.
- Manual booking with valid and invalid data.
- Duplicate-submit check.
- `npm run lint`
- `npm run build`
- Desktop, mobile, keyboard, and contrast checks.

**Completion:** Mark `Ready for review`. Do not begin Stage 6.

---

## Stage 6: Driver Workspace

**Status:** Blocked by Stage 5 approval

**Required skills:** `impeccable`, `state-machine`, `feedback-patterns`, `loading-states`, `error-handling-ux`, `data-visualization`, `accessibility-audit`, `systematic-debugging`, `test-driven-development`.

**Goal:** Make the active delivery run the primary driver workspace and keep every state action clear.

**Files to inspect and likely modify:**

- `app/dashboard/driver/page.tsx`
- `app/dashboard/driver/driver-dashboard-client.tsx`
- Shared status and map components.

**Work:**

- Prioritize active route, next valid action, and route context.
- Simplify active, available, and history navigation.
- Reduce nested cards.
- Improve claim, pickup, transit, delay, resume, and delivery controls.
- Explain disabled actions and run limits.
- Handle stale or conflicting updates safely.
- Keep map expansion useful on desktop and mobile.
- Preserve the server-side transit simulation.

**Acceptance criteria:**

- The next valid state action is always obvious.
- Invalid transitions are unavailable and explained.
- Claiming cannot silently exceed the active-run limit.
- Starting transit moves the public marker.
- Delivery updates all role views.
- Failure feedback identifies what happened and what to do next.

**Checks:**

- Focused transition tests.
- Full claim, pickup, transit, movement, delay, resume, and delivery flow.
- Cross-tab stale-state check.
- `npm run lint`
- `npm run build`
- Desktop, mobile, keyboard, and contrast checks.

**Completion:** Mark `Ready for review`. Do not begin Stage 7.

---

## Stage 7: Recipient And Admin Workspaces

**Status:** Blocked by Stage 6 approval

**Required skills:** `impeccable`, `information-architecture`, `data-visualization`, `feedback-patterns`, `error-handling-ux`, `accessibility-audit`, `test-driven-development`.

**Goal:** Focus the recipient on package location and the admin on network state and exceptions.

**Files to inspect and likely modify:**

- `app/dashboard/recipient/page.tsx`
- `app/dashboard/admin/page.tsx`
- `app/dashboard/admin/admin-actions.tsx`

**Recipient work:**

- Lead with the latest inbound package and its state.
- Keep tracking search available without dominating known shipments.
- Improve package list and empty state.
- Make driver, route, estimate, and live tracking easy to scan.

**Admin work:**

- Lead with network state and exceptions.
- Improve shipment filtering and route scanning only if current data justifies it.
- Make overrides deliberate and safe.
- Require clear confirmation for destructive or irreversible actions.
- Show action feedback and failure recovery.

**Acceptance criteria:**

- The recipient can answer “Where is my package?” immediately.
- The admin can find active and delayed shipments quickly.
- Admin actions cannot be triggered accidentally.
- All roles show a consistent shipment state.
- Mobile tables have usable alternatives.

**Checks:**

- Recipient account browser flow.
- Admin account browser flow.
- Admin action tests where feasible.
- Cross-role consistency check.
- `npm run lint`
- `npm run build`
- Desktop, mobile, keyboard, and contrast checks.

**Completion:** Mark `Ready for review`. Do not begin Stage 8.

---

## Stage 8: Backend And Reliability Hardening

**Status:** Blocked by Stage 7 approval

**Required skills:** `systematic-debugging`, `test-driven-development`, `supabase`, `supabase-postgres-best-practices`, `state-machine`, `error-handling-ux`, `verification-before-completion`.

**Goal:** Confirm that authorization, status transitions, simulation, realtime, and failure paths support the polished interface safely.

**Files to inspect before selecting changes:**

- `server/actions/auth-actions.ts`
- `server/actions/shipment-actions.ts`
- `lib/simulation.ts`
- `lib/supabase.ts`
- `lib/supabase-server.ts`
- `middleware.ts` or the active route-protection file.
- `app/api/webhooks/clerk/**`
- `supabase/migrations/**`
- Database types and schema scripts.

**Audit areas:**

- Role authorization on every server action.
- Server-side validation and trusted identifiers.
- Allowed shipment status transitions.
- Duplicate driver claims.
- Stale concurrent updates.
- Active shipment limits.
- Duplicate simulations and orphaned simulation work.
- Realtime subscription cleanup and reconnect behavior.
- Public data exposure and Row Level Security.
- Invalid tracking behavior.
- Clerk profile synchronization.
- Safe error logging without secrets.
- Checked-in migration parity with deployed Supabase state.

**Implementation rule:** Change only confirmed defects. Write a failing test or reproducible check before each fix.

**Acceptance criteria:**

- Unauthorized role actions fail on the server.
- Invalid state transitions fail consistently.
- Concurrent claims have one winner.
- Transit starts one simulation per shipment.
- Realtime recovers or gives clear failure feedback.
- Public tracking exposes only intended fields.
- No secret appears in logs, client code, or commits.

**Checks:**

- Focused tests for every confirmed defect.
- Supabase policy and migration review.
- Full local cross-role flow.
- `npm run lint`
- `npm run build`
- Secret scan of the intended diff before any commit.

**Completion:** Mark `Ready for review`. Do not begin Stage 9.

---

## Stage 9: Final Quality And Release Pass

**Status:** Blocked by Stage 8 approval

**Required skills:** `impeccable`, `accessibility-audit`, `design-motion-principles`, `seo`, `verification-before-completion`, `requesting-code-review`.

**Goal:** Verify the complete product as a deployed, repeatable portfolio demonstration.

**Files to inspect and likely modify:**

- `README.md`
- `DEMO.md`
- Metadata and robots files.
- Loading and error states found during final checks.
- This plan for final completion status.

**Work:**

- Run a WCAG 2.2 review across key routes.
- Check responsive behavior at representative widths.
- Check light sensitivity, reduced motion, focus order, labels, and live regions.
- Audit every visible string for clarity and truthful claims.
- Run Lighthouse on landing and tracking pages.
- Rehearse the 90-second demonstration.
- Capture final desktop and mobile screenshots.
- Update README with the deployed URL and current workflow.
- Update DEMO.md with exact final labels and recovery notes.
- Request a final code review focused on regressions, security, and missing tests.

**Release acceptance criteria:**

- Shipper books a shipment.
- Driver claims it and confirms pickup.
- Driver starts transit.
- Public marker moves through realtime updates.
- Shipment reaches delivered state.
- Recipient and admin show the same final state.
- Invalid tracking has a clear recovery path.
- All role access rules remain correct.
- Landing and key product pages work at desktop and mobile widths.
- Keyboard navigation and focus are complete.
- Reduced motion works.
- Lint and build pass, with any remaining warnings documented.
- README and demo script match deployed behavior.
- The single simulation disclosure is present and legible.

**Final checks:**

- `node --test lib/onboarding-steps.test.mjs` plus all tests added by this plan.
- `npm run lint`
- `npm run build`
- Full browser rehearsal on the deployed Vercel URL.
- Lighthouse reports for landing and public tracking.
- Final `git diff` review.
- Final secret scan.

**Completion:** Mark all stages complete and report remaining known limitations. Commit or push only with Victor's explicit approval.

---

## Current Proven Baseline

Preserve these facts during implementation:

- Local end-to-end booking, claiming, pickup, transit, marker movement, and delivery succeeded.
- Public tracking received realtime movement without page reload.
- The final watcher previously recorded three position updates and zero errors.
- Clerk development authentication can require one reload after landing.
- Driver automation must use the visible label `Start Transit`.
- The truck map marker uses `.livetrack-marker-wrapper` without the `livetrack-endpoint` child.
- Supabase tables use replica identity full through `supabase/migrations/04_realtime_replica_identity.sql`.
- The latest pushed commit before this plan is `4c321d9 feat: add role-based demo onboarding`.
- Existing unrelated working-tree files must remain untouched.

## Resume Instructions

When a new session starts:

1. Read `/home/redmane/AGENTS.md` and `/home/redmane/Documents/AGENTS.md`.
2. Read this plan.
3. Inspect `git status`, recent commits, `README.md`, `DEMO.md`, and the files listed in the next incomplete stage.
4. Recall agentmemory for LiveTrack if available.
5. Load every skill listed for the next incomplete stage.
6. State that stage's approval checkpoint.
7. Continue from the first unchecked stage only.
