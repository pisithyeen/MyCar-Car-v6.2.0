# MyCar Care KH: Telegram Notification Integration Architecture

This document outlines the detailed multi-role architecture, data schemas, API routes, permission rules, bot command structures, and implementation checklists for the **Telegram Notification Integration** module within the MyCar Care KH application.

---

## 1. Full Feature Architecture

The notification layer maps event emitters to channels based on routing and policy matrices.

```
                    [App Event / Garage Event / System Event]
                                       │
                                       ▼
                       [Notification Dispatcher Router]
                                       │
                      ┌────────────────┴────────────────┐
                      ▼                                 ▼
              [Push/In-App Channels]          [Telegram Channels Gateway]
                      │                                 │
                      ▼                                 ▼
             Check: App settings                Check: Settings preferences
                                                 Check: bot connection token
                                                 Check: garage relationship / blocks
                                                 Check: daily template message limits
                                                        │
                                                        ▼
                                             [Send Telegram Bot API]
```

---

## 2. User Flow

```
[User goes to App Settings] ───► [Enables "Telegram notifications" / Connect Telegram]
                                                      │
                                                      ▼
                                       [Secure Token Generated] (e.g., "kh_9901")
                                                      │
                                                      ▼
                                      [User clicks: Connect Bot link]
                                                      │
                                                      ▼
                                    [Telegram Opens: /start kh_9901]
                                                      │
                                                      ▼
                       [Bot validates token with server ◄──► Chat ID stored on User profile]
                                                      │
                                                      ▼
                                      [Telegram: Connection Successful]
```

---

## 3. Garage Flow (Outbound Messages)

```
[Garage Owner opens "Customer Communication Center"]
                                │
                                ▼
         [Filters user by connected Telegram status and opt-ins]
                                │
                                ▼
         [Selects message template (Pickup, Quotation, Promo)]
                                │
                                ▼
                     [Server runs checks:]
                     - Connected & Enabled?
                     - Specific notification category allowed?
                     - Has user blocked this garage?
                     - Daily limit cap exceeded?
                                │
                                ├─► [Yes] ──► [Fail: Blocked or Opted Out]
                                ▼
                             [No] ──► [Dispatch via BOT API / Log to notification_logs]
```

---

## 4. Database Schema (Schema Definitions)

### 1. `user_notification_preferences` (CRM User Matrix)
```json
{
  "user_id": "cust_kh092",
  "app_notification_enabled": true,
  "telegram_enabled": true,
  "telegram_chat_id": "88219034",
  "telegram_connected_at": "2026-05-29T16:40:07Z",
  "allow_maintenance_reminders": true,
  "allow_garage_service_updates": true,
  "allow_invoice_notifications": true,
  "allow_quotation_requests": true,
  "allow_warranty_reminders": true,
  "allow_garage_promotions": false,
  "allow_emergency_alerts": true,
  "created_at": "2026-01-10T08:00:00Z",
  "updated_at": "2026-05-29T16:40:07Z"
}
```

### 2. `telegram_connections` (Connection Trace Log)
```json
{
  "id": "tg_conn_01",
  "user_id": "cust_kh092",
  "telegram_chat_id": "88219034",
  "telegram_username": "@kiri_kh9",
  "connection_status": "Connected",
  "verification_token": "kh_9901_3f42",
  "connected_at": "2026-05-29T16:40:07Z",
  "disconnected_at": null,
  "last_message_at": "2026-05-29T16:42:15Z"
}
```

### 3. `notification_logs` (Audit System Ledger)
```json
{
  "id": "notif_log_44312",
  "user_id": "cust_kh092",
  "garage_id": "garage_abc999",
  "vehicle_id": "veh_prius2010",
  "channel": "Telegram",
  "notification_type": "Vehicle ready for pickup",
  "title": "Toyota Prius Ready",
  "message": "Your Toyota Prius (Phnom Penh 2B-3512) has passed quality checks and is ready for pickup at Apsara Premium Diagnostics. Invoice Total: $40.00 USD. Thank you!",
  "status": "delivered",
  "trigger_source": "garage",
  "sent_by_staff_id": "staff_tech01",
  "related_service_record_id": "srv_rec_8831",
  "related_invoice_id": "inv_99812",
  "related_quotation_id": null,
  "error_message": "",
  "created_at": "2026-05-29T16:42:15Z",
  "sent_at": "2026-05-29T16:42:15Z"
}
```

