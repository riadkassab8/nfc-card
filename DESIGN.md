# Dynamic QR & NFC Local Business Platform — Design System & UI/UX Specification (DESIGN.md)

---

## 1. Design Philosophy

The core UX proposition of this platform is **frictionless clarity and speed**.

```
+-----------------------------------------------------------------------+
|                         THE CORE DESIGN RULE                          |
|                                                                       |
|   Customer Public Page  ──►  Understood in 1 second (Mobile-first)   |
|   Business Owner Dashboard ──► Understood in 1 minute (Desktop-first)  |
+-----------------------------------------------------------------------+
```

* **Minimalism:** Remove all decorative visual noise, extraneous charts, secondary enterprise controls, and redundant navigation. Every element on screen must serve a direct operational goal.
* **Clarity:** Use plain human language, clear hierarchy, high-contrast typography, and explicit interactive states.
* **Consistency:** Maintain strict design token usage (colors, spacing scale, border radius, typography) across both the management dashboard and the public customer landing page.
* **Speed:** Sub-800ms initial public page render, instantaneous client-side interactions, zero layout shifts, and non-blocking toast feedback.
* **Mobile-First Customer Experience:** The public page (`/q/:code`) is optimized exclusively for handheld touch interaction. Large, accessible touch targets, fast scrolling, and instant app transfers.
* **Desktop-First Management Experience:** The business dashboard (`/dashboard`) prioritizes structured data layout, clear tabular lists, and quick-action editing on desktop viewports while gracefully collapsing into touchable cards on mobile devices.

---

## 2. Visual Direction

The visual style is **Calm, Premium, Trustworthy, and Modern**. It deliberately avoids overly dense enterprise CRM aesthetics while refraining from looking childish, cartoonish, or excessively flashy.

### Aesthetic Principles
* **Neutral Tone Palette:** Slate and graphite dark tones paired with crisp white and neutral zinc surfaces. Colors are used exclusively for semantic signaling (actions, success, warnings).
* **Subtle Borders Over Heavy Shadows:** Cards and containers rely on clean `1px` subtle borders (`var(--border-subtle)`) rather than diffuse drop shadows.
* **Purposeful Micro-Interactions:** Fast 150ms-200ms linear transitions on hover and active states. No long, distracting motion or decorative page entrance animations.
* **Zero Dashboard Clutter:** No floating decorative graphics, widgets, or multi-tab enterprise sidebars.

### What to Avoid
* ❌ No gradient-heavy backgrounds or vibrant neon cards.
* ❌ No heavy glassmorphism or blurred backdrop panels that degrade mobile render performance.
* ❌ No rounded pill cards for standard content blocks.
* ❌ No decorative charts or complex BI analytics widgets.

---

## 3. Design Tokens

The system uses CSS custom properties (tokens) built on a neutral, modern color palette. Hard-coding arbitrary hex codes within components is strictly prohibited.

### Color Tokens

```css
:root {
  /* Surface & Background */
  --bg-app: #fcfcfd;
  --bg-surface: #ffffff;
  --bg-surface-hover: #f4f4f5;
  --bg-surface-active: #e4e4e7;
  --bg-elevated: #ffffff;
  --bg-overlay: rgba(9, 9, 11, 0.4);

  /* Text & Typography */
  --text-primary: #09090b;
  --text-secondary: #71717a;
  --text-muted: #a1a1aa;
  --text-on-primary: #ffffff;

  /* Borders & Dividers */
  --border-subtle: #e4e4e7;
  --border-strong: #d4d4d8;
  --border-focus: #18181b;

  /* Primary Brand Action (Sleek Dark Accent) */
  --primary-bg: #18181b;
  --primary-bg-hover: #27272a;
  --primary-bg-active: #09090b;

  /* Semantic Messaging Colors */
  --success-bg: #ecfdf5;
  --success-text: #065f46;
  --success-border: #a7f3d0;

  --warning-bg: #fffbeb;
  --warning-text: #92400e;
  --warning-border: #fde68a;

  --error-bg: #fef2f2;
  --error-text: #991b1b;
  --error-border: #fecaca;

  /* Focus Indicator Ring */
  --focus-ring: 0 0 0 2px #ffffff, 0 0 0 4px #18181b;
}
```

