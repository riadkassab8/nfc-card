# Dynamic QR & NFC Local Business Platform — Product & Technical Specification (DOCUMENT.md)

---

## 1. Product Overview

### What the Product Is
The product is a lightweight Software-as-a-Service (SaaS) platform tailored for local brick-and-mortar businesses. It pairs physical Dynamic QR Codes and NFC tags with a clean, mobile-first digital landing page that houses a business's primary call-to-action buttons (WhatsApp, Phone Call, Google Maps Location, Instagram, Google Review, Website, and optional custom links).

### What Problem It Solves
Traditional static QR codes and physical print materials (table stands, window stickers, flyers, menu boards, business cards) embed fixed URLs or telephone numbers. If a business owner changes their phone number, shifts locations, updates their Google Maps pin, or wants to redirect feedback to a new review link, static QR codes become instantly obsolete, forcing expensive re-printing and re-distribution.

This platform solves the re-printing problem by separating the **physical identifier** (the QR code pattern or NFC chip payload) from the **digital destination**.

### Who It Is For
Local service and retail business owners (café managers, restaurant operators, salon owners, barbers, retail store owners, clinic administrators) who need a friction-free way to connect offline physical foot traffic with online communication channels without managing complex websites or enterprise IT systems.

### Core Value Proposition
> **"Print Once. Change Anytime."**

* **Zero Re-printing Costs:** Physical hardware (NFC tags, printed acrylic display stands, vinyl window decals) is generated once.
* **Instant Dynamic Redirection:** Business owners update their destination links from a simplified dashboard in real-time without modifying the physical QR pattern or rewriting NFC tag data.
* **Aggregated Action Tracking:** Simple visibility into scan rates and customer interaction choices without invading customer privacy.

### Why Dynamic QR is Different from Static QR
* **Static QR Code:** Encodes raw destination data (e.g., `https://wa.me/1234567890`) directly into the matrix pattern. Once printed, altering the destination requires generating and printing a new matrix pattern.
* **Dynamic QR Code:** Encodes a persistent system route URL (e.g., `https://app.example.com/q/7FJ2K9`) containing an immutable `public_code`. When scanned, the platform inspects `7FJ2K9`, fetches the current business metadata, records the scan event, and renders the dynamic mobile landing page.

### QR / NFC Relationship
Both Dynamic QR codes and physical NFC tags serve as identical entry points to the exact same dynamic destination URL (`https://app.example.com/q/:code`). 
* Scanning the printed matrix code with a smartphone camera resolves `https://app.example.com/q/:code`.
* Tapping an NDEF-formatted NFC tag containing `https://app.example.com/q/:code` launches the exact same browser route.
* No special mobile app is required for either customer entry vector.

---

## 2. Product Goals

The Primary MVP (Minimum Viable Product) goals are strictly operational and measurable:

1. **Instant Link Updates:** Any update made in the dashboard to phone, WhatsApp, location, Instagram, or Google review links must reflect immediately (0-second propagation delay) on subsequent customer scans.
2. **Sub-second Redirect/Render:** The public dynamic page (`/q/:code`) must load within **< 800ms** on 4G mobile connections.
3. **100% Reliable QR Resolution:** Stable mapping of `public_code` to business actions with zero breakdown of printed codes across lifecycle state transitions.
4. **Frictionless Mobile Action Execution:** 1-tap transfer from customer screen to native apps (WhatsApp client, native dialer, Google Maps, Instagram app).
5. **Accurate Event Capture:** 100% server-side log accuracy for `SCAN` events and outbound link button clicks.
6. **Zero Technical Knowledge Required for Setup:** A non-technical business owner can complete onboarding, set up actions, and download printable QR assets in **< 3 minutes**.

---

## 3. Non-Goals

To keep the platform simple, reliable, and cheap to operate, the MVP **MUST NOT** include or evolve into any of the following enterprise features:

* 🚫 **No Customer Relationship Management (CRM):** No storing customer names, phone numbers, lead forms, or contact lists.
* 🚫 **No Marketing Automation & Messaging:** No automated WhatsApp broadcasting, SMS marketing, or email campaigns.
* 🚫 **No Customer Accounts or Logins:** Customers scanning the QR code NEVER create accounts, log in, or input personal passwords.
* 🚫 **No Loyalty Systems / Digital Stamp Cards:** No point tracking, reward redemption, or coupon validation engines.
* 🚫 **No Point-Of-Sale (POS) or E-Commerce:** No shopping cart, product catalog, payment processing, or ordering system.
* 🚫 **No Artificial Intelligence (AI):** No AI chat assistants, automated response generators, or predictive data algorithms.
* 🚫 **No Push Notifications:** No WebPush or native push notification infrastructure.
* 🚫 **No Complex Customer Segmentation / Cohort Analysis:** No user tracking across browser sessions or identity profiling.

---

## 4. Target Businesses

The platform targets local businesses that depend heavily on fast customer action and quick phone/location inquiries:

1. **Restaurants & Cafés:** Tabletop QR for digital menu links, Google reviews, and instant WhatsApp reservations.
2. **Barbers & Beauty Salons:** Reception counter QR/NFC for booking links, Instagram portfolios, and Google reviews.
3. **Retail & Clothing Stores:** Checkout counter tags for Instagram follow links and customer feedback.
4. **Bakeries & Coffee Shops:** Packaging tags or display stand links.
5. **Gyms & Fitness Studios:** Entrance tags for schedule links and WhatsApp membership inquiries.
6. **Medical & Dental Clinics:** Desk tags for phone appointments, location mapping, and website links.
7. **Car Wash & Auto Service Centers:** Waiting room desk tags for Google review generation and direct phone calls.
8. **Local Service Professionals (Plumbers, Electricians, Locksmiths):** Magnetic cards or sticker tags linking directly to dialer and WhatsApp.

---

## 5. User Roles & Permissions

The system defines two strict roles:

```
+-----------------------------------------------------------------------+
|                              PLATFORM ADMIN                           |
|  - Platform wide management                                          |
|  - Business provisioning & activation                                 |
|  - System analytics monitoring                                        |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                            BUSINESS OWNER                             |
|  - Manages single tenant business profile                             |
|  - Configures business contact & social links                          |
|  - Generates, labels & manages dynamic QR codes                       |
|  - Views tenant-specific analytics & scan stats                        |
+-----------------------------------------------------------------------+
```

### 1. Platform Admin
* **Permissions:**
  * View all registered business tenants.
  * System-wide statistics (total businesses, aggregate scans).
  * Provision or deactivate business accounts.
  * System setup and security settings.
* **Scope:** Global platform level.

### 2. Business Owner
* **Permissions:**
  * Configure business profile (Name, Logo, Description, Address, GPS coordinates).
  * Configure primary action links (WhatsApp, Phone, Google Maps, Instagram, Google Review, Website).
  * Enable or disable individual action buttons.
  * Create, view, label, disable, or archive dynamic QR codes for their business.
  * Download printable QR code graphics (PNG / SVG).
  * View tenant-isolated scan and click analytics.
* **Scope:** Strictly isolated to their own tenant record (`business_id`). Cannot view or touch another business's data under any condition.

---

## 6. Complete User Journeys

```
                    +--------------------------------+
                    |      BUSINESS ONBOARDING       |
                    | Signup -> Profile -> Links     |
                    +--------------------------------+
                                    |
                                    v
                    +--------------------------------+
                    |          QR CREATION           |
                    | Create -> Print/Program NFC    |
                    +--------------------------------+
                                    |
                                    v
                    +--------------------------------+
                    |        CUSTOMER DISCOVERY      |
                    | Scan/Tap -> Dynamic Page       |
                    +--------------------------------+
                                    |
                                    v
                    +--------------------------------+
                    |        CUSTOMER ACTION         |
                    | Click Button -> External App   |
                    +--------------------------------+
                                    |
                                    v
                    +--------------------------------+
                    |       EVENT & ANALYTICS        |
                    | Server Logs -> Dashboard Stat  |
                    +--------------------------------+
```

### Flow A: Business Onboarding
1. **Signup:** Owner registers with `Email` and `Password`.
2. **Business Setup:** Owner sets `Business Name`, optional `Logo`, `Description`, `Address`, `Phone`, `WhatsApp`.
3. **Links Configuration:** Owner pastes optional links (`Instagram URL`, `Google Review URL`, `Website URL`).
4. **First QR Generation:** System automatically creates the default primary dynamic QR code (`public_code`).
5. **Download / Print:** Owner downloads PNG/SVG vector format or writes the encoded URL to an NFC chip using any standard NFC tools.

### Flow B: Customer QR / NFC Journey
1. **Scan / Tap:** Customer scans QR code or taps NFC tag with smartphone.
2. **Resolution (`GET /q/:code`):** Server validates `public_code`.
   * Checks if QR status is `ACTIVE` and Business status is `ACTIVE`.
   * Log `SCAN` event asynchronously into `qr_events`.
   * Server returns clean mobile-first HTML landing page populated with active business action buttons.
3. **Action Execution:** Customer taps a button (e.g., "WhatsApp Us").
   * Client captures click event via lightweight fetch ping to `POST /q/:code/event` with `event_type = 'WHATSAPP_CLICK'`.
   * Browser immediately redirects/opens target app protocol (e.g., `https://wa.me/1234567890`).

### Flow C: QR Management
1. **Create:** Owner creates additional QR codes (e.g., Label: "Table 1", Placement: "Main Dining Area").
2. **View:** List all generated QR codes with individual scan counts.
3. **Edit Label/Placement:** Update administrative description without changing `public_code`.
4. **Disable:** Soft-pause a QR code (Status: `DISABLED`). Future scans display an " Temporarily Unavailable" screen.
5. **Archive:** Soft-delete a QR code (Status: `ARCHIVED`). QR disappears from active list, historical analytics are retained.

### Flow D: Business Editing (Zero Re-printing Core Flow)
1. **Scenario:** Business changes phone number from `+10000000000` to `+19999999999`.
2. **Action:** Owner logs into dashboard -> Navigates to **Business** settings -> Edits Phone number field -> Clicks **Save Changes**.
3. **Effect:** Database `businesses` record is updated.
4. **Verification:** The physical QR code printed on acrylic stands remains identical (`https://app.example.com/q/7FJ2K9`).
5. **Customer Scan:** Next customer scanning the original printed QR receives the updated `+19999999999` call link immediately.

### Flow E: Analytics Aggregation
1. Customer actions emit lightweight event logs to `qr_events`.
2. Dashboard queries aggregated counts grouped by time frame (Today, 7 Days, 30 Days, All Time) and event type.
3. Owner inspects scan trends and button popularity metrics in real time.