### 4. `garage_customer_notification_permissions` (Anti-Spam Blocklist)
```json
{
  "id": "gcnp_882",
  "garage_id": "garage_abc999",
  "user_id": "cust_kh092",
  "allow_service_updates": true,
  "allow_invoice_messages": true,
  "allow_reminders": true,
  "allow_promotions": false,
  "blocked_by_user": false,
  "created_at": "2026-01-15T09:00:00Z",
  "updated_at": "2026-05-29T16:40:00Z"
}
```

---

## 5. API Endpoints

- **`POST /api/telegram/generate-token`**:
  Generates a short-lived cryptographically secure token paired with the user profile (`userId`).
- **`POST /api/telegram/webhook`**:
  Receives Telegram updates. Handles registration / token parsing, start sequence, `/on`, `/off`, `/status`, `/disconnect` bot commands.
- **`POST /api/telegram/send-template`**:
  Enables outbound templates triggers, runs validation policies (permission checks, spam limits) prior to invoking Telegram Bot client dispatch.

---

## 6. Telegram Bot Command Logic

- `/start [token]`: Greets the user, extracts the verified security token, binds their Telegram `chat_id` and username to their user account, and activates communication channels.
- `/status`: Replies with connected vehicle profiles, active alert preferences, and any due/overdue smart diagnostic categories.
- `/on`: Turns all MyCar Care KH Telegram updates ON in settings.
- `/off`: Suspends Telegram updates (enters silent state without breaking the profile pairing).
- `/disconnect`: Completely deletes the saved `telegram_chat_id` and token correlation for absolute privacy.
- `/help`: Offers user support instructions and Cambodian translation guidelines.

---

## 7. Operational Permission rules

1. **User Empowerment Rule**: System can never dispatch messages if `telegram_enabled == false` or specific category allowed equals `false`.
2. **Promotional Squelch Rule**: If `allow_garage_promotions == false`, matching marketing messages are immediately blocked at gateway.
3. **Soft-Block Protection Rule**: If `blocked_by_user == true` on the garage relationship matrix, any attempt by that garage to message the user will return a policy error.
4. **Volume Flood Cap**: Individual garages are hard-throttled to a maximum of 5 manual dispatch events per customer per day, preventing spam.

---

## 8. UI Screen Manifest

### For Vehicle Owners:
1. **Connect Telegram Hub (Settings)**: Beautiful token presentation, deep linking redirect tags, active pairing status, and commands reference cheat sheet.
2. **Interactive Notifications Preference Grid**: Granular toggle sliders for app notifications vs Telegram bot alerts (Maintenance, Updates, Promotives, Emergency warnings).
3. **Garage Direct Control Board**: Toggle lists to selectively block specific repair shops or mute promotional templates.
4. **History Log Ledger**: Scrollable feed showing delivery timeline and statuses.

### For Garage Owners / Admins:
1. **Live Customer Telegram Indicator**: Matrix badge overlay on diagnostic records showing whether user is connected to Bot.
2. **Customer Communication Center**: Custom dispatcher workspace with templated forms (Ready for Pickup, Quotation reviews, Invoices, reminders).
3. **Failed Message reporting**: Simple diagnostic widgets indicating failure counts (opted-out, blocked) to keep communication processes pristine.

---

## 9. Testing & Delivery Checklist

- [x] Integrate full Telegram token simulator on the user settings terminal.
- [x] Seed interactive bot simulations to test `/start`, `/help`, `/status`, `/disconnect` sequence safely inside the sandbox context.
- [x] Configure permissions validation checker within outbounds dispatchers.
- [x] Build live notification audit timelines displaying actual message payloads.
- [x] Compile and verify dev server status under extreme conditions.