---

## 4. Typography

The platform standardizes on a single, highly readable font family: **`Inter`** (with system fallback: `system-ui, -apple-system, sans-serif`).

### Typography Scale & Hierarchy

| Tokens / Role | Font Size | Weight | Line Height | Letter Spacing | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | `32px` (`2rem`) | Bold (`700`) | `1.2` | `-0.02em` | Public Page Main Title |
| **Page Title** | `24px` (`1.5rem`) | SemiBold (`600`) | `1.3` | `-0.01em` | Dashboard Screen Title |
| **Section Title**| `18px` (`1.125rem`) | SemiBold (`600`) | `1.4` | `0` | Card Headers & Section Titles |
| **Card Title** | `15px` (`0.9375rem`)| Medium (`500`) | `1.4` | `0` | Stat Card Labels, Table Headers |
| **Body Standard**| `14px` (`0.875rem`) | Regular (`400`) | `1.5` | `0` | General Text, Table Cells |
| **Body Medium** | `14px` (`0.875rem`) | Medium (`500`) | `1.5` | `0` | Form Input Values, Buttons |
| **Label** | `13px` (`0.8125rem`)| Medium (`500`) | `1.4` | `0` | Form Field Labels, Badges |
| **Caption** | `12px` (`0.75rem`) | Regular (`400`) | `1.4` | `0` | Secondary Timestamps, Footers |

---

## 5. Spacing Scale

Spacing relies on a strict **4px base grid**. Ad-hoc pixel spacing (e.g. `13px`, `19px`) is strictly forbidden.

```
+----+----+----+----+----+----+----+----+----+----+
| 4  | 8  | 12 | 16 | 20 | 24 | 32 | 40 | 48 | 64 |
+----+----+----+----+----+----+----+----+----+----+
  xs   sm   md   lg   xl  2xl  3xl  4xl  5xl  6xl
```

### Spacing Guidelines
* `4px` (`space-xs`): Inline badge padding, micro-gap between icon and text.
* `8px` (`space-sm`): Form field internal vertical padding, button icon gaps.
* `12px` (`space-md`): Input horizontal padding, card content inner padding.
* `16px` (`space-lg`): Standard card padding, form section gaps.
* `20px` (`space-xl`): Public page action button vertical gap.
* `24px` (`space-2xl`): Dashboard grid gap between metrics cards.
* `32px` (`space-3xl`): Page content vertical padding.
* `40px`-`64px` (`space-4xl`-`6xl`): Layout header/sidebar margins and empty state vertical padding.

---

## 6. Border Radius

Border radii are subtle and refined. The system avoids making every UI container a fully rounded pill.

* **Inputs & Controls:** `6px` (`--radius-sm`)
* **Buttons:** `8px` (`--radius-md`)
* **Cards & Containers:** `10px` (`--radius-lg`)
* **Modals & Drawers:** `12px` (`--radius-xl`)
* **Public Action Buttons:** `12px` (`--radius-xl` - maximizes touch friendliness)
* **Badges / Tags:** `9999px` (Full pill shape)

---

## 7. Shadows System

The system relies almost exclusively on surface colors and `1px` subtle borders (`--border-subtle`). Drop shadows are used sparingly to elevate interactive layers:

```css
:root {
  --shadow-none: none;
  --shadow-subtle: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-elevated: 0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04);
  --shadow-overlay: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
```

* **Cards / Panels:** Use `--shadow-subtle` paired with `border: 1px solid var(--border-subtle)`.
* **Dropdown Menus:** Use `--shadow-elevated`.
* **Modals / Drawers:** Use `--shadow-overlay`.

---

## 8. Dashboard Layout Architecture

The business management dashboard uses a classic fixed sidebar + top header layout structure on desktop viewports.

