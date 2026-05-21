# LiveTrack 90-Second Demo Script

This script guide ensures a smooth, high-impact demonstration of the real-time package tracker to interviewers.

---

## 🚀 Setup & Preparation (30 seconds)
1. **Reset Database**: Log in as a Shipper/Driver and click **Seed Initial Demo Data** to populate the system with clean records.
2. **Open Three Tabs Side-by-Side**:
   - **Tab 1**: Shipper Portal (`/dashboard/shipper`)
   - **Tab 2**: Courier Driver Portal (`/dashboard/driver`)
   - **Tab 3**: Landing page / Public Tracking (`/`)

---

## 🎙️ Step-by-Step Demo Guide (90 seconds)

### 1. The Shipper's View: Booking (0s – 30s)
* **Action**: On **Tab 1**, click **New Booking** and fill out the form:
  - *Recipient*: `Alice Jones`, `alice@example.com`
  - *Route*: Origin `London Port Logistics`, Destination `Birmingham Distribution Hub`
  - Click **Create Shipment**.
* **Voiceover**: *"Here, I'm logged in as a logistics dispatcher. I'll book a new shipment heading from London to Birmingham. Upon creation, LiveTrack assigns a unique tracking number (`LTK-XXXXXXXXX`) and creates an immutable initial status milestone in the event history."*
* **Action**: Copy the new tracking number, paste it on **Tab 3**, and click **Track Package** to load the public view.

### 2. The Driver's View: Claiming & Dispatches (30s – 55s)
* **Action**: Go to **Tab 2** (Driver Portal) and click the **Available Jobs** tab.
* **Voiceover**: *"Now I'm looking at the Courier Driver portal. As a courier, I can view all pending runs in my region. Notice that under my current active queue, I have an enforced cap of 5 dispatches to keep driver loads safe."*
* **Action**: Find the booked shipment, click **Claim Job**, and switch to the **My Active Deliveries** tab.
* **Voiceover**: *"I will claim this dispatch. It moves directly into my active queue, and the status changes to 'Assigned' globally."*

### 3. Real-Time Telemetry & Milestone updates (55s – 75s)
* **Action**: In **Tab 2**, click **Confirm Pickup** $\rightarrow$ **Start Transit**.
* **Action**: Switch immediately to **Tab 3** (Public Tracker) to show the updated progress stepper and timeline.
* **Voiceover**: *"Once picked up, I start the transit. On the public-facing tracking page, the recipient receives instant status updates. In the next phase, we'll see a live marker moving along the route using Leaflet mapping and Supabase Realtime broadcast."*

### 4. Complete Delivery & Summary (75s – 90s)
* **Action**: Go to **Tab 2**, click **Deliver Package**. Show **Tab 3** updating to **Delivered**.
* **Voiceover**: *"Finally, I arrive at the destination and mark the package as delivered. The tracking timeline locks, the actual delivery timestamp is logged, and the shipper dashboard is updated instantly. All cross-tab interactions run through serverless actions and reactive Postgres triggers."*
