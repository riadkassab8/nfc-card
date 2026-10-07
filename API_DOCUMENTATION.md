# Smart NFC/QR Card Management System — API Documentation

## 1. Authentication

The system uses **JWT (JSON Web Token)** for admin authentication only.

### How it Works

1. Admin sends `POST /api/auth/login` with `username` + `password`.
2. Server validates credentials and returns an `access_token`.
3. Admin includes the token in every protected request:
   ```
   Authorization: Bearer <access_token>
   ```
4. Token expires after 7 days (configurable via `JWT_EXPIRES_IN`).

### Protected vs Public Routes

| Type      | Routes                                              | Requires Token? |
|-----------|-----------------------------------------------------|-----------------|
| Public    | `POST /api/auth/login`                              | ❌ No           |
| Public    | `GET /r/:identifier`                                | ❌ No           |
| Protected | All `GET/POST/PUT/DELETE /api/cards/*`              | ✅ Yes          |
| Protected | All `GET/POST/PUT/DELETE /api/categories/*`         | ✅ Yes          |
| Protected | `GET /api/auth/me`                                  | ✅ Yes          |

---

## 2. API Endpoints

### 2.1 Auth Endpoints

---

#### `POST /api/auth/login`

Login as admin and receive a JWT token.

- **Auth required:** No
- **Rate limited:** Yes (100 req / 15 min per IP)

**Request Body:**
```json
{
  "username": "admin",
  "password": "your_password"
}
```

**Success Response — `200 OK`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "username": "admin"
  }
}
```

**Error Response — `401 Unauthorized`:**
```json
{
  "statusCode": 401,
  "error": "UnauthorizedException",
  "message": "Invalid username or password",
  "path": "/api/auth/login",
  "timestamp": "2026-10-01T10:00:00.000Z"
}
```

---

#### `GET /api/auth/me`

Get current admin profile.

- **Auth required:** ✅ Yes (Bearer token)

**Success Response — `200 OK`:**
```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
  "username": "admin",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

---

### 2.2 Card Management Endpoints

> All endpoints below require: `Authorization: Bearer <access_token>`

---

#### `POST /api/cards`

Create a new card. `subscription_end_date` is auto-set to **1 year from today**.
`qr_code` is **auto-generated** — no need to pass it manually.

**Request Body:**
```json
{
  "card_code": "CARD-0001",
  "nfc_uid": "NFC-7FJ2K9",
  "card_type": "Google Review",
  "current_redirect_url": "https://g.page/r/YOUR_REVIEW_LINK",
  "category_id": "64f1a2b3c4d5e6f7a8b9c0d5",
  "business_data": {
    "business_name": "Coffee House",
    "logo": "https://cdn.example.com/logo.png",
    "description": "Best coffee in town",
    "phone": "+20100000000",
    "whatsapp": "https://wa.me/20100000000",
    "instagram": "https://instagram.com/coffeehouse",
    "facebook": "https://facebook.com/coffeehouse",
    "tiktok": "https://tiktok.com/@coffeehouse",
    "google_maps": "https://maps.google.com/?q=...",
    "website": "https://coffeehouse.com",
    "email": "hello@coffeehouse.com"
  }
}
```

| Field                  | Required | Validation                                          |
|------------------------|----------|-----------------------------------------------------|
| `card_code`            | ✅ Yes   | Format: `CARD-XXXX` (e.g. `CARD-0001`)              |
| `nfc_uid`              | ❌ No    | Format: `NFC-XXXXXX` (e.g. `NFC-7FJ2K9`)           |
| `qr_code`              | ❌ No    | Auto-generated if omitted                           |
| `card_type`            | ✅ Yes   | One of the 7 card type values (see below)           |
| `current_redirect_url` | ✅ Yes   | Must be a valid URL (http/https)                    |
| `category_id`          | ✅ Yes   | Valid MongoDB ObjectId of an existing category      |
| `business_data`        | ❌ No    | Object — see `business_data` fields table below     |

**Card Types:**

| Value           | Description                      |
|-----------------|----------------------------------|
| `Google Review` | Redirects to Google review page  |
| `Instagram`     | Redirects to Instagram profile   |
| `TikTok`        | Redirects to TikTok profile      |
| `InstaPay`      | Redirects to InstaPay            |
| `Google Maps`   | Redirects to Google Maps         |
| `WhatsApp`      | Redirects to WhatsApp            |
| `Social Page`   | Displays embedded social profile |