```
+-----------------------------------------------------------------------+
|  LOGO  │ Top Header Bar: Business Name | Quick Preview | User Account |
+--------+--------------------------------------------------------------+
| SIDEBAR│ MAIN CONTENT CONTAINER (max-width: 1200px; padding: 32px)     |
|        │                                                              |
| 📊 Dash│  Page Title                                  [Primary Action]|
| 🏢 Biz │  ----------------------------------------------------------  |
| 📱 QRs │  [ Stat Card 1 ]   [ Stat Card 2 ]   [ Stat Card 3 ]         |
| 📈 Stat│                                                              |
| ⚙️ Set │  +--------------------------------------------------------+  |
|        │  | Main Content Table / Section                          |  |
|        │  +--------------------------------------------------------+  |
+--------+--------------------------------------------------------------+
```

### Layout Constants
* **Sidebar Width:** `240px` (Fixed on desktop).
* **Header Height:** `60px` (Sticky top).
* **Content Container:** `max-width: 1200px`, centered with `margin: 0 auto`.
* **Content Padding:** `32px` on desktop, `16px` on mobile.

---

## 9. Responsive Design & Breakpoints

The system defines three standard breakpoints:

```
Mobile (< 768px)  ──►  Tablet (768px - 1024px)  ──►  Desktop (> 1024px)
```

### Responsive Behavior Rules

#### 1. Dashboard Responsiveness:
* **Desktop (> 1024px):** Fixed left sidebar (`240px`), multi-column metric grids (3 columns), full data tables.
* **Tablet (768px - 1024px):** Collapsible sidebar, metrics grid becomes 2 columns, table scrollable.
* **Mobile (< 768px):** Left sidebar hides into a sliding **Hamburger Drawer**. Metric grid becomes a 1-column stack. Tables convert cleanly into **Stacked Card Views**.

#### 2. Customer Public Page Responsiveness:
* Always rendered mobile-first centered column (`max-width: 480px`). On desktop monitors, the page centers neatly with a soft subtle background surrounding the mobile card view.

---

## 10. Dashboard Overview Screen (`/dashboard`)

```
+-----------------------------------------------------------------------+
| Dashboard                                                [Edit Links] |
| Overview of your dynamic QR code performance                          |
+-----------------------------------------------------------------------+
|  TOTAL SCANS          | ACTIVE QR CODES       | ACTION CLICKS         |
|  1,420                | 3                     | 890                   |
|  +12% from last week  | All systems active    | 62% conversion rate   |
+-----------------------------------------------------------------------+
| Recent Activity                                                       |
| +-------------------------------------------------------------------+ |
| | WhatsApp Click  │ Front Counter QR   │ 2 mins ago                 | |
| | Phone Call      │ Table 4 QR         │ 14 mins ago                | |
| | Scan            │ Window Sticker QR  │ 1 hour ago                 | |
| +-------------------------------------------------------------------+ |
+-----------------------------------------------------------------------+
```

### UI Sections & Elements
1. **Header Block:** Title ("Dashboard"), Subtitle ("Overview of your dynamic QR performance"), CTA ("Edit Links").
2. **Top Metrics Bar (3 Stat Cards):**
   * Total Scans (Number + comparison badge).
   * Active QR Codes (Number + active status tag).
   * Action Clicks (Number + click-through conversion rate).
3. **Recent Activity Stream:** Clean 5-row list showing event icon, event type, QR label, and relative time.

---

## 11. Business Screen (`/dashboard/business`)

The business page is a single, clean management form split into logical sections.

