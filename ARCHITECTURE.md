# MyCar Care KH &mdash; Product Architecture & Technical Specifications

This documentation serves as the master blueprint for **MyCar Care KH**, an AI-powered vehicle maintenance and service platform customized for the Cambodian market. This blueprint outlines the MVP's software design, database schemas, API architecture, workflows, permissions, and deployment lifecycles.

---

## 1. Full Database Schema (PostgreSQL)

The database schema is designed for scalability, performance, and transactional safety under PostgreSQL. It utilizes indexes on foreign keys and frequently searched attributes (like vehicle registration details, geolocations, and service categories).

```sql
-- PostgreSQL Database Definition Language (DDL) Script
-- MyCar Care KH MVP Database Blueprint

-- Enable PostGIS extension for geo-spatial garage searching (if required, otherwise fallback to index calculations)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Users table supporting multi-tenant roles
CREATE TYPE user_role AS ENUM ('vehicle_owner', 'garage_owner', 'partner_station', 'spare_part_shop', 'admin');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(150) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL, -- e.g. +85512345678 (Cambodian format)
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'vehicle_owner',
    full_name VARCHAR(100) NOT NULL,
    language_preference VARCHAR(5) DEFAULT 'en', -- 'kh' for Khmer, 'en' for English
    fcm_token VARCHAR(255), -- For push notifications via Firebase
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. User Profiles
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    avatar_url VARCHAR(255),
    home_address VARCHAR(255),
    city_province VARCHAR(50) DEFAULT 'Phnom Penh',
    preferred_payment_method VARCHAR(50), -- offline_cash (default for MVP), partner_account
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Vehicle Profiles
CREATE TYPE fuel_type AS ENUM ('Gasoline', 'Diesel', 'Hybrid', 'EV');

CREATE TABLE vehicle_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plate_no VARCHAR(20), -- Cambodian license plates (e.g., "Phnom Penh 2AZ-9999")
    brand VARCHAR(50) NOT NULL, -- e.g. Toyota, Lexus, Ford
    model VARCHAR(50) NOT NULL, -- e.g. Prius, RX330, Ranger
    year_manufactured INTEGER NOT NULL,
    current_mileage INTEGER NOT NULL DEFAULT 0,
    fuel_type fuel_type NOT NULL DEFAULT 'Gasoline',
    vin_number VARCHAR(17),
    last_oil_change_mileage INTEGER,
    last_service_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vehicle_owner ON vehicle_profiles(owner_id);
CREATE INDEX idx_vehicle_brand_model ON vehicle_profiles(brand, model);

-- 4. Garages & Service Center Profiles
CREATE TABLE garage_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    address VARCHAR(255) NOT NULL,
    district VARCHAR(50) NOT NULL, -- e.g. Tuol Kork, Boeng Keng Kang, Sen Sok
    city_province VARCHAR(50) DEFAULT 'Phnom Penh',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326), -- PostGIS Spatial Column
    image_url VARCHAR(255),
    description TEXT,
    is_verified_partner BOOLEAN NOT NULL DEFAULT false,
    rating NUMERIC(3, 2) DEFAULT 0.00,
    services_offered VARCHAR(100)[] NOT NULL DEFAULT '{}', -- array of tags
    opening_hours VARCHAR(100) DEFAULT '08:00 - 17:00 (Mon-Sat)',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_garages_spatial ON garage_profiles USING gist(geom);
CREATE INDEX idx_garages_verified ON garage_profiles(is_verified_partner);

-- 5. Maintenance Records & Log items
CREATE TABLE maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicle_profiles(id) ON DELETE CASCADE,
    garage_id UUID REFERENCES garage_profiles(id) ON DELETE SET NULL, -- optional local service
    service_category VARCHAR(100) NOT NULL, -- e.g., "Engine Oil Service", "Brake Pad Check", "HV Battery Check"
    service_date DATE NOT NULL,
    service_mileage INTEGER NOT NULL,
    cost_usd NUMERIC(10, 2) DEFAULT 0.00,
    notes TEXT,
    technician_remarks TEXT,
    receipt_image_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_maintenance_vehicle ON maintenance_records(vehicle_id);

-- 6. Smart Maintenance Reminders (triggered by date/mileage calculations)
CREATE TYPE reminder_type AS ENUM ('Oil_Change', 'Brakes', 'Air_Filters', 'Tires_Alignment', 'Battery_Check', 'General_Audit');

CREATE TABLE maintenance_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicle_profiles(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    type reminder_type NOT NULL,
    target_date DATE,
    target_mileage INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, due, completed, snoozed
    notified_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reminders_vehicle_status ON maintenance_reminders(vehicle_id, status);

-- 7. AI Diagnostic Assist logs (stores chat sessions and auto reports for model safety check)
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicle_profiles(id) ON DELETE SET NULL,
    title VARCHAR(150) DEFAULT 'Symptom Consultation',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    sender VARCHAR(10) NOT NULL, -- 'user', 'assistant' (or 'validator' for internal check state)
    message_text TEXT NOT NULL,
    validation_status VARCHAR(20) DEFAULT 'approved', -- approved, flagged, sanitized
    grounding_urls VARCHAR(255)[] NOT NULL DEFAULT '{}', -- Maps or parts stores references
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Brand/Model/Year Weakness Reports (pre-generated or cached via server proxy to minimize token cost)
CREATE TABLE vehicle_weakness_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year_manufactured INTEGER NOT NULL,
    general_issues JSONB NOT NULL, -- list of potential problems (common oil leaks, engine noise, etc.)
    critical_warnings JSONB NOT NULL, -- structural or safety notes (e.g., hybrid cooling fan cleaning)
    local_sourcing_tips TEXT, -- instructions about parts availability in Phnom Penh (e.g., "Dei Huy market", "Sihanouk Blvd shops")
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_weakness_brand_model_year ON vehicle_weakness_reports(brand, model, year_manufactured);

-- 9. Push Notifications Queue
CREATE TABLE push_notifications_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    body TEXT NOT NULL,
    payload JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, sent, failed
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_status ON push_notifications_queue(status, scheduled_for);
```