**`business_data` fields (all optional):**

| Field           | Type   | Validation    | Description               |
|-----------------|--------|---------------|---------------------------|
| `business_name` | String | Max 120 chars | Brand / business name     |
| `logo`          | String | Valid URL     | Logo image URL            |
| `description`   | String | Max 500 chars | Short description         |
| `phone`         | String | —             | Contact phone number      |
| `whatsapp`      | String | Valid URL     | WhatsApp link             |
| `instagram`     | String | Valid URL     | Instagram profile URL     |
| `facebook`      | String | Valid URL     | Facebook page URL         |
| `tiktok`        | String | Valid URL     | TikTok profile URL        |
| `google_maps`   | String | Valid URL     | Google Maps place URL     |
| `website`       | String | Valid URL     | Business website URL      |
| `email`         | String | Valid email   | Contact email address     |

**Success Response — `201 Created`:** Returns the full card object (see shape in `GET /api/cards`).

---

#### `GET /api/cards`

Get all cards with pagination, search, and filtering.

**Query Parameters:**

| Parameter     | Type   | Required | Description                                  |
|---------------|--------|----------|----------------------------------------------|
| `page`        | Number | No       | Page number (default: `1`)                   |
| `limit`       | Number | No       | Items per page (default: `10`, max: `100`)   |
| `search`      | String | No       | Search in `card_code`, `nfc_uid`, `qr_code`  |
| `status`      | String | No       | `active` or `inactive`                       |
| `card_type`   | String | No       | Filter by card type (exact match)            |
| `category_id` | String | No       | Filter by category MongoDB ObjectId          |