```
+-----------------------------------------------------------------------+
| Business Profile                                        [Save Changes]|
| Manage your public contact details and dynamic actions                 |
+-----------------------------------------------------------------------+
| BASIC INFORMATION                                                     |
| Business Name *  [ Acme Coffee Bar                                  ] |
| Description      [ Artisanal coffee and fresh pastries in downtown  ] |
| Logo             [ 🖼️ Upload Logo Image (PNG/JPG < 2MB)             ] |
+-----------------------------------------------------------------------+
| DYNAMIC ACTION LINKS                                                  |
| [✓] WhatsApp    [ +14155552671                                      ] |
| [✓] Phone Call  [ +14155552671                                      ] |
| [✓] Location    [ 123 Main Street, Suite 100                        ] |
| [✓] Instagram   [ https://instagram.com/acmecoffee                  ] |
| [✓] Google Rev  [ https://g.page/r/acmecoffee/review                ] |
| [ ] Website     [ https://acmecoffee.com                            ] |
+-----------------------------------------------------------------------+
```

* **Toggle Switches:** Each link row features an inline toggle switch (`ACTIVE` / `DISABLED`). Disabled links are omitted from the customer page without deleting the URL string.
* **Sticky Save Footer:** On mobile, a bottom floating bar ensures the "Save Changes" button is always accessible.

---

## 12. QR Codes Screen (`/dashboard/qr-codes`)

```
+-----------------------------------------------------------------------+
| QR Codes                                         [+ Create New QR]   |
| Manage physical dynamic QR code placements                            |
+-----------------------------------------------------------------------+
| QR   │ LABEL          │ PLACEMENT     │ STATUS   │ SCANS │ ACTIONS    |
|------+----------------+---------------+----------+-------+------------|
| [QR] │ Main Counter   │ Register desk │ ACTIVE   | 842   | [⋮ Menu]  |
| [QR] │ Table 1        │ Dining floor  │ ACTIVE   | 310   | [⋮ Menu]  |
| [QR] │ Window Decal   │ Entrance door │ DISABLED | 268   | [⋮ Menu]  |
+-----------------------------------------------------------------------+
```

### Table & Mobile Card Spec
* **Row Thumbnail:** Small 40x40px crisp QR code preview.
* **Status Badge:** Green dot for `ACTIVE`, Gray dot for `DISABLED`, Red dot for `ARCHIVED`.
* **Actions Menu (`[⋮]` Dropdown):**
  * 📥 Download PNG
  * 📄 Download Printable Template (PDF)
  * ✏️ Edit Label & Placement
  * ⏸️ Disable / Enable
  * 🗑️ Archive

---

## 13. Create QR Modal

```
+---------------------------------------------------+
| Create New Dynamic QR Code                    [X] |
+---------------------------------------------------+
| Label *                                           |
| [ e.g. Front Counter Acrylic Stand              ] |
|                                                   |
| Placement Description                             |
| [ e.g. Next to payment register                 ] |
|                                                   |
|                [ Cancel ]  [ Create QR Code ]     |
+---------------------------------------------------+
```

### Post-Creation Result State
Immediately after clicking "Create QR Code", the modal transitions to the success preview state:

```
+---------------------------------------------------+
| QR Code Created Successfully!                 [X] |
+---------------------------------------------------+
|                +---------------+                  |
|                |  [QR IMAGE]   |                  |
|                +---------------+                  |
|               Public Code: 7FJ2K9                 |
|                                                   |
| [ 📥 Download PNG ]  [ 📄 Print Card ] [ Done ]   |
+---------------------------------------------------+
```

---

## 14. QR Details Drawer

A lightweight slide-over drawer (`width: 400px`) that opens when clicking a QR row, avoiding full page navigations.

```
+------------------------------------------+
| QR Details                           [X] |
+------------------------------------------+
|  +------------------------------------+  |
|  |             [QR IMAGE]             |  |
|  +------------------------------------+  |
|  Public Code: 7FJ2K9                     |
|  URL: https://app.example.com/q/7FJ2K9   |
|                                          |
|  Label: Main Counter Display             |
|  Placement: Register Desk                |
|  Status: ACTIVE                          |
|  Created: Oct 12, 2026                   |
|  Total Scans: 842                        |
|                                          |
|  --------------------------------------  |
|  [ 📥 Download PNG ] [ ⏸️ Disable QR ]   |
+------------------------------------------+
```