---

## 2. API Endpoint List

### Dynamic Authentication & Profile Registry
*   `POST /api/v1/auth/register` &mdash; Registers new user. Generates default `user_profiles` record.
*   `POST /api/v1/auth/login` &mdash; Validates account credentials, returns secure JWT token.
*   `POST /api/v1/auth/fcm-token` &mdash; Registers client application instance for Push Notifications.
*   `GET /api/v1/profile` &mdash; Retrieves current profile metadata.
*   `PUT /api/v1/profile` &mdash; Updates avatar, addresses, contact preferences.

### Vehicle Management
*   `GET /api/v1/vehicles` &mdash; Fetches all vehicle cards registered by the logged-in user.
*   `POST /api/v1/vehicles` &mdash; Subscribes a new brand/model vehicle to the user's dashboard.
*   `PUT /api/v1/vehicles/:id` &mdash; Modifies mileage or general specs.
*   `DELETE /api/v1/vehicles/:id` &mdash; Unregisters a profile.

### Maintenance & History Records
*   `GET /api/v1/vehicles/:id/records` &mdash; Gathers full historical service list of a specific vehicle.
*   `POST /api/v1/vehicles/:id/records` &mdash; Logs a service action (oil service, filter swap, tires).
*   `DELETE /api/v1/records/:id` &mdash; Removes or cancels a service log.

### Smart Calculations & Reminders
*   `GET /api/v1/vehicles/:id/reminders` &mdash; Returns list of dynamic date-triggered and mileage-triggered alerts.
*   `POST /api/v1/reminders` &mdash; Manually inserts custom maintenance triggers.
*   `PUT /api/v1/reminders/:id/resolve` &mdash; Marks smart reminder as completed, recalculating the next recurrence.

