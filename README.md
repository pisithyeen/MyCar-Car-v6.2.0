# MyCar Care KH &mdash; Product Documentation & Developer Workbook (V6.2.0)

Welcome to the unified product specification and technical context workbook for **MyCar Care KH**, an AI-powered vehicle maintenance, diagnostics, and service platform customized for the Cambodian market. 

This document serves as the master blueprint and full-context specification. It catalogs the visual identity, modular frontend architecture, full-stack server configurations, spatial capabilities, multi-role security boundaries, database specifications, and local simulation fallback engines.

---

## 1. System Overview & Visual Style

**MyCar Care KH** bridges the gap between vehicle owners, repair workshops, and parts vendors in Cambodia. Highly responsive under 3G/4G cellular connections, it streamlines maintenance ledgers, leverages AI checkups, and provides a powerful Point-of-Sale (POS) and CRM toolkit for garage owners.

### 🎨 Visual & Design Language
The application features a dark slate and amber tech identity, conveying high visual quality, premium styling, and maximum readability under outdoor Cambodian sunlight:
*   **The Palette:** A deep anthracite background (`slate-950` / `zinc-900`) contrasted with neon yellow/amber highlighting (`amber-400` / `yellow-500`) and emerald status accents (`emerald-400`).
*   **Typography:** Elegant "Inter" sans-serif layout mappings for readable data presentation, paired with tracking-tight headings and monospace layouts ("JetBrains Mono" / `font-mono`) for invoices, metrics, sensor limits, and diagnostic logs.
*   **negative space:** Generous margins, bento-grid structure layouts, and subtle fade-in layout entries powered by `motion` controls (imported from `motion/react`).
*   **No "AI Slop" Clutter:** Pure, authentic labels and real customer metrics without pseudo-intellectual system coordinates or verbose developer logs.

---

## 2. Full Application Architecture

The application is structured as a full-stack, decoupled architecture:

```
                            ┌────────────────────────────────────┐
                            │      MOBILE & WEB CLIENTS          │
                            │      (Vite + React Canvas)         │
                            └─────────────────┬──────────────────┘
                                              │ Uses HTTP & REST endpoints
                                              ▼
                            ┌────────────────────────────────────┐
                            │    UNIFIED EXPRESS ROUTER PROXY    │
                            │             (server.ts)            │
                            └─────────────────┬──────────────────┘
                 ┌────────────────────────────┼───────────────────────────┐
                 ▼                            ▼                           ▼
    ┌───────────────────────┐    ┌────────────────────────┐    ┌──────────────────────┐
    │  GEMINI AI ENGINES    │    │  TELEGRAM BOT GATEWAY  │    │  DATABASE SERVICES   │
    │  (Google GenAI SDK)   │    │  (Chat ID Webhooks)    │    │ (Drizzle + PG Client)│
    ├───────────────────────┤    ├────────────────────────┤    ├──────────────────────┤
    │ ── Diagnostic Advisor │    │ ── Token Handshaker    │    │ ── Robust Fallback   │
    │ ── Powertrain Projections  │ ── Templated Triggers  │    │    System if Offline │
    │ ── Parts Marketplace  │    │ ── Direct Commands     │    │ ── Seeding Engine    │
    └───────────────────────┘    └────────────────────────┘    └──────────────────────┘
```

---

## 3. Core Feature Verticals & Screen Mappings

The system utilizes an integrated layout partitioned into **9 feature tabs** inside the main application viewport:

