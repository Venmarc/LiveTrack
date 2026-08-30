# Product

## Register

product

## Users

LiveTrack serves technical reviewers, hiring managers, and portfolio visitors who need to understand the system quickly.

The product demonstrates one shared shipment workflow across four roles:

- Shippers book shipments and review their shipment records.
- Drivers claim available jobs, confirm pickup, start transit, and complete delivery.
- Recipients follow shipment status and location through the public tracking page.
- Admins inspect shipments and can override status for demonstration purposes.

The main user job is to see one shipment move from booking to delivery, with each role seeing the relevant part of the same record.

## Product Purpose

LiveTrack is a portfolio demonstration of a real-time logistics workflow. It shows booking, driver assignment, pickup, transit simulation, public tracking, and delivery.

The product proves its value through the working flow. It does not depend on marketing claims, fictional customers, or invented scale.

The core flow is:

1. A shipper books a shipment.
2. A driver claims the available shipment.
3. The driver confirms pickup and starts transit.
4. A server-side simulation writes GPS positions to Supabase.
5. Supabase Realtime streams positions to the public tracking page.
6. The shipment reaches delivered status.

## Role Jobs

### Shipper

Job: create and monitor a shipment.

Main actions: create a booking, copy the tracking number, inspect shipment status, and review the event timeline.

### Driver

Job: move an assigned shipment through its delivery states.

Main actions: view available jobs, claim a job, confirm pickup, start transit, and mark delivery complete.

### Recipient

Job: understand where a shipment is and what happened to it.

Main actions: view shipment status, inspect the route, and read the milestone timeline.

### Admin

Job: inspect the demonstration workflow and correct a shipment state when needed.

Main actions: review shipment records and use the status override controls.

## Supported Claims

LiveTrack supports these claims:

- It demonstrates a booking-to-delivery logistics workflow.
- It supports shipper, driver, recipient, and admin views.
- It uses Clerk for role-based authentication.
- It uses Supabase Postgres and Realtime for shipment data and location updates.
- It uses a server-side simulation to move a shipment along a route.
- It provides a public tracking page without requiring authentication.

## Prohibited Claims

Do not claim that LiveTrack:

- Connects to a real carrier feed.
- Uses live production location data.
- Represents a production logistics service.
- Supports real customers, carriers, or delivery networks.
- Provides measured enterprise scale, uptime, speed, or savings.

## Public Tracking

Public tracking accepts a shipment tracking number without authentication. It shows the current status, route endpoints, shipment milestones, and simulated marker movement while transit runs.

The tracking page must explain simulated data in the site-level disclosure. It must not imply that the map represents a live carrier location.

## Simulation Disclosure

Use this text verbatim in the product and interface documentation:

> LiveTrack is a portfolio demonstration. Location data and carrier events are simulated.

The interface should show this disclosure once in a quiet site-level location. Avoid repeated demo banners and status badges that distract from the working flow.

## Success Criteria

- A reviewer can understand the product purpose within one minute.
- A reviewer can complete the booking-to-delivery flow without hidden setup.
- Public tracking works without authentication.
- The public marker moves during simulated transit.
- All four roles show consistent shipment state.
- The interface makes simulation boundaries clear without weakening the demonstration.
- Keyboard users can operate all controls.
- Text and control states meet WCAG AA contrast targets.

## Known Demo Constraints

- Location data and carrier events are simulated.
- The route simulation uses a fixed route and timed position updates.
- Demo accounts and seeded data support portfolio demonstration only.
- Clerk and Supabase environment configuration is required for a complete local or deployed flow.
- Admin overrides support demonstration recovery and do not model a full operations policy.

## Product Principles

### Show The Workflow

Let the working shipment flow prove the product. Use copy to orient the reviewer, not to replace evidence.

### Keep The Record Consistent

Show one shipment state across role views. Use shared terms for statuses, milestones, and tracking numbers.

### Be Honest About Simulation

State the simulation boundary clearly. Do not hide it and do not repeat it so often that it becomes visual noise.

### Prefer Useful Density

Use timelines, tables, route records, and split panels when they help a reviewer inspect the workflow.

### Make The Next Action Clear

Each role view should point to the next useful action without forcing the user to search the interface.
