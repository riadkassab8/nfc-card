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

| Type      | Routes                                                          | Requires Token? |
|-----------|------------------------------------------------------------------|-----------------|
| Public    | `POST /api/auth/login`                                          | ❌ No           |
| Public    | `GET /r/:identifier`                                            | ❌ No           |
| Public    | `GET /api/lookup/group/:group`                                  | ❌ No           |
| Protected | All `GET/POST/PUT/DELETE /api/cards/*`                          | ✅ Yes          |
| Protected | All `GET/POST/PUT/DELETE /api/categories/*`                     | ✅ Yes          |
| Protected | All `GET/POST/PUT/DELETE /api/lookup/*` (except group endpoint) | ✅ Yes          |
| Protected | `GET /api/auth/me`                                              | ✅ Yes          |

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

Create a new card. `subscription_end_date` is automatically set to **1 year from today**.
`qr_code` is **auto-generated** as a redirect URL pointing to this card — no need to pass it manually.

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

| Field                   | Required | Validation                                          |
|-------------------------|----------|-----------------------------------------------------|
| `card_code`             | ✅ Yes   | Format: `CARD-XXXX` (e.g. `CARD-0001`)              |
| `nfc_uid`               | ❌ No    | Format: `NFC-XXXXXX` (e.g. `NFC-7FJ2K9`)           |
| `qr_code`               | ❌ No    | Auto-generated if omitted — override only if needed |
| `card_type`             | ✅ Yes   | One of the 7 card type values (see below)           |
| `current_redirect_url`  | ✅ Yes   | Must be a valid URL (http/https)                    |
| `category_id`           | ✅ Yes   | Valid MongoDB ObjectId of an existing category      |
| `business_data`         | ❌ No    | Object — see `business_data` fields table below     |

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

| Field           | Type   | Validation              | Description                      |
|-----------------|--------|-------------------------|----------------------------------|
| `business_name` | String | Max 120 chars           | Brand / business name            |
| `logo`          | String | Valid URL               | Logo image URL                   |
| `description`   | String | Max 500 chars           | Short description                |
| `phone`         | String | —                       | Contact phone number             |
| `whatsapp`      | String | Valid URL               | WhatsApp link (wa.me/...)        |
| `instagram`     | String | Valid URL               | Instagram profile URL            |
| `facebook`      | String | Valid URL               | Facebook page URL                |
| `tiktok`        | String | Valid URL               | TikTok profile URL               |
| `google_maps`   | String | Valid URL               | Google Maps place URL            |
| `website`       | String | Valid URL               | Business website URL             |
| `email`         | String | Valid email             | Contact email address            |

**Auto-generated `qr_code` value:**
```
https://smart-card-qr-api.koyeb.app/r/CARD-0001
```

**Success Response — `201 Created`:**
```json
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
  },
  "createdAt": "2026-10-01T00:00:00.000Z",
  "updatedAt": "2026-10-01T00:00:00.000Z"
}
```

---

#### `GET /api/cards`

Get all cards with pagination, search, and filtering.

**Query Parameters:**

| Parameter     | Type   | Required | Description                                       |
|---------------|--------|----------|---------------------------------------------------|
| `page`        | Number | No       | Page number (default: `1`)                        |
| `limit`       | Number | No       | Items per page (default: `10`, max: `100`)        |
| `search`      | String | No       | Search in `card_code`, `nfc_uid`, `qr_code`       |
| `status`      | String | No       | Filter by status: `active` or `inactive`          |
| `card_type`   | String | No       | Filter by card type (exact match)                 |
| `category_id` | String | No       | Filter by category MongoDB ObjectId               |

**Example Request:**
```
GET /api/cards?page=1&limit=10&status=active&card_type=Social+Page&category_id=64f1a2b3c4d5e6f7a8b9c0d5
```

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

> `category_id` is returned as a **populated object** (name, description, icon) — not just the raw ObjectId.

---

#### `GET /api/cards/:id`

Get a single card by its MongoDB `_id`. Returns `category_id` as a populated object.

**Success Response — `200 OK`:** Same shape as the card object above (full `business_data` + populated `category_id`).

**Error Response — `404 Not Found`:**
```json
{
  "statusCode": 404,
  "error": "NotFoundException",
  "message": "Card with id \"64f1a2b3c4d5e6f7a8b9c0d2\" not found",
  "path": "/api/cards/64f1a2b3c4d5e6f7a8b9c0d2",
  "timestamp": "2026-10-01T10:00:00.000Z"
}
```

