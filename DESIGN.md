# Design

## Direction

LiveTrack uses the **Dispatch Ledger** direction.

Scene: a dispatcher or technical reviewer studies a live route and shipment record in a dim operations room. The interface feels controlled, readable, and calm.

The design uses a restrained dark theme, warm white text, one route accent, quiet status colors, thin rules, tabular data, route records, and timelines.

## Design Principles

1. **Operational clarity**: make status, next action, and route state easy to scan.
2. **Evidence over decoration**: give visual weight to working records, maps, timelines, and controls.
3. **One system**: use one semantic palette and one spacing language across all roles.
4. **Quiet confidence**: use contrast, alignment, and hierarchy instead of glow, gradients, or repeated badges.
5. **Truthful signals**: distinguish simulated events from actual interaction without inventing production authority.

## Color Tokens

Use semantic tokens in application code. Components must not create role-specific accent palettes.

### Base Palette

| Token | Value | Use |
| --- | --- | --- |
| `--color-graphite-950` | `#0b0d0f` | Page background |
| `--color-graphite-900` | `#111417` | Raised surface |
| `--color-graphite-850` | `#171b1f` | Panel surface |
| `--color-graphite-800` | `#20262b` | Hover and selected surface |
| `--color-graphite-700` | `#30383f` | Strong border |
| `--color-graphite-600` | `#46515a` | Disabled border and quiet rule |
| `--color-ink-100` | `#f4f1e9` | Primary text |
| `--color-ink-200` | `#d5d6d1` | Secondary text |
| `--color-ink-300` | `#a7aca8` | Muted text |
| `--color-ink-400` | `#7d8581` | Placeholder and tertiary text |
| `--color-route-500` | `#f28a24` | Primary action and route accent |
| `--color-route-400` | `#ffad52` | Accent hover and selected text |
| `--color-success-500` | `#6fbe79` | Delivered and successful state |
| `--color-warning-500` | `#e9b949` | Delayed or attention state |
| `--color-danger-500` | `#ed766c` | Error and destructive state |
| `--color-map-500` | `#6ea8d8` | Map and navigation information only |

### Semantic Mapping

| Semantic token | Meaning |
| --- | --- |
| `--color-page` | Main application background |
| `--color-surface` | Default panel background |
| `--color-surface-raised` | Raised controls and overlays |
| `--color-text` | Primary readable text |
| `--color-text-muted` | Supporting text that remains readable |
| `--color-border` | Default structural rule |
| `--color-border-strong` | Focused or emphasized rule |
| `--color-accent` | Primary route action |
| `--color-map` | Map-only information |
| `--color-success` | Completed shipment state |
| `--color-warning` | Delayed or attention state |
| `--color-danger` | Error or destructive state |
| `--color-focus` | Keyboard focus ring |

### Contrast Targets

- Primary and secondary body text must reach at least 4.5:1.
- Large text and UI components must reach at least 3:1.
- Focus indicators must remain visible against adjacent surfaces.
- Status meaning must include text, shape, or position. Color cannot carry meaning alone.
- Use `--color-map` only for map and navigation information. It does not become a role brand color.

## Typography

Use the existing `Inter` family for interface text and `Outfit` for the product wordmark or display moments. Use tabular numerals for tracking numbers, counts, times, dates, and speeds.

| Style | Size | Weight | Line height | Use |
| --- | --- | --- | --- | --- |
| `display` | `clamp(2.5rem, 6vw, 4.5rem)` | 600 | 1.05 | Landing headline only |
| `heading-1` | `2.25rem` | 600 | 1.1 | Page title |
| `heading-2` | `1.5rem` | 600 | 1.2 | Major panel title |
| `heading-3` | `1.125rem` | 600 | 1.3 | Component title |
| `body` | `1rem` | 400 | 1.5 | Main copy |
| `body-small` | `0.875rem` | 400 | 1.45 | Supporting copy and table cells |
| `caption` | `0.75rem` | 500 | 1.35 | Metadata and compact labels |
| `data` | `0.875rem` | 500 | 1.3 | Tracking codes and operational values |

Headings use `text-wrap: balance`. Long prose uses `text-wrap: pretty`. Display letter spacing stays at or above `-0.04em`.

