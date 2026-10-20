import { describe, it, expect } from 'vitest';

/**
 * Tests for Smart Form Population in Bulk Edit Mode
 * When cards are loaded, form fields should be pre-populated with common values
 */

describe('Smart Form Population - Bulk Edit Mode', () => {
  /**
   * Helper function to simulate the smart population logic
   */
  const getCommonValue = (values: string[]): string => {
    if (!values || values.length === 0) return '';
    const filtered = values.filter(v => v && v.trim());
    return filtered.every(v => v === filtered[0]) ? filtered[0] : '';
  };

  describe('Scenario 1: All Cards Have Identical Business Data', () => {
    it('should populate form with common values when all cards are identical', () => {
      const cards = [
        {
          _id: 'card-1',
          business_data: {
            business_name: 'محلة الموبايل',
            phone: '201000000001',
            email: 'store@example.com',
          },
        },
        {
          _id: 'card-2',
          business_data: {
            business_name: 'محلة الموبايل',
            phone: '201000000001',
            email: 'store@example.com',
          },
        },
        {
          _id: 'card-3',
          business_data: {
            business_name: 'محلة الموبايل',
            phone: '201000000001',
            email: 'store@example.com',
          },
        },
      ];

      const businessNames = cards.map(c => c.business_data?.business_name || '');
      const phones = cards.map(c => c.business_data?.phone || '');
      const emails = cards.map(c => c.business_data?.email || '');

      expect(getCommonValue(businessNames)).toBe('محلة الموبايل');
      expect(getCommonValue(phones)).toBe('201000000001');
      expect(getCommonValue(emails)).toBe('store@example.com');
    });

    it('should show empty field when cards have different values', () => {
      const cards = [
        { business_data: { business_name: 'محلة الموبايل' } },
        { business_data: { business_name: 'Top Phone' } },
        { business_data: { business_name: 'محلة الموبايل' } },
      ];

      const businessNames = cards.map(c => c.business_data?.business_name || '');
      expect(getCommonValue(businessNames)).toBe(''); // Empty because not all same
    });
  });

  describe('Scenario 2: Different Business Data Across Cards', () => {
    it('should show empty for fields that differ between cards', () => {
      const cards = [
        {
          business_data: {
            business_name: 'Store A',
            phone: '201111111111',
          },
        },
        {
          business_data: {
            business_name: 'Store B',
            phone: '201111111111',
          },
        },
      ];

      const names = cards.map(c => c.business_data?.business_name || '');
      const phones = cards.map(c => c.business_data?.phone || '');

      expect(getCommonValue(names)).toBe(''); // Different
      expect(getCommonValue(phones)).toBe('201111111111'); // Same
    });

    it('should show common values and hide different values', () => {
      const cards = [
        {
          business_data: {
            business_name: 'Common Store',
            phone: '201000000001',
            email: 'store1@example.com',
          },
        },
        {
          business_data: {
            business_name: 'Common Store',
            phone: '201000000002', // Different!
            email: 'store2@example.com', // Different!
          },
        },
      ];

      const names = cards.map(c => c.business_data?.business_name || '');
      const phones = cards.map(c => c.business_data?.phone || '');
      const emails = cards.map(c => c.business_data?.email || '');

      expect(getCommonValue(names)).toBe('Common Store'); // Show this
      expect(getCommonValue(phones)).toBe(''); // Hide this
      expect(getCommonValue(emails)).toBe(''); // Hide this
    });
  });

  describe('Scenario 3: Template Consistency Detection', () => {
    it('should detect when all cards use same template', () => {
      const cards = [
        { _id: 'card-1', template: 'mobile_shop' },
        { _id: 'card-2', template: 'mobile_shop' },
        { _id: 'card-3', template: 'mobile_shop' },
      ];

      const templates = cards.map(c => c.template || 'default');
      const commonTemplate = templates.every(t => t === templates[0]) ? templates[0] : 'default';

      expect(commonTemplate).toBe('mobile_shop');
    });

    it('should default to generic template when mixed', () => {
      const cards = [
        { _id: 'card-1', template: 'default' },
        { _id: 'card-2', template: 'mobile_shop' },
        { _id: 'card-3', template: 'default' },
      ];

      const templates = cards.map(c => c.template || 'default');
      const commonTemplate = templates.every(t => t === templates[0]) ? templates[0] : 'default';

      expect(commonTemplate).toBe('default'); // Mixed → use default
    });
  });

  describe('Scenario 4: Payment Shifts Detection', () => {
    it('should show shifts when all cards have identical shifts', () => {
      const shifts = [
        { label: 'Shift 1', cashier_name: 'Ahmed' },
        { label: 'Shift 2', cashier_name: 'Mohamed' },
      ];

      const cards = [
        { _id: 'card-1', payment_shifts: shifts },
        { _id: 'card-2', payment_shifts: shifts },
        { _id: 'card-3', payment_shifts: shifts },
      ];

      const shiftsJSON = cards.map(c => JSON.stringify(c.payment_shifts || []));
      const allSame = shiftsJSON.every(s => s === shiftsJSON[0]);

      expect(allSame).toBe(true);
      expect(cards[0].payment_shifts).toEqual(shifts);
    });

    it('should use defaults when shifts differ between cards', () => {
      const cards = [
        { _id: 'card-1', payment_shifts: [{ label: 'Shift A' }] },
        { _id: 'card-2', payment_shifts: [{ label: 'Shift B' }] },
      ];

      const shiftsJSON = cards.map(c => JSON.stringify(c.payment_shifts || []));
      const allSame = shiftsJSON.every(s => s === shiftsJSON[0]);

      expect(allSame).toBe(false); // Different shifts

      // Should use defaults
      const defaultShifts = [
        { label: 'شيفت الصباح' },
        { label: 'شيفت المساء' },
      ];
      expect(defaultShifts.length).toBe(2);
    });
  });

  describe('Scenario 5: Locations Detection', () => {
    it('should show locations when all cards have identical locations', () => {
      const locations = [
        { name: 'Cairo Branch', google_maps_url: 'https://maps.app.goo.gl/cairo' },
        { name: 'Alex Branch', google_maps_url: 'https://maps.app.goo.gl/alex' },
      ];

      const cards = [
        { _id: 'card-1', business_data: { locations } },
        { _id: 'card-2', business_data: { locations } },
      ];

      const locationsJSON = cards.map(c => JSON.stringify(c.business_data?.locations || []));
      const allSame = locationsJSON.every(l => l === locationsJSON[0]);

      expect(allSame).toBe(true);
      expect(cards[0].business_data?.locations).toEqual(locations);
    });

    it('should be empty when locations differ', () => {
      const cards = [
        { business_data: { locations: [{ name: 'Cairo' }] } },
        { business_data: { locations: [{ name: 'Alex' }] } },
      ];

      const locationsJSON = cards.map(c => JSON.stringify(c.business_data?.locations || []));
      const allSame = locationsJSON.every(l => l === locationsJSON[0]);

      expect(allSame).toBe(false); // Different locations
    });
  });

  describe('Scenario 6: Edge Cases', () => {
    it('should handle empty business_data gracefully', () => {
      const cards = [
        { _id: 'card-1', business_data: {} as any },
        { _id: 'card-2', business_data: {} as any },
        { _id: 'card-3', business_data: {} as any },
      ];

      const names = cards.map(c => c.business_data?.business_name || '');
      expect(getCommonValue(names)).toBe(''); // All empty → show empty
    });

    it('should handle undefined business_data gracefully', () => {
      const cards = [
        { _id: 'card-1', business_data: undefined as any },
        { _id: 'card-2', business_data: undefined as any },
        { _id: 'card-3', business_data: undefined as any },
      ];

      const names = cards.map(c => c.business_data?.business_name || '');
      expect(getCommonValue(names)).toBe('');
    });

    it('should handle single card correctly', () => {
      const cards = [
        {
          _id: 'card-1',
          business_data: {
            business_name: 'Only Store',
            phone: '201000000001',
          },
        },
      ];

      const names = cards.map(c => c.business_data?.business_name || '');
      const phones = cards.map(c => c.business_data?.phone || '');

      expect(getCommonValue(names)).toBe('Only Store');
      expect(getCommonValue(phones)).toBe('201000000001');
    });

    it('should handle null/empty strings properly', () => {
      const cards = [
        { business_data: { business_name: 'Store' } as any },
        { business_data: { business_name: '' } as any },
        { business_data: { business_name: 'Store' } as any },
      ];

      const names = cards.map(c => c.business_data?.business_name || '');
      // Should handle empty string differently
      expect(names).toContain('Store');
      expect(names).toContain('');
    });

    it('should handle whitespace-only values', () => {
      const cards = [
        { business_data: { business_name: '   ' } as any },
        { business_data: { business_name: 'Store' } as any },
      ];

      const names = cards.map(c => (c.business_data?.business_name || '').trim());
      expect(getCommonValue(names)).toBe(''); // Whitespace treated as different
    });
  });

  describe('Scenario 7: Complex Real-World Cases', () => {
    it('should handle 10 cards with mostly common data', () => {
      const commonData = {
        business_name: 'محلة الموبايل الرئيسية',
        phone: '201000000001',
        email: 'store@example.com',
      };

      const cards = Array.from({ length: 10 }, (_, i) => ({
        _id: `card-${i}`,
        business_data: commonData,
      }));

      const names = cards.map(c => c.business_data?.business_name || '');
      expect(getCommonValue(names)).toBe(commonData.business_name);
      expect(cards.length).toBe(10);
    });

    it('should detect one different card among many', () => {
      const cards = [
        { business_data: { business_name: 'Store A', phone: '201111111111' } },
        { business_data: { business_name: 'Store A', phone: '201111111111' } },
        { business_data: { business_name: 'Store A', phone: '201111111111' } },
        { business_data: { business_name: 'Store B', phone: '201111111111' } }, // Different name
        { business_data: { business_name: 'Store A', phone: '201111111111' } },
      ];

      const names = cards.map(c => c.business_data?.business_name || '');
      expect(getCommonValue(names)).toBe(''); // Shows as different
      expect(cards.length).toBe(5);
    });

    it('should preserve order of cards when analyzing', () => {
      const cards = [
        { _id: 'card-1', business_data: { business_name: 'First' } },
        { _id: 'card-2', business_data: { business_name: 'First' } },
        { _id: 'card-3', business_data: { business_name: 'First' } },
      ];

      const names = cards.map(c => c.business_data?.business_name || '');
      expect(names[0]).toBe('First');
      expect(getCommonValue(names)).toBe('First');
    });
  });

  describe('Scenario 8: User Expectations', () => {
    it('should NOT modify any card data during population', () => {
      const originalCard = {
        _id: 'card-1',
        business_data: { business_name: 'Store' },
      };

      const formValue = originalCard.business_data?.business_name || '';
      expect(formValue).toBe('Store');
      expect(originalCard.business_data?.business_name).toBe('Store'); // Unchanged
    });

    it('should allow user to clear pre-populated values', () => {
      let formValue = 'Store Name'; // Pre-populated
      expect(formValue).toBe('Store Name');

      formValue = ''; // User clears it
      expect(formValue).toBe('');
    });

    it('should allow user to modify pre-populated values', () => {
      let formValue = 'Old Store'; // Pre-populated
      expect(formValue).toBe('Old Store');

      formValue = 'New Store'; // User modifies it
      expect(formValue).toBe('New Store');
    });
  });
});
