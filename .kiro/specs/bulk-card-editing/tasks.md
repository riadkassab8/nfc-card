# Implementation Plan: Bulk Card Editing Feature

## Overview

This implementation plan breaks down the bulk card editing feature into manageable, incremental coding tasks. Each task builds on the previous ones to create a complete, testable feature. Tasks are organized from foundational (routing, types) through feature implementation (UI, logic) to integration and testing.

## Tasks

- [x] 1. Set up feature routing and navigation structure
  - Add bulk edit route `/admin/cards/bulk-edit?customerId={customerId}` to router configuration
  - Create new `BulkEditCardPage.tsx` wrapper component or modify routing in existing component
  - Implement query parameter parsing for bulk vs. single mode detection
  - _Requirements: 1.1, 7.3_

- [x] 2. Create bulk edit state and types
  - Define `BulkEditState` interface with mode, customerId, cardIds, affectedCards
  - Define `BulkCardUpdateDto` interface excluding Step 1 fields
  - Create utility function `isBulkMode()` to detect mode from route params
  - _Requirements: 2.1, 4.1_

- [x] 3. Modify AdminEditCardPage to detect bulk mode
  - Update `useParams` hook to capture both `id` (single) and `customerId` (bulk) params
  - Add state variable `editMode: 'single' | 'bulk'` based on params
  - Implement conditional logic to set initial state differently for bulk vs. single
  - _Requirements: 2.1, 7.1_

- [x] 4. Fetch and load affected cards for bulk mode
  - Create `useEffect` hook to fetch all cards for customer when in bulk mode
  - Parse `customerId` from params and call `customersApi.getCustomerById(customerId)`
  - Store affected cards list in state and validate it's not empty
  - Show loading indicator while fetching
  - _Requirements: 5.1, 8.1_

- [x] 5. Conditionally hide Step 1 in bulk mode
  - Modify STEPS configuration to conditionally include/exclude Step 1
  - Add conditional rendering to skip Step 1 content block in JSX
  - Adjust stepper progress bar calculation to account for missing step
  - Ensure "Previous" button on Step 2 goes back to customer page in bulk mode
  - _Requirements: 2.1, 2.2_

- [x] 6. Add affected cards summary component
  - Create summary section showing customer name and count of cards to edit
  - Display list of affected card codes with template types and statuses
  - Add warning banner explaining which data will be modified and which will not
  - Show summary on Step 2 in bulk mode
  - _Requirements: 5.1, 5.2_

- [x] 7. Initialize form fields with empty values for bulk mode
  - Modify `populateFromCard` function to handle bulk mode (no single card to load from)
  - Initialize all form fields to empty strings or default values in bulk mode
  - Add placeholder text to fields: "اترك الحقل فارغاً للاحتفاظ بالبيانات الحالية لكل كارت"
  - _Requirements: 3.1_

- [x] 8. Modify page header and title for bulk mode
  - Update page title to show "تعديل جميع الكروت المرتبطة بـ [Customer Name]" in bulk mode
  - Add badge or indicator showing "Bulk Editing" mode vs. "Single Card Editing"
  - Update subtitle to explain which cards are being edited
  - _Requirements: 7.1_

- [x] 9. Implement template variation detection and handling
  - Create utility function `detectTemplateVariations()` to check for mixed templates
  - Show warning banner if templates vary across selected cards
  - Conditionally render template-specific fields with appropriate notes
  - Example: shifts builder only shown for mobile_shop cards
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 10. Build bulk update DTO builder function
  - Create `buildBulkUpdateDto()` function that:
    - Extracts Step 2-4 data from form state
    - Explicitly excludes Step 1 fields (card_code, category_id, etc.)
    - Handles template-specific fields appropriately
  - Validate DTO has correct structure before sending
  - _Requirements: 4.1, 4.2_

- [x] 11. Implement bulk submit handler
  - Modify `handleSubmit()` to detect bulk mode and execute bulk update logic
  - For each card in `affectedCardIds`:
    - Build update DTO
    - Call `cardsApi.updateCard(cardId, updateDto)`
  - Track which updates succeed and which fail
  - Store results for error handling
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 12. Add error handling for partial failures
  - When some cards succeed and some fail:
    - Collect failed card IDs and error messages
    - Display detailed error modal showing successes and failures
    - Offer "Retry Failed" and "Go Back" options
  - Implement retry logic to attempt failed cards again
  - _Requirements: 3.4_

- [x] 13. Add success redirect and feedback
  - After all updates complete successfully:
    - Show success toast message
    - Redirect to CustomerDetailsPage after 2-3 second delay
    - Ensure customer data is refreshed on redirect
  - _Requirements: 3.5_

- [x] 14. Add "Edit All Associated Cards" button to CustomerDetailsPage
  - Open `src/pages/admin/CustomerDetailsPage.tsx`
  - Add new button in action buttons section (near "Assign Cards" button)
  - Button text: "تعديل جميع الكروت المرتبطة"
  - Button action: Navigate to `/admin/cards/bulk-edit?customerId=${customer._id}`
  - Disable button if customer has no cards
  - _Requirements: 1.1_

