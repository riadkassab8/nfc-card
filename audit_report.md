# 📋 Frontend ↔ Backend Audit Report

## A. API CONTRACT STATUS

| Endpoint | Status | Notes |
|----------|--------|-------|
| `POST /api/auth/login` | ✅ Correct | Used in `authApi.ts` |
| `GET /api/auth/me` | ✅ Correct | Used in `AuthContext.tsx` |
| `POST /api/cards` | ⚠️ Partial | Missing `category_id` in `ApiCreateCardDto` |
| `GET /api/cards` | ⚠️ Partial | Missing `category_id` filter param |
| `GET /api/cards/:id` | ✅ Correct | But adapter ignores `category_id` population |
| `GET /api/cards/:id/qr` | ✅ Correct | |
| `PUT /api/cards/:id` | ⚠️ Partial | `ApiUpdateCardDto` missing `category_id` |
| `PUT /api/cards/:id/toggle` | ✅ Correct | |
| `PUT /api/cards/:id/redirect` | ⚠️ Wrong | Passing `business_data` via `/redirect` — API only accepts `redirect_url` |
| `POST /api/cards/:id/renew` | ✅ Correct | |
| `DELETE /api/cards/:id` | ✅ Correct | |
| `GET /api/categories` | ❌ Missing | No categories API client exists |
| `POST /api/categories` | ❌ Missing | No categories API client exists |
| `PUT /api/categories/:id` | ❌ Missing | No categories API client exists |
| `DELETE /api/categories/:id` | ❌ Missing | No categories API client exists |
| `GET /api/lookup/group/:group` | ✅ Public | Returns `[]` — no lookup entries seeded yet |
| `GET /r/:identifier` | ✅ Public | Handled by backend redirect |

---

## B. CURRENT FRONTEND STATUS

| Area | Status |
|------|--------|
| Auth (JWT localStorage) | ✅ Working |
| Card list/toggle/delete/renew | ✅ Working |
| Category API | ❌ MISSING ENTIRELY |
| `business_data` field names | ❌ WRONG (see Section G) |
| `card_type` options (hardcoded) | ⚠️ Hardcoded in 3 files |
| `category_id` sent on create/edit | ❌ NEVER SENT |
| QR stable URL | ✅ Correct (`/r/CARD-XXXX`) |
| Social Page rendering | ⚠️ Uses wrong field names |
| `/admin/categories` page | ❌ DOES NOT EXIST |

---

## C. CATEGORY SYSTEM STATUS

**COMPLETELY MISSING from the frontend.**

The frontend has no concept of the backend `Category` model. Instead, it uses a hand-rolled `getMainCategory()` function in `src/types/index.ts` that maps `card_type` strings to 3 hardcoded buckets (`Google Review`, `Social`, `Payment`). This is a frontend-only concept — it does NOT exist in the backend.

Backend categories are:
- A separate MongoDB collection (`/api/categories`)
- Has fields: `_id`, `name`, `description`, `icon`, `is_active`, `createdAt`, `updatedAt`
- Cards reference them via `category_id`

---

## D. CATEGORY CRUD SUPPORT FROM BACKEND

| Operation | Endpoint | Supported |
|-----------|----------|-----------|
| List categories | `GET /api/categories` | ✅ Yes (auth required) |
| Create category | `POST /api/categories` | ✅ Yes (auth required) |
| Update category | `PUT /api/categories/:id` | ✅ Yes (auth required) |
| Delete category | `DELETE /api/categories/:id` | ✅ Yes (auth required) |
| Get single category | `GET /api/categories/:id` | ✅ Yes (auth required) |

**All 5 CRUD operations are supported.**

---

## E. FILES THAT NEED CHANGES

