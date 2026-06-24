# MyCar Care KH: Garage Owner Admin Panel & Mini POS Architecture

This document outlines the full multi-dimensional architecture, data schemas, API endpoints, role permission matrix, and design layouts for the **Garage Owner Admin Panel / Mini POS / Sales Tracking / Customer Tracking / Report System** integrated into the MyCar Care KH application.

---

## 1. Full Feature Architecture

The Garage Owner Admin Panel is structured into a full-stack, modular architecture designed to support fast client workflows (paved/unpaved road status, monsoon checks) and state synchronization with end-car-owners.

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT-SIDE (React App)                             │
├───────────────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐  ┌───────────────────┐  ┌─────────────────┐  ┌──────────┐  │
│  │   Garage Owner    │  │     Mini POS      │  │    Inventory    │  │    AI    │  │
│  │   Dashboard KPI   │  │  Invoice Checkout │  │   SKU Ledger    │  │ Advisor  │  │
│  └─────────┬─────────┘  └─────────┬─────────┘  └────────┬────────┘  └────┬─────┘  │
└────────────┼──────────────────────┼─────────────────────┼────────────────┼────────┘
             │                      │                     │                │
             ▼                      ▼                     ▼                ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY Router (Express)                         │
├───────────────────────────────────────────────────────────────────────────────────┤
│  /api/ai/car-advisor         Proxy query parameters with Gemini SDK               │
│  /api/garage/service-records Create record, triggers pending customer receipt      │
│  /api/garage/pos/checkout    Saves invoice transactions, decrements stock        │
│  /api/garage/inventory       Maintains item lists, pricing templates & triggers  │
└────────────────────────────────────┬──────────────────────────────────────────────┘
                                     │
                                     ▼
 ┌─────────────────────────────────────────────────────────────────────────────────┐
 │                               DATABASE PERSISTENCE                              │
 ├─────────────────────────────────────────────────────────────────────────────────┤
 │ 1. garages               2. garage_branches         3. garage_staff             │
 │ 4. customers             5. vehicles                6. service_records          │
 │ 7. invoices              8. invoice_items           9. products                 │
 │ 10. inventory_txs        11. service_templates      12. payments                │
 │ 13. quotations           14. customer_notifications  15. customer_feedback       │
 │ 16. garage_reports       17. audit_logs                                         │
 └─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. User Flow

```
[Customer arrives / Scans Vehicle QR] 
        │
        ▼
[Garage reads Customer Types & Pothole/Flood risk parameters]
        │
        ▼
[Initiate Workstation Bay Ticket] ---> (Send Quotations for big repairs) ---> [Customer app approval]
        │
        ▼
[Add Spare Parts from Inventory via POS] ---> [Labor charge calculation]
        │
        ▼
[Complete Repair / Service Ready for Pickup]
        │
        ├── (Triggers push Notification to Customer App)
        ▼
[Checkout in POS / select Payment (ABA QR, USD Cash, Acleda)]
        │
        ├── (Auto-decrements Inventory count, creates Invoice ticket)
        ▼
[Service Certificate added to Customer History] ---> [Feedback Rating Triggered]
```

---

## 3. Database Schema (Schema Definitions)

### 1. `garages` (Main Workshop Table)
```json
{
  "id": "garage_abc999",
  "name": "Apsara Premium Diagnostics and Tuning",
  "main_owner_id": "user_owner123",
  "address": "45A Street 271, Teuk Thla, Phnom Penh",
  "contact_phone": "+855 12 555 984",
  "license_number": "MPTC-PP-9831-2025",
  "status": "Verified",
  "createdAt": "2025-10-01T08:00:00Z"
}
```

### 2. `garage_branches` (Multi-branch Matrix)
```json
{
  "id": "branch_sen_sok",
  "garage_id": "garage_abc999",
  "branch_name": "Teuk Thla Main",
  "location": "Phnom Penh",
  "staff_count": 8,
  "revenue_target": 12000.00
}
```

### 3. `garage_staff` (Role Permissions Mapping)
```json
{
  "id": "staff_tech01",
  "garage_id": "garage_abc999",
  "branch_id": "branch_sen_sok",
  "name": "Khem Somaly",
  "phone": "+855 98 221 442",
  "role": "Mechanic", 
  "permissions": ["add_service_notes", "view_checklist"],
  "status": "Active"
}
```

### 4. `customers` (CRM and Segment Profiles)
```json
{
  "id": "cust_kh092",
  "name": "Kiri Prasath",
  "phone": "+855 16 990 120",
  "type": "VIP customer", 
  "total_spending": 1450.00,
  "last_visit_date": "2026-04-12",
  "next_service_date": "2026-07-12",
  "notes": "Prefers premium oil brands. Highly responsive via messaging."
}
```

### 5. `vehicles` (Fleet Profiles)
```json
{
  "id": "veh_prius2010",
  "owner_id": "cust_kh092",
  "brand": "Toyota",
  "model": "Prius",
  "year": "2010",
  "plate_number": "Phnom Penh 2B-3512",
  "mileage": 182400,
  "qr_token": "mycarcarekh://customer/verify?userId=cust_kh092&vehicleId=veh_prius2010&token=sec_k89a"
}
```