**Success Response — `200 OK`:**
```json
{
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
      "card_code": "CARD-0001",
      "nfc_uid": "NFC-7FJ2K9",
      "qr_code": "https://smart-card-qr-api.koyeb.app/r/CARD-0001",
      "card_type": "Social Page",
      "current_redirect_url": "https://yourapp.com/social/CARD-0001",
      "status": "active",
      "subscription_start_date": "2026-10-01T00:00:00.000Z",
      "subscription_end_date": "2027-10-01T00:00:00.000Z",
      "category_id": {
        "_id": "64f1a2b3c4d5e6f7a8b9c0d5",
        "name": "Restaurants",
        "description": "Food & beverage businesses",
        "icon": "https://cdn.example.com/icons/restaurant.png"
      },
      "business_data": {
        "business_name": "Coffee House",
        "logo": "https://cdn.example.com/logo.png",
        "phone": "+20100000000",
        "instagram": "https://instagram.com/coffeehouse"
      },
      "createdAt": "2026-10-01T00:00:00.000Z",
      "updatedAt": "2026-10-01T00:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

> `category_id` is returned as a **populated object** — not just the raw ObjectId.

---

#### `GET /api/cards/:id`

Get a single card by MongoDB `_id`. Returns `category_id` as a populated object.

**Error — `404 Not Found`:**
```json
{
  "statusCode": 404,
  "error": "NotFoundException",
  "message": "Card with id \"64f1a2b3c4d5e6f7a8b9c0d2\" not found"
}
```

---

#### `GET /api/cards/:id/history`

Returns the **full audit log** for a card — every snapshot recorded since creation, newest first.

- Works even **after the card is deleted** (history is never removed).
- Each entry contains the full card state at the moment the action occurred.

**Actions recorded:**

| Action    | When it's recorded                                            |
|-----------|---------------------------------------------------------------|
| `created` | Immediately after a new card is saved                        |
| `updated` | Before any change: update, toggle, redirect change, renew    |
| `deleted` | Before the card is permanently deleted                       |

**Success Response — `200 OK`:**
```json
[
  {
    "_id": "64f1a2b3c4d5e6f7a8b9c0e1",
    "card_id": "64f1a2b3c4d5e6f7a8b9c0d2",
    "action": "updated",
    "snapshot": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
      "card_code": "CARD-0001",
      "card_type": "Google Review",
      "current_redirect_url": "https://g.page/r/OLD_LINK",
      "status": "active",
      "business_data": null,
      "subscription_end_date": "2027-10-01T00:00:00.000Z"
    },
    "recorded_at": "2026-10-03T14:22:00.000Z"
  },
  {
    "_id": "64f1a2b3c4d5e6f7a8b9c0e0",
    "card_id": "64f1a2b3c4d5e6f7a8b9c0d2",
    "action": "created",
    "snapshot": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
      "card_code": "CARD-0001",
      "card_type": "Google Review",
      "current_redirect_url": "https://g.page/r/YOUR_REVIEW_LINK",
      "status": "active",
      "business_data": null,
      "subscription_end_date": "2027-10-01T00:00:00.000Z"
    },
    "recorded_at": "2026-10-01T10:00:00.000Z"
  }
]
```

> To **restore** a deleted or corrupted card, take the `snapshot` object from the last `created` or `updated` entry and re-create the card via `POST /api/cards`.

---

#### `GET /api/cards/:id/qr`

Download the QR code as a **PNG file** — ready for printing.

- **Response type:** `image/png` — 400×400 px, error correction Level H

**Response Headers:**
```
Content-Type: image/png
Content-Disposition: attachment; filename="qr-CARD-0001.png"
```

---

#### `PUT /api/cards/:id`

General update — all fields optional. A history snapshot of the **previous state** is saved automatically.

**Request Body:**
```json
{
  "nfc_uid": "NFC-NEWUID",
  "card_type": "Social Page",
  "current_redirect_url": "https://yourapp.com/social/CARD-0001",
  "status": "active",
  "category_id": "64f1a2b3c4d5e6f7a8b9c0d5",
  "business_data": {
    "business_name": "Updated Name",
    "instagram": "https://instagram.com/updated"
  }
}
```

**Success Response — `200 OK`:** Returns the updated card object.

---

#### `PUT /api/cards/:id/toggle`

Toggle status `active` ↔ `inactive`. No body needed. History snapshot saved automatically.

---

#### `PUT /api/cards/:id/redirect`

Change **only** `current_redirect_url`. History snapshot saved automatically.

**Request Body:**
```json
{ "redirect_url": "https://instagram.com/yournewpage" }
```

---

#### `POST /api/cards/:id/renew`

Extend subscription by **1 year**. History snapshot saved automatically.

- Still active → extends from `subscription_end_date`.
- Already expired → extends from today.
- Re-activates the card if it was inactive.

No body needed.

---

#### `DELETE /api/cards/:id`

🛡️ **نقل الكارت إلى سلة المهملات (Soft Delete)**  
يتطلب تأكيد بكلمة مرور الأدمن الحالي، ويمنع الحذف في حال كان الكارت مربوطاً بعميل.

**Request Body:**
```json
{
  "password": "admin_password"
}
```

**Success Response — `200 OK`:**
```json
{
  "message": "تم نقل الكارت \"CARD-0001\" إلى سلة المهملات بنجاح. يمكنك استرجاعه في أي وقت.",
  "card_id": "64f1a2b3c4d5e6f7a8b9c0d2"
}
```

---

#### `GET /api/cards/trash`

🗑️ **عرض جميع الكروت الموجودة في سلة المهملات**

**Success Response — `200 OK`:** Returns array of soft-deleted card objects sorted by `deleted_at` descending.

---

#### `POST /api/cards/:id/restore`

♻️ **استرجاع الكارت من سلة المهملات**

**Success Response — `200 OK`:**
```json
{
  "message": "تم استرجاع الكارت \"CARD-0001\" من سلة المهملات بنجاح!",
  "card": { /* full card object */ }
}
```

---

#### `DELETE /api/cards/:id/permanent` (أو `DELETE /api/cards/trash/:id`)

💥 **حذف كارت نهائياً من قاعدة البيانات (Permanent / Hard Delete)**  
يحذف سجل الكارت تماماً ولا يمكن استرجاعه، ويحرر كود الكارت والـ NFC UID.  
يتطلب تأكيد بكلمة مرور الأدمن الحالي، ويمنع الحذف إذا كان الكارت مربوطاً بعميل.

**Request Body:**
```json
{
  "password": "admin_password"
}
```

**Success Response — `200 OK`:**
```json
{
  "message": "تم حذف الكارت \"CARD-0001\" نهائياً من قاعدة البيانات وبشكل لا يمكن استرجاعه.",
  "card_id": "64f1a2b3c4d5e6f7a8b9c0d2",
  "card_code": "CARD-0001"
}
```

---

#### `DELETE /api/cards/trash/empty`

🧹 **تفريغ سلة المهملات بالكامل (حذف نهائي)**  
يحذف جميع الكروت الموجودة حالياً داخل سلة المهملات نهائياً من قاعدة البيانات دفعة واحدة.  
يتطلب تأكيد بكلمة مرور الأدمن الحالي.

**Request Body:**
```json
{
  "password": "admin_password"
}
```

**Success Response — `200 OK`:**
```json
{
  "message": "تم تفريغ سلة المهملات وحذف 5 كارت نهائياً من قاعدة البيانات.",
  "deleted_count": 5
}
```

---

### 2.3 Categories Endpoints

> All endpoints require: `Authorization: Bearer <access_token>`

---

#### `POST /api/categories`

**Request Body:**
```json
{
  "name": "Restaurants",
  "description": "Food & beverage businesses",
  "icon": "https://cdn.example.com/icons/restaurant.png",
  "is_active": true
}
```

| Field         | Required | Validation                    |
|---------------|----------|-------------------------------|
| `name`        | ✅ Yes   | String, max 100 chars, unique |
| `description` | ❌ No    | String, max 500 chars         |
| `icon`        | ❌ No    | Valid URL                     |
| `is_active`   | ❌ No    | Boolean (default: `true`)     |

**Success Response — `201 Created`:**
```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0d5",
  "name": "Restaurants",
  "description": "Food & beverage businesses",
  "icon": "https://cdn.example.com/icons/restaurant.png",
  "is_active": true,
  "createdAt": "2026-10-01T00:00:00.000Z",
  "updatedAt": "2026-10-01T00:00:00.000Z"
}
```

**Error — `409 Conflict`:**
```json
{
  "statusCode": 409,
  "message": "Category with name \"Restaurants\" already exists"
}
```

---

#### `GET /api/categories`

**Query Parameters:**

| Parameter   | Type   | Description                              |
|-------------|--------|------------------------------------------|
| `page`      | Number | Default: `1`                             |
| `limit`     | Number | Default: `10`, max: `100`               |
| `search`    | String | Case-insensitive search on `name`        |
| `is_active` | String | `"true"` or `"false"`                   |

**Success Response — `200 OK`:** Paginated list `{ data, total, page, limit, totalPages }`.

---

#### `GET /api/categories/:id`

Get a single category by MongoDB `_id`.

---

#### `PUT /api/categories/:id`

Update a category. All fields optional.

---

#### `DELETE /api/categories/:id`

**Success Response — `200 OK`:**
```json
{ "message": "Category \"Restaurants\" deleted successfully" }
```

---

### 2.4 Public Redirect Endpoint

---

#### `GET /r/:identifier`

The endpoint that NFC taps and QR code scans hit.

- **Auth required:** ❌ No
- `identifier` can be: `card_code`, `nfc_uid`, or `qr_code`

**Logic Flow:**
```
1. Find card by identifier
2. Not found                       → 404
3. status !== 'active'             → 403
4. now > subscription_end_date     → 403
5. Valid → log scan (fire & forget) → 302 redirect to current_redirect_url
```

**Error — `403 Forbidden`:**
```json
{ "message": "Card is inactive or subscription expired" }
```

**Error — `404 Not Found`:**
```json
{ "message": "Card not found" }
```

> The redirect is **not affected** by `business_data` or `category_id` — it always goes to `current_redirect_url`.

---

## 3. Request & Response Examples

### Social Page Workflow

```http
# 1. Create category
POST /api/categories
{ "name": "Restaurants" }