---

## 7. Public Customer Page

The public dynamic customer page is the most critical UI component. It must be hyper-lean, fast, and optimized for mobile devices.

```
+------------------------------------+
|               [Logo]               |
|            Acme Coffee             |
|    123 Main Street, Suite 400      |
|                                    |
|  +------------------------------+  |
|  |  💬  WhatsApp Us             |  |
|  +------------------------------+  |
|  |  📞  Call Business           |  |
|  +------------------------------+  |
|  |  📍  Get Directions          |  |
|  +------------------------------+  |
|  |  ⭐  Leave a Google Review   |  |
|  +------------------------------+  |
|  |  📸  Follow on Instagram     |  |
|  +------------------------------+  |
|  |  🌐  Visit Website           |  |
|  +------------------------------+  |
|                                    |
|        Powered by DynamicQR        |
+------------------------------------+
```

### Technical Requirements
* **URL Structure:** `https://<domain>/q/:public_code` (e.g., `https://app.example.com/q/7FJ2K9`).
* **Authentication:** **NONE** (Strictly public endpoint).
* **Responsive Layout:** Mobile-first vertical stack layout (`max-width: 480px`, centered, optimized touch targets `min-height: 52px`).
* **SEO & Social Meta Tags:** Includes OpenGraph metadata (`og:title`, `og:description`, `og:image`) populated dynamically from business profile so sharing link previews renders correctly.

### Display Sections & Button Ordering
Buttons render in a logical priority order. **Only actions with non-empty configuration values will display.**

1. **Header Block:**
   * Business Logo (if available, fallback to stylized initials icon).
   * Business Name (`h1`).
   * Short Description (optional).
   * Address text (optional).
2. **Action Buttons Stack:**
   * **WhatsApp:** `https://wa.me/<number>?text=<urlencoded_optional_greeting>`
   * **Phone Call:** `tel:<number>`
   * **Google Maps Location:** `https://www.google.com/maps/search/?api=1&query=<latitude>,<longitude>` or fallback to `https://www.google.com/maps/search/?api=1&query=<url_encoded_address>`
   * **Google Review:** Direct link to Google Review modal (`https://search.google.com/local/writereview?placeid=...` or standard google review link).
   * **Instagram:** Direct deep-link URL `https://instagram.com/<username>`.
   * **Website:** Direct web URL `https://<domain>`.
3. **Footer Block:**
   * Subtle non-intrusive brand attribution ("Powered by DynamicQR").

### Handled Page States
* **Loading State:** Server-Side Rendered (SSR) or lightweight skeletal CSS spinner while fetching initial payload. Total render time under 800ms.
* **Disabled State:** If QR status is `DISABLED` or business status is `DISABLED`, render a clean friendly message: *"This QR code is currently inactive. Please contact the business."*
* **Not Found (404) State:** Invalid `public_code` renders a clean message: *"Invalid QR Code. The link you scanned does not exist."*
* **Error State:** Server error renders: *"Unable to load business details. Please refresh or try again later."*

---

## 8. Dashboard Specifications

The dashboard allows non-technical business owners to manage their dynamic destination and view metrics.

### Navigation Structure
* 📊 **Overview / Dashboard** (`/dashboard`)
* 🏢 **Business Profile** (`/dashboard/business`)
* 📱 **QR Codes** (`/dashboard/qr-codes`)
* 📈 **Analytics** (`/dashboard/analytics`)
* ⚙️ **Settings** (`/dashboard/settings`)

---

### Screen 1: Dashboard Overview (`/dashboard`)
* **Purpose:** Quick snapshot of business status, total scans, quick link to copy/test public page, and QR activity.
* **UI Sections:**
  1. **Quick Status Card:** Shows Business Name, Current Status (Active/Disabled), and Public Page URL preview link.
  2. **Metrics Summary Cards (4 Cards):** Total Scans, WhatsApp Clicks, Phone Calls, Google Review Clicks.
  3. **Recent Activity Table:** Last 5 recorded events with timestamp and action type.
  4. **Quick Actions:** Button to "Edit Links" and "Download Main QR".
* **Data Required:** Aggregated count totals for current tenant, recent 5 `qr_events`.
* **Empty State:** If 0 scans recorded, display graphic with text: *"No scans recorded yet. Print and display your QR code to start receiving activity!"*

---

### Screen 2: Business Profile (`/dashboard/business`)
* **Purpose:** Single management page for all public-facing information and action links.
* **UI Sections:**
  1. **Basic Info Section:**
     * Business Name `[Input Text, Required]`
     * Logo Image Upload `[File Upload / URL Input, Optional]`
     * Description `[Textarea, Max 250 chars, Optional]`
     * Address `[Input Text, Optional]`
     * Latitude & Longitude `[Input Numbers / Map Picker, Optional]`
  2. **Primary Actions Setup Section:**
     * Phone Number `[Input Tel, Optional]` (Formats to international `+1...`)
     * WhatsApp Number `[Input Tel, Optional]`
     * Google Maps / Location Link `[Input URL, Optional]`
     * Google Review Link `[Input URL, Optional]`
     * Instagram Profile URL `[Input URL, Optional]`
     * Website URL `[Input URL, Optional]`
  3. **Form Actions:**
     * "Save Changes" Button `[Primary CTA]`.
