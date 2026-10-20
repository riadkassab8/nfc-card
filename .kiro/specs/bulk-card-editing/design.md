# Design Document: Bulk Card Editing Feature

## Overview

The bulk card editing feature extends the existing `AdminEditCardPage` component to support editing multiple cards linked to a customer simultaneously. The feature intelligently skips Step 1 (which contains card-specific fields like card code and category) and focuses on Steps 2-4 where shared business profile, contact information, payment methods, and shift data can be edited across all selected cards.

**Key Design Principle**: Reuse the existing AdminEditCardPage component with a new "bulk edit" mode, rather than creating a separate component. This ensures consistency in UI/UX and reduces code duplication.

## Architecture

### Component Structure

```
CustomerDetailsPage
├── "Edit All Associated Cards" button (NEW)
│   └── onClick → navigate to AdminEditCardPage with bulk edit params
│
AdminEditCardPage (MODIFIED)
├── Query params detection
│   ├── Single card mode: ?id=<cardId>
│   └── Bulk edit mode: ?bulkCustomerId=<customerId> (NEW)
├── Step 1 conditional rendering (hidden in bulk mode)
├── Steps 2-4 (render normally)
├── Affected cards summary (NEW, in bulk mode)
└── Bulk update handler (NEW)
```

### URL Routing

**Single Card Edit** (existing):
```
/admin/cards/{id}/edit
```

**Bulk Card Edit** (new):
```
/admin/cards/bulk-edit?customerId={customerId}
```

### State Management Flow

```
1. User clicks "Edit All Associated Cards" on CustomerDetailsPage
2. Navigate to AdminEditCardPage with customerId param
3. AdminEditCardPage detects bulk mode
4. Fetch all cards for the customer
5. Display affected cards summary
6. Initialize form with empty/default values (not from a specific card)
7. User edits shared fields (Steps 2-4)
8. On save: Apply changes to ALL cards in the set
9. Show success/error feedback
10. Redirect to CustomerDetailsPage
```

## Components and Interfaces

### New Props for AdminEditCardPage

```typescript
interface AdminEditCardPageProps {
  // Single card mode (existing)
  id?: string;
  
  // Bulk edit mode (new)
  bulkCustomerId?: string;
  bulkCardIds?: string[];
}
```

### New Types

```typescript
interface BulkEditState {
  mode: 'single' | 'bulk';
  customerId?: string;
  cardIds: string[];
  affectedCards: ApiCard[];
}
```

### Modified Hooks

```typescript
// NEW: Detect bulk vs. single mode from URL params
const { id, customerId, cardIds } = useParams();
const bulkMode = !id && !!customerId;
const editMode: 'single' | 'bulk' = bulkMode ? 'bulk' : 'single';

// NEW: Fetch all cards for customer in bulk mode
useEffect(() => {
  if (bulkMode && customerId) {
    customersApi.getCustomerById(customerId)
      .then(data => {
        const cardIds = data.cards.map(c => c._id);
        setAffectedCards(data.cards);
      });
  }
}, [bulkMode, customerId]);
```

### Modified handleSubmit Handler

```typescript
const handleSubmit = async () => {
  // Bulk mode: update all cards
  if (editMode === 'bulk') {
    for (const cardId of cardIds) {
      // Build update DTO excluding Step 1 fields
      const updateDto = buildBulkUpdateDto(formData);
      
      try {
        await cardsApi.updateCard(cardId, updateDto);
      } catch (err) {
        // Track failures, show which cards failed
      }
    }
  }
  // Single mode: update single card (existing logic)
};
```

## Data Models

### Update DTO for Bulk Edit

```typescript
interface BulkCardUpdateDto {
  // Step 2 fields (Business Profile & Contact)
  business_data?: BusinessData;
  
  // Step 3 fields (Cashier & Payment)
  payment_shifts?: PaymentShift[];
  
  // Step 4 already handles summary only
  
  // EXCLUDE from bulk update:
  // - card_code
  // - category_id
  // - card_type
  // - custom_slug
  // - requires_subscription
  // - template (in most cases, but may vary)
  // - current_redirect_url (unless explicitly set)
}
```

## UI/UX Modifications

### 1. CustomerDetailsPage Changes

**Location**: Cards table section, in the header where action buttons are

**New Button**:
```tsx
<button
  onClick={() => navigate(`/admin/cards/bulk-edit?customerId=${customer._id}`)}
  disabled={cards.length === 0}
  className="btn-primary"
  style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 18px',
  }}
  title="Edit business data and payment info for all cards at once"
>
  <Edit2 size={15} />
  تعديل جميع الكروت المرتبطة
</button>
```

**Placement**: Next to the existing "+ ربط كروت بهذا العميل" button

### 2. AdminEditCardPage Changes

#### Header Title (Conditional)

**Single Mode** (existing):
```
تعديل البطاقة CARD-0001
```

**Bulk Mode** (new):
```
تعديل جميع الكروت المرتبطة بـ [Customer Name]
```

#### Step Indicator (Conditional)

**Single Mode**: Steps 1, 2, 3, 4
**Bulk Mode**: Steps 1 (hidden), 2, 3, 4 → Display as Steps 1, 2, 3 (renumbered for clarity)

#### Affected Cards Summary (Bulk Mode Only)

**Location**: Below the header, above Step 2 content

