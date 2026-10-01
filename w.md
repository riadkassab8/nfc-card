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

| Type      | Routes                                        | Requires Token? |
|-----------|-----------------------------------------------|-----------------|
| Public    | `POST /api/auth/login`                        | ❌ No           |
| Public    | `GET /r/:identifier`                          | ❌ No           |
| Protected | All `GET/POST/PUT/DELETE /api/cards/*`        | ✅ Yes          |
| Protected | `GET /api/auth/me`                            | ✅ Yes          |

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
  "password": "كلمني اديك البساورد 😂 "
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

**Request Headers:**
```
Authorization: Bearer <access_token>
```

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
  "current_redirect_url": "https://g.page/r/YOUR_REVIEW_LINK"
}
```

| Field                   | Required | Validation                                          |
|-------------------------|----------|-----------------------------------------------------|
| `card_code`             | ✅ Yes   | Format: `CARD-XXXX` (e.g. `CARD-0001`)              |
| `nfc_uid`               | ❌ No    | Format: `NFC-XXXXXX` (e.g. `NFC-7FJ2K9`)            |
| `qr_code`               | ❌ No    | Auto-generated if omitted — override only if needed  |
| `card_type`             | ✅ Yes   | One of the 6 card type values                       |
| `current_redirect_url`  | ✅ Yes   | Must be a valid URL (http/https)                    |

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
  "card_type": "Google Review",
  "current_redirect_url": "https://g.page/r/YOUR_REVIEW_LINK",
  "status": "active",
  "subscription_start_date": "2026-10-01T00:00:00.000Z",
  "subscription_end_date": "2027-10-01T00:00:00.000Z",
  "createdAt": "2026-10-01T00:00:00.000Z",
  "updatedAt": "2026-10-01T00:00:00.000Z"
}
```

---

#### `GET /api/cards`

Get all cards with pagination, search, and filtering.

**Query Parameters:**

| Parameter   | Type   | Required | Description                                      |
|-------------|--------|----------|--------------------------------------------------|
| `page`      | Number | No       | Page number (default: `1`)                       |
| `limit`     | Number | No       | Items per page (default: `10`, max: `100`)       |
| `search`    | String | No       | Search in `card_code`, `nfc_uid`, `qr_code`      |
| `status`    | String | No       | Filter by status: `active` or `inactive`         |
| `card_type` | String | No       | Filter by card type (exact match)                |

**Example Request:**
```
GET /api/cards?page=1&limit=10&status=active&search=CARD-0
```

**Success Response — `200 OK`:**
```json
{
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
      "card_code": "CARD-0001",
      "nfc_uid": "NFC-7FJ2K9",
      "qr_code": "QR-0001",
      "card_type": "Google Review",
      "current_redirect_url": "https://g.page/r/YOUR_REVIEW_LINK",
      "status": "active",
      "subscription_start_date": "2026-10-01T00:00:00.000Z",
      "subscription_end_date": "2027-10-01T00:00:00.000Z",
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

#### `GET /api/cards/:id`

Get a single card by its MongoDB `_id`.

**URL Parameter:** `id` — MongoDB ObjectId of the card

**Success Response — `200 OK`:**
```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
  "card_code": "CARD-0001",
  "nfc_uid": "NFC-7FJ2K9",
  "qr_code": "https://smart-card-qr-api.koyeb.app/r/CARD-0001",
  "card_type": "Google Review",
  "current_redirect_url": "https://g.page/r/YOUR_REVIEW_LINK",
  "status": "active",
  "subscription_start_date": "2026-10-01T00:00:00.000Z",
  "subscription_end_date": "2027-10-01T00:00:00.000Z",
  "createdAt": "2026-10-01T00:00:00.000Z",
  "updatedAt": "2026-10-01T00:00:00.000Z"
}
```

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
- **Error correction:** Level H (High) — best for physical printing, survives scratches/wear

**URL Parameter:** `id` — MongoDB ObjectId of the card

**Request:**
```http
GET /api/cards/64f1a2b3c4d5e6f7a8b9c0d2/qr
Authorization: Bearer <access_token>
```

**Success Response — `200 OK`:**
- Returns a PNG image file download: `qr-CARD-0001.png`
- The QR encodes: `https://smart-card-qr-api.koyeb.app/r/CARD-0001`