---

#### `GET /api/cards/:id/qr`

Download the QR code image for a card as a **PNG file** — ready for printing on medals or cards.

- **Auth required:** ✅ Yes (Bearer token)
- **Response type:** `image/png`
- **Image size:** 400×400 px
- **Error correction:** Level H (High) — best for physical printing

**Success Response — `200 OK`:**
- Returns a PNG file download: `qr-CARD-0001.png`

**Response Headers:**
```
Content-Type: image/png
Content-Disposition: attachment; filename="qr-CARD-0001.png"
```

**Download via curl:**
```bash
curl -H "Authorization: Bearer <token>" \
  https://smart-card-qr-api.koyeb.app/api/cards/64f1a2b3c4d5e6f7a8b9c0d2/qr \
  --output qr-CARD-0001.png
```

---

#### `PUT /api/cards/:id`

Update a card's fields (general update). All fields optional.

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

Toggle the card status between `active` ↔ `inactive`. No request body needed.

---

#### `PUT /api/cards/:id/redirect`

Change **only** the `current_redirect_url` of a card.

**Request Body:**
```json
{
  "redirect_url": "https://instagram.com/yournewpage"
}
```

**Success Response — `200 OK`:** Returns the updated card object.

---

#### `POST /api/cards/:id/renew`

Extend the card's subscription by **1 year**.

- If subscription still active → extends from `subscription_end_date`.
- If already expired → extends from today.
- Re-activates the card if it was `inactive` due to expiry.

No request body needed.

---

#### `DELETE /api/cards/:id`

Permanently delete a card.

**Success Response — `200 OK`:**
```json
{
  "message": "Card \"CARD-0001\" deleted successfully"
}
```

---

### 2.3 Categories Endpoints

> All endpoints require: `Authorization: Bearer <access_token>`

Categories allow organizing cards into logical groups (e.g. Restaurants, Retail, Services).

---

#### `POST /api/categories`

Create a new category.

**Request Body:**
```json
{
  "name": "Restaurants",
  "description": "Food & beverage businesses",
  "icon": "https://cdn.example.com/icons/restaurant.png",
  "is_active": true
}
```

| Field         | Required | Validation                       |
|---------------|----------|----------------------------------|
| `name`        | ✅ Yes   | String, max 100 chars, unique    |
| `description` | ❌ No    | String, max 500 chars            |
| `icon`        | ❌ No    | Valid URL                        |
| `is_active`   | ❌ No    | Boolean (default: `true`)        |

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

**Error — `409 Conflict`** (name already exists):
```json
{
  "statusCode": 409,
  "error": "ConflictException",
  "message": "Category with name \"Restaurants\" already exists"
}
```

---

#### `GET /api/categories`

Get all categories with pagination and filtering.

**Query Parameters:**

| Parameter   | Type   | Required | Description                                          |
|-------------|--------|----------|------------------------------------------------------|
| `page`      | Number | No       | Page number (default: `1`)                           |
| `limit`     | Number | No       | Items per page (default: `10`, max: `100`)           |
| `search`    | String | No       | Case-insensitive search on `name`                    |
| `is_active` | String | No       | `"true"` or `"false"`                                |