* **Validation:** Client & server-side URL validation, phone format checking.
* **Loading State:** Form fields locked with inline spinner on submit button during patch mutation.
* **Success State:** Toast notification: *"Business information saved successfully! Printed QR codes now reflect these changes."*
* **Error State:** Toast notification with specific validation failures.

---

### Screen 3: QR Codes Management (`/dashboard/qr-codes`)
* **Purpose:** View, generate, label, and download dynamic QR codes.
* **UI Sections:**
  1. **Header Action:** "Create New QR Code" Button (Opens Modal).
  2. **QR Code Grid/Table:**
     * QR Thumbnail Preview.
     * Label (e.g., "Front Door Sticker", "Table 4").
     * Placement description.
     * Public URL (`https://app.example.com/q/7FJ2K9`).
     * Status Badge (`ACTIVE`, `DISABLED`, `ARCHIVED`).
     * Total Scan Count badge.
     * Action Menu:
       * 📥 **Download PNG / SVG**
       * ✏️ **Edit Label**
       * ⏸️ **Disable / Enable**
       * 🗑️ **Archive**
  3. **Create/Edit QR Modal:**
     * Label `[Input Text, Required, e.g., "Main Counter Display"]`
     * Placement `[Input Text, Optional, e.g., "Next to Cash Register"]`
* **Empty State:** If no QR codes exist, show central graphic with button: *"Create Your First Dynamic QR Code"*.

---

### Screen 4: Analytics (`/dashboard/analytics`)
* **Purpose:** In-depth breakdown of customer interactions over time.
* **UI Sections:**
  1. **Time Range Selector:** Buttons (`Today`, `Last 7 Days`, `Last 30 Days`, `All Time`).
  2. **Scan Trend Chart:** Simple line/bar chart displaying daily scans over selected range.
  3. **Action Breakdown Chart/Table:** Bar chart or percentage breakdown showing distribution of clicks (`WhatsApp`, `Phone`, `Location`, `Instagram`, `Google Review`, `Website`).
  4. **QR Code Performance Table:** Displays list of QR codes with scan counts to compare placement effectiveness (e.g., Table 1 vs Counter).
* **Empty State:** Charts replaced with placeholder graph graphic: *"Insufficient analytics data for selected date range."*

---

### Screen 5: Account Settings (`/dashboard/settings`)
* **Purpose:** Manage account credentials and platform authentication.
* **UI Sections:**
  1. **Account Info:** Display registered email address.
  2. **Change Password Form:** Current Password, New Password, Confirm New Password.
* **Actions:** "Update Password" button with toast notification on success.

---

## 9. Business & Data Model

The data model uses a clean multi-tenant relational architecture. Each business tenant owns its branches and QR codes.

```
+--------------------+           +--------------------+
|       users        |           |     businesses     |
+--------------------+           +--------------------+
| id (PK)            |1         1| id (PK)            |
| email (Unique)     |<--------->| user_id (FK)       |
| password_hash      |           | name               |
| role               |           | logo_url           |
| created_at         |           | description        |
+--------------------+           | phone              |
                                 | whatsapp           |
                                 | address            |
                                 | latitude           |
                                 | longitude          |
                                 | instagram_url      |
                                 | google_review_url  |
                                 | website_url        |
                                 | status             |
                                 | created_at         |
                                 | updated_at         |
                                 +--------------------+
                                           |
                                           | 1
                                           |
                                           v N
                                 +--------------------+
                                 |      branches      |
                                 +--------------------+
                                 | id (PK)            |
                                 | business_id (FK)   |
                                 | name               |
                                 | address            |
                                 | is_primary         |
                                 | created_at         |
                                 +--------------------+
                                           |
                                           | 1
                                           |
                                           v N
                                 +--------------------+
                                 |      qr_codes      |
                                 +--------------------+
                                 | id (PK)            |
                                 | business_id (FK)   |
                                 | branch_id (FK)     |
                                 | public_code(Uniq)  |
                                 | label              |
                                 | placement          |
                                 | status             |
                                 | created_at         |
                                 | updated_at         |
                                 +--------------------+
                                           |
                                           | 1
                                           |
                                           v N
                                 +--------------------+
                                 |     qr_events      |
                                 +--------------------+
                                 | id (PK)            |
                                 | qr_id (FK)         |
                                 | event_type         |
                                 | created_at         |
                                 | user_agent         |
                                 | referrer           |
                                 +--------------------+
```

### Table Definitions & Field Schemas

#### 1. `users`
Represents authentication credentials.
* `id`: UUID / Primary Key
* `email`: VARCHAR(255) — Unique, lowercased index
* `password_hash`: VARCHAR(255) — Hashed via bcrypt/Argon2
* `role`: VARCHAR(50) — Default `'BUSINESS_OWNER'` (Values: `'BUSINESS_OWNER'`, `'PLATFORM_ADMIN'`)
* `created_at`: TIMESTAMP WITH TIME ZONE — Default `NOW()`
* `updated_at`: TIMESTAMP WITH TIME ZONE — Default `NOW()`

