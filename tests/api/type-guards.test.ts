import { describe, expect, it } from 'vitest';

import { from, isMoneyInput } from '@/index';

describe('isMoneyInput', () => {
  it('should return true for a number', () => {
    expect(isMoneyInput(19.99)).toBe(true);
  });

  it('should return true for zero', () => {
    expect(isMoneyInput(0)).toBe(true);
  });

  it('should return true for a negative number', () => {
    expect(isMoneyInput(-10)).toBe(true);
  });

  it('should return true for a MoneyContract instance', () => {
    expect(isMoneyInput(from(10, 'BR'))).toBe(true);
  });

  it('should return false for a string', () => {
    expect(isMoneyInput('19.99')).toBe(false);
  });

  it('should return false for null', () => {
    expect(isMoneyInput(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isMoneyInput(undefined)).toBe(false);
  });

  it('should return false for a plain object', () => {
    expect(isMoneyInput({ amount: 10 })).toBe(false);
  });

  it('should return false for an array', () => {
    expect(isMoneyInput([10])).toBe(false);
  });

  it('should return false for a boolean', () => {
    expect(isMoneyInput(true)).toBe(false);
  });
});
