# SIMULATION.md

## Simulation Engine Overview

Location + status simulation for shipments. Must feel alive and realistic while being controllable and leak-free.

## Core Requirements

- Marker moves smoothly toward destination
- Updates every 3-8 seconds
- Status changes at logical points (e.g. "in_transit" → "delayed")
- Broadcast updates via Supabase Realtime so other roles see changes instantly
- Easy to start/stop per shipment
- No memory leaks

## Architecture

- `lib/simulation.ts` — central engine
- Uses a `Map<shipmentId, Simulation>` internally
- Each simulation has:
  - Current position (lat, lng)
  - Waypoints array (origin → 3-4 intermediate → destination)
  - Current waypoint index
  - Progress percentage
  - Status

## How It Works

1. When Driver marks "Picked Up" → simulation starts
2. Every tick:
   - Move toward next waypoint with small random jitter (±0.001 lat/lng)
   - Update `shipment_locations` table
   - Broadcast via Supabase Realtime
   - Occasionally trigger status change + event
3. When close to destination → auto "Delivered" or allow manual override

## Technical Details

- Use `requestAnimationFrame` + timestamp for smooth interpolation if needed
- Store active simulations in a module-level Map
- `startSimulation(shipmentId)`, `stopSimulation(shipmentId)`, `stopAll()`
- Clean up on component unmount + page navigation
- Seed realistic initial waypoints based on origin/destination

## Future Swap

The interface should allow easy replacement with real carrier WebSocket data.

**Implementation Order**:
1. Basic position updates (static movement first)
2. Realtime broadcast
3. Status + event integration
4. Polish (speed, progress bar, etc.)