### Interactive Service & Garage Directory (Phnom Penh)
*   `GET /api/v1/garages` &mdash; Fetches active servicing locations in Phnom Penh (supports query parameters, and distance threshold filtering using coordinates).
*   `GET /api/v1/garages/:id` &mdash; Details booking policies, services list, phone calls, and direct coordinates.
*   `POST /api/v1/garages/:id/bookings` &mdash; Schedules partner-level checkups (returns basic ticket invoice, manual cash processing).

### AI Assistant & Safety Diagnosis Backends
*   `POST /api/v1/ai/diagnose` &mdash; Bridges standard customer inputs with Gemini. The entry point validates prompts, queries Gemini with strict structured fallback limits, filters unsafe keywords, maps regional spare part hotspots, and saves discussion trails.
*   `GET /api/v1/ai/reports/weakness-model` &mdash; Gathers pre-cached AI audits for particular year/make/model configurations. Includes critical cooling, battery and suspension issues typical of Cambodian weather (humidity, dust).

---

## 3. User Role Permission Matrix

The MVP utilizes user role permissions to guarantee operational boundaries are respected.

| Module Endpoint / Action | Vehicle Owner | Garage Owner | Petrol / Partner | Spare Part Shop | Admin Team |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Manage Profile Info** | RW | RW | RW | RW | RW |
| **Register & Edit Own Vehicles** | RW | — | — | — | RW |
| **Log Service / Maintenance** | RW | — | — | — | RW |
| **Consult AI Diagnostics** | RW | — | — | — | RW |
| **Create/Edit Garage Profile** | — | RW | — | — | RW |
| **Flag/Verify Garage Partners**| — | — | — | — | RW |
| **Broadcast System Push alerts**| — | — | — | — | RW |
| **Read Analytical Reports** | — | — | — | — | R |

> **RW** = Create, Read, Update, Delete  |  **R** = View Only  |  **—** = Forbidden

---

## 4. Mobile App Screen Flow (Flutter-Ready List)

The Flutter mobile application focuses on lightning-fast response times under cellular networks.

### 4.1 Onboarding & Gateway
*   **App Launch & Locale Option**: Choice of interfaces immediately in native Khmer or English.
*   **Sign In / Sign Up Gateway**: Telephone code validator or dual validation password block.

### 4.2 Primary Dashboard Hub
*   **Vehicle Deck**: Horizontal scroll showing selected vehicle, current mileage, health status, and speed dials.
*   **Urgent Care Indicators (Smart Reminders)**: Dynamic warnings shown in red/orange ("Oil Change due in 500 km or 12 days").
*   **Quick Menu**: One-click shortcuts to 'Find Repair shops', 'AI Assistant', or 'Log Maintenance'.

### 4.3 Maintenance Record Keeper
*   **Complete Log History**: Scrollable historical check-cards sorted of previous repairs with attached receipts.
*   **Log Activity Form**: Interactive data fields for mileage, spent amount (USD/KHR), category dropdowns, and photo attachment.

### 4.4 Phnom Penh Service Finder (Map-Engine)
*   **Interactive Partner Street Map**: Dynamic visual viewport displaying verified service garages, gasoline stations, and specialty battery parts vendors on top of Google Maps coordinate vectors.
*   **Detail Service Profile**: Shows operating schedules, direct dialing button, list of verified user comments, and service badges.

### 4.5 AI Care Engine & Weakness Library
*   **Diagnostics Dialogue System**: Multi-turn diagnostic dialogue screen supporting typical symptom inputs (e.g. "My Prius dash displays a red triangle, engine heat spikes").
*   **Vulnerability & Weakness Finder**: Instant search interface by Year/Model compiling standard localized breakdowns (such as air intake dust checks, steering rack wear on unpaved roads).

---

## 5. Web Admin Dashboard Module List

An admin dashboard written in Angular or React for managing the backend system.