# 2. Create card
POST /api/cards
{
  "card_code": "CARD-0042",
  "card_type": "Social Page",
  "current_redirect_url": "https://yourapp.com/social/CARD-0042",
  "category_id": "<category_id>",
  "business_data": {
    "business_name": "Pizza Palace",
    "phone": "+20111000000",
    "instagram": "https://instagram.com/pizzapalace"
  }
}

# 3. Customer scans → 302 to social page → frontend reads GET /api/cards/:id

# 4. Update business info
PUT /api/cards/:id
{ "business_data": { "tiktok": "https://tiktok.com/@pizzapalace" } }

# 5. View history
GET /api/cards/:id/history
```

### Restore a Deleted Card

```http
# 1. Fetch history (works even after deletion)
GET /api/cards/<deleted_card_id>/history

# 2. Take snapshot from the last "deleted" entry
# 3. Re-create
POST /api/cards
{ ...snapshot fields... }
```

---

## 4. Error Handling

All errors follow a uniform structure:

```json
{
  "statusCode": 400,
  "error": "BadRequestException",
  "message": "...",
  "path": "/api/cards",
  "timestamp": "2026-10-01T10:00:00.000Z"
}
```

| Code | Meaning                                                       |
|------|---------------------------------------------------------------|
| 200  | Success                                                       |
| 201  | Created                                                       |
| 302  | Redirect                                                      |
| 400  | Validation failed                                             |
| 401  | Missing or invalid JWT                                        |
| 403  | Card inactive or subscription expired                         |
| 404  | Resource not found                                            |
| 409  | Duplicate value                                               |
| 429  | Rate limit exceeded                                           |
| 500  | Internal server error                                         |

---

## 5. Business Logic

### Card History (Audit Log / Backup)

Every mutating operation on a card automatically saves a full snapshot to the `card_history` collection:

```
POST /api/cards        → snapshot saved after creation   (action: "created")
PUT  /api/cards/:id    → snapshot saved before update    (action: "updated")
PUT  /api/cards/:id/toggle   → snapshot saved before     (action: "updated")
PUT  /api/cards/:id/redirect → snapshot saved before     (action: "updated")
POST /api/cards/:id/renew    → snapshot saved before     (action: "updated")
DELETE /api/cards/:id        → snapshot saved before     (action: "deleted")
```

- Snapshots are saved **fire-and-forget** — they never block or slow down the main operation.
- History is **never deleted**, even when the card is removed.
- Use `GET /api/cards/:id/history` to view or restore any previous state.

---

### Dynamic Redirect System

```
Physical NFC/QR Card  →  static URL  →  /r/CARD-0001
                                               │
                                         MongoDB lookup
                                               │
                                      current_redirect_url
                                               │
                                          302 Redirect