#### 2. `businesses`
Represents the core tenant configuration.
* `id`: UUID / Primary Key
* `user_id`: UUID — Foreign Key -> `users(id)` ON DELETE CASCADE
* `name`: VARCHAR(255) — Required
* `logo_url`: TEXT — Optional
* `description`: TEXT — Optional
* `phone`: VARCHAR(50) — Optional
* `whatsapp`: VARCHAR(50) — Optional
* `address`: TEXT — Optional
* `latitude`: DECIMAL(10, 8) — Optional
* `longitude`: DECIMAL(11, 8) — Optional
* `instagram_url`: TEXT — Optional
* `google_review_url`: TEXT — Optional
* `website_url`: TEXT — Optional
* `status`: VARCHAR(50) — Default `'ACTIVE'` (Values: `'ACTIVE'`, `'DISABLED'`, `'SUSPENDED'`)
* `created_at`: TIMESTAMP WITH TIME ZONE — Default `NOW()`
* `updated_at`: TIMESTAMP WITH TIME ZONE — Default `NOW()`

#### 3. `branches`
Extensible branch support. In MVP, every business has exactly 1 default primary branch.
* `id`: UUID / Primary Key
* `business_id`: UUID — Foreign Key -> `businesses(id)` ON DELETE CASCADE
* `name`: VARCHAR(255) — Default `'Main Branch'`
* `address`: TEXT — Optional
* `is_primary`: BOOLEAN — Default `TRUE`
* `created_at`: TIMESTAMP WITH TIME ZONE — Default `NOW()`

#### 4. `qr_codes`
Represents dynamic physical identifiers.
* `id`: UUID / Primary Key
* `business_id`: UUID — Foreign Key -> `businesses(id)` ON DELETE CASCADE
* `branch_id`: UUID — Foreign Key -> `branches(id)` ON DELETE SET NULL
* `public_code`: VARCHAR(32) — Unique indexed string (e.g. Nanoid/random alphanumeric)
* `label`: VARCHAR(255) — Required (e.g., `"Front Counter"`)
* `placement`: TEXT — Optional (e.g., `"Near register"`)
* `status`: VARCHAR(50) — Default `'ACTIVE'` (Values: `'ACTIVE'`, `'DISABLED'`, `'ARCHIVED'`)
* `created_at`: TIMESTAMP WITH TIME ZONE — Default `NOW()`
* `updated_at`: TIMESTAMP WITH TIME ZONE — Default `NOW()`

#### 5. `qr_events`
Represents scan and click log entries.
* `id`: BIGINT / BIGSERIAL / Primary Key
* `qr_id`: UUID — Foreign Key -> `qr_codes(id)` ON DELETE CASCADE
* `event_type`: VARCHAR(50) — Required (Values: `'SCAN'`, `'WHATSAPP_CLICK'`, `'PHONE_CLICK'`, `'LOCATION_CLICK'`, `'INSTAGRAM_CLICK'`, `'GOOGLE_REVIEW_CLICK'`, `'WEBSITE_CLICK'`, `'CUSTOM_LINK_CLICK'`)
* `created_at`: TIMESTAMP WITH TIME ZONE — Default `NOW()`
* `user_agent`: TEXT — Optional raw user agent snippet for basic mobile analytics
* `referrer`: TEXT — Optional

### Ownership & Multi-Tenant Rules
1. Direct ownership chaining: `user` 1:1 `business`, `business` 1:N `qr_codes`, `qr_code` 1:N `qr_events`.
2. Database query scoping: Every dashboard database query MUST explicitly match `WHERE business_id = :authenticated_user_business_id`.
3. Strict foreign key cascades clean up child entities if a business is purged.

---

## 10. QR Code Architecture & Dynamic Resolution

```
[ Physical QR / NFC Tag ]
  Payload: https://app.example.com/q/7FJ2K9
         │
         ▼ (Customer Scan / Tap)
[ GET /q/7FJ2K9 ] ──(Lookup public_code="7FJ2K9")──► [ Database ]
         │                                                │
         │                                           Returns QR + Business
         ▼                                                │
[ Verify Status ] ◄───────────────────────────────────────┘
  - Is QR ACTIVE?
  - Is Business ACTIVE?
         │
         ├─► [ YES ] ──► Log SCAN event ──► Render Customer Page with live links
         │
         └─► [ NO  ] ──► Render "QR Inactive" Error Page
```

### Mechanism of Action
1. The printed QR image encodes an **immutable short URL**: `https://<domain>/q/<public_code>` (e.g., `https://app.example.com/q/7FJ2K9`).
2. The `public_code` is a 8-to-12 character random, cryptographically non-sequential alphanumeric string (e.g. Nanoid).
3. **Lookup Execution:**
   * When a HTTP GET request hits `/q/:public_code`, the server queries `qr_codes` where `public_code = :public_code`.
   * It joins the associated `businesses` record.
   * If found and both QR and Business status are `ACTIVE`, it logs a `SCAN` event.
   * Server returns the dynamic HTML page containing the **current** links stored in `businesses`.
4. **Immutability Guarantee:** Updating business telephone numbers or Instagram links in the dashboard updates fields in `businesses`. It **never** alters `qr_codes.public_code`. The physical QR matrix and NFC payload remain untouched forever.

---

## 11. QR Status Lifecycle

A QR code can exist in one of three states:

```
          +------------------+
          |      ACTIVE      |  <-- Scans record & load business page
          +------------------+
             |            ^
  Owner      |            | Owner
  Disables   v            | Enables
          +------------------+
          |     DISABLED     |  <-- Scans show "Temporarily Inactive"
          +------------------+
             |
             | Owner Archives
             v
          +------------------+
          |     ARCHIVED     |  <-- Hidden from active lists, historical events preserved
          +------------------+
```

