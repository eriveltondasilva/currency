import { describe, expect, it } from 'vitest';

import {
  CurrencyMismatchError,
  clamp,
  DivisionByZeroError,
  from,
  InvalidRangeError,
  percent,
  zero,
} from '@/index';

describe('percent', () => {
  it('should return 50 when the portion is half of the base', () => {
    expect(percent(50, 100, 'US')).toBe(50);
  });

  it('should return 100 when portion equals the base', () => {
    expect(percent(100, 100, 'US')).toBe(100);
  });

  it('should return a value above 100 when portion exceeds the base', () => {
    expect(percent(150, 100, 'US')).toBe(150);
  });

  it('should return 0 when the portion is zero', () => {
    expect(percent(0, 100, 'US')).toBe(0);
  });

  it('should accept Money instances as portion and base', () => {
    expect(percent(from(50, 'US'), from(100, 'US'), 'US')).toBe(50);
  });

  it('should return a precise percentage for non-round values', () => {
    expect(percent(1, 3, 'US')).toBeCloseTo(33.33, 1);
  });

  it('should throw DivisionByZeroError when the base is zero', () => {
    expect(() => percent(10, 0, 'US')).toThrow(DivisionByZeroError);
  });

  it('should throw DivisionByZeroError when the base is a zero Money instance', () => {
    expect(() => percent(10, zero('US'), 'US')).toThrow(DivisionByZeroError);
  });

  it('should throw CurrencyMismatchError when portion and base have different currencies', () => {
    expect(() => percent(from(10, 'BR'), from(100, 'US'), 'US')).toThrow(CurrencyMismatchError);
  });
});

describe('clamp', () => {
  it('should return the value unchanged when it is within the range', () => {
    expect(clamp(5, 1, 10, 'US').minorUnits()).toBe(500);
  });

  it('should return the minimum when the value is below the range', () => {
    expect(clamp(0, 1, 10, 'US').minorUnits()).toBe(100);
  });

  it('should return the maximum when the value is above the range', () => {
    expect(clamp(20, 1, 10, 'US').minorUnits()).toBe(1000);
  });

  it('should return the value when it equals the minimum boundary', () => {
    expect(clamp(1, 1, 10, 'US').minorUnits()).toBe(100);
  });

  it('should return the value when it equals the maximum boundary', () => {
    expect(clamp(10, 1, 10, 'US').minorUnits()).toBe(1000);
  });

  it('should accept Money instances as value, min and max', () => {
    expect(clamp(from(5, 'US'), from(1, 'US'), from(10, 'US'), 'US').minorUnits()).toBe(500);
  });

  it('should produce the correct currency code', () => {
    expect(clamp(5, 1, 10, 'BR').currencyCode()).toBe('BRL');
  });

  it('should throw InvalidRangeError when min is greater than max', () => {
    expect(() => clamp(5, 10, 1, 'US')).toThrow(InvalidRangeError);
  });
});