```

The admin can change `current_redirect_url` at any time without touching the physical card.

---

### Subscription Flow

```
Card Created  →  end_date = today + 1 year, status = active

Cron (nightly):  expired active cards → status = inactive

Renew:  end_date += 1 year, status = active
```

---

### Scan Logging

Every valid redirect creates a `ScanLog` entry (card_id, timestamp, ip_address, user_agent) — asynchronously, never delays the redirect.

---

## 6. Quick Reference

| Action                       | Method | URL                          | Auth |
|------------------------------|--------|------------------------------|------|
| Admin login                  | POST   | `/api/auth/login`            | ❌   |
| Get admin profile            | GET    | `/api/auth/me`               | ✅   |
| **Cards**                    |        |                              |      |
| Create card                  | POST   | `/api/cards`                 | ✅   |
| List all cards               | GET    | `/api/cards`                 | ✅   |
| Get one card                 | GET    | `/api/cards/:id`             | ✅   |
| Get card history (audit log) | GET    | `/api/cards/:id/history`     | ✅   |
| Download QR code (PNG)       | GET    | `/api/cards/:id/qr`          | ✅   |
| Update card                  | PUT    | `/api/cards/:id`             | ✅   |
| Toggle active/inactive       | PUT    | `/api/cards/:id/toggle`      | ✅   |
| Change redirect URL          | PUT    | `/api/cards/:id/redirect`    | ✅   |
| Renew subscription (+1 year) | POST   | `/api/cards/:id/renew`       | ✅   |
| Delete card                  | DELETE | `/api/cards/:id`             | ✅   |
| **Categories**               |        |                              |      |
| Create category              | POST   | `/api/categories`            | ✅   |
| List categories              | GET    | `/api/categories`            | ✅   |
| Get one category             | GET    | `/api/categories/:id`        | ✅   |
| Update category              | PUT    | `/api/categories/:id`        | ✅   |
| Delete category              | DELETE | `/api/categories/:id`        | ✅   |
| **Redirect**                 |        |                              |      |
| NFC/QR scan redirect         | GET    | `/r/:identifier`             | ❌   |

---

*Stack: NestJS · MongoDB Atlas · Mongoose · JWT · TypeScript · bcryptjs · node-cron*

---

## 7. Frontend Developer Prompt

> Copy this prompt and give it to any AI or frontend developer to build the dashboard correctly.

---

```
You are building the frontend dashboard for a Smart NFC/QR Card Management System.
The backend is already built with NestJS + MongoDB. Below is everything you need to
integrate correctly — follow it exactly.

════════════════════════════════════════════════════════
BASE URL
════════════════════════════════════════════════════════
https://smart-card-qr-api.koyeb.app

All API routes are prefixed with /api except the public redirect which is /r/:identifier.