### 3.1 Primary Customer Dashboard (`Dashboard.tsx`)
Provides a complete high-fidelity vehicle deck, scheduling indicators, and operational widgets:
*   **Horizontal Vehicle Carousel:** Flip between registered sedans, SUVs, and heavy-duty vehicles with real-time mileage and status tags.
*   **Oil Life Expectancy & Battery Health Meters:** Circular status rings showing remaining days or kilometers before the next standard oil checkup, adapting to road conditions.
*   **Interactive Expense Trends Chart (`recharts`):** Beautifully rendered responsive line/bar graphs showing monthly spending in USD, split by fuel costs, service charges, and parts.
*   **Maintenance Ledger History:** Chronological cards tracking dates, spent amounts, services performed, mechanics assigned, and links to visual attachments of receipts.
*   **Smart Reminders Panel:** Lists due/overdue alerts (e.g. "Prius Hybrid Transmission Flush due in 1,200 km") with snooze sliders and direct garage booking bridges.

### 3.2 Garage Owner Admin & Mini POS System (`GarageDashboard.tsx`)
A workspace designed for garage managers and service stations with multi-branch layouts:
*   **Financial Metrics & KPI Overview:** High-contrast summary cards showing Daily Income, Gross Margins, and ticket completion counters.
*   **Workplace Role Switcher Simulate:** Experience the application as an *Owner*, *Branch Manager*, *Mechanic*, or *Cashier*, adapting the visible views and permission rights dynamically.
*   **Interactive Mini POS Checkout Terminal:** 
    *   Search inventory SKU cards (Engine fluids, spark plugs, filters, brake assemblies).
    *   Add items to the shopping basket, override pricing, apply individual item or total ticket discounts.
    *   Assign labor charges, select customer accounts, and generate dynamic **80mm black/white thermal receipts** containing custom ABA Pay QR vectors for cashless payment processing.
*   **SKU Inventory Stock Control:** Maintain product lists, write adjustments logs, and trigger automated "Critical Low Stock" alerts.
*   **Unified Customer CRM logs:** Track client profile segments ("VIP Customer", "First-time visitor"), vehicle identification plates, total expenditures, and booking statuses.
*   **Telegram Outreach Dispatcher:** Choose pre-designed message templates (e.g., "Ready for pickup", "Weekly Promotion", "Immediate Diagnostic alert") and send them directly to the user's paired Telegram messenger account.

### 3.3 AI-Powered Care Assistant Chat (`AICareAssistant.tsx`)
A diagnostic chat console leveraging `gemini-3.5-flash` with robust localized guardrails:
*   **Symptom Analyzer Multi-Turn:** Input symptoms (such as "rattling under the driver's side floorboard at 60 km/h") and receive diagnostic suggestions.
*   **Cambodian Adaptation Wrapper:** The model automatically integrates local conditions (monsoon season, high humidity, gravel dust, heavy traffic) and recommends checks tailored to the specific vehicle make, model, and year.
*   **Regional Hotspot Grounding:** Diagnostic outcomes reference localized parts outlets and repair centers in Phnom Penh, such as Dei Huy Market, Russian Market, Sen Sok parts centers, and Sihanouk Boulevard.
*   **Automated Failover Engine:** If the Gemini API experiences network limits or key timeouts, the backend automatically serves pre-validated expert diagnostics corresponding to the selected vehicle model.

### 3.4 AI Dream Car Advisor (`AIDreamCarAdvisor.tsx` & `PremiumDreamCarAdvisor.tsx`)
Suggests standard or hybrid vehicles matching the user's lifestyle:
*   **Parameter Filter Engine:** Input budgets, seating needs, primary driving terrain (Phnom Penh traffic vs. provincial dirt/paved routes), and fuel priorities.
*   **Interactive comparison cards:** Weigh pros, cons, long-term ownership projections, hybrid battery replacement schedules, and estimated repair frequencies inside Cambodia.

### 3.5 Vehicle Powertrain Registration (`VehicleRegistrationSystem.tsx`)
Advanced vehicle sub-configurations supporting standard and electric configurations:
*   **Multi-Powertrain Support:** Register specific powertrains including **Gasoline (ICE)**, **Diesel**, **Plug-in Hybrid (PHEV)**, and **Battery Electric (BEV)**.
*   **Dynamic Weight & Tax Assessment:** Evaluates displacement metrics, battery pack size, motor outputs, and generates automated Cambodian tax tier approximations.
*   **Powertrain-Specific Audits:** Identifies cooling circuit checks, hybrid blower fan cleaning, or fuel injector flushes based on type.
*   **Secure Mobile QR Logs:** Generates a high-contrast dynamic QR tag containing encapsulated secure metadata that garage staff can immediately scan to import vehicle details.