---

## 15. Public Customer Page (`/q/:code`)

This is the primary customer-facing view. It must render flawlessly on any smartphone screen.

```
+------------------------------------+
|               [LOGO]               |
|            Acme Coffee             |
|  Artisanal coffee & fresh bakery   |
|     123 Main St, Downtown          |
|                                    |
|  +------------------------------+  |
|  | 💬  WhatsApp Us              |  |
|  +------------------------------+  |
|  | 📞  Call Business            |  |
|  +------------------------------+  |
|  | 📍  Get Directions           |  |
|  +------------------------------+  |
|  | ⭐  Leave a Google Review    |  |
|  +------------------------------+  |
|  | 📸  Follow on Instagram      |  |
|  +------------------------------+  |
|  | 🌐  Visit Website            |  |
|  +------------------------------+  |
|                                    |
|         Powered by DynamicQR       |
+------------------------------------+
```

### Layout Specifications
* **Max Width:** `480px` centered.
* **Vertical Gap Between Buttons:** `12px`.
* **Touch Target Height:** `54px` minimum.
* **No Scrollbar Clutter:** Clean, natural mobile viewport fitting.

---

## 16. Public Page Interaction Standards

```
Default State    ──(Tap / Click)──►    Active State    ──(Ping API)──► Outbound App
(High contrast button)               (Scale 0.98 + opacity)           (Native protocol)
```

1. **Button Touch Target:** Height `54px`, `border-radius: 12px`, bold readable text (`16px`).
2. **Hover State (Desktop preview):** Subtle background darkening (`var(--bg-surface-hover)`), `transform: translateY(-1px)`.
3. **Active/Tap Feedback:** Immediate visual press down (`transform: scale(0.98)`, duration `100ms`).
4. **Outbound Click Trigger:** Client sends non-blocking ping to `/q/:code/event` (`event_type`), while immediately opening external deep-link (`wa.me`, `tel:`, `maps.google.com`).
5. **Disabled Button State:** Hidden entirely from public view (never shown as grayed-out disabled clutter to customers).

---

## 17. Analytics Screen (`/dashboard/analytics`)

Intentionally clean, aggregate analytics with zero enterprise bloat.

```
+-----------------------------------------------------------------------+
| Analytics                                      [ Last 7 Days ▼ ]      |
+-----------------------------------------------------------------------+
| TOTAL SCANS               TOTAL ACTION CLICKS       CONVERSION RATE   |
| 1,420                     890                       62.6%             |
+-----------------------------------------------------------------------+
| SCANS OVER TIME                                                       |
| 300 |                                            *                    |
| 200 |                        *                 *   *                  |
| 100 |       *              *   *             *       *                |
|   0 +-------+------+-------+---+-----+-------+-------+-------------   |
|            Mon    Tue     Wed Thu   Fri     Sat     Sun               |
+-----------------------------------------------------------------------+
| ACTION BREAKDOWN                                                      |
| WhatsApp        ██████████████████████ 45% (400 clicks)               |
| Google Review   ██████████████        30% (267 clicks)                |
| Phone Call      ██████                15% (133 clicks)                |
| Location        ████                   10% (90 clicks)                |
+-----------------------------------------------------------------------+
```

---

## 18. Settings Screen (`/dashboard/settings`)

Streamlined account security and preferences.

```
+-----------------------------------------------------------------------+
| Account Settings                                                      |
+-----------------------------------------------------------------------+
| ACCOUNT CREDENTIALS                                                   |
| Email Address    [ owner@acmecoffee.com                            ]  |
|                                                                       |
| CHANGE PASSWORD                                                       |
| Current Password [ ••••••••••••••••                                ]  |
| New Password     [ ••••••••••••••••                                ]  |
| Confirm Password [ ••••••••••••••••                                ]  |
|                                                                       |
|                                                   [ Update Password ] |
+-----------------------------------------------------------------------+
```

---

## 19. Reusable Component Inventory