════════════════════════════════════════════════════════
AUTHENTICATION
════════════════════════════════════════════════════════
- POST /api/auth/login  →  { username, password }
  Returns: { access_token, admin: { id, username } }

- Store the access_token in memory or localStorage.
- Send it on every protected request:
  Header: Authorization: Bearer <access_token>

- GET /api/auth/me  →  returns current admin object

Token expires in 7 days. Redirect to login on 401.

════════════════════════════════════════════════════════
DATA MODELS
════════════════════════════════════════════════════════

── Card ─────────────────────────────────────────────
{
  _id:                    string (MongoDB ObjectId)
  card_code:              string  — format CARD-0001
  nfc_uid:                string | null  — format NFC-XXXXXX
  qr_code:                string  — auto-generated URL
  card_type:              'Google Review' | 'Instagram' | 'TikTok' |
                          'InstaPay' | 'Google Maps' | 'WhatsApp' | 'Social Page'
  current_redirect_url:   string (URL)
  status:                 'active' | 'inactive'
  subscription_start_date: ISO date string
  subscription_end_date:   ISO date string
  category_id:            Category object (populated) — see Category model below
  business_data:          BusinessData object | null
  createdAt:              ISO date string
  updatedAt:              ISO date string
}

── BusinessData (embedded in Card) ──────────────────
{
  business_name:  string | null
  logo:           string | null  (URL)
  description:    string | null
  phone:          string | null
  whatsapp:       string | null  (full URL — wa.me/...)
  instagram:      string | null  (full URL)
  facebook:       string | null  (full URL)
  tiktok:         string | null  (full URL)
  google_maps:    string | null  (full URL)
  website:        string | null  (full URL)
  email:          string | null
}

── Category ─────────────────────────────────────────
{
  _id:         string
  name:        string
  description: string | null
  icon:        string | null  (URL)
  is_active:   boolean
  createdAt:   ISO date string
  updatedAt:   ISO date string
}

── CardHistory ──────────────────────────────────────
{
  _id:         string
  card_id:     string
  action:      'created' | 'updated' | 'deleted'
  snapshot:    Card object (full state at time of action)
  recorded_at: ISO date string
}

════════════════════════════════════════════════════════
CARDS API
════════════════════════════════════════════════════════

LIST CARDS
  GET /api/cards
  Query params (all optional):
    page        number   default 1
    limit       number   default 10, max 100
    search      string   searches card_code, nfc_uid, qr_code
    status      'active' | 'inactive'
    card_type   one of the 7 card type values
    category_id MongoDB ObjectId string
  Response: { data: Card[], total, page, limit, totalPages }
  Note: category_id in each Card is returned as a populated object, not a raw ID.

GET ONE CARD
  GET /api/cards/:id
  Response: Card object with populated category_id

GET CARD HISTORY (audit log / backup)
  GET /api/cards/:id/history
  Response: CardHistory[]  — newest first
  Works even after the card is deleted.
  Use the snapshot field to restore a deleted card.

CREATE CARD
  POST /api/cards
  Body:
    card_code             string   REQUIRED  format: CARD-XXXX (CARD-0001)
    card_type             string   REQUIRED  one of the 7 values
    current_redirect_url  string   REQUIRED  valid http/https URL
    category_id           string   REQUIRED  valid MongoDB ObjectId
    nfc_uid               string   optional  format: NFC-XXXXXX (NFC-7FJ2K9)
    qr_code               string   optional  auto-generated if omitted
    business_data         object   optional  all sub-fields optional
  Response 201: Created Card object

UPDATE CARD
  PUT /api/cards/:id
  Body: same as create but all fields optional (except card_code cannot be changed)
  Automatically saves a history snapshot before updating.
  Response 200: Updated Card object

TOGGLE STATUS
  PUT /api/cards/:id/toggle
  No body. Flips active ↔ inactive.
  Response 200: Updated Card object

CHANGE REDIRECT URL
  PUT /api/cards/:id/redirect
  Body: { redirect_url: string }  — must be a valid URL
  Response 200: Updated Card object

RENEW SUBSCRIPTION
  POST /api/cards/:id/renew
  No body. Extends subscription_end_date by 1 year and sets status to active.
  Response 200: Updated Card object

DELETE CARD
  DELETE /api/cards/:id
  Saves a full snapshot to history before deleting (data is never truly lost).
  Response 200: { message: string }

DOWNLOAD QR CODE (PNG)
  GET /api/cards/:id/qr
  Response: image/png binary — save as file or use as <img src> via blob URL
  Filename: qr-CARD-0001.png

