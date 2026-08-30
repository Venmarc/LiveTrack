# LiveTrack Dispatch Ledger Design Foundation

## Status

Ready for review.

## Scope

This foundation defines the product truth and visual rules for the LiveTrack redesign. It prepares later interface work without changing the working Next.js, Clerk, Supabase, Realtime, Leaflet, or server-action architecture.

## Product Decision

LiveTrack remains a portfolio demonstration of a real-time logistics workflow. The supported proof is the working booking-to-delivery flow across shipper, driver, recipient, and admin views.

The interface will show this disclosure once:

> LiveTrack is a portfolio demonstration. Location data and carrier events are simulated.

The redesign will not add fake customers, testimonials, carrier integrations, production claims, or performance claims.

## Visual Decision

The approved direction is Dispatch Ledger. It uses a deep graphite environment, warm white text, one safety-orange route accent, restrained green success states, blue only for map information, and operational records instead of generic SaaS card stacks.

The system will use semantic CSS tokens, one shared status map, a 4px spacing scale, consistent radii, strong focus indicators, and reduced-motion defaults.

## Application Order

1. Establish product and design documents.
2. Add shared CSS tokens and primitive rules.
3. Replace emoji branding and the loud demo banner.
4. Apply the system to the landing page.
5. Apply it to public tracking.
6. Apply it to authenticated role shells and workspaces.
7. Harden backend transitions and reliability after the visual workflow is coherent.

## Acceptance Criteria

- Product claims match the routes, README, demo script, and server actions.
- The disclosure appears verbatim in the foundation documents.
- Semantic status roles are defined.
- The rules guide landing, tracking, and dashboard surfaces.
- The foundation contains no placeholder decisions.
- Later stages preserve the proven workflow and public marker movement.

## Review Questions

- Does the product description state the actual workflow without overclaiming?
- Does the Dispatch Ledger direction fit both public tracking and authenticated workspaces?
- Are the semantic color roles clear enough to prevent role-specific palettes?
- Are any typography, spacing, or responsive rules unclear before implementation?