### 1. Layout Components
* `AppShell`: Main wrapper housing sticky header and responsive sidebar.
* `Sidebar`: Left navigation panel with active route highlight.
* `Header`: Top navigation bar with business identifier and user avatar menu.
* `PageContainer`: `1200px` max-width content container.

### 2. Card Components
* `StatCard`: Standard metric tile (Title, Big Number, Subtext/Trend).
* `QRCard`: Mobile card representation of a QR code record.
* `ActivityCard`: Single activity stream row item.

### 3. Form Controls
* `TextField`: Standard text input with floating or top label and error message block.
* `PhoneField`: Input formatted for international telephone numbers.
* `URLField`: Input with auto `https://` prefix handling.
* `ToggleSwitch`: Accessible boolean slider button (`ACTIVE`/`DISABLED`).

### 4. QR Components
* `QRPreview`: SVG vector renderer for QR codes.
* `QRStatusBadge`: Pill badge indicating state (`ACTIVE` - Green, `DISABLED` - Gray).
* `CreateQRModal`: Modal wrapper for generating dynamic codes.
* `QRDetailsDrawer`: Slide-over drawer detailing a single QR.

### 5. Feedback Components
* `Toast`: Non-blocking alert banner popping up at top-right.
* `ConfirmDialog`: Modal confirmation for destructive actions.
* `EmptyState`: Centered illustration + message for zero-data states.
* `SkeletonLoader`: Animated gray rectangle matching UI shape during loading.

### 6. Public Components
* `BusinessHeader`: Logo, Name, Address block for customer landing view.
* `ActionButton`: Primary 54px touch target button for public links.

---

## 20. Interactive Component States

Every interactive component MUST explicitly implement these 6 states:

| State | Visual Behavior |
| :--- | :--- |
| **Default** | Standard token colors, `1px` subtle border, readable text. |
| **Hover** | Background shifts to hover token (`var(--bg-surface-hover)`), pointer cursor. |
| **Focus** | High-contrast double focus ring (`var(--focus-ring)`). Accessible via Keyboard Tab. |
| **Active** | Pressed scale effect (`transform: scale(0.98)`). |
| **Disabled** | Opacity `0.5`, `cursor: not-allowed`, pointer events disabled. |
| **Loading** | Label replaced with inline spinner icon, submit click handler blocked. |

---

## 21. Toast Notification System

Mutations NEVER use disruptive native browser `alert()` or `confirm()` dialogs. Asynchronous events trigger subtle toasts at the top-right of the dashboard viewport.

```
+-------------------------------------------------------+
|  ✓  Business information saved successfully!        |
+-------------------------------------------------------+

+-------------------------------------------------------+
|  ✕  Failed to save changes. Check input links.        |
+-------------------------------------------------------+

+-------------------------------------------------------+
|  !  QR Code Table 1 has been disabled.                |
+-------------------------------------------------------+
```

* **Auto-Dismiss:** Toasts auto-dismiss after 4,000ms.
* **Manual Close:** Includes an optional `[X]` close icon.

---

## 22. Confirmation Dialogs

Destructive mutations (Disabling a QR code, Archiving a QR code) MUST require explicit user confirmation. Normal updates ("Save Changes") DO NOT prompt confirmation.

```
+---------------------------------------------------+
| Disable QR Code "Table 1"?                    [X] |
+---------------------------------------------------+
| Customers scanning this physical QR code will     |
| no longer be directed to your business links      |
| until re-enabled.                                 |
|                                                   |
|             [ Cancel ]  [ Yes, Disable QR ]       |
+---------------------------------------------------+
```

---

## 23. Empty States Specification

Empty states provide clear guidance on what action to take next.

### 1. No QR Codes Created
```
+---------------------------------------------------+
|                      📱                           |
|              No QR Codes Created Yet              |
|                                                   |
| Create your first dynamic QR code to print for    |
| your table counters, windows, or receipts.        |
|                                                   |
|             [ + Create First QR Code ]            |
+---------------------------------------------------+
```

