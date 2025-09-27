import { describe, it, expect } from 'vitest';
import { parseDate, validateDateRange, formatDuration } from './helpers.js';

describe('Utility Functions', () => {
  describe('parseDate', () => {
    it('should parse valid date strings', () => {
      const date = parseDate('2025-01-15');
      expect(date).toBeInstanceOf(Date);
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(0); // January is 0
      expect(date.getDate()).toBe(15);
    });

    it('should throw error for invalid date strings', () => {
      expect(() => parseDate('invalid-date')).toThrow('Invalid date format');
    });
  });

  describe('validateDateRange', () => {
    it('should not throw for valid date ranges', () => {
      const since = new Date('2025-01-01');
      const until = new Date('2025-01-31');
      expect(() => validateDateRange(since, until)).not.toThrow();
    });

    it('should throw error when since is after until', () => {
      const since = new Date('2025-01-31');
      const until = new Date('2025-01-01');
      expect(() => validateDateRange(since, until)).toThrow(
        'Start date must be before end date'
      );
    });
  });

  describe('formatDuration', () => {
    it('should format duration in seconds', () => {
      const start = new Date('2025-01-01T00:00:00Z');
      const end = new Date('2025-01-01T00:00:30Z');
      expect(formatDuration(start, end)).toBe('30s');
    });

    it('should format duration in minutes and seconds', () => {
      const start = new Date('2025-01-01T00:00:00Z');
      const end = new Date('2025-01-01T00:02:30Z');
      expect(formatDuration(start, end)).toBe('2m 30s');
    });

    it('should format duration in hours and minutes', () => {
      const start = new Date('2025-01-01T00:00:00Z');
      const end = new Date('2025-01-01T01:30:00Z');
      expect(formatDuration(start, end)).toBe('1h 30m');
    });
  });
});