1. **`ACTIVE`:**
   * Customer scanning/tapping lands directly on the functional business page.
   * Scans and action clicks are recorded in `qr_events`.
2. **`DISABLED`:**
   * Customer scanning lands on a friendly notice: *"This QR code has been temporarily disabled by the business owner."*
   * Scan attempt is still recorded as a `SCAN` event in `qr_events` tagged with metadata so owners can see demand on disabled codes.
3. **`ARCHIVED`:**
   * Soft-deleted state. The QR code is hidden from the primary dashboard list.
   * Scanning lands on a 404/Inactive page.
   * **Crucial Rule:** Historical analytics entries in `qr_events` are NEVER deleted when a code is archived. Data integrity is preserved for reporting.

---

## 12. Event Tracking Specification

The platform logs clean operational events without collecting personal customer identifiers.

### Tracked Event Types
1. `SCAN`: Triggered when customer opens the public route `/q/:public_code`.
2. `WHATSAPP_CLICK`: Triggered when customer taps the "WhatsApp Us" button.
3. `PHONE_CLICK`: Triggered when customer taps the "Call Business" button.
4. `LOCATION_CLICK`: Triggered when customer taps the "Get Directions / Location" button.
5. `INSTAGRAM_CLICK`: Triggered when customer taps the "Instagram" button.
6. `GOOGLE_REVIEW_CLICK`: Triggered when customer taps the "Leave Google Review" button.
7. `WEBSITE_CLICK`: Triggered when customer taps the "Website" button.
8. `CUSTOM_LINK_CLICK`: Triggered when customer taps any future custom link button.

### Operational Definition of "Unique" Scans
* The MVP **does not** collect personal identification or invade customer privacy.
* The system reports raw event counts ("Total Scans" and "Total Clicks").
* Analytics UI must explicitly label metrics as **"Total Scans"** and **"Action Clicks"**, explicitly refraining from claiming "Unique Visitors" unless IP-hash deduplication within a tight 1-hour window is configured.

---

## 13. MVP Analytics

Dashboard analytics must be aggregate, fast, and simple to digest:

1. **Total Scans Metric:** Sum of `SCAN` events for tenant QR codes in date range.
2. **Scan Trend:** Bar graph showing daily aggregate `SCAN` events over selected period (Last 7 Days / Last 30 Days).
3. **Action Clicks Summary:** Sum of all non-`SCAN` click events.
4. **Action Breakdown:** Percentage/count split of clicks across action types (e.g., 45% WhatsApp, 30% Google Review, 15% Location, 10% Phone Call).
5. **QR Code Performance Breakdown:** Table listing each QR label alongside total scan count to compare physical placements (e.g. Table 1 vs Window Sticker).

---

## 14. Validation Rules

All input fields must be validated strictly on both client and server:

| Field | Validation Rules | Error Message |
| :--- | :--- | :--- |
| **Business Name** | Required, String, 2 to 100 characters. | *"Business name must be between 2 and 100 characters."* |
| **Phone Number** | Optional, E.164 format or standard numeric string (min 7 digits). | *"Please enter a valid phone number with country code."* |
| **WhatsApp Number** | Optional, Numeric string only with country code (e.g., `14155552671`). | *"WhatsApp number must include country code without symbols."* |
| **Website URL** | Optional, Valid HTTP/HTTPS format. | *"Website must be a valid URL starting with http:// or https://"* |
| **Instagram URL** | Optional, Valid URL containing `instagram.com`. | *"Please enter a valid Instagram URL."* |
| **Google Review URL**| Optional, Valid HTTP/HTTPS format. | *"Please enter a valid Google Review URL."* |
| **Logo File / URL** | Optional, Valid Image URL or image upload < 2MB (PNG/JPG/WEBP). | *"Logo must be a PNG, JPG, or WEBP image under 2MB."* |
| **QR Code Label** | Required, String, 1 to 50 characters. | *"QR label is required (e.g., Table 1, Counter Display)."* |

---

## 15. Security Specification

Multi-tenant security is of paramount importance. A business must **NEVER** under any condition view, edit, or access another business's data.

### Security Enforcements
1. **Multi-Tenant Isolation:**
   * Server endpoints MUST derive `business_id` strictly from the verified session token / JWT.
   * **NEVER** trust `business_id` passed in HTTP request bodies or query parameters.
2. **Authentication:**
   * Secure session-cookie or JWT bearer tokens.
   * Passwords hashed using `bcrypt` (work factor 10+) or `Argon2id`.
3. **Server-Side Authorization Checks:**
   * Every mutation API endpoint checks ownership: `WHERE id = :target_id AND business_id = :auth_business_id`.
4. **Public Endpoint Hardening (`/q/:code`):**
   * Endpoint is unauthenticated by design, but protected against brute-force harvesting via rate limiting (e.g., max 60 requests per minute per IP).
   * Unpredictable `public_code` generation (cryptographically secure random string with high entropy, min 8 chars).
5. **Input Sanitization & XSS Prevention:**
   * All dynamic text rendered on public page (Business Name, Description, Address) MUST be escaped to prevent cross-site scripting (XSS).
6. **URL Validation & SSRF Prevention:**
   * Outbound customer destination links validated to prevent `javascript:` protocol injection.