**Success Response — `200 OK`:**
```json
{
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d5",
      "name": "Restaurants",
      "description": "Food & beverage businesses",
      "icon": "https://cdn.example.com/icons/restaurant.png",
      "is_active": true,
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

---

#### `GET /api/categories/:id`

Get a single category by MongoDB `_id`.

---

#### `PUT /api/categories/:id`

Update a category. All fields optional.

**Request Body:**
```json
{
  "name": "Food & Beverage",
  "is_active": false
}
```

**Success Response — `200 OK`:** Returns the updated category object.

---

#### `DELETE /api/categories/:id`

Delete a category permanently.

**Success Response — `200 OK`:**
```json
{
  "message": "Category \"Restaurants\" deleted successfully"
}
```

---

### 2.4 Lookup Endpoints

The Lookup collection is **auto-populated** whenever a card is created — no manual intervention needed. Every unique `card_type` used in a card is automatically upserted into the lookup under the group `card_type`.

Admins can also manage entries manually via the CRUD endpoints below.

---

#### `POST /api/lookup`

> **Auth required:** ✅ Yes — manual create for admin use

**Request Body:**
```json
{
  "group": "card_type",
  "key": "Google Review",
  "label": "Google Review",
  "meta": { "color": "#4285F4", "icon": "google" },
  "order": 1,
  "is_active": true
}
```

| Field       | Required | Validation                              |
|-------------|----------|-----------------------------------------|
| `group`     | ✅ Yes   | String, max 60 chars                    |
| `key`       | ✅ Yes   | String, max 120 chars — unique in group |
| `label`     | ✅ Yes   | String, max 120 chars                   |
| `meta`      | ❌ No    | Any JSON object                         |
| `order`     | ❌ No    | Number ≥ 0 (default: `0`)              |
| `is_active` | ❌ No    | Boolean (default: `true`)              |

**Success Response — `201 Created`:**
```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0d9",
  "group": "card_type",
  "key": "Google Review",
  "label": "Google Review",
  "meta": null,
  "order": 0,
  "is_active": true,
  "createdAt": "2026-10-01T00:00:00.000Z",
  "updatedAt": "2026-10-01T00:00:00.000Z"
}
```

**Error — `409 Conflict`:**
```json
{
  "statusCode": 409,
  "error": "ConflictException",
  "message": "Lookup entry with group \"card_type\" and key \"Google Review\" already exists"
}
```

---

#### `GET /api/lookup`

> **Auth required:** ✅ Yes

**Query Parameters:**

| Parameter   | Type   | Required | Description                                  |
|-------------|--------|----------|----------------------------------------------|
| `page`      | Number | No       | Page number (default: `1`)                   |
| `limit`     | Number | No       | Items per page (default: `20`, max: `100`)   |
| `group`     | String | No       | Filter by group — e.g. `card_type`           |
| `is_active` | String | No       | `"true"` or `"false"`                        |
| `search`    | String | No       | Case-insensitive search on `key` and `label` |

**Success Response — `200 OK`:**
```json
{
  "data": [ ... ],
  "total": 7,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

#### `GET /api/lookup/group/:group`

> **Auth required:** ❌ No — public endpoint used by frontend dropdowns

Returns all **active** entries for a group, sorted by `order` then `label`.

**Example:**
```
GET /api/lookup/group/card_type
```

**Success Response — `200 OK`:**
```json
[
  { "_id": "...", "group": "card_type", "key": "Google Review", "label": "Google Review", "order": 0 },
  { "_id": "...", "group": "card_type", "key": "Instagram",     "label": "Instagram",     "order": 0 },
  { "_id": "...", "group": "card_type", "key": "Social Page",   "label": "Social Page",   "order": 0 }
]
```

> Entries are added here **automatically** the first time a card with that `card_type` is created.

---

#### `GET /api/lookup/:id`

> **Auth required:** ✅ Yes

Get a single lookup entry by MongoDB `_id`.

---

#### `PUT /api/lookup/:id`

> **Auth required:** ✅ Yes

Update `label`, `meta`, `order`, or `is_active`. The `group` and `key` fields cannot be changed.

**Request Body (all optional):**
```json
{
  "label": "Google Reviews",
  "order": 1,
  "is_active": false
}
```

**Success Response — `200 OK`:** Returns the updated entry.

---

#### `DELETE /api/lookup/:id`

> **Auth required:** ✅ Yes

**Success Response — `200 OK`:**
```json
{
  "message": "Lookup entry \"card_type.Google Review\" deleted successfully"
}
```

---

### 2.5 Public Redirect Endpoint

---

#### `GET /r/:identifier`

The endpoint that NFC taps and QR code scans hit.

- **Auth required:** ❌ No
- The `identifier` can be any of: `card_code`, `nfc_uid`, or `qr_code`

**Example URLs:**
```
https://smart-card-qr-api.koyeb.app/r/CARD-0001
https://smart-card-qr-api.koyeb.app/r/NFC-7FJ2K9
https://smart-card-qr-api.koyeb.app/r/QR-0001
```

**Logic Flow:**

```
1. Find card where card_code OR nfc_uid OR qr_code === :identifier
2. If NOT found                          → 404 JSON error
3. If card.status !== 'active'           → 403 JSON error
4. If current date > subscription_end_date → 403 JSON error
5. If valid → create ScanLog (fire & forget)
           → HTTP 302 redirect to card.current_redirect_url
```

**Success:** `302 Redirect` → Browser follows redirect to final URL

**Error Response — `403 Forbidden`:**
```json
{ "message": "Card is inactive or subscription expired" }
```

**Error Response — `404 Not Found`:**
```json
{ "message": "Card not found" }
```

> ⚠️ The redirect logic is **not affected** by `business_data` or `category_id`. Those fields are only used by the Social Page frontend to display the profile.

---

## 3. Request & Response Examples

### Full Social Page Workflow

#### Step 1 — Create a Category
```http
POST /api/categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Restaurants",
  "icon": "https://cdn.example.com/icons/restaurant.png"
}
```

#### Step 2 — Create a Social Page Card
```http
POST /api/cards
Authorization: Bearer <token>
Content-Type: application/json

{
  "card_code": "CARD-0042",
  "card_type": "Social Page",
  "current_redirect_url": "https://yourapp.com/social/CARD-0042",
  "category_id": "64f1a2b3c4d5e6f7a8b9c0d5",
  "business_data": {
    "business_name": "Pizza Palace",
    "logo": "https://cdn.example.com/pizza-logo.png",
    "phone": "+20111000000",
    "whatsapp": "https://wa.me/20111000000",
    "instagram": "https://instagram.com/pizzapalace",
    "google_maps": "https://maps.google.com/?q=Pizza+Palace"
  }
}
```

#### Step 3 — Customer Scans the Card
```
GET https://smart-card-qr-api.koyeb.app/r/CARD-0042
→ 302 Redirect → https://yourapp.com/social/CARD-0042
```
The Social Page frontend then calls `GET /api/cards/:id` to display the `business_data`.

#### Step 4 — Update Business Info
```http
PUT /api/cards/64f1a2b3c4d5e6f7a8b9c0d2
Authorization: Bearer <token>
Content-Type: application/json

{
  "business_data": {
    "instagram": "https://instagram.com/pizzapalace_new",
    "tiktok": "https://tiktok.com/@pizzapalace"
  }
}
```

### Standard QR/NFC Workflow

#### Step 1 — Create a Card
```http
POST /api/cards
Authorization: Bearer <token>

{
  "card_code": "CARD-0001",
  "nfc_uid": "NFC-7FJ2K9",
  "card_type": "Google Review",
  "current_redirect_url": "https://g.page/r/CbGoogle123"
}
```

#### Step 2 — Download QR Image
```bash
curl -H "Authorization: Bearer <token>" \
  https://smart-card-qr-api.koyeb.app/api/cards/<id>/qr \
  --output qr-CARD-0001.png
```

#### Step 3 — Change Redirect Without Reprinting
```http
PUT /api/cards/<id>/redirect
Content-Type: application/json

{ "redirect_url": "https://instagram.com/newbusiness" }
```

#### Step 4 — Renew Subscription
```http
POST /api/cards/<id>/renew
Authorization: Bearer <token>
```

---

## 4. Error Handling

All errors follow a **uniform JSON structure**:

```json
{
  "statusCode": 400,
  "error": "BadRequestException",
  "message": "Description of what went wrong",
  "path": "/api/cards",
  "timestamp": "2026-10-01T10:00:00.000Z"
}
```

### Common HTTP Status Codes

| Code | Meaning                                                       |
|------|---------------------------------------------------------------|
| 200  | Success                                                       |
| 201  | Created successfully                                          |
| 302  | Redirect (public redirect endpoint)                           |
| 400  | Bad Request — validation failed (check `message` for details) |
| 401  | Unauthorized — missing or invalid JWT token                   |
| 403  | Forbidden — card inactive or subscription expired             |
| 404  | Not Found — resource does not exist                           |
| 409  | Conflict — duplicate value (card_code, category name, etc.)  |
| 429  | Too Many Requests — rate limit exceeded (100 req / 15 min)   |
| 500  | Internal Server Error                                         |

### Validation Error Example

```json
{
  "statusCode": 400,
  "error": "BadRequestException",
  "message": [
    "card_code must follow the format CARD-0001",
    "card_type must be one of: Google Review, Instagram, TikTok, InstaPay, Google Maps, WhatsApp, Social Page",
    "current_redirect_url must be a valid URL",
    "business_data.logo must be a valid URL",
    "category_id must be a valid MongoDB ObjectId"
  ],
  "path": "/api/cards",
  "timestamp": "2026-10-01T10:00:00.000Z"
}
```

---

## 5. Business Logic

### Dynamic Redirect System

```
Physical NFC/QR Card
        │
        │  stores static URL
        ▼
https://yourdomain.com/r/CARD-0001
        │
        │  backend lookup
        ▼
 Card document in MongoDB
  { current_redirect_url: "https://yourapp.com/social/CARD-0001" }
        │
        │  302 redirect
        ▼
   Social Page (or any destination)
   → Frontend reads GET /api/cards/:id
   → Displays business_data fields
```

The admin can change `current_redirect_url` at **any time** without touching the physical card.

---

### Subscription Flow

```
Card Created
    │
    ├── subscription_start_date = today
    ├── subscription_end_date   = today + 1 year
    └── status = "active"

Every night at 00:00 (Cron Job):
    └── Find cards where status = "active"
                        AND subscription_end_date < now
         → Set status = "inactive"

Admin renews card:
    └── subscription_end_date += 1 year
        status = "active"
```

---

### Scan Logging

Every time a valid card is redirected, a `ScanLog` entry is created:
- `card_id` — which card was scanned
- `timestamp` — exact date and time
- `ip_address` — IP of the scanning device
- `user_agent` — browser/device info

Done **asynchronously** (fire-and-forget) — never delays the redirect.

---

### business_data & Social Page

`business_data` is an **optional embedded sub-document** on every card. It is designed for the `Social Page` card type where the QR/NFC redirect goes to a frontend page that reads and displays the profile.

- The redirect endpoint (`GET /r/:identifier`) is **not affected** by `business_data` — it always redirects to `current_redirect_url`.
- The Social Page frontend fetches `GET /api/cards/:id` and reads `business_data` directly from the response.
- You can store a partial `business_data` — only fill the fields you need.

---

## 6. Quick Reference

| Action                          | Method | URL                              | Auth |
|---------------------------------|--------|----------------------------------|------|
| Admin login                     | POST   | `/api/auth/login`                | ❌   |
| Get admin profile               | GET    | `/api/auth/me`                   | ✅   |
| **Cards**                       |        |                                  |      |
| Create card                     | POST   | `/api/cards`                     | ✅   |
| List all cards                  | GET    | `/api/cards`                     | ✅   |
| Get one card                    | GET    | `/api/cards/:id`                 | ✅   |
| Download QR code (PNG)          | GET    | `/api/cards/:id/qr`              | ✅   |
| Update card                     | PUT    | `/api/cards/:id`                 | ✅   |
| Toggle active/inactive          | PUT    | `/api/cards/:id/toggle`          | ✅   |
| Change redirect URL             | PUT    | `/api/cards/:id/redirect`        | ✅   |
| Renew subscription (+1 year)    | POST   | `/api/cards/:id/renew`           | ✅   |
| Delete card                     | DELETE | `/api/cards/:id`                 | ✅   |
| **Categories**                  |        |                                  |      |
| Create category                 | POST   | `/api/categories`                | ✅   |
| List categories                 | GET    | `/api/categories`                | ✅   |
| Get one category                | GET    | `/api/categories/:id`            | ✅   |
| Update category                 | PUT    | `/api/categories/:id`            | ✅   |
| Delete category                 | DELETE | `/api/categories/:id`            | ✅   |
| **Lookup** (auto-populated)     |        |                                  |      |
| Create lookup entry             | POST   | `/api/lookup`                    | ✅   |
| List lookup entries             | GET    | `/api/lookup`                    | ✅   |
| Get entries by group (public)   | GET    | `/api/lookup/group/:group`       | ❌   |
| Get one lookup entry            | GET    | `/api/lookup/:id`                | ✅   |
| Update lookup entry             | PUT    | `/api/lookup/:id`                | ✅   |
| Delete lookup entry             | DELETE | `/api/lookup/:id`                | ✅   |
| **Redirect**                    |        |                                  |      |
| NFC/QR scan redirect            | GET    | `/r/:identifier`                 | ❌   |

---

*Stack: NestJS · MongoDB Atlas · Mongoose · JWT · TypeScript · bcryptjs · node-cron*