### 2. No Analytics Activity
```
+---------------------------------------------------+
|                      📊                           |
|             No Analytics Recorded                 |
|                                                   |
| Scan activity will appear here once customers     |
| start scanning your printed QR codes.             |
+---------------------------------------------------+
```

---

## 24. Loading States & Skeleton Design

To prevent visual layout shifts (CLS), initial component loads render skeleton shapes matching the final container dimensions.

```
Metric Card Loading Skeleton:
+------------------------------------+
|  ░░░░░░░░░░░ (Title)               |
|  ░░░░░░░░ (Big Number)             |
|  ░░░░░░░░░░░░░░ (Subtext)          |
+------------------------------------+
```

### Button Loading Behavior
When a submit button is clicked, it immediately displays an inline spinner while preserving button width:

```
[ Saving... 🌀 ]   (Disabled during request)
```

---

## 25. Error Handling & Human-Readable Messages

Raw backend or database errors (e.g. `PG::UniqueViolation`, `500 Internal Error`) are caught at the API layer and translated into plain, actionable messages.

| Technical Scenario | User-Facing Error Message |
| :--- | :--- |
| Network offline | *"Network connection lost. Please check your internet connection."* |
| Invalid `public_code` | *"This QR code link is invalid or has been removed."* |
| Disabled QR scan | *"This business link is currently inactive."* |
| Duplicate Signup Email | *"An account with this email address already exists."* |
| Invalid Phone Format | *"Please enter a valid phone number including country code."* |

---

## 26. Accessibility Standards (WCAG 2.1 AA)

1. **Color Contrast:** Text tokens maintain minimum **4.5:1** contrast ratio against backgrounds.
2. **Keyboard Navigation:** Every action item (buttons, inputs, toggles, menus) is navigable via `Tab` key with visible focus rings (`--focus-ring`).
3. **Screen Reader Labels:** All icons without visible text labels include explicit `aria-label` tags (e.g., `aria-label="Close Modal"`).
4. **Touch Targets:** Public buttons adhere to minimum `44x44px` touch target areas (recommended `54px`).
5. **No Color-Only Signaling:** Status indications combine color badges with explicit text descriptions (e.g., Green + "ACTIVE").

---

## 27. Physical QR Print Design Standards

Physical printed QR displays must adhere to strict scanner readability rules:

```
+--------------------------------------------+
|                                            |
|             [ BUSINESS LOGO ]              |
|                                            |
|          +----------------------+          |
|          |                      |          |
|          |   [ DYNAMIC QR ]     |          |
|          |                      |          |
|          +----------------------+          |
|                                            |
|           SCAN TO CONNECT WITH US          |
|          WhatsApp • Call • Location        |
|                                            |
+--------------------------------------------+
```

### Printable Output Templates (PDF / PNG)
1. **Quiet Zone:** Minimum 4 modules (white border space) surrounding the QR matrix pattern.
2. **High Contrast:** Strictly black matrix on pure white background (`#000000` on `#FFFFFF`).
3. **Physical Sizing:**
   * **Table / Counter Stand:** Minimum 5cm x 5cm matrix.
   * **Window Decal / Poster:** Minimum 10cm x 10cm matrix.
   * **Business Card / Receipt:** Minimum 2.5cm x 2.5cm matrix.

---

## 28. NFC Tag Physical & Encoding Standards

NFC tags operate identically to printed QR codes.

```
[ Physical NFC Tag ] ──(Tap)──► NDEF Payload: https://app.example.com/q/7FJ2K9 ──► Dynamic Page
```

* **Payload Format:** Standard NDEF URI Record (`https://app.example.com/q/:public_code`).
* **Immutability:** Once encoded onto an NFC chip (NTAG213 / NTAG215), the physical tag **NEVER needs to be re-encoded or rewritten**. All destination updates occur dynamically on the server.

---

## 29. Motion & Animation Guidelines

Animations must be hyper-subtle and respect user operating system motion preferences.