## Spacing And Layout

Use a 4px base scale:

`--space-1: 4px`, `--space-2: 8px`, `--space-3: 12px`, `--space-4: 16px`, `--space-5: 20px`, `--space-6: 24px`, `--space-8: 32px`, `--space-10: 40px`, `--space-12: 48px`, `--space-16: 64px`.

Use `max-width: 1440px` for application shells and `max-width: 72ch` for long text. Use page gutters of 24px on desktop, 20px on tablet, and 16px on mobile.

Use a 12-column desktop grid when the page needs a split between record and map. Collapse to one column below 768px. Keep related controls within 8px to 16px. Separate major groups by 24px to 48px.

## Shape And Layers

- Use one radius scale: 4px for controls, 8px for panels, and 999px for compact status pills.
- Use 1px borders for structure. Avoid thick colored side stripes.
- Prefer surface contrast to shadows for elevation.
- Use shadows only for overlays and menus, with a maximum blur of 8px.
- Use a semantic layer scale: base, sticky, dropdown, modal backdrop, modal, toast, tooltip.
- Avoid broad glow shadows, decorative glass blur, and gradient text.

## Component Rules

### Buttons

Buttons use clear verbs. The primary button uses the route accent with dark text. Secondary buttons use a solid surface and visible border. Every button has hover, active, focus, disabled, and loading states. The minimum practical touch target is 44px.

### Inputs

Inputs use a solid surface, clear label, readable placeholder, and a visible focus ring. Error text appears near the field and does not rely on color alone.

### Status

Status presentation uses a shared semantic map. Every status includes text and may include a small dot or icon. Status colors remain consistent across roles.

### Tables

Tables align numbers and tracking codes with tabular numerals. Use row rules and whitespace instead of nested cards. On small screens, allow horizontal scrolling or switch to a labeled record layout.

### Panels

Panels group one clear job. Use a title, supporting context, and the primary action when needed. Do not nest panels without a strong information reason.

### Timelines

Timelines show ordered shipment events with status text, time, and message. The active event is visually clear without depending on color alone.

### Maps

Maps use blue for navigation information, route-amber for the active vehicle, and semantic endpoint markers. Provide adjacent text for route and status information. Live marker motion pauses or becomes static when reduced motion is enabled.

## Responsive Rules

- Desktop: use a persistent shell, split record/map layouts, and visible secondary metadata.
- Tablet: reduce gutters, keep the main action visible, and let supporting columns collapse first.
- Mobile: use a single reading order, full-width primary actions, horizontally scrollable data when needed, and 44px controls.
- Never hide the current shipment status or next useful action at a breakpoint.
- Test at 375px, 768px, 1024px, and 1440px widths.

## Motion

Motion communicates hierarchy, feedback, live state, or route progression. Use short ease-out transitions. Do not animate layout properties unless required for the interaction.

Respect `prefers-reduced-motion: reduce` globally. Disable route pulses and marker movement, reduce transitions to immediate state changes, and keep all content visible without an animation trigger.

## Accessibility

- Use semantic landmarks and headings in reading order.
- Keep all controls keyboard reachable.
- Show a visible `:focus-visible` state.
- Use labels for form controls and accessible names for icon-only controls.
- Announce important async status changes where appropriate.
- Do not use color as the only status signal.
- Preserve readable text contrast and visible disabled states.
- Support reduced motion.
- Keep mobile targets at least 44px where practical.

## Copy Voice

Use direct, calm, operational language. Name the current state and the next action.

Prefer: `Start transit`, `Shipment assigned`, `Tracking number`, `Last update`, `View shipment`.

Avoid: `Unlock powerful logistics`, `Next-generation visibility`, `Enterprise-grade`, `Mission control`, and claims about live or production service.

Use `shipment` for the tracked item, `driver` for the assigned role, `tracking number` for the public identifier, and `status` for the current lifecycle state.

## Use And Reject

Use route records, event timelines, restrained tables, split map panels, clear action hierarchy, and honest status language.

Reject centered generic SaaS heroes, three equal feature cards, emoji branding, role-specific palettes, repeated translucent cards, decorative technology badges, broad glows, and repeated demo banners.