### 3.6 Spare Parts & Barter Classifieds (`ClassifiedsMarketplace.tsx` / `PartsMarketplace.tsx`)
A distributed P2P portal tracking parts, wheels, and listing details:
*   **Marketplace Catalog Grid:** Browse active used cars, replacement components, hybrid cells, and structural pieces on responsive bento grids.
*   **Side-by-Side Comparison Desk:** Compare part weights, compatibility ranges, condition scales, and pricing.
*   **Secure Escrow & Buyer Guidelines:** Lists tips for safe cash handshakes in Cambodia, preventing common marketplace scams.
*   **Interactive Quote/Offer Sheet:** Direct forms to submit lower-bound pricing offers, schedule physical checkups, or propose equal-value barter assets.

### 3.7 Care Coin Rewards Program (`CareCoinWallet.tsx` / `MyCarCareCoinSystem.tsx`)
A gamified eco-loyalty program with automated scoring:
*   **Balance Dashboard Ledger:** Displays current "Care Coins" accumulated and carbon offsets saved.
*   **Preventative Care Scoring:** Awards coin tokens when the user logs preventative checkups (battery test, coolant flush, filter change) or schedules low-carbon carpool tracking.
*   **Redemption Store:** Exchange points for partner discounts, engine oil cans, microfiber cloths, car wash vouchers, or fluid flushes.

### 3.8 Service Mapping & Directory Locator (`MyCarCareMap.tsx` / `GarageLocator.tsx`)
A visual vector coordinate locator displaying servicing points in Phnom Penh:
*   **Interactive Canvas Map:** Smooth panning viewport containing detailed marker hotspots representing Partner Garages, Gasoline Stations, and Specialty Battery centers.
*   **Detailed Location Sidebar:** Lists operating hours, verified rating gauges, direct phone lines, specific service badges, and distance estimations.
*   **Custom View Filters:** Toggle map markers to isolate only emergency towing, wheel alignments, or EV charging modules.

### 3.9 Help Forum & Community Boards (`HelpForum.tsx`)
A collaborative network where users exchange ideas:
*   **Post Streams:** Categorize posts under "Engine Issues", "Transmission Hacks", "Phnom Penh Garage Recommendations", or "Sourcing Parts".
*   **Interactive Comment Trees:** Support secondary answers, certified mechanic feedback marks, and helpful community voting.

---

## 4. User Role Permission Matrix

The application coordinates access across four primary roles to protect operations and data boundaries:

| Module / Operational Tab | Vehicle Owner | Garage Owner | Shop / Partner | System Admin |
| :--- | :---: | :---: | :---: | :---: |
| **Manage Profile & Onboarding Forms** | ✅ Read/Write | ✅ Read/Write | ✅ Read/Write | ✅ Read/Write |
| **Register & Edit Own Vehicles** | ✅ Read/Write | ❌ Restricted | ❌ Restricted | ✅ Read/Write |
| **Access Financial Metrics / KPI View**| ❌ Restricted | ✅ Read/Write | ❌ Restricted | ✅ Read/Write |
| **POS Checkout / ABA QR Trigger** | ❌ Restricted | ✅ Read/Write | ❌ Restricted | ✅ Read/Write |
| **Adjust Stock SKU Inventory Counts**  | ❌ Restricted | ✅ Read/Write | ✅ Read/Write | ✅ Read/Write |
| **Log Mechanic Diagnostic Reports**   | ❌ Restricted | ✅ Read/Write | ❌ Restricted | ✅ Read/Write |
| **Consult AI Diagnostics / Dream Car** | ✅ Read/Write | ✅ Read/Write | ✅ Read/Write | ✅ Read/Write |
| **Post Marketplace & Forum Offers**   | ✅ Read/Write | ✅ Read/Write | ✅ Read/Write | ✅ Read/Write |

