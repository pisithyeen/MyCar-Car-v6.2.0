# DESIGN.md — MyCarCare Cambodia Master Design Specification

Welcome to the definitive Design and Product Specification document for **MyCarCare Cambodia** (also referred to as the Angkor Speed Auto Network), a comprehensive full-stack, AI-powered vehicle lifecycle management, diagnostic, and workshop coordination platform customized specifically for the Cambodian market.

This system bridges the gap between individual vehicle owners, fleet operations, commercial service providers (garages, parts stores, fuel stations), and highway rescue helpers under a **Unified Persona Control System**.

---

## 1. Architectural Concept & Core Value Proposition

In Cambodia, vehicle maintenance is highly decentralized, ranging from modern dealerships in Phnom Penh to roadside mechanics in rural provinces. Owners deal with extreme weather conditions (intense seasonal humidity, dust, and heavy monsoon flooding) that damage critical components like hybrid cooling fans, chassis joints, and air filters. 

**MyCarCare** provides:
*   **A Unified Account with Multi-Role Switching**: A single user account can act as a **Vehicle Owner** by day, a **Driver** or **Fleet Manager** by night, or run a **Garage / Spare Parts shop** without needing to create separate profiles.
*   **Cambodian-Localized AI Diagnostics**: High-fidelity symptom analysis backed by Gemini, referencing specific regional parts marketplaces inside Phnom Penh (e.g., Dei Huy Market, Russian Market, Sihanouk Boulevard).
*   **Highway Rescue & Bidding (Fix My Car)**: Instantly broadcast emergency breakdown coordinates on Cambodia's highways and receive competitive rescue bids from freelance mechanics.
*   **Dual Currency Ledger**: Clean maintenance accounting supporting United States Dollars (USD) and Khmer Riel (KHR) transactions.

---

## 2. Complete User Persona Directory

The system is architected around **10 distinct user personas**, each equipped with tailored dashboard systems, dynamic navigation lists, and specific action centers.

```
                    ┌───────────────────────────────┐
                    │     UNIFIED USER ACCOUNT      │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
       [CONSUMER / LOGISTICS CORES]     [COMMERCIAL / SERVICE CORES]
       ├── 1. Vehicle Owner             ├── 4. Garage Owner
       ├── 2. Vehicle Manager (Fleet)   ├── 5. Garage Staff (Mechanic)
       └── 3. Driver / Staff            ├── 6. Spare Part Shop
                                        ├── 7. Petrol Station Partner
       [ADMIN / OPERATIONS CORES]        ├── 8. EV Charging Station Partner
       ├── 10. System Admin             └── 9. Freelance Mechanic (Rescue)
```

### 2.1 Vehicle Owner (The Consumer Core)
*   **Focus**: Single or multi-vehicle health tracking, quick logging, and service discovery.
*   **Key Functions**:
    *   **Interactive Vehicle Deck**: View brand, model, and year with live fuel/odometer state.
    *   **Smart Maintenance Alerts**: Colored notifications flagging oil changes, brakes, and spark plugs.
    *   **Phnom Penh Service Finder**: Locate verified repair hubs with distance calculations.
    *   **Care Coin System**: Earn rewards for logging services and donate to community roadside safety causes.
    *   **Marketplace**: Post used cars or spare parts for sale.

### 2.2 Vehicle Manager (The Fleet Core)
*   **Focus**: Medium-to-large business fleet operators or family vehicle managers.
*   **Key Functions**:
    *   **Driver Assignment Dashboard**: Bind designated drivers to specific fleet vehicles.
    *   **Fleet Expense Ledger**: Consolidated reports on aggregate fuel, charging, and repair expenditures.
    *   **Availability Planner**: Live indicators of which vehicles are in service, in repairs, or ready.
    *   **Custom Reminders**: Batch schedule tire rotations or road tax payments.

### 2.3 Driver / Staff (The Logistics Core)
*   **Focus**: On-the-road telemetry and quick logging.
*   **Key Functions**:
    *   **★ Driver Console**: A simplified, high-contrast interface designed for quick access on smartphones.
    *   **Odometer update input**: Submit latest mileage with a single tap.
    *   **Trip Logs & Fuel/Charge reporter**: Record fuel consumption or charging fees on the go.
    *   **Trip Notes**: Direct report of issues or anomalies to the Fleet Manager.

### 2.4 Garage Owner (The Commercial Core)
*   **Focus**: Workshop management, POS operations, and service bidding.
*   **Key Functions**:
    *   **Garage Dashboard**: Overview of active mechanics, current job queues, and revenue.
    *   **Service Jobs POS**: Dynamic work order dispatcher and billing center.
    *   **Scan Vehicle QR**: Read a customer's vehicle QR code to instantly import their service history.
    *   **Staff & Mini POS Management**: Invite receptionist/mechanic staff and manage inventory.
    *   **Distress Bids**: Bid on emergency highway breakdowns.

### 2.5 Garage Staff (The Workshop Core)
*   **Focus**: Job queue execution, checklists, and vehicle check-ins.
*   **Key Functions**:
    *   **Receptionist & Job Intake**: Quickly check in incoming client cars.
    *   **Active Job Workspace**: Checklist of mechanics actions (oil draining, parts swap).
    *   **Scan QR Profile**: Look up vehicle specifications and registered concerns.

### 2.6 Spare Part Shop (The Retail Core)
*   **Focus**: Inventory management, sales, and marketplace outreach.
*   **Key Functions**:
    *   **Spare Parts Dashboard**: At-a-glance stock indicators and pending orders.
    *   **Marketplace Publisher**: Directly publish parts (filters, spark plugs, brake pads) to the public marketplace.
    *   **Low Stock Alerts**: Automatically highlights part numbers needing re-ordering.

