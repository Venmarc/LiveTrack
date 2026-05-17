# CONSTITUTION.md

This is the unbreakable law of LiveTrack.

## Core Principles

1. **Real-time is the product** — If the map marker doesn't move convincingly in real-time across tabs, the project fails.
2. **Discipline over Vibes** — Plan → Happy path + error handling → Manual test → Polish. No blind AI code acceptance.
3. **Senior Quality** — Code must be readable, typed, and structured well enough that a staff engineer would approve it.
4. **Demo First** — Every decision must serve the 90-second interview demo.
5. **Keep it Tight** — Scope creep kills portfolio projects. Say no aggressively.

## Non-Negotiables

- All data mutations via Server Actions / Route Handlers
- Full TypeScript strict mode, no `any`
- Zod validation on every input
- Proper error boundaries and user feedback
- No memory leaks in simulation (clean intervals, subscriptions, Leaflet layers)
- Lighthouse ≥ 95 (Performance + Accessibility)
- Mobile responsive, especially map view
- Professional, trustworthy UI (logistics blues/grays)
- Clear "DEMO / Simulation Only" banner on every page

## Coding Standards

- File names: kebab-case for components, descriptive for others
- Components: Server where possible, Client only when needed (`"use client"`)
- Comments: Only for complex logic, never obvious shit
- No console.log in production code
- Review every line of AI-generated code before committing
- New chat per major feature (Phase or big component)

## Quality Gates (must pass before moving to next phase)

- All happy paths + basic error paths manually tested
- No console errors
- Real-time updates work across 2+ browser tabs
- Map performs smoothly (no jank)
- Role-based access works correctly

Violating these rules makes the entire project trash. No excuses.