════════════════════════════════════════════════════════
CATEGORIES API
════════════════════════════════════════════════════════

LIST CATEGORIES
  GET /api/categories
  Query params (all optional):
    page        number   default 1
    limit       number   default 10, max 100
    search      string   searches name
    is_active   'true' | 'false'
  Response: { data: Category[], total, page, limit, totalPages }

GET ONE CATEGORY
  GET /api/categories/:id
  Response: Category object

CREATE CATEGORY
  POST /api/categories
  Body:
    name         string   REQUIRED  max 100 chars, must be unique
    description  string   optional  max 500 chars
    icon         string   optional  valid URL
    is_active    boolean  optional  default true
  Response 201: Created Category object

UPDATE CATEGORY
  PUT /api/categories/:id
  Body: same as create, all fields optional
  Response 200: Updated Category object

DELETE CATEGORY
  DELETE /api/categories/:id
  Response 200: { message: string }

════════════════════════════════════════════════════════
PUBLIC REDIRECT (NFC / QR)
════════════════════════════════════════════════════════

  GET /r/:identifier   (NO auth required)
  identifier = card_code OR nfc_uid OR qr_code value
  Returns 302 redirect to current_redirect_url if card is active and subscription valid.
  Returns JSON error on 403 (inactive/expired) or 404 (not found).

  This endpoint is what gets programmed into the NFC chip and printed in the QR code.
  The frontend Social Page reads GET /api/cards/:id to display business_data.

════════════════════════════════════════════════════════
VALIDATION RULES (use in frontend forms)
════════════════════════════════════════════════════════

card_code           required, regex: /^CARD-\d{4,}$/
nfc_uid             optional, regex: /^NFC-[A-Z0-9]{6,}$/
card_type           required, one of 7 enum values
current_redirect_url required, valid URL
category_id         required, 24-char hex string (MongoDB ObjectId)
business_data.business_name  optional, max 120 chars
business_data.logo           optional, valid URL
business_data.description    optional, max 500 chars
business_data.phone          optional, string
business_data.whatsapp       optional, valid URL
business_data.instagram      optional, valid URL
business_data.facebook       optional, valid URL
business_data.tiktok         optional, valid URL
business_data.google_maps    optional, valid URL
business_data.website        optional, valid URL
business_data.email          optional, valid email format
category.name       required, max 100 chars, unique
category.icon       optional, valid URL

════════════════════════════════════════════════════════
ERROR HANDLING
════════════════════════════════════════════════════════

All errors return:
{
  statusCode: number
  error:      string
  message:    string | string[]  (array on validation errors)
  path:       string
  timestamp:  ISO date string
}

Handle these cases:
  401  → clear token, redirect to login
  403  → show "Card inactive or subscription expired"
  404  → show "Not found" message
  409  → show conflict message (e.g. duplicate card_code or category name)
  400  → show validation errors from message array
  500  → show generic error

════════════════════════════════════════════════════════
HISTORY / RESTORE FLOW
════════════════════════════════════════════════════════

To show a card's audit trail:
  GET /api/cards/:id/history
  Returns array of { action, snapshot, recorded_at } newest first.

To restore a deleted card:
  1. GET /api/cards/:id/history
  2. Find the entry with action === 'deleted'
  3. Use snapshot fields to pre-fill a create form
  4. POST /api/cards with that data

════════════════════════════════════════════════════════
PAGINATION PATTERN
════════════════════════════════════════════════════════

All list endpoints return:
{
  data:        array of items
  total:       number  — total matching documents
  page:        number  — current page
  limit:       number  — items per page
  totalPages:  number  — Math.ceil(total / limit)
}

Use ?page=1&limit=10 and render a pagination control from totalPages.
```

---

## 3. Customer Email Messaging (إرسال الإيميلات للعملاء)

### 3.1 Send Email to a Specific Customer
* **Path:** `POST /api/customers/:id/send-email`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Request Body:**
```json
{
  "subject": "تنبيه: اقتراب موعد انتهاء باقة كروت الـ NFC",
  "message": "عزيزنا العميل، نود إحاطتك علماً بأن اشتراك بطاقتك ينتهي خلال 3 أيام.\nيرجى تجديد الاشتراك لضمان استمرار عمل الروابط دون انقطاع.",
  "badge": "تنبيه اشتراك",
  "button_text": "تجديد الباقة الآن",
  "button_url": "https://k2rty.vercel.app/renew"
}
```
* **Success (200 OK):**
```json
{
  "success": true,
  "message": "تم إرسال البريد الإلكتروني إلى العميل \"أحمد علي\" بنجاح.",
  "to": "ahmed@example.com"
}
```
* **Customer has no email (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "العميل \"أحمد علي\" ليس لديه بريد إلكتروني مسجل. يرجى إضافة بريده أولاً."
}
```

