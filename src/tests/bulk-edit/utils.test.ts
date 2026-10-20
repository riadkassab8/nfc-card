import { describe, it, expect } from 'vitest';
import { isBulkMode } from '../../types';

/**
 * TASK 16: Unit Tests for Bulk Mode Detection
 * Validates Requirements: 2.1, 8.1
 */
describe('Bulk Mode Detection - isBulkMode()', () => {
  it('should return true when customerId is provided and cardId is undefined', () => {
    const result = isBulkMode(undefined, '6ac46e143883b08344234133');
    expect(result).toBe(true);
  });

  it('should return false when only cardId is provided (single mode)', () => {
    const result = isBulkMode('6ad5ee3aa43374b0e895bef1', undefined);
    expect(result).toBe(false);
  });

  it('should return false when neither cardId nor customerId are provided', () => {
    const result = isBulkMode(undefined, undefined);
    expect(result).toBe(false);
  });

  it('should return false when both cardId and customerId are provided (single mode takes precedence)', () => {
    const result = isBulkMode('6ad5ee3aa43374b0e895bef1', '6ac46e143883b08344234133');
    expect(result).toBe(false);
  });

  it('should return true with valid MongoDB ObjectId for customerId', () => {
    const result = isBulkMode(undefined, '507f1f77bcf86cd799439011');
    expect(result).toBe(true);
  });

  it('should return true with any truthy customerId string', () => {
    const result = isBulkMode(undefined, 'customer-123');
    expect(result).toBe(true);
  });

  it('should return false when customerId is empty string', () => {
    const result = isBulkMode('6ad5ee3aa43374b0e895bef1', '');
    expect(result).toBe(false);
  });

  it('should return false when customerId is null', () => {
    const result = isBulkMode('6ad5ee3aa43374b0e895bef1', null as any);
    expect(result).toBe(false);
  });
});