---

## 5. Database Architecture & Persistence Core

The database architecture is designed with **robust, defensive reliability** to prevent server interruptions and database connectivity issues of sandboxed environments.

### 5.1 The Drizzle Schema & PostgreSQL Models
The core schema mapped inside `./src/db/schema.ts` establishes 10 primary relational tables:
1.  `users`: Identity ledger tracks emails, hashed passwords, selected roles, language preference, and Firebase FCM notification tokens.
2.  `vehicles`: Profile structures storing model details, physical plates numbers, fuel classifications, and dynamic mileages.
3.  `maintenance_records`: Diagnostic checklist items detailing costs in USD, date records, workshop partners, and attachment paths.
4.  `garages`: Coordinates locations inside Phnom Penh, list of pricing services, verified companion flags, and reviews scale.
5.  `reminders`: Time-triggered and mileage-triggered intervals calculating specific alerts.
6.  `expenses`: Financial logs of operational bills.
7.  `attached_documents`: Links scanned paper documents to vehicles.
8.  `forum_posts` & `forum_comments`: The database structures backing community forums and user advice networks.
9.  `part_listings` & `part_offers`: Power the marketplace lists, pricing limits, barter options, and verification status.
10. `notification_logs`: Secure record logs tracing in-app message paths and historical delivery timestamps.

### 5.2 Defensive Local Simulation Fallback Engine (`src/db/helper.ts`)
To protect against database connection timeouts or missing PostgreSQL configs during development and runtime transitions, the database service is protected by a fallback controller:

```typescript
// Robust fallback indicator inside helper.ts
function isDbAvailable(): boolean {
  return typeof process !== 'undefined' && !!process.env.SQL_HOST;
}

export async function getAllVehicles() {
  if (!isDbAvailable()) {
    console.warn("[Database Helper] SQL_HOST matching configuration is absent. Serving pre-seeded state safely.");
    return []; // Graceful fallback
  }
  return await db.select().from(vehicles);
}
```

This prevents database exceptions from crashing the application server, allowing it to serve pre-seeded high-fidelity models natively to the client.

---

## 6. Full-Stack API Gateways (`server.ts`)

The Express server exposes the following endpoints to bridge client networks with secure APIs and external SDKs:

### 6.1 Authentication & Profile Setup
*   `POST /api/auth/login` &mdash; Simulates credential evaluations, returning the paired user profile and token configurations.
*   `POST /api/auth/register` &mdash; Registers a new user account and creates default user settings.
*   `GET /api/profile` &mdash; Retrieves the currently authenticated session's user profile data.
*   `PUT /api/profile` &mdash; Updates operational settings like contact details, avatar, and language selector.

### 6.2 Vehicle & Records Services
*   `GET /api/vehicles` &mdash; Fetches all vehicle registration records for the logged-in user.
*   `POST /api/vehicles` &mdash; Registers a new vehicle with powertrain details and generates a diagnostic QR code.
*   `GET /api/maintenance` &mdash; Retrieves historical repair tickets, maintenance expenses, and diagnostic logs.
*   `POST /api/maintenance` &mdash; Registers a new service entry, decrementing the vehicle's remaining oil life expectancy.

### 6.3 Mini POS Catalog & Inventory Management
*   `GET /api/garage/inventory` &mdash; Fetches current product stock lists, buy/sell prices, and unit counts.
*   `POST /api/garage/inventory/adjust` &mdash; Logs physical inventory counts and adjusts stock levels on-screen.
*   `POST /api/garage/pos/checkout` &mdash; Processes POS balances, lowers product counts, logs transaction invoices, and generates ABA Pay payment QR tags.