1.  **System Analytics Visualizer**: Visual tracking of Cambodia user growth, vehicle distribution indexes, common garage bookings, and aggregate maintenance costs (D3/Recharts modules).
2.  **Partner & Repair Shop Registry List**: Verification queue for incoming garage partners, coordinate editing interface, verified checks validator, and badge manager.
3.  **Dynamic Weakness Database Engine**: Admin portal allowing direct edits, tuning, and additions of localized maintenance tips to pre-cached AI audits.
4.  **Notification Broadcaster (FCM Dispatcher)**: Targeting tools for push notifications (e.g., broadcasting rain/flooding seasonal notices to all vehicle owners inside Phnom Penh).
5.  **User Support & Symptom Logs Auditor**: Security checking board for AI communication flows to detect bad requests, and optimize prompt system structures.

---

## 6. Comprehensive Development Sprint Plan

An agile deployment roadmap consisting of 6 specific 2-week iterations.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          DEVELOPMENT ROADMAP                           │
├────────────┬─────────────────────────────┬─────────────────────────────┤
│ Milestone  │ Main Execution Focus        │ Key Structural Deliverables │
├────────────┼─────────────────────────────┼─────────────────────────────┤
│ Sprint 1   │ Core Infra, Auth & Database │ PostgreSQL schema creation, │
│            │                             │ NestJS auth APIs, Flutter   │
│            │                             │ basic navigation state.     │
├────────────┼─────────────────────────────┼─────────────────────────────┤
│ Sprint 2   │ Garage Partner Directory    │ Geolocation search engine,  │
│            │                             │ detail listings, partner    │
│            │                             │ checkout, map views.        │
├────────────┼─────────────────────────────┼─────────────────────────────┤
│ Sprint 3   │ Maintenance & Tracking      │ Vehicle CRUD, dynamic date- │
│            │                             │ and mileage calculations,   │
│            │                             │ oil life algorithm logic.   │
├────────────┼─────────────────────────────┼─────────────────────────────┤
│ Sprint 4   │ AI Car Diagnostic Engine    │ Multi-turn Gemini endpoints,│
│            │                             │ Cambodian context injection,│
│            │                             │ structured parsing schema.  │
├────────────┼─────────────────────────────┼─────────────────────────────┤
│ Sprint 5   │ FCM Alerts & Admin Panel    │ FCM push queue management,  │
│            │                             │ Admin portal, interactive   │
│            │                             │ metrics visualization.      │
├────────────┼─────────────────────────────┼─────────────────────────────┤
│ Sprint 6   │ Hardening & Polishing       │ E2E verification, Khmer UI  │
│            │                             │ mapping, production cold-    │
│            │                             │ start config & Play Store.  │
└────────────┴─────────────────────────────┴─────────────────────────────┘
```

### Sprint 1: Core Infra, Auth & Database (Weeks 1-2)
*   **Database Setup**: Deploy transactional tables on PostgreSQL; compile indexing structures.
*   **Backend Architecture Bootstrap**: Initialize NestJS API gateways; set up JSON Web Token strategies and request boundary rules.
*   **Mobile Framework Foundation**: Initialize Flutter codebase with basic states manager and local secure storage.

### Sprint 2: Garage Partner Directory (Weeks 3-4)
*   **Geolocation Search**: Backend geospatial service calculating geographic distances accurately.
*   **Directory API Integration**: Serves category-specific lookups (alignments, battery changes).
*   **Mobile Map View**: Embedded Google Maps viewport containing custom pin clusters, popup details, and booking requests.

### Sprint 3: Maintenance Ledger & Calculations (Weeks 5-6)
*   **Vehicle CRUD operations**: Implement backend asset controls and Flutter layouts.
*   **Calculations Algorithms**: Date and mileage scheduling engines running recursive mileage estimation when daily telemetry is missing.
*   **Receipt Attachments**: Integrate AWS S3 or Cloudinary storage proxies to store document scans securely.

### Sprint 4: AI Care Assistant & Weakness Audit (Weeks 7-8)
*   **AI Service API**: Secure server-side routes proxying request loads safely to Gemini (`gemini-3.5-flash`), with automated model failover rules.
*   **Context & Grounding Filters**: Real-time Cambodian parts sifter context parsing and validation layers.
*   **Vulnerability Audits Engine**: Automated weakness reports generation for model combinations caching reports in PostgreSQL.

### Sprint 5: FCM Alerts & Admin Panel (Weeks 9-10)
*   **FCM Push Queue manager**: Background engine managing daily scheduler actions and push tasks.
*   **Web Console**: Built to empower administrators with user search, garage verifications, and custom report corrections.

### Sprint 6: Localization, Hardening & Launch Prep (Weeks 11-12)
*   **Khmer Localization**: Translate all UI layers to native language maps.
*   **E2E Testing**: Stress-test endpoints, check memory consumption, optimize database querying indexes.

---

## 7. Quality & Testing Checklist

### 7.1 Security & Access Guardrails
- [ ] JWT tokens expire after 24 hours, utilizing secure refresh-token patterns.
- [ ] No client can read, update, or delete are belonging to another user.
- [ ] Admin actions protect crucial configurations with Guard-based validation.
- [ ] Database variables and API secrets are never committed to repositories or exposed to clients.

### 7.2 Performance under Cellular Conditions
- [ ] Images uploaded must be optimized and resized client-side before S3/Cloudinary dispatch.
- [ ] Network requests leverage local database cache (SQLite/Hive) to function offline during rural trips.
- [ ] Distance calculation queries leverage indexed bounding-box limits instead of querying entire spatial tables.

### 7.3 Multi-language & Locale Validation
- [ ] Verify both English and Khmer text renderings avoid UI truncation.
- [ ] Currency support shows simple dollar denominations ($) and Riel translations (KHR).
- [ ] Standard vehicle measurements adjust between Miles and Kilometers cleanly.

---

## 8. AI Assistant System Prompt & Validation Logic

To prevent hallucinatory output or instructions unsuitable for Cambodia, our backend operates a multi-tier AI validation and retry strategy.

```
                       ┌─────────────────────────┐
                       │   Mobile User Symptom   │
                       └────────────┬────────────┘
                                    │ e.g., "Airbag light is on"
                                    ▼
                       ┌─────────────────────────┐
                       │  Backend API Guardrails  │
                       │ ── Inject Local Context │
                       │ ── Attach Vehicle Specs │
                       └────────────┬────────────┘
                                    │ Robust server-side request wrapper
                                    ▼
                       ┌─────────────────────────┐
                       │  Gemini API Processing   │
                       │ ── Model Failover List  │
                       │ ── JSON Structured Type │
                       └────────────┬────────────┘
                                    │ JSON response payload returned
                                    ▼
                       ┌─────────────────────────┐
                       │   Backend Validation    │
                       │ ── Verify Safety Tags   │
                       │ ── Map Parts Hotspots   │
                       └────────────┬────────────┘
                                    ├──────────────────────────┐
                                    │ (Approved)               │ (Fails validation)
                                    ▼                          ▼
                       ┌─────────────────────────┐    ┌──────────────────┐
                       │   Serve Safe Diagnostic │    │  Deploy Mock/AI  │
                       │       Response          │    │ Recovery Handler │
                       └─────────────────────────┘    └──────────────────┘
