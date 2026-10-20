# Requirements Document: Bulk Card Editing Feature

## Introduction

This feature allows users to efficiently edit multiple cards that are linked to the same customer from a single interface. Instead of editing each card individually (which requires navigating to each card's edit page), users can now edit all cards associated with a customer with shared data in one go.

**Use Case**: A customer has multiple physical cards (NFC, QR, etc.). When the customer updates their business information (name, logo, contact details, payment methods, shift times), instead of manually updating each card one by one, the user can now click "Edit All Associated Cards" from the customer's detail page and apply changes to all cards at once.

## Glossary

- **Customer**: A registered user/business that may have multiple associated cards
- **Card**: A digital or physical card (NFC/QR) linked to a customer
- **Bulk Edit**: Editing multiple cards simultaneously using shared form data
- **Step 1 (Card Identity)**: Form fields specific to individual cards (card code, category, template, subscription type, custom slug)
- **Step 2-4 (Business Profile)**: Form fields shared across cards (business name, logo, contact info, payment methods, shifts, locations)
- **AdminEditCardPage**: The existing single-card edit page with 4 steps
- **CustomerDetailsPage**: The customer profile page where associated cards are displayed

## Requirements

### Requirement 1: Add Bulk Edit Button

**User Story**: As an admin, I want to access a bulk editing interface from the customer details page, so that I can efficiently update shared data across all cards linked to a customer without editing each card individually.

#### Acceptance Criteria

1. WHEN on the CustomerDetailsPage viewing a customer with one or more associated cards, THE system SHALL display a prominent "Edit All Associated Cards" button near the existing action buttons (alongside "Assign Cards", "Edit Customer", etc.)
2. THE button SHALL be clearly labeled to indicate bulk editing of multiple cards
3. WHEN the button is clicked, THE system SHALL navigate to a modified edit interface that starts directly at Step 2 (skipping Step 1)
4. THE button SHALL be disabled or hidden if the customer has zero associated cards

### Requirement 2: Skip Step 1 in Bulk Edit Mode

**User Story**: As an admin using bulk edit mode, I don't need to see card-specific fields (like card code or category) since those differ between individual cards, so the interface should start from Step 2 where shared business data can be edited.

#### Acceptance Criteria

1. WHEN bulk edit mode is initiated with a customer ID and card list, THE system SHALL skip Step 1 (Card Identity & Template) and start directly at Step 2 (Business Profile & Contact Info)
2. WHEN the stepper navigation is rendered in bulk mode, THE Step 1 indicator SHALL NOT be displayed or rendered
3. THE form validation for Step 1 SHALL be bypassed in bulk mode since those fields are not applicable
4. WHEN navigating backward from Step 2, THE system SHALL navigate to the previous section or to the customer details page (not back to Step 1)

### Requirement 3: Apply Changes to All Associated Cards

**User Story**: As an admin, when I save changes in bulk edit mode, the system should update all selected cards with the shared data (business profile, contact info, payment methods, shifts, locations), ensuring consistency across all the customer's cards.

#### Acceptance Criteria

1. WHEN the admin modifies form fields in Step 2, Step 3, or Step 4 in bulk edit mode, THE system SHALL collect and prepare these changes for all associated cards
2. WHEN the "Save Changes" button is clicked on Step 4, THE system SHALL send update requests to apply the changes to ALL cards linked to the customer
3. THE changes SHALL be applied to business_data, payment_shifts, template settings, and other shared fields for each card
4. IF an update for any card fails, THE system SHALL display an error message specifying which card failed and allow retry or partial save
5. WHEN all updates complete successfully, THE system SHALL show a success message and redirect to the customer details page

### Requirement 4: Preserve Card-Specific Data

**User Story**: As an admin using bulk edit, I want assurance that card-specific fields (like card code, custom slug, category, card type) remain unchanged, and only the shared business profile data is modified across all cards.

#### Acceptance Criteria

1. WHEN bulk editing is in progress, THE system SHALL NOT modify Step 1 fields (card_code, category_id, card_type, custom_slug, requires_subscription, template, redirect_url) for any of the cards
2. WHEN saving bulk changes, THE update payload for each card SHALL exclude Step 1 fields and include ONLY Step 2-4 fields (business_data, payment_shifts, etc.)
3. IF a card has a different template than others (e.g., one card is "mobile_shop" and another is "default"), THE system SHALL still apply business_data changes but handle template-specific fields appropriately

### Requirement 5: Display Affected Cards Summary

**User Story**: As an admin, when I enter bulk edit mode, I want to see which cards will be affected by my changes, so I can be confident I'm editing the right set of cards.

#### Acceptance Criteria

1. WHEN bulk edit mode is initiated, THE system SHALL display a summary showing the number and list of cards that will be affected
2. THE summary SHALL show each card's code, current template, and status
3. THE summary SHALL be clearly visible at the top of Step 2 or in a dedicated section
4. THE summary SHALL remind the user that Step 1 (card-specific) fields will NOT be changed

### Requirement 6: Handle Template Variations

**User Story**: As an admin editing multiple cards with different templates (some "default", some "mobile_shop"), the form should intelligently display or adapt fields based on which templates are present in the selected card set.

#### Acceptance Criteria

1. IF all selected cards share the same template, THE form SHALL display only the fields relevant to that template (normal behavior)
2. IF selected cards have mixed templates (e.g., both "default" and "mobile_shop"), THE system SHALL display a warning that indicates which fields will be applied to which template
3. WHEN template-specific fields are shown (e.g., shift builder for mobile_shop), THE system SHALL apply those changes only to cards with the matching template

### Requirement 7: Navigation & State Management

**User Story**: As an admin, I want smooth navigation between steps in bulk edit mode and a clear way to return to the customer details page if I change my mind.

#### Acceptance Criteria

1. WHEN in bulk edit mode, THE stepper progress indicator SHALL reflect steps 2, 3, and 4 (not step 1)
2. WHEN the "Back" button is clicked on Step 2, THE system SHALL navigate to the customer details page (not to Step 1)
3. WHEN the "Cancel" button is clicked at any step, THE system SHALL confirm the action and return to the customer details page without saving
4. THE page title and header SHALL clearly indicate "Bulk Editing" mode and show the customer name

### Requirement 8: API Integration

**User Story**: As a developer, I need clear API calls to fetch all cards for a customer, and to send bulk updates to multiple cards efficiently.

#### Acceptance Criteria

1. THE system SHALL fetch all cards associated with a customer before entering bulk edit mode
2. WHEN saving bulk changes, THE system SHALL make individual update requests for each card (or batch requests if the API supports it)
3. IF partial failures occur (some cards update successfully, others fail), THE system SHALL retry failed cards or allow the user to retry
4. THE API responses SHALL be handled gracefully with appropriate error messages for each card