7. **Transport Security:**
   * HTTPS enforced across all endpoints with HSTS.

---

## 16. Privacy & Data Minimization

The system strictly adheres to privacy-by-design principles:

* 🛡️ **No Customer PII:** The platform does NOT ask customers for names, email addresses, phone numbers, or social logins.
* 🛡️ **No Message Content Access:** Tapping "WhatsApp Us" transfers the customer directly into their native WhatsApp application. The SaaS platform never sits in the message path or reads chats.
* 🛡️ **No Fingerprinting:** No cross-site tracking cookies, device fingerprinting, or intrusive telemetry.
* 🛡️ **Data Minimization:** `qr_events` logs strictly record `qr_id`, `event_type`, and timestamp `created_at`.

---

## 17. API & Backend Specifications

### Authentication API

#### `POST /api/auth/signup`
* **Auth:** Public
* **Input:** `{ "email": "owner@cafe.com", "password": "SecurePassword123", "business_name": "Acme Cafe" }`
* **Output:** `{ "user": { "id": "...", "email": "..." }, "business": { "id": "...", "name": "Acme Cafe" }, "token": "..." }`
* **Validation:** Email format, Password length >= 8.
* **Errors:** `400 Bad Request` (Email already exists / Validation failure).

#### `POST /api/auth/login`
* **Auth:** Public
* **Input:** `{ "email": "owner@cafe.com", "password": "SecurePassword123" }`
* **Output:** `{ "token": "...", "business": { "id": "...", "name": "Acme Cafe" } }`
* **Errors:** `401 Unauthorized` (Invalid credentials).

---

### Business API

#### `GET /api/business`
* **Auth:** Required (`BUSINESS_OWNER`)
* **Input:** None
* **Output:** Full `businesses` model record for authenticated user.
* **Authorization:** Scoped to `user_id`.

#### `PATCH /api/business`
* **Auth:** Required (`BUSINESS_OWNER`)
* **Input:** `{ "name": "Acme Coffee Bar", "phone": "+14155552671", "whatsapp": "+14155552671", "instagram_url": "...", ... }`
* **Output:** Updated `businesses` object.
* **Validation:** Valid formats for URLs and phone numbers.
* **Authorization:** Scoped to user's tenant `business_id`.

---

### QR Code Management API

#### `GET /api/qr`
* **Auth:** Required (`BUSINESS_OWNER`)
* **Input:** Query params: `status` (optional)
* **Output:** Array of `qr_codes` belonging to user's business with scan counts.

#### `POST /api/qr`
* **Auth:** Required (`BUSINESS_OWNER`)
* **Input:** `{ "label": "Table 1", "placement": "Main Floor" }`
* **Output:** Created `qr_codes` record including generated `public_code` and full QR image download URL.

#### `PATCH /api/qr/:id`
* **Auth:** Required (`BUSINESS_OWNER`)
* **Input:** `{ "label": "Table 1 - Updated", "placement": "Patio" }`
* **Output:** Updated `qr_codes` record.
* **Authorization:** Ensures `qr_code.business_id == authenticated_user.business_id`.

#### `POST /api/qr/:id/disable` (or status toggle)
* **Auth:** Required (`BUSINESS_OWNER`)
* **Input:** `{ "status": "DISABLED" }`
* **Output:** Updated status.

---

### Public Dynamic Resolution API

#### `GET /q/:public_code`
* **Auth:** Public
* **Input:** Path parameter `public_code`
* **Output:** Renders public landing HTML page. Asynchronously logs `SCAN` event.
* **Errors:** `404 Not Found` if code doesn't exist; Renders inactive template if status is `DISABLED`.

#### `POST /q/:public_code/event`
* **Auth:** Public
* **Input:** `{ "event_type": "WHATSAPP_CLICK" }`
* **Output:** `{ "success": true }`
* **Behavior:** Appends record to `qr_events` linked to the QR code.

---

### Analytics API

#### `GET /api/analytics`
* **Auth:** Required (`BUSINESS_OWNER`)
* **Input:** Query params: `range` (`today` | `7d` | `30d` | `all`)
* **Output:** `{ "total_scans": 150, "total_clicks": 98, "trend": [...], "breakdown": { "WHATSAPP_CLICK": 40, ... }, "qr_performance": [...] }`

---

## 18. Database Rules & Indexes

### Primary Keys & Foreign Keys
* All entities use UUID v4 primary keys (except high-volume `qr_events` which can use `BIGSERIAL` / `BIGINT` PK).
* Explicit foreign key constraints with `ON DELETE CASCADE` for clear cleanup.

### Mandatory Indexes for Performance
```sql
-- Fast dynamic resolution lookup (Critical for customer scans)
CREATE UNIQUE INDEX idx_qr_codes_public_code ON qr_codes(public_code);

-- Tenant isolation lookup
CREATE INDEX idx_qr_codes_business_id ON qr_codes(business_id);
CREATE INDEX idx_branches_business_id ON branches(business_id);

-- Analytics queries aggregation
CREATE INDEX idx_qr_events_qr_id_created_at ON qr_events(qr_id, created_at);
CREATE INDEX idx_qr_events_event_type ON qr_events(event_type);
```

---

## 19. Error Handling Principles