```

### System Instruction Payload
The backend wraps all user questions with this safety context block before communicating with `gemini-3.5-flash`:

```text
You are the elite automotive mechanics validator for MyCar Care KH in Cambodia.
Diagnose issues objectively using the following parameters:
- Brand: {brand}
- Model: {model}
- Manufactured Year: {year}
- Current Mileage: {mileage} km

CRITICAL COMPLIANCE RULES:
1. Provide mechanical diagnoses separated into potential causes, security severity levels, and actionable steps.
2. Adapt suggestions to the Cambodian context (humid climate, unpaved road dust, flooding seasons).
3. Ground local parts sourcing tips by referencing reliable hotspots inside Phnom Penh (e.g., Dei Huy Market, Sihanouk Boulevard, Russian Market area, Sen Sok parts centers).
4. Do NOT recommend illegal modifications or uncertified diagnostic hacks.
5. Format the result as valid JSON conforming strictly to the response schema.
```

### Safety & Structural Verification Filters
Our backend middleware inspects the JSON payload from Gemini before responding to the mobile client:
*   **JSON Integrity Check**: Verify formatting meets our pre-defined interfaces.
*   **Failure Failover**: If the Gemini API reports a temporary service outage (`ApiError 503 UNAVAILABLE`), our backend:
    1. Retries the call with exponential backoff.
    2. Gracefully switches model targets to `gemini-3.1-flash-lite`.
    3. If all requests fail, it serves a robust, structured mock diagnostics report from local caching schemas matching standard model issues.
*   **Content Sanitizer**: Any flagged keywords or critical errors default back to a safe "Visit nearest verified garage" warning card.

---

## 9. Suggested Project Directory Structures

### 9.1 NestJS Backend (Custom Service Engine)
```text
mycar-care-backend/
├── src/
│   ├── main.ts                 # Backend server bootstrap entry point
│   ├── app.module.ts           # Root module mapping dependencies
│   ├── auth/                   # JWT and access logic
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── guards/
│   ├── vehicles/               # Vehicle registration management
│   │   ├── schemas/
│   │   ├── vehicles.controller.ts
│   │   └── vehicles.service.ts
│   ├── maintenance/            # Service record logging, oil calculations
│   │   ├── maintenance.controller.ts
│   │   └── maintenance.service.ts
│   ├── garages/                # Spatial partner locations mapping
│   │   ├── spatial-query.helper.ts
│   │   ├── garages.controller.ts
│   │   └── garages.service.ts
│   ├── ai-consultant/          # Gemini API interactions, schemas, validations
│   │   ├── prompts/
│   │   ├── ai-consultant.controller.ts
│   │   └── ai-consultant.service.ts
│   └── notifications/          # FCM Push messaging trigger service
│       ├── fcm-client.ts
│       └── scheduler.task.ts
├── test/                       # Unit and integration test suites
├── database/                   # Migrations directory and DDL scripts
├── .env.example                # Uncommitted environment configurations
└── package.json
```

### 9.2 Flutter Mobile Client
```text
mycar_care_kh/
├── assets/
│   ├── icons/                  # High contrast vector application shapes
│   ├── images/
│   └── lang/                   # Localization resource dictionaries
│       ├── en.json             # English language mapping
│       └── kh.json             # Khmer language mapping
├── lib/
│   ├── main.dart               # Core initialization gateway
│   ├── core/                   # Utilities, networking clients, themes
│   │   ├── theme/
│   │   ├── network/
│   │   └── secure_storage.dart
│   ├── data/                   # API providers and repository contracts
│   │   ├── models/
│   │   └── repositories/
│   ├── domain/                 # Clean Architecture logical use-cases
│   │   ├── usecases/
│   │   └── entities/
│   └── presentation/           # Flutter UI components, widgets, screens
│       ├── onboarding/
│       ├── dashboard/
│       ├── maintenance/
│       ├── map_finder/
│       ├── ai_care/
│       └── shared_widgets/
└── pubspec.yaml
```

---

## 10. MVP Delivery Timeline (Standard 12-Week Allocation)

```
Week  1 - 2  : Environment Setup & Core Architecture (Sprint 1)
Week  3 - 4  : Phnom Penh Geolocation Directory Search Routing (Sprint 2)
Week  5 - 6  : Maintenance Ledger & Oil Estimators Engine (Sprint 3)
Week  7 - 8  : Gemini API Diagnostic integration & Weakness Report Cache (Sprint 4)
Week  9 - 10 : FCM Push integration & Administrative Portal (Sprint 5)
Week 11 - 12 : Polish Locale strings, E2E stress testing, App Store filing (Sprint 6)
```

---
*(End of Technical Architecture Document)*