### 6.4 AI Diagnostics Gateway
*   `POST /api/ai/diagnose` &mdash; Proxies user diagnostics questions to the Gemini validator engine. Injects system instructions with vehicle specifications, local traffic variables, and monsoon safety parameters.
*   `POST /api/ai/dream-car` &mdash; Feeds user budget constraints and driving styles to the Gemini model to recommend optimal vehicles.

### 6.5 Telegram Bot Simulating Gateway
*   `POST /api/telegram/generate-token` &mdash; Generates a unique, short-lived diagnostic verification code (e.g. `kh_9901_3f42`) allowing a user to link their Telegram account securely.
*   `POST /api/telegram/webhook` &mdash; Receives Telegram events, parses Bot commands (`/start`, `/status`, `/disconnect`), and manages subscriber databases.
*   `POST /api/telegram/send-template` &mdash; Dispatches pre-defined notification templates (such as ready-for-pickup notices) and tracks delivery statuses.

---

## 7. Interactive Telegram Notification Integration

The Telegram module connects repair centers and vehicle owners using a secure bot command pipeline:

```
[Vehicle Dashboard Settings] ─► Click "Link Telegram" ─► Connect token generated (e.g. kh_9921)
                                                                 │
                                                                 ▼
[Inbound Webhook API Target] ◄─ Sends chat event chat_id ◄─ Direct launch in TG with token
                                                                 │
                                                                 ▼
Account linked securely ────► Garage dispatches repair check status update ────► Instant Telegram message
```

### 7.1 Key Bot Commands Supported
*   `/start [token]` &mdash; Initiates the connection handshake, extracts the verified pairing code, and binds the Telegram `chat_id` directly to the client's account profile.
*   `/status` &mdash; Queries the active vehicle deck, summarizing current mileage levels, pending notifications, carbon savings, and overdue maintenance records.
*   `/on` / `/off` &mdash; Suspends or resumes Telegram updates globally without breaking the profile connection.
*   `/disconnect` &mdash; Deletes the saved pairing and removes the associated `telegram_chat_id` and username from database logs.

### 7.2 Safety & Volume Flood Caps
*   **Mute Promotives:** Users can toggle individual sliders to mute marketing notifications while keeping critical diagnostic warnings and receipt invoices enabled.
*   **Abuse Filters:** Individual workshops are hard-throttled to a maximum of 5 daily notification events per customer, preventing spam.

---

## 8. Development & Compilation Workspace Guide

### 8.1 Installed Dependencies (`package.json`)
Our system keeps external dependencies minimal, focused, and fast:
*   **Reactive Rendering:** `react` & `react-dom` (v19) built on **Vite** (v6).
*   **Visual Physics & Animation:** `motion` (v12) for layout transitions and animations.
*   **Diagrams & Analytical Charts:** `recharts` for responsive charts and financial widgets.
*   **Database Schema & ORM:** `drizzle-orm` matching `pg` driver libraries.
*   **AI Models Gateway:** Modern `@google/genai` (v2.4) SDK for robust chat streaming.
*   **Vector UI Shapes:** `lucide-react` for high-quality icons.

### 8.2 Build and Start Commands
*   **Start Local Dev Environment:**
    ```bash
    npm run dev
    ```
    This launches the backend proxy server through `tsx`, automatically mounting server-side APIs on HTTP port `3000` while proxying frontend assets via Vite middleware.
*   **Perform Project Type Checking / Linting:**
    ```bash
    npm run lint
    ```
    Ensures strict type compliance before compilation.
*   **Build Production-Grade Packages:**
    ```bash
    npm run build
    ```
    Triggers client-side optimization code chunks writing static assets to `dist/`, and bundles server-side typescript configurations through `esbuild` to build a single, fast CommonJS server bundle (`dist/server.cjs`).
*   **Start Compiled Server:**
    ```bash
    npm run start
    ```
    Deploys the production server directly from the compiled CommonJS build.

---

*(End of Product Technical documentation. Designed with precision for MyCar Care KH)*