| File | Changes Required |
|------|-----------------|
| `src/types/index.ts` | Add `ApiCategory`, `ApiCategoryDto` types; fix `BusinessData` field names; add `category_id` to `ApiCard`, `ApiCreateCardDto`, `ApiUpdateCardDto`; fix `apiCardToCardItem` adapter |
| `src/services/api/cardsApi.ts` | Add `category_id` to `CardQueryParams`; add it to `getCards()` params |
| `src/services/api/categoriesApi.ts` | **CREATE NEW FILE** — full CRUD client for categories |
| `src/services/api/index.ts` | Export new `categoriesApi` |
| `src/services/cardService.ts` | Fix `saveCardBusinessData` — use `PUT /api/cards/:id` with `business_data`, NOT `/redirect`; use correct field names |
| `src/pages/admin/AdminCategoriesPage.tsx` | **CREATE NEW FILE** — full `/admin/categories` page |
| `src/App.tsx` | Add `/admin/categories` route |
| `src/components/admin/AdminSidebar.tsx` | Add "التصنيفات" nav link |
| `src/components/admin/BatchGenerateCardsModal.tsx` | Load card types from `/api/lookup/group/card_type`; add `category_id` selector; add `current_redirect_url` requirement |
| `src/components/admin/CardDetailsDrawer.tsx` | Fix preview URL to use `card.card_code` directly; fix card type edit; load categories dynamically |
| `src/pages/admin/AdminInventoryPage.tsx` | Replace hardcoded category filter pills with dynamic categories from API |
| `src/pages/admin/AdminScanPage.tsx` | Fix `formData` field names to match API; fix save logic |
| `src/pages/SocialPage.tsx` | Remove `invalid_category` check based on `getMainCategory` — trust `card_type === 'Social Page'`; fetch by card_code not publicCode |
| `src/components/public/PublicCardView.tsx` | Fix field names (`instagram` not `instagram_url`, `facebook` not `facebook_url`, etc.) |

---

## F. SOCIAL PAGE STATUS

**⚠️ Partially broken** due to wrong `business_data` field names.

- `SocialPage.tsx` resolves card by `publicCode` (e.g. `0001`) — this works via `resolveCardByPayload`
- But then `getMainCategory()` rejects any `card_type` it doesn't know, blocking valid Social Page cards with category names like `Social Page` ← This is a real issue.
- `PublicCardView.tsx` reads `bizData.instagram_url` but API returns `bizData.instagram` — **no links will render**

---

## G. BUSINESS_DATA STATUS

**❌ Field names mismatch — CRITICAL**

| API Field | Frontend Field | Status |
|-----------|---------------|--------|
| `business_name` | `name` | ❌ WRONG |
| `logo` | `logo_url` | ❌ WRONG |
| `instagram` | `instagram_url` | ❌ WRONG |
| `facebook` | `facebook_url` | ❌ WRONG |
| `tiktok` | `tiktok_url` | ❌ WRONG |
| `website` | `website_url` | ❌ WRONG |
| `google_maps` | `google_review_url` | ❌ WRONG (semantics differ too) |
| `whatsapp` | `whatsapp` | ✅ OK |
| `phone` | `phone` | ✅ OK |
| `description` | `description` | ✅ OK |
| `email` | not in frontend | ❌ MISSING |

**The API returns `business_data.business_name` and `business_data.instagram` etc.** The frontend reads `business_data.name` and `business_data.instagram_url` — so all links on the Social Page are invisible.

Additionally `saveCardBusinessData()` sends data through `PUT /api/cards/:id/redirect` with an extra `business_data` body field. The API docs show `/redirect` only accepts `{ redirect_url: string }`. Business data must go through `PUT /api/cards/:id` as `{ business_data: {...} }`.

---

## H. QR/NFC STATUS

✅ **Architecture is correct:**
- QR code printed = `https://smart-card-qr-api.koyeb.app/r/CARD-XXXX`
- Backend redirects to `current_redirect_url`
- For Social Page: `current_redirect_url` = `https://yourapp.com/social/CARD-XXXX`

⚠️ **Issue:** `saveCardBusinessData()` in `cardService.ts` sets `current_redirect_url` to `/social/${cardCode}` where `cardCode` is the full `CARD-XXXX` string. This is correct behavior — but the logic fetches all cards (100) just to find the current card. Should use `GET /api/cards/:id` directly.

⚠️ **Issue:** Batch generation uses `redirectUrl = 'https://example.com'` as placeholder — acceptable for blank cards, but should use the correct frontend URL for Social Page types.

---

## I. AUTH STATUS

✅ **Correct:**
- JWT stored in `localStorage` under key `nfc_admin_access_token`
- All protected endpoints include `Authorization: Bearer <token>`
- Public endpoints (`/auth/login`, `/r/`) explicitly excluded
- `GET /api/categories/*` — ALL require auth ← Currently no category client exists