### 3.2 Broadcast Email to All or Selected Customers
* **Path:** `POST /api/customers/broadcast-email`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Request Body:**
```json
{
  "subject": "🔥 خصم خاص 30% على ترقية باقات كروت NFC",
  "message": "يسعدنا إعلامك ببدء عرض التخفيضات لهذا الشهر!\nاحصل على ترقية اشتراكك السنوي بخصم حصري ومميزات إضافية لفترة محدودة.",
  "badge": "عرض خاص لفترة محدودة",
  "button_text": "استعراض العرض والتجديد",
  "button_url": "https://k2rty.vercel.app/offers",
  "customer_ids": ["68e...", "68f..."]
}
```
* **Success (200 OK):**
```json
{
  "success": true,
  "total_targeted": 15,
  "sent_count": 15,
  "failed_count": 0,
  "message": "تم إرسال البريد بنجاح إلى 15 عميل."
}
```

---

## 4. نظام تقسيم العملاء على الشركاء (Partners / Account Managers)

تم دعم ميزة تحديد وفلترة الشريك المسؤول عن كل عميل وإحصائيات كل شريك:

### 4.1 جلب قائمة أسماء الشركاء (للـ Dropdown)
يُستخدم لملء قائمة الاختيار (Select Menu) في الفلتر وعند إضافة عميل جديد:
* **المسار:** `GET /api/customers/partners/list`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Response (200 OK):**
```json
[
  "عام",
  "عبدالله",
  "أحمد",
  "شريك 3"
]
```

### 4.2 فلترة العملاء حسب الشريك
في جدول العملاء، عند اختيار شريك من القائمة المنسدلة:
* **المسار:** `GET /api/customers?partner=عبدالله&page=1&limit=10`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Response (200 OK):** يعيد فقط العملاء التابعين لـ "عبدالله" مع حساب عدد كروتهم وPagination.
*(إذا لم يتم إرسال `partner`، يعيد جميع العملاء كالمعتاد)*.

### 4.3 إحصائيات ومقارنة الشركاء (Dashboard Cards)
لعرض بطاقات إحصائية أو جدول مقارنة في لوحة التحكم:
* **المسار:** `GET /api/customers/partners/stats`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Response (200 OK):**
```json
{
  "total_partners": 3,
  "total_customers": 45,
  "total_cards": 98,
  "partners": ["عام", "عبدالله", "أحمد"],
  "stats": [
    {
      "partner": "عبدالله",
      "customers_count": 25,
      "cards_count": 55,
      "active_cards": 50,
      "expired_cards": 5
    },
    {
      "partner": "أحمد",
      "customers_count": 18,
      "cards_count": 40,
      "active_cards": 38,
      "expired_cards": 2
    },
    {
      "partner": "عام",
      "customers_count": 2,
      "cards_count": 3,
      "active_cards": 3,
      "expired_cards": 0
    }
  ]
}
```

### 4.4 إضافة عميل جديد مع تحديد الشريك
* **المسار:** `POST /api/customers`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Request Body (JSON):**
```json
{
  "name": "شركة الأمل",
  "phone": "01012345678",
  "email": "info@alamal.com",
  "city": "القاهرة",
  "partner": "عبدالله",
  "notes": "اتفاق سنوي"
}
```
*(حقل `partner` اختياري، افتراضياً: `"عام"`)*.

### 4.5 نقل / تغيير الشريك المسؤول عن عميل
زر سريع بجوار العميل لنقل إدارته لشريك آخر:
* **المسار:** `PUT /api/customers/:id/partner`
* **Headers:** `Authorization: Bearer <TOKEN>`
* **Request Body (JSON):**
```json
{
  "partner": "أحمد"
}
```
* **Response (200 OK):**
```json
{
  "message": "تم تعيين العميل للشريك \"أحمد\" بنجاح.",
  "customer": {
    "id": "...",
    "name": "شركة الأمل",
    "partner": "أحمد"
  }
}
```