- [ ] 15. Implement navigation flow for bulk mode
  - Step 2 "Previous": Navigate to `/admin/customers/{customerId}`
  - Step 3 "Previous": Go back to Step 2
  - All "Edit" links in Step 4: Target Step 2, 3, or 4 (skip Step 1)
  - Cancel button: Confirm action, then navigate to customer page
  - _Requirements: 7.2, 7.3, 7.4_

- [ ] 16. Add unit tests for bulk mode detection
  - Test `isBulkMode()` with various URL params
  - Test query parameter parsing in both single and bulk modes
  - Test affected cards list population
  - _Requirements: 2.1, 8.1_

- [ ] 17. Write property test: Bulk edit affects all target cards
  - **Property 1: Bulk Edit Affects All Target Cards**
  - **Validates: Requirements 3.1, 3.2**
  - Generate random customer with N cards
  - Generate random business data changes
  - Execute bulk edit
  - Verify all N cards in database have been updated
  - Verify no other cards were modified

- [ ] 18. Write property test: Step 1 fields remain unchanged
  - **Property 2: Step 1 Fields Remain Unchanged**
  - **Validates: Requirements 4.1, 4.2**
  - For any set of cards and Step 1 fields
  - Capture original Step 1 values (card_code, category_id, etc.)
  - Execute bulk edit with business data changes
  - Verify Step 1 fields equal original values after update

- [ ] 19. Write property test: Bulk mode never displays Step 1
  - **Property 3: Bulk Mode Never Displays Step 1**
  - **Validates: Requirements 2.1, 2.2**
  - Generate bulk edit URL with customerId
  - Load component in bulk mode
  - Verify Step 1 form fields are not in DOM
  - Verify Step 1 stepper indicator not rendered

- [ ] 20. Write property test: Affected cards list matches API
  - **Property 4: Affected Cards List Matches Customer Cards**
  - **Validates: Requirements 5.1, 5.2**
  - For any customer with M cards
  - Load bulk edit page for that customer
  - Verify displayed affected cards list has exactly M items
  - Verify card codes and details match API response

- [ ] 21. Write property test: Template handling consistency
  - **Property 5: Template Handling Consistency**
  - **Validates: Requirements 6.1, 6.2, 6.3**
  - Generate set of cards with mixed templates (some default, some mobile_shop)
  - Execute bulk edit with both generic and template-specific changes
  - Verify generic fields (business_name, logo) applied to all
  - Verify template-specific fields (shifts) applied only to matching templates

- [ ] 22. Integration test: End-to-end bulk edit flow
  - Test complete flow from CustomerDetailsPage to bulk edit to save and redirect
  - Create test customer with 3 cards of mixed templates
  - Click "Edit All Associated Cards" button
  - Edit business name, phone, and shifts
  - Click save
  - Verify all 3 cards updated with new data
  - Verify redirect to customer page
  - _Requirements: 3.1-3.5, 5.1-5.2, 7.1-7.4_

- [ ] 23. Checkpoint - Verify all tests pass
  - Run full test suite for bulk edit feature
  - Verify no regressions in existing card editing (single mode)
  - Verify UI renders correctly in both modes
  - Fix any failing tests or add missing coverage

- [ ] 24. Write integration test: Partial failure handling
  - **Property**: For any set of N cards where K succeed and (N-K) fail, the system should display detailed error with successes and failures
  - Mock API to fail on specific cards
  - Execute bulk update
  - Verify error modal shows correct succeeded/failed counts
  - Test retry logic

- [ ] 25. Write unit tests: Error scenarios
  - Test empty customer (no cards)
  - Test invalid customer ID (404 response)
  - Test network timeout during bulk update
  - Test partial failure scenarios
  - _Requirements: 3.4, 8.4_

- [ ] 26. Manual testing and QA
  - Test on multiple browsers (Chrome, Firefox, Safari)
  - Test on mobile/tablet breakpoints
  - Test with various customer card counts (1, 5, 20, 100+ cards)
  - Test with mixed templates
  - Verify accessibility (keyboard navigation, screen readers)

- [ ] 27. Documentation and code comments
  - Add JSDoc comments to bulk edit functions
  - Document the `buildBulkUpdateDto()` function and what fields are excluded
  - Add comments explaining mode detection logic
  - Update README or component documentation with bulk edit feature overview

## Notes

- All tasks including property-based and integration tests are included for comprehensive, correct implementation.
- Each task builds on previous ones; tasks should be completed in order.
- The component will support both single and bulk modes seamlessly through a single code path with conditional logic.
- No new dependencies are required; the feature uses existing APIs and libraries.
- Bulk mode should feel native to the existing UI/UX, not like a separate feature.