* **Transitions:** `150ms ease-out` for hover background color shifts and modal overlays.
* **Drawer / Modal Entrance:** `200ms cubic-bezier(0.16, 1, 0.3, 1)` slide up or slide in.
* **Reduced Motion:** If `prefers-reduced-motion: reduce` is enabled in the browser, remove all layout translation shifts and set transition durations to `0ms`.

---

## 30. Core UX Rules

1. **Location Awareness:** User always knows which business profile they are managing.
2. **Immediate Feedback:** Every save action triggers a toast within 200ms.
3. **No Hidden Core Actions:** Primary actions ("Create QR", "Save Changes", "Download") are visible without nesting inside deep dropdowns.
4. **No Destructive Surprises:** Archiving or disabling a QR code always requests confirmation.

---

## 31. Form UX Standards

* **Top-Aligned Labels:** Labels sit directly above form fields for optimal vertical scan lines.
* **Helpful Placeholders:** Used for format examples only (e.g. `+14155552671`), never as a replacement for field labels.
* **Inline Validation:** Validates format on `blur` event; clears error state immediately as user types valid characters.
* **Input Retention:** Form inputs are NEVER cleared automatically when server validation fails. User entries are preserved.

---

## 32. Mobile UX Standards

### Public Customer Page:
* Single vertical column stack layout.
* No horizontal scrolling under any viewport width.
* Sticky tap feedback.

### Dashboard Mobile:
* Sidebar collapses into a smooth slide-out drawer accessible via top-left hamburger icon (`☰`).
* Data tables transform into clean, stacked cards (`QRCard`).

---

## 33. Branding Balance

```
+---------------------------------------------------+
|               [ BUSINESS LOGO ]                   |  <-- Dominant (Primary)
|             Acme Coffee & Bakery                  |
|                                                   |
|             [ Action Buttons Stack ]              |
|                                                   |
|               Powered by DynamicQR                |  <-- Subtle (Secondary)
+---------------------------------------------------+
```

* **Customer View:** Business branding (Logo, Name, Description) dominates 90% of visual weight.
* **Platform Branding:** Secondary, subtle footer attribution ("Powered by DynamicQR").

---

## 34. Design Quality Verification Checklist

Before considering any UI implementation complete, verify against this checklist:

* [ ] Color usage strictly adheres to CSS variables in `DESIGN.md`.
* [ ] Typography strictly uses font scale tokens.
* [ ] All touch targets on public customer page are >= 44px (recommended 54px).
* [ ] Dashboard layout is responsive and tested at `< 768px` width.
* [ ] Table rows convert to cards on mobile viewport.
* [ ] No raw browser `alert()` or `confirm()` popups exist.
* [ ] Async mutations show toast notifications.
* [ ] Form inputs maintain value on validation errors.
* [ ] Loading skeletons exist for data fetch states.
* [ ] Empty states exist for zero-data scenarios.
* [ ] Keyboard focus ring (`--focus-ring`) is visible on `Tab` focus.
* [ ] QR code SVG previews render with proper quiet zones.
* [ ] Physical QR code scan reliability verified with real mobile camera.
* [ ] Public customer page loads and renders in < 800ms.

---

## 35. Implementation Rules for Developers & AI Agents

1. **Read `DESIGN.md` First:** Inspect tokens, component specs, and UX rules before building or editing components.
2. **Reuse System Components:** Always check existing UI components before writing custom HTML/CSS buttons, inputs, or cards.
3. **No Arbitrary Hex Colors:** Never hardcode colors like `#3b82f6` or `#111827` inside component styles. Use CSS custom properties (`var(--primary-bg)`).
4. **No Arbitrary Spacing:** Stick to 4px base grid spacing scale (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`).
5. **Preserve Functionality:** Never remove working API calls or business logic during a UI polishing task.

---

## 36. Final Design Principle

> **Canonical Principle:**
> Simple enough for a local business owner to manage in **one minute** without technical support; polished and reliable enough to present to thousands of scanning customers in **one second**.
