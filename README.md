# FarmConnect — Direct Farmer-to-Consumer Platform (MERN Stack)

## 1. Project Overview

FarmConnect is a MERN stack web app that directly connects small/marginal farmers with urban health-conscious consumers, cutting out middlemen. Unlike a typical e-commerce app, the core value is **trust and transparency** — consumers see exactly which farmer grew their food, how much the farmer actually earns, and can chat directly with them.

**Primary persona (v1):** Urban health-conscious consumers who want fresh, local, farm-direct produce but don't have time to visit farms or shop daily.

**Launch scope (v1):** 2-3 regions to start — Vijayawada, Hyderabad (and one more later). Each region is divided into a maximum of 5 hubs (see Section 3).

---

## 2. What Makes This Different From a Normal E-Commerce App

1. **Price transparency** — every produce listing shows a price breakdown: how much goes to the farmer, how much is platform fee, how much is delivery/hub cost. Shown consistently on listing, cart, checkout, and order history.
2. **Direct real-time chat** — consumers can message farmers directly (pre-purchase questions, post-purchase feedback) via Socket.io.
3. **Farmer-to-hub-to-consumer connection model** (not open marketplace search) — see Section 3.
4. **Weekly batch delivery via community hubs** — not instant/daily delivery. Solves the real-world conflict: busy urban consumers can't shop often, and small farmers can't do daily doorstep delivery.
5. **Impact-oriented consumer stats** — not just order history, but "money sent directly to farmers," "farmers supported," "weekly order streaks" (see Section 6).

---

## 3. The Hub Model — How Farmer-Consumer Connection Works

This is the core mechanic of the app. Do NOT implement this as an open "search any farmer" marketplace.

- Each **Region** (e.g., Vijayawada) is divided into a maximum of **5 Hubs**.
- A Hub is a physical pickup point (partnered kirana store, society common area, etc.) with a defined service radius (~3-5 km) and a set of pincodes it covers.
- **Farmers are assigned to Hubs** based on realistic delivery distance from their farm (e.g., within ~30 km road distance). A farmer can be assigned to multiple hubs if in range. For v1, this assignment is manually approved by an admin — no automated geo-matching needed yet.
- **Consumers are auto-assigned to their nearest Hub** based on the pincode they enter at signup.
- A consumer only ever sees produce/farmers available at THEIR assigned hub — never an unfiltered citywide list. This guarantees every farmer shown can actually deliver to that consumer.
- Delivery cadence: **once a week**. Farmer makes one bulk delivery trip to their assigned hub(s) on a fixed day; consumers collect within a pickup window (e.g., 6-9 PM) on that day.

### Example hub breakdown for Vijayawada (illustrative — refine with real data)
1. Governorpet / MG Road
2. Benz Circle / Auto Nagar
3. Patamata / Bhavanipuram
4. Gunadala / Ring Road residential belt
5. Payakapuram / college-IT pocket

---

## 4. Weekly Order Cycle Logic

- Each Hub runs a recurring **OrderCycle** (e.g., order window opens Monday, closes Wednesday 8 PM; farmer delivers to hub Friday; consumers pick up Friday 6-9 PM).
- Orders placed within a cycle are locked once the window closes.
- Farmer sees aggregated demand (total quantity needed per produce item) for their hub(s) once the window closes — not individual scattered orders.
- Order status flow: `ordered → confirmed (by farmer) → ready (dropped at hub) → picked-up`.
- Payment method for v1: **Cash on Delivery (COD)** only, paid at hub pickup.

---

## 5. Functional Modules (Build Task List)

Build in this order:

### Task 1 — Project Setup
- MERN project structure (client + server folders)
- MongoDB connection (Atlas)
- Express server with CORS, body-parser, error-handling middleware
- React app with React Router
- Socket.io server + client setup
- `.env` config for DB URI, JWT secret, ports

### Task 2 — Database Models
Implement all models exactly as specified in Section 7 below.

### Task 3 — Authentication & Roles
- JWT-based signup/login for Farmer, Consumer, Admin roles
- Role-based route protection middleware
- Farmer verification flow (admin must approve before farmer can list produce)
- Consumer signup: enter pincode → auto-assign nearest Hub

### Task 4 — Farmer-Side Features
- Farmer onboarding form (farm details, location, select from eligible hubs)
- Farmer dashboard: assigned hubs, current cycle's aggregated demand
- Produce CRUD (create/edit/delete, with price breakdown fields)
- View incoming orders per cycle/hub
- Mark order cycle as fulfilled/delivered to hub
- Farmer chat inbox