1. **User-Friendly Error Messages:** Never expose raw database crash logs, stack traces, or SQL syntax errors to the client.
2. **Dashboard Feedback:** All asynchronous dashboard mutations (saving links, creating QR, updating password) MUST trigger clear UI **Toast Notifications** (Success / Error).
3. **Public Page Fallbacks:** If a single external link is malformed, hide that specific button gracefully while keeping all valid action buttons fully operational.
4. **No Silent Failures:** Client-side form submissions must highlight invalid input fields inline.

---

## 20. Empty States Specifications

* **No QR Codes:** Show visual icon of printable table stand with message: *"You haven't generated any QR codes yet."* + Button: `[Create First QR Code]`.
* **No Analytics:** Display lightweight line graph illustration with message: *"No customer scan activity recorded for this period."*
* **Unconfigured Business Links:** Display helper message banner on dashboard: *"Your public page has no action buttons enabled yet. Add a phone number or WhatsApp to activate customer actions."*

---

## 21. Loading & Interaction States

1. **Skeleton Loaders:** Dashboard cards and public page load skeleton placeholders before data populates to eliminate layout shifts.
2. **Mutation Debouncing / Double-Click Prevention:** Form submit buttons must disable immediately upon click and display an inline loading spinner until the API response resolves.
3. **Download Feedback:** Clicking "Download QR (PNG)" shows immediate preparation indicator before triggering browser file download.

---

## 22. Future Roadmap (Isolated from MVP Architecture)

To maintain MVP simplicity, advanced features are explicitly deferred to later versions:

```
+-----------------------------------------------------------------------+
| V1 (Current MVP)                                                      |
| - Single branch support                                               |
| - 6 Standard Action Buttons                                           |
| - Dynamic QR resolution & basic event analytics                       |
+-----------------------------------------------------------------------+
                                   │
                                   ▼
+-----------------------------------------------------------------------+
| V2 (Multi-Branch & Theme Customization)                              |
| - Multiple branches per business owner                                |
| - Custom theme color picker & logo badge on QR center                 |
| - Custom links (e.g. WiFi password page, PDF Menu link)               |
+-----------------------------------------------------------------------+
                                   │
                                   ▼
+-----------------------------------------------------------------------+
| V3 (Growth & Engagement Tools)                                        |
| - Direct Feedback Collector (Private feedback form before Google review)|
| - Printable PDF Template Generator (Pre-designed printable table cards)|
| - Advanced time-of-day analytics & geographic scan grouping           |
+-----------------------------------------------------------------------+
```

---

## 23. Acceptance Criteria Checklist

The MVP is complete and ready for deployment **ONLY** when every item below is verified:

* [ ] **Onboarding & Auth:** A new user can register an account and log into the dashboard cleanly.
* [ ] **Business Profile Setup:** Business name, phone, WhatsApp, Google Maps, Instagram, and Google review links can be saved and updated.
* [ ] **QR Generation:** A dynamic QR code can be created with a custom label and downloaded as a high-res printable image.
* [ ] **Stability of QR Code:** Updating business details does NOT change the generated QR `public_code` or public URL.
* [ ] **Public Resolution:** Scanning the QR code with a physical mobile device opens the dynamic page in under 800ms.
* [ ] **Mobile Action Execution:**
  * [ ] Tapping WhatsApp opens native WhatsApp with the pre-configured number.
  * [ ] Tapping Call opens native dialer with the phone number.
  * [ ] Tapping Location opens Google Maps at correct destination.
  * [ ] Tapping Instagram opens Instagram profile.
  * [ ] Tapping Google Review opens direct review destination.
* [ ] **Status Controls:** Disabling a QR code in the dashboard immediately prevents public dynamic access and displays an inactive state notice.
* [ ] **Analytics Tracking:**
  * [ ] Scans are accurately counted in the dashboard.
  * [ ] Action button clicks are accurately recorded and displayed in breakdown charts.
* [ ] **Multi-Tenant Security:** A logged-in business owner CANNOT access or modify another business's profile or QR codes by guessing URL parameters or IDs.
* [ ] **Responsive Design:** The public customer page renders flawlessly across standard screen sizes (iOS and Android browsers).

---

## 24. Development Rules for AI & Engineers

Future developers and AI coding agents working on this codebase MUST follow these strict guidelines:

1. **Read `DOCUMENT.md` First:** Understand the business concept ("Print once. Change anytime.") and non-goals before altering code.
2. **Inspect Existing Architecture:** Always check existing components, routes, database schemas, and helpers before creating new files.
3. **No Database Schema Drift:** Do NOT add arbitrary database fields or tables without updating `DOCUMENT.md`.
4. **Keep MVP Simple:** Refuse requests to introduce CRM features, point systems, automated chat bots, or complex user tracking during the MVP phase.
5. **Enforce Tenant Isolation:** Always include `business_id` scoping on every database query handling user data. Never rely on client-supplied business IDs.
6. **Decouple Business Logic:** Keep backend data handling separate from UI display components.

---

## 25. Final Product Definition

> **Canonical Definition:**
> The Dynamic QR & NFC Local Business Platform is a lightweight, mobile-first micro-SaaS that allows local brick-and-mortar businesses to print physical QR codes and program NFC tags once, while retaining total real-time control over where customers are directed. It aggregates direct customer actions (WhatsApp, Calls, Location, Socials, Reviews) on a clean digital landing page and provides simple visibility into offline-to-online engagement without complex IT overhead or customer friction.