### 2.7 Petrol Station Partner (The Refueling Core)
*   **Focus**: Location map discoverability and fuel promotional campaigns.
*   **Key Functions**:
    *   **Fuel Station Desk**: Logging daily fuel rate updates.
    *   **Promotional Campaign Hub**: Push discount rates (e.g., "$1 off Super Gasoline") to nearby Vehicle Owners.
    *   **Location Geofence Manager**: Track visits and map views.

### 2.8 EV Charging Station Partner (The Green Core)
*   **Focus**: Charger status tracking and pricing administration.
*   **Key Functions**:
    *   **EV Charging Dashboard**: View active chargers, utilization metrics, and grid feed-ins.
    *   **Dynamic Price Editor**: Set pricing per kWh based on peak and off-peak hours.
    *   **Live Status Broadcasting**: Push real-time charger availability (Available, Occupied, Out of Service) to EV owners.

### 2.9 Freelance Mechanic (The Highway Rescue Core)
*   **Focus**: On-demand emergency rescue and roadside diagnostics.
*   **Key Functions**:
    *   **Highway Distress Alerts Radar**: Real-time visual map overlay showing breakdowns along Route 1, Route 4, and other major highways.
    *   **Bidding Center**: Submit instant, competitive price estimates and arrival times to stranded motorists.
    *   **Assistance Tips Board**: Share peer-reviewed tips for roadside fixes with other mechanics.

### 2.10 Operations Admin (The Platform Core)
*   **Focus**: Complete database audits, user verification, and forum moderation.
*   **Key Functions**:
    *   **System Analytics Board**: Tracks growth metrics across Cambodia, peak booking hours, and average repair ticket costs.
    *   **Partner Verification Queue**: Approve business licenses and grant "Verified Partner" badges.
    *   **Forum Moderation Workspace**: Review, delete, or pinned community posts.

---

## 3. System Workflow & Data Integration Maps

### 3.1 Unified Persona Control & Active Context Sync
When a user switches their active role via the **Unified Persona Control** (`RoleSwitcher`), the frontend immediately synchronizes their state on the Express backend via `PUT /api/profile/preferences`. 

This updates:
1.  **`active_role`**: Restructures the sidebar navigation (`getNavItems()`) dynamically.
2.  **`active_vehicle_id`**: For Drivers/Managers, isolates fuel logs and alerts to the designated vehicle.
3.  **`active_business_id`**: For Garage Staff/Owners/Stores, ties their workspace context to the designated shop profile.

```
┌──────────────────┐    Active Switch    ┌─────────────────────────┐
│   RoleSwitcher   ├────────────────────>│ PUT /api/p/preferences  │
│    (Frontend)    │   active_role,     │     (Express Backend)   │
└──────────────────┘   vehicle/business  └────────────┬────────────┘
                                                      │ Updates Profile DB
                                                      ▼
┌──────────────────┐                     ┌─────────────────────────┐
│ Sidebar Restruct │<────────────────────┤   Re-bootstrap Client   │
│   (Nav Items)    │  State Synced       │   (Trigger New Fetch)   │
└──────────────────┘                     └─────────────────────────┘
```

### 3.2 AI Diagnostic & Location-Aware Sourcing Workflow
When a vehicle owner submits diagnostic symptoms (e.g., "Airbag light is on, engine running hot"):

1.  **Prompt wrapping**: The backend retrieves the vehicle's specifications (Toyota Prius 2010, 180,000 km) and appends Cambodian environmental context factors (high air dust, seasonal monsoonal floods).
2.  **Gemini Model Execution**: `gemini-3.5-flash` processes the structured query.
3.  **Local Grounding**: The system extracts parts sourcing recommendations and maps them to physical locations like the Russian Market or Sen Sok district garages.

---

## 4. Key Database Schema Overview

The underlying database uses high-performance indexed queries. Key relational definitions:

*   **`users`**: Master credential storage, holds original user registration role.
*   **`user_profiles`**: Personal preferences, geolocation, preferred language (EN/KH), and active preferences (`active_role`, `active_vehicle_id`, `active_business_id`).
*   **`vehicle_profiles`**: Individual car cards (vin, plate, brand, model, mileage, fuel type, oil-change logs).
*   **`garage_profiles`**: Coordinates, district, opening hours, verified badge status, and service lists.
*   **`maintenance_records`**: Financial and mechanical history cards tracking spent USD/KHR and technician notes.
*   **`maintenance_reminders`**: Dynamically computed upcoming actions linked to odometer thresholds.

---

## 5. Visual Theme & Aesthetic Philosophy

MyCarCare adheres to the **Cosmic Slate Theme** — a high-contrast dark visual identity that reduces eye strain under Cambodia's high-glare sunlight:

*   **Primary Palette**: Rich deep blues and slate grays (`bg-slate-950`, `bg-slate-900`) contrasted with sharp icy borders (`border-white/10`).
*   **Accent Colors**: Sky Blue (`sky-400`) for navigation, Emerald (`emerald-400`) for verified partner credentials and business growth items, and Amber/Rose (`amber-400`, `red-400`) for urgent warnings and roadside alerts.
*   **Typography**: Clean **Inter** display headings for maximum legibility paired with monospace formatting (**JetBrains Mono**) for system indicators, plate numbers, and currency ledger values.
*   **Responsive Precision**: Grid layouts automatically shift from a clean single-column feed on mobile screens to a rich multi-grid dashboard on desktop viewports.

---
*(End of DESIGN.md master specification file)*