### 6. `service_records` (Mechanic Logs)
```json
{
  "id": "srv_rec_8831",
  "customer_id": "cust_kh092",
  "vehicle_id": "veh_prius2010",
  "plate_number": "Phnom Penh 2B-3512",
  "mileage": 182400,
  "service_type": "Engine Oil Service",
  "problem_description": "Standard interval maintenance & engine check light inspection",
  "inspection_notes": "Diagnostic scan reports code P0A93 (Inverter cooling fan performance). Cleaned filter grid.",
  "labor_cost": 15.00,
  "product_cost": 30.00,
  "total_cost": 45.00,
  "mechanic_name": "Khem Somaly",
  "status": "Waiting for Customer Approval",
  "next_service_mileage": 187400,
  "next_service_date": "2026-08-25"
}
```

### 7. `invoices` (Sales Ledger)
```json
{
  "id": "inv_99812",
  "invoice_number": "INV-2026-0032",
  "garage_name": "Apsara Premium Diagnostics and Tuning",
  "customer_name": "Kiri Prasath",
  "customer_phone": "+855 16 990 120",
  "vehicle_brand": "Toyota",
  "vehicle_model": "Prius",
  "plate_number": "Phnom Penh 2B-3512",
  "service_date": "2026-05-29",
  "discount": 5.00,
  "total_price": 40.00,
  "payment_method": "ABA Pay",
  "paid_status": "Paid",
  "staff_name": "Keo Sorya (Cashier)",
  "next_service_recommendation": "Schedule transmission fluid flush at 190,000 km."
}
```

### 8. `products` (Inventory Catalog)
```json
{
  "sku": "SKU-CAST-5W30-1L",
  "name": "Castrol Edge 5W-30 Titanium",
  "category": "Fluids & Engine Oil",
  "brand": "Castrol",
  "supplier": "Cambodia Lubricant Distributor Co. Ltd",
  "purchase_price": 5.50,
  "selling_price": 8.00,
  "stock_quantity": 42,
  "min_stock_alert": 10,
  "storage_location": "Bay C Cabinet 1"
}
```

---

## 4. UI Screen List

The administrative experience is partitioned into 6 main sub-interfaces:
1. **Financial reports and KPI dashboard**: Quick visualization dials of profit margins, branch comparisons, and monthly metrics.
2. **Interactive Mini-POS check-out terminal**: Basket construction, item pricing overrides, discount tools, and customer linking.
3. **CRM customer registry**: Active visitor histories, loyalty types, and vehicle status monitors.
4. **Interactive SKU Inventory manager**: Item registers, fast adjustment keys, and supplier lists.
5. **Role switcher workspace**: Simulation desk allowing the tester to experience the application as an Owner, Manager, Mechanic, or Cashier.
6. **Interplanetary AI Reports Assistant**: An interactive helper chat providing custom prompt buttons to evaluate inventory levels, customer timing, and marketing packages.

---

## 5. Role Permission Matrix

| Module/Perm | Owner | Manager | Mechanic | Cashier |
| :--- | :---: | :---: | :---: | :---: |
| View Financial Reports | ✅ | ✅ | ❌ | ❌ |
| Create & Log Invoices | ✅ | ✅ | ❌ | ✅ |
| Access Inventory Purchase Price | ✅ | ✅ | ❌ | ❌ |
| Edit Stock Quantity | ✅ | ✅ | ✅ (Adjust) | ✅ (Decrement) |
| Log Mechanics Diagnostic Notes | ✅ | ✅ | ✅ | ❌ |
| Add new Staff Profiles | ✅ | ❌ | ❌ | ❌ |
| Re-diagnose on-site issues | ✅ | ✅ | ✅ | ❌ |

---

## 6. Full-Stack API Endpoints

- **`POST /api/ai/car-advisor`**: Evaluates custom Cambodian drivers' profile parameters and generates budgets, ownership forecasts, and optimal choices using the Gemini 3.5 model.
- **`POST /api/garage/service-records`**: Places a mechanic diagnostic ticket on a scanned customer's digital record.
- **`POST /api/garage/pos/checkout`**: Books a customer checkout event, lowering product stocks, logging invoices, and emitting audit logs.
- **`POST /api/garage/inventory/adjust`**: Updates localized part stock quantity for audit trails.
- **`POST /api/garage/follow-up`**: Sends automated notifications (Promotions, diagnostics notifications, or check reminders).

---

## 7. MVP Development Plan & Testing Checklist

### Phase 1: Interactive Core (Current Phase)
- Implement full-canvas multi-tab view under the "Garage Owner" or "Vehicles" router.
- Seed high-fidelity sample data representing realistic Phnom Penh garages, products (fluid, brake pads), and local customers.
- Direct-binding state controllers between checkout, CRM, and stock managers so items decrement dynamically.

### Phase 2: Live Integrations (Medium Term)
- Connect real-world hardware barcodes to scanning components via camera framing flags.
- Establish remote sync with third-party multi-payment integrations.

---

## 8. Security Rules (Firestore / Firestore.rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Audit logs are read-only for security and never modified
    match /audit_logs/{logId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Admin';
      allow update, delete: if false;
    }
    
    // Invoices are auditable; soft-delete only
    match /invoices/{invId} {
      allow read, write: if request.auth != null;
      allow delete: if false;
    }
  }
}
```

---

## 9. Mobile App Layout & Suggested Interface

- **Left margin sidebar** for widescreen desktop terminals tracking check-ins of Prius and Lexus models.
- **Bento cards** at the top summarizing diagnostic counts, capacities, and currency revenue.
- **Direct print visual layouts** formatted in standard monochrome receipt structures suitable for 80mm thermal receipt printers in Cambodia.