---

## J. MOCK/LOCAL/HARDCODED DATA FOUND

| Location | Issue |
|----------|-------|
| `src/services/mockData.ts` | Full mock database — `mockUsers`, `mockBusinesses`, `mockQRCodes`, `mockQREvents` — still exists and exported |
| `src/services/qrService.ts` | Uses `mockQRCodes` and `mockBusinesses` — a fully fake QR service still active |
| `src/services/businessService.ts` | Uses `mockBusinesses` — fake business service |
| `src/services/index.ts` | Exports `mockData` publicly |
| `src/types/index.ts` `getMainCategory()` | Hardcoded category buckets — frontend-only invention |
| `AdminInventoryPage.tsx` L358-407 | Hardcoded category filter pills: `ALL`, `Google Review`, `Social Media`, `Payment` |
| `AdminInventoryPage.tsx` L317 | Hardcoded stat `6` for "التصنيفات" |
| `BatchGenerateCardsModal.tsx` L37-41 | `CARD_TYPE_OPTIONS` — hardcoded array of 3 types |
| `CardDetailsDrawer.tsx` L44-48 | `CARD_TYPE_OPTIONS` — hardcoded 3 types |
| `cardService.ts` L107 | `redirectUrl = 'https://example.com'` — hardcoded placeholder |
| `SocialPage.tsx` L30-35 | Validates `getMainCategory() === 'Social'` — blocks valid cards |
| `PublicCardView.tsx` L264 | `bizData.logo_url` — wrong field name |
| `PublicCardView.tsx` L332 | `bizData.instagram_url` — wrong field name |
| `PublicCardView.tsx` L344 | `bizData.facebook_url` — wrong field name |
| `PublicCardView.tsx` L356 | `bizData.tiktok_url` — wrong field name |
| `PublicCardView.tsx` L368 | `bizData.website_url` — wrong field name |
| `AdminScanPage.tsx` L44-50 | Form state uses old `BusinessData` field names |
| No `?data=` or Base64 | ✅ Not found in active code (only in legacy adapter `apiCardToCardItem`) |

---

## K. TYPESCRIPT STATUS

`npx tsc --noEmit` → **0 errors** (current codebase compiles clean)

---

## L. BUILD STATUS

Not yet run. Will run after changes.

---

## M. PRODUCTION API TEST STATUS

- `GET /api/lookup/group/card_type` → **200 OK, returns `[]`** (no lookup entries seeded yet — auto-populates when cards are created)
- `POST /api/auth/login` → **401** (correct credentials not available in this session — API is live and reachable)
- Production backend: **`https://smart-card-qr-api.koyeb.app`** — ✅ Live and responding

---

## SUMMARY OF REQUIRED CHANGES

### Priority 1 — CRITICAL (broken functionality)
1. **Fix `BusinessData` type and all field names** → backend uses `business_name`, `logo`, `instagram`, `facebook`, `tiktok`, `website`, `google_maps`
2. **Fix `saveCardBusinessData`** → use `PUT /api/cards/:id` with `{ business_data }`, not `/redirect`
3. **Fix `PublicCardView`** → use correct field names so links render
4. **Fix `SocialPage`** → remove `getMainCategory()` gating; check `card_type === 'Social Page'` directly

### Priority 2 — NEW FEATURE
5. **Create `categoriesApi.ts`** — full CRUD client
6. **Create `AdminCategoriesPage.tsx`** — `/admin/categories` with full CRUD UI
7. **Add route + sidebar link**

### Priority 3 — DYNAMIC CATEGORIES
8. **Update `BatchGenerateCardsModal`** — load card types from lookup API; add `category_id` selector loading from categories API
9. **Update `CardDetailsDrawer`** — load categories dynamically for edit
10. **Update `AdminInventoryPage`** — load categories dynamically for filter

### Priority 4 — TYPES & CLEANUP
11. **Update TypeScript types** — add `ApiCategory`, fix `ApiCreateCardDto`, `ApiUpdateCardDto`, `ApiCard`
12. **Remove/isolate mock data** — `mockData.ts`, `qrService.ts`, `businessService.ts`