**Response Headers:**
```
Content-Type: image/png
Content-Disposition: attachment; filename="qr-CARD-0001.png"
```

**Usage — Download via curl:**
```bash
curl -H "Authorization: Bearer <token>" \
  https://smart-card-qr-api.koyeb.app/api/cards/64f1a2b3c4d5e6f7a8b9c0d2/qr \
  --output qr-CARD-0001.png
```

**Error Response — `404 Not Found`:**
```json
{
  "statusCode": 404,
  "error": "NotFoundException",
  "message": "Card with id \"64f1a2b3c4d5e6f7a8b9c0d2\" not found",
  "path": "/api/cards/64f1a2b3c4d5e6f7a8b9c0d2/qr",
  "timestamp": "2026-10-01T10:00:00.000Z"
}
```

---

#### `PUT /api/cards/:id`

Update a card's fields (general update).

**Request Body** (all fields optional):
```json
{
  "nfc_uid": "NFC-NEWUID",
  "qr_code": "QR-0002",
  "card_type": "Instagram",
  "current_redirect_url": "https://instagram.com/yourbusiness",
  "status": "active"
}
```

**Success Response — `200 OK`:** Returns the updated card object.

---

#### `PUT /api/cards/:id/toggle`

Toggle the card status between `active` ↔ `inactive`.

- **No request body needed.**

**Success Response — `200 OK`:**
```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
  "card_code": "CARD-0001",
  "status": "inactive",
  ...
}
```

---

#### `PUT /api/cards/:id/redirect`

Change **only** the `current_redirect_url` of a card.
This is the most-used endpoint by the admin dashboard for dynamic redirect management.

**Request Body:**
```json
{
  "redirect_url": "https://instagram.com/yournewpage"
}
```

| Field          | Required | Validation               |
|----------------|----------|--------------------------|
| `redirect_url` | ✅ Yes   | Must be a valid URL       |

**Success Response — `200 OK`:** Returns the updated card object.

---

#### `POST /api/cards/:id/renew`

Extend the card's subscription by **1 year**.

- If the subscription is still active → extends from `subscription_end_date`.
- If the subscription has already expired → extends from today.
- Also re-activates the card if it was set to `inactive` due to expiry.

- **No request body needed.**

**Success Response — `200 OK`:**
```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
  "card_code": "CARD-0001",
  "status": "active",
  "subscription_end_date": "2028-10-01T00:00:00.000Z",
  ...
}
```

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

### 2.3 Public Redirect Endpoint

---

#### `GET /r/:identifier`

The endpoint that NFC taps and QR code scans hit.

- **Auth required:** ❌ No
- The `identifier` can be any of: `card_code`, `nfc_uid`, or `qr_code`
- This is the URL stored on the physical NFC chip or printed in the QR code

**Example URLs:**
```
https://smart-card-qr-api.koyeb.app/r/CARD-0001
https://smart-card-qr-api.koyeb.app/r/NFC-7FJ2K9
https://smart-card-qr-api.koyeb.app/r/QR-0001
```

**Logic Flow:**

```
1. Find card where card_code OR nfc_uid OR qr_code === :identifier
2. If NOT found          → 404 JSON error
3. If card.status !== 'active'          → 403 JSON error
4. If current date > subscription_end_date → 403 JSON error
5. If valid → create ScanLog entry (fire & forget)
           → HTTP 302 redirect to card.current_redirect_url
```

**Success:** `302 Redirect` → Browser/app follows redirect to final URL (e.g., Google Review page)

**Error Response — `403 Forbidden`:**
```json
{
  "message": "Card is inactive or subscription expired"
}
```

**Error Response — `404 Not Found`:**
```json
{
  "message": "Card not found"
}
```

---

## 3. Request & Response Examples

### Full Workflow Example

#### Step 1 — Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "كلمني اديك البساورد 😂 "
}
```
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI2NGYx...",
  "admin": { "id": "64f1...", "username": "admin" }
}
```