### Task 5 — Consumer-Side Features
- Consumer onboarding (address, pincode, auto hub assignment)
- Browse produce (filtered to consumer's assigned hub only)
- Farmer profile page (bio, photos, practice tags, produce list)
- Cart + place order within active order window
- Order confirmation screen with price breakdown
- "My Orders" page (history + status)
- "Impact" stats dashboard (see Section 6)
- "My Farmers" tab (farmers ordered from + order count)
- Consumer chat inbox

### Task 6 — Real-Time Chat (Socket.io)
- Socket connection on both farmer and consumer clients
- Real-time send/receive between farmer-consumer pairs
- Persist chat history in `ChatMessage` collection, load on chat open
- New message notification badge

### Task 7 — Order Cycle & Hub Aggregation Logic
- Admin-defined weekly cycle per hub (open/close timestamps)
- Scheduled job to auto-close order window
- Aggregation query: total ordered quantity per farmer per hub per cycle
- Order status update flow (farmer confirms → ready → picked-up)

### Task 8 — Admin Panel
- Region management (add/edit regions)
- Hub management (create up to 5 hubs per region, set anchor location + radius + pincodes)
- Farmer verification/approval queue
- Farmer-hub assignment approval (manual for v1)
- View all order cycles across regions

### Task 9 — Price Transparency Feature
- Price breakdown calculation (farmer sets base earning, platform fee is fixed % or flat, delivery cost fixed per hub)
- Display breakdown consistently across listing, cart, checkout, order history

### Task 10 — Notifications (basic, in-app)
- Order window closing reminder
- Order confirmed by farmer
- Ready for pickup at hub
- New chat message

---

## 6. Consumer "Impact" Stats Dashboard (Task 5 detail)

Show three tabs on the consumer dashboard:

**Tab 1 — Orders:** order history list + current cycle status ("Order window closes in 2 days" / "Pickup Friday 6-9 PM at [Hub]") + reorder button.

**Tab 2 — Impact:**
- Total amount spent (lifetime)
- Total money sent directly to farmers (lifetime) — computed from `Order.totalFarmerEarning`
- Number of distinct farmers supported
- Most-ordered produce items
- Weekly order streak (consecutive weeks ordered)

**Tab 3 — My Farmers:** list of farmers ordered from, with order count per farmer (from `ConsumerProfile.savedFarmers` + aggregation on `Order`).

Compute all stats via MongoDB aggregation queries on the `Order` collection (group by consumer) rather than stored counters, unless order volume becomes very high later.

---

## 7. Database Models (Exact Field Specs)

### User
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| email | String | required, unique |
| phone | String | required, unique |
| passwordHash | String | required |
| role | String enum | 'farmer' \| 'consumer' \| 'admin' |
| region | ObjectId ref Region | required |
| isVerified | Boolean | default false |
| createdAt | Date | auto (timestamps: true) |

### FarmerProfile
| Field | Type | Notes |
|---|---|---|
| user | ObjectId ref User | required |
| farmName | String | |
| farmLocation | String | village/town name |
| farmCoordinates | { lat: Number, lng: Number } | for distance calc |
| farmingPractice | String enum | 'organic' \| 'natural' \| 'chemical-free' \| 'conventional' |
| certifications | [String] | optional |
| farmPhotos | [String] | image URLs |
| bio | String | |
| assignedHubs | [ObjectId ref Hub] | |
| verificationStatus | String enum | 'pending' \| 'approved' \| 'rejected' |
| createdAt | Date | auto |

### ConsumerProfile
| Field | Type | Notes |
|---|---|---|
| user | ObjectId ref User | required |
| address | String | full address |
| pincode | String | indexed, for hub auto-assignment |
| assignedHub | ObjectId ref Hub | required |
| savedFarmers | [ObjectId ref FarmerProfile] | optional |
| createdAt | Date | auto |

### Region
| Field | Type | Notes |
|---|---|---|
| name | String | e.g. "Vijayawada" |
| isActive | Boolean | default true |
| createdAt | Date | auto |

### Hub
| Field | Type | Notes |
|---|---|---|
| name | String | e.g. "Governorpet Hub" |
| region | ObjectId ref Region | required |
| anchorAddress | String | physical pickup location |
| coordinates | { lat: Number, lng: Number } | |
| serviceRadiusKm | Number | default 3-5 |
| pincodesCovered | [String] | indexed |
| contactPersonName | String | kirana partner/society contact |
| contactPhone | String | |
| pickupWindowStart | String | e.g. "18:00" |
| pickupWindowEnd | String | e.g. "21:00" |
| isActive | Boolean | default true |
| createdAt | Date | auto |

### Produce
| Field | Type | Notes |
|---|---|---|
| farmer | ObjectId ref FarmerProfile | required |
| name | String | e.g. "Tomatoes" |
| category | String | e.g. "Vegetables" |
| unit | String | e.g. "kg", "dozen" |
| pricePerUnit | Number | total price consumer pays |
| farmerEarning | Number | portion farmer receives |
| platformFee | Number | portion platform keeps |
| deliveryCost | Number | portion for hub logistics |
| quantityAvailable | Number | for current cycle |
| harvestDate | Date | |
| images | [String] | |
| practiceTag | String | inherited from farmer or overridden |
| isActive | Boolean | default true |
| createdAt | Date | auto |

### OrderCycle
| Field | Type | Notes |
|---|---|---|
| region | ObjectId ref Region | required |
| hub | ObjectId ref Hub | required |
| weekStartDate | Date | |
| weekEndDate | Date | |
| orderWindowOpen | Date | timestamp |
| orderWindowClose | Date | timestamp |
| deliveryDate | Date | when farmer drops at hub |
| status | String enum | 'open' \| 'closed' \| 'fulfilled' \| 'completed' |
| createdAt | Date | auto |

### Order
| Field | Type | Notes |
|---|---|---|
| consumer | ObjectId ref ConsumerProfile | required |
| farmer | ObjectId ref FarmerProfile | required |
| hub | ObjectId ref Hub | required |
| orderCycle | ObjectId ref OrderCycle | required |
| items | [{ produce: ObjectId ref Produce, quantity: Number, priceAtOrder: Number }] | snapshot price, don't reference live Produce price |
| totalAmount | Number | sum of all items |
| totalFarmerEarning | Number | sum, used for consumer impact stats |
| totalPlatformFee | Number | sum |
| paymentMethod | String | 'COD' for v1 |
| status | String enum | 'ordered' \| 'confirmed' \| 'ready' \| 'picked-up' \| 'cancelled' |
| orderedAt | Date | auto |
| pickedUpAt | Date | set when completed |

### ChatMessage
| Field | Type | Notes |
|---|---|---|
| sender | ObjectId ref User | required |
| receiver | ObjectId ref User | required |
| conversationId | String | indexed, derived: sorted senderId_receiverId |
| message | String | required |
| isRead | Boolean | default false |
| createdAt | Date | auto |

### HubAssignmentRequest (optional — separate approval log)
| Field | Type | Notes |
|---|---|---|
| farmer | ObjectId ref FarmerProfile | required |
| hub | ObjectId ref Hub | required |
| distanceKm | Number | estimated |
| status | String enum | 'pending' \| 'approved' \| 'rejected' |
| requestedAt | Date | auto |

---

## 8. Implementation Notes

- Use `mongoose.Schema.Types.ObjectId` with `ref` for all relational fields.
- Use schema option `{ timestamps: true }` instead of manually defining `createdAt` fields.
- Add indexes on: `ConsumerProfile.pincode`, `FarmerProfile.assignedHubs`, `Hub.pincodesCovered`, `ChatMessage.conversationId`.
- `Order.items` must snapshot `priceAtOrder` at the time of ordering — never read live `Produce.pricePerUnit` for historical orders, since prices change between weekly cycles.
- Consumer impact stats (Section 6) should be computed via MongoDB aggregation on the `Order` collection at request time, not stored as separate running counters — revisit only if order volume becomes very high.
- Do not build an open "search all farmers" browse experience — consumers must only ever see farmers/produce tied to their assigned hub.
- Keep v1 to a maximum of 5 hubs per region and 2-3 regions total (Vijayawada, Hyderabad, +1 later).

---

## 9. Explicitly Out of Scope for v1 (Do Not Build Yet)

- Pre-harvest booking / demand forecasting
- Group buying / shared logistics between consumers
- Farm story social feed
- Online payment gateway integration (COD only for v1)
- Automated geo-distance calculation via Maps API (manual/estimated distance is fine for v1)
- Third-party delivery fleet integration

# FarmConnect — Frontend Build Spec (React)

This is the frontend companion to README.md (backend spec). Build the React client using this as the exact screen/component/flow list. Reference README.md for field names, model shapes, and business logic — this doc only covers UI structure.

---

## 1. Tech & Structure Notes

- **Single React app** (not separate apps per role) — one codebase, one build, one deployment
- React + React Router for navigation
- Role-based routing: after login, redirect to `/farmer/*`, `/consumer/*`, or `/admin/*` based on `user.role`
- Route guards: a `ProtectedRoute` wrapper checks `user.role` before rendering farmer/consumer/admin routes, redirects unauthorized users to login or their correct role home
- Global state: use Context API (or Redux if preferred) for: logged-in user, cart (consumer), unread chat count
- Socket.io client connects once on login, stays alive across the session for chat + notifications
- **Styling: plain CSS** (no UI library like Material UI/Chakra) — use CSS Modules or a single global stylesheet with clear class naming (e.g., BEM-style: `.produce-card`, `.produce-card__image`) to keep styles organized without a framework
- Keep styling simple and consistent — a shared component library (buttons, cards, badges, form inputs) used across all three role areas, styled with shared CSS classes/variables (e.g., CSS custom properties for colors, spacing) so the look stays consistent without a library
- Mobile-first layout — target consumer is on their phone during commute/breaks

---

## 2. Shared / Public Screens (before login)

1. **Landing Page** — explains what FarmConnect is, price transparency pitch, "how it works" (hub model explained simply), CTA buttons: "I'm a Farmer" / "I want fresh produce"
2. **Login Page** — email/phone + password
3. **Signup Page (role selection first)** — choose Farmer or Consumer, then role-specific signup form
4. **Region Not Available Page** — shown if consumer enters a pincode outside the 2-3 launched regions ("We're not in your area yet — join the waitlist")

---

## 3. Consumer Screens

1. **Consumer Onboarding**
   - Step 1: Enter address + pincode
   - Step 2: Auto-shows assigned Hub ("Your hub: Governorpet Hub, pickup Fridays 6-9 PM") — confirm or edit address if wrong hub assigned

2. **Home / Browse Produce**
   - Shows only produce from farmers assigned to consumer's hub
   - Filter bar: category, farming practice (organic/natural/etc.), price range
   - Produce card: image, name, price, farmer name (clickable), practice tag badge
   - Banner showing current order cycle status ("Order window closes in 2 days")

3. **Farmer Profile Page**
   - Farm photos, bio, farming practice, certifications
   - List of their current produce (add to cart directly from here)
   - "Chat with farmer" button

4. **Produce Detail Page** (optional — can also be a modal/expand from card)
   - Larger image, description, price breakdown shown upfront (farmer earning / platform fee / delivery cost as a simple 3-part bar or list)
   - Quantity selector, Add to Cart

5. **Cart Page**
   - Items grouped by farmer (since multiple farmers can be in one hub)
   - Price breakdown totals
   - Confirms hub + pickup window before checkout
   - "Place Order" button (disabled if order window is closed)

6. **Order Confirmation Screen**
   - Order summary, total price breakdown, pickup date/window, hub address
   - "Track Order" and "Chat with Farmer" quick links

7. **My Orders Page**
   - Tabs: **Orders** / **Impact** / **My Farmers** (as specified in README Section 6)
   - **Orders tab:** list of past + current orders, status badges (ordered/confirmed/ready/picked-up), reorder button on past orders
   - **Impact tab:** stat cards — total spent, total to farmers, farmers supported count, most-ordered produce, weekly streak (use simple stat cards or a small chart, not dense tables)
   - **My Farmers tab:** list of farmers ordered from with order count, link to farmer profile

8. **Chat Inbox**
   - List of conversations (farmer name, last message preview, unread badge)
   - Chat Thread screen: real-time message bubbles, input box

9. **Profile / Settings**
   - Edit address/pincode (may trigger hub reassignment warning)
   - Logout

---

## 4. Farmer Screens

1. **Farmer Onboarding**
   - Farm details form: farm name, location, farming practice, bio, upload farm photos
   - Hub selection: shows eligible hubs (within range) as checkboxes — farmer picks which they can commit to
   - Submission shows "Pending Admin Verification" status screen until approved

2. **Farmer Dashboard (home)**
   - Current cycle status per assigned hub: order window open/closed, aggregated demand summary ("Tomatoes: 45kg needed for Governorpet Hub")
   - Quick links: Manage Produce, View Orders, Chat

3. **Manage Produce Page**
   - List of current produce listings (edit/delete/deactivate)
   - "Add Produce" form: name, category, unit, price, farmer earning / platform fee / delivery cost breakdown, quantity, harvest date, images, practice tag
   - Simple, minimal-text-first form — large touch targets, since farmers may have lower digital literacy (per README's ease-of-use goal)

4. **Orders Page**
   - Filter by hub + cycle
   - Aggregated view: total quantity needed per produce item for the upcoming delivery
   - Individual order list (consumer name, items, status)
   - Bulk action: "Mark cycle as delivered to hub" → updates all orders in that cycle to 'ready'
   - Per-order action: mark 'picked-up' if needed manually

5. **Chat Inbox**
   - Same pattern as consumer chat — list of consumer conversations, thread view

6. **Farmer Profile / Settings**
   - Edit farm details, photos, assigned hubs (resubmits for admin approval if hubs change)

---

## 5. Admin Screens

1. **Admin Dashboard**
   - Overview stats: active regions, total hubs, pending farmer verifications, active order cycles

2. **Region Management**
   - Table of regions, add/edit/activate-deactivate

3. **Hub Management**
   - Table of hubs per region (max 5 enforced in UI), add/edit hub: anchor address, coordinates, radius, pincodes covered, pickup window, contact person

4. **Farmer Verification Queue**
   - List of pending farmers, view submitted details/photos, Approve/Reject buttons

5. **Farmer-Hub Assignment Review**
   - List of farmer hub requests (if using separate HubAssignmentRequest model), approve/reject per farmer-hub pair

6. **Order Cycles Overview**
   - Table of all cycles across regions/hubs with status, ability to manually open/close a cycle if needed

---

## 6. Shared Components to Build Once, Reuse Everywhere

- `Navbar` (role-aware — shows different links for farmer/consumer/admin)
- `ProduceCard`
- `FarmerCard` (used in browse + admin views)
- `PriceBreakdownDisplay` (used in produce detail, cart, checkout, order history — must look identical everywhere for consistency)
- `OrderStatusBadge` (color-coded: ordered/confirmed/ready/picked-up/cancelled)
- `ChatWindow` (reusable for both farmer and consumer, just swaps the "other party" reference)
- `StatCard` (for consumer Impact tab and admin dashboard)
- `HubInfoBanner` (shows hub name + pickup window, used on home, cart, order confirmation)
- `Toast/Notification` component for in-app alerts (Task 10 from backend spec)

---

## 7. Key UX Rules to Follow

- Never show a consumer produce/farmers outside their assigned hub — this is a hard filter at the API level, but the UI should also make the hub context visible at all times (e.g., persistent small banner: "Showing produce for: Governorpet Hub")
- Price breakdown must appear in the same visual format on every screen it's shown (produce detail, cart, checkout, order history) — build `PriceBreakdownDisplay` once and reuse, don't recreate it per page
- Order window state must be visible wherever ordering happens — if the window is closed, disable "Add to Cart"/"Place Order" and show next window's open date instead
- Keep the farmer-side forms simpler than the consumer-side browsing UI — fewer fields per screen, larger buttons, minimal jargon
- Chat should feel lightweight — no need for read receipts/typing indicators in v1, just real-time message delivery + unread badge

---

## 8. Suggested Folder Structure (single app)

```
client/
  src/
    components/       # shared components (Navbar, ProduceCard, PriceBreakdownDisplay, etc.)
    styles/            # global.css, variables.css (colors, spacing as CSS custom properties)
    pages/
      consumer/        # all consumer screens
      farmer/          # all farmer screens
      admin/            # all admin screens
      auth/              # login, signup, onboarding
    context/            # AuthContext, CartContext, ChatContext
    routes/              # ProtectedRoute, route definitions
    services/            # API call functions (axios/fetch wrappers), socket.js
    App.jsx
    main.jsx
```

---

## 9. Suggested Build Order

1. Shared components + role-aware Navbar + routing shell
2. Auth screens (login/signup/onboarding for both roles)
3. Consumer browse + farmer profile + cart + checkout flow
4. Farmer produce management + orders view
5. Chat (once both sides have something to chat about)
6. Consumer "My Orders" (Orders/Impact/My Farmers tabs)
7. Admin panel (region/hub/verification management)
8. Notifications layer last, since it depends on order/chat events already working