**Content**:
```
┌─────────────────────────────────────────────────────┐
│ تحرير 3 بطاقات مرتبطة بهذا العميل                   │
├─────────────────────────────────────────────────────┤
│ • CARD-0001 (Default Template) - نشطة              │
│ • CARD-0002 (Mobile Shop) - نشطة                   │
│ • CARD-0003 (Default Template) - معطلة             │
├─────────────────────────────────────────────────────┤
│ ⚠️ ملاحظة: سيتم تطبيق البيانات التالية فقط:          │
│ • بيانات النشاط التجاري والتواصل                    │
│ • طرق الدفع والشيفتات                              │
│ بينما تبقى البيانات الخاصة بكل كارت (الكود، الفئة)  │
│ دون تغيير                                           │
└─────────────────────────────────────────────────────┘
```

#### Conditional Field Rendering

**If all cards share same template**:
- Show all fields normally (current behavior)

**If mixed templates**:
- Show warning banner
- Display template-specific fields with conditionals
- Example:
  ```tsx
  {/* Mobile Shop fields - only shown if at least one card is mobile_shop */}
  {hasTemplate('mobile_shop') && (
    <div className="template-note">
      ⚠️ الحقول التالية ستُطبق فقط على كروت نوع "كاشير محلات الموبايل":
      <ShiftBuilderSection />
    </div>
  )}
  ```

### 3. Form Initialization (Bulk Mode)

**Current Behavior** (single mode):
- Load all fields from the single card

**New Behavior** (bulk mode):
- Initialize business_data with empty values (or with common values if all cards have the same data)
- Initialize payment_shifts with empty array or default shifts
- Show placeholder text: "اترك الحقل فارغاً للاحتفاظ بالبيانات الحالية لكل كارت"

### 4. Navigation Flow (Bulk Mode)

**Step 2** (Business Profile & Contact):
- "Previous" button → Navigate back to CustomerDetailsPage
- "Next" button → Go to Step 3

**Step 3** (Cashier & Payment):
- "Previous" button → Go back to Step 2
- "Next" button → Go to Step 4

**Step 4** (Review & Confirm):
- "Edit" links → Go to specific step (Steps 2, 3, 4 only, not Step 1)
- "Back" button → Go to Step 3
- "Save Changes" button → Execute bulk update and redirect to CustomerDetailsPage

## Error Handling

### Partial Failure Scenario

**Scenario**: 3 cards being updated, 2 succeed, 1 fails

**Flow**:
1. Show error dialog with details:
   ```
   ⚠️ تم حفظ البيانات في 2 من 3 بطاقات بنجاح
   
   الكروت المحدثة:
   ✓ CARD-0001
   ✓ CARD-0002
   
   الكروت التي فشلت:
   ✗ CARD-0003 (Server error: Business name too long)
   
   [Retry Failed] [Go Back]
   ```

2. On "Retry Failed": Attempt to update failed cards again
3. On "Go Back": Return to review step to edit and try again

### Network Error

**Scenario**: Network fails during bulk update

**Flow**:
1. Show toast error
2. Offer "Retry" button
3. Log failed card IDs for retry

## Testing Strategy

### Unit Tests

- **Test**: Detect bulk mode from URL params
- **Test**: Render affected cards summary with correct data
- **Test**: Hide Step 1 indicator in bulk mode
- **Test**: Initialize form with empty values in bulk mode
- **Test**: Build bulk update DTO (exclude Step 1 fields)
- **Test**: Handle partial failures in bulk update

### Property-Based Tests

- **Property 1**: For any customer with N cards, bulk edit should target exactly N cards
- **Property 2**: Applying bulk changes to N cards should result in N successful updates or appropriate error handling
- **Property 3**: Step 1 fields should never be modified during bulk edit (invariant)
- **Property 4**: Business data should be consistent across all N cards after bulk update

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Bulk Edit Affects All Target Cards

*For any* customer with N cards and any set of business data changes, applying bulk edit should result in ALL N cards being updated with the new business data.

**Validates: Requirements 3.1, 3.2**

### Property 2: Step 1 Fields Remain Unchanged

*For any* set of cards in bulk edit mode and any Step 1 field (card_code, category_id, card_type, custom_slug), the value of that field in the database after bulk edit should equal its value before bulk edit.

**Validates: Requirements 4.1, 4.2**

### Property 3: Bulk Mode Never Displays Step 1

*For any* bulk edit session accessed with a valid customerId parameter, the UI should NOT render any Step 1 form fields or Step 1 stepper indicator.

**Validates: Requirements 2.1, 2.2**

### Property 4: Affected Cards List Matches Customer Cards

*For any* customer with M associated cards, the affected cards list displayed in bulk edit mode should contain exactly M cards and match the result of querying the customer's card list from the API.

**Validates: Requirements 5.1, 5.2**

### Property 5: Template Handling Consistency

*For any* set of cards with mixed templates and template-specific fields (e.g., shifts for mobile_shop), applying bulk edit should apply template-agnostic fields (business name, logo, phone) to all cards, while template-specific fields are applied only to matching templates.

**Validates: Requirements 6.1, 6.2, 6.3**

## Error Handling & Resilience

### Scenarios Covered

1. **Empty Card List**: Disable button, show message "No cards to edit"
2. **Partial Failure**: Retry with detailed error feedback per card
3. **Network Timeout**: Graceful fallback, allow retry
4. **Invalid Customer ID**: Redirect to customer list with error message
5. **Cards Deleted During Edit**: Detect and warn user before save

## Performance Considerations

- **Pagination**: If customer has 100+ cards, consider pagination or chunked updates
- **Optimistic Updates**: Consider optimistic UI updates while waiting for backend confirmation
- **Batch API**: If available, use batch update endpoint instead of individual requests