#### Step 2 — Create a Card
```http
POST /api/cards
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI2NGYx...
Content-Type: application/json

{
  "card_code": "CARD-0001",
  "nfc_uid": "NFC-7FJ2K9",
  "card_type": "Google Review",
  "current_redirect_url": "https://g.page/r/CbGoogle123"
}
```
> `qr_code` is auto-generated: `https://smart-card-qr-api.koyeb.app/r/CARD-0001`

#### Step 3 — Download QR Image for Printing
```http
GET /api/cards/64f1a2b3c4d5e6f7a8b9c0d2/qr
Authorization: Bearer <token>
```
→ Downloads `qr-CARD-0001.png` (400×400px, ready for medal/card printing)

#### Step 3 — Physical Card URL
Program the NFC chip or use the downloaded QR image with this **static URL**:
```
https://smart-card-qr-api.koyeb.app/r/CARD-0001
```

#### Step 4 — Change Redirect (Dashboard)
When the business wants to change destination (no reprogram needed):
```http
PUT /api/cards/64f1a2b3c4d5e6f7a8b9c0d2/redirect
Authorization: Bearer <token>
Content-Type: application/json

{
  "redirect_url": "https://instagram.com/newbusiness"
}
```

#### Step 5 — Customer Scans Card
```http
GET https://yourdomain.com/r/CARD-0001
```
→ **302 Redirect** → `https://instagram.com/newbusiness`

#### Step 6 — Renew Subscription
```http
POST /api/cards/64f1a2b3c4d5e6f7a8b9c0d2/renew
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

| Code | Meaning                                                      |
|------|--------------------------------------------------------------|
| 200  | Success                                                      |
| 201  | Created successfully                                         |
| 302  | Redirect (public redirect endpoint)                          |
| 400  | Bad Request — validation failed (check `message` for details)|
| 401  | Unauthorized — missing or invalid JWT token                  |
| 403  | Forbidden — card inactive or subscription expired            |
| 404  | Not Found — card/admin does not exist                        |
| 409  | Conflict — card_code already exists                          |
| 429  | Too Many Requests — rate limit exceeded (100 req / 15 min)  |
| 500  | Internal Server Error                                        |

### Validation Error Example

When a required field is missing or invalid:
```json
{
  "statusCode": 400,
  "error": "BadRequestException",
  "message": [
    "card_code must follow the format CARD-0001",
    "card_type must be one of: Google Review, Instagram, TikTok, InstaPay, Google Maps, WhatsApp",
    "current_redirect_url must be a valid URL"
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
  { current_redirect_url: "https://instagram.com/shop" }
        │
        │  302 redirect
        ▼
   Final destination
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

Every time a valid card is redirected, a `ScanLog` entry is created with:
- `card_id` — which card was scanned
- `timestamp` — exact date and time
- `ip_address` — IP of the scanning device
- `user_agent` — browser/device info

This is done **asynchronously** (fire-and-forget) so it never delays the redirect.

---


## Quick Reference Card

| Action                        | Method | URL                              | Auth |
|-------------------------------|--------|----------------------------------|------|
| Admin login                   | POST   | `/api/auth/login`                | ❌   |
| Get admin profile             | GET    | `/api/auth/me`                   | ✅   |
| Create card                   | POST   | `/api/cards`                     | ✅   |
| List all cards                | GET    | `/api/cards`                     | ✅   |
| Get one card                  | GET    | `/api/cards/:id`                 | ✅   |
| **Download QR code (PNG)**    | GET    | `/api/cards/:id/qr`              | ✅   |
| Update card                   | PUT    | `/api/cards/:id`                 | ✅   |
| Toggle active/inactive        | PUT    | `/api/cards/:id/toggle`          | ✅   |
| Change redirect URL           | PUT    | `/api/cards/:id/redirect`        | ✅   |
| Renew subscription (+1 year)  | POST   | `/api/cards/:id/renew`           | ✅   |
| Delete card                   | DELETE | `/api/cards/:id`                 | ✅   |
| **Public: NFC/QR redirect**   | GET    | `/r/:identifier`                 | ❌   |

---

*Generated for the Smart NFC/QR Card Management System Backend*
*Stack: NestJS · MongoDB Atlas · JWT · TypeScript · bcryptjs · node-cron*
