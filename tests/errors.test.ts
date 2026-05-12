import { describe, expect, it } from 'vitest';

import {
  CurrencyMismatchError,
  DivisionByZeroError,
  InvalidAllocationError,
  InvalidInputError,
  InvalidPercentageError,
  InvalidRangeError,
  MoneyError,
  UnsafeIntegerError,
  UnsupportedCurrencyError,
} from '@/lib/errors';

// ─────────────────────────────────────────────────────────────────────────────

describe('MoneyError', () => {
  it('should be the base class for all money errors', () => {
    expect(new InvalidInputError('x')).toBeInstanceOf(MoneyError);
    expect(new InvalidInputError('x')).toBeInstanceOf(Error);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('InvalidInputError', () => {
  it('should have the INVALID_INPUT code', () => {
    expect(new InvalidInputError('msg').code).toBe('INVALID_INPUT');
  });

  it('should have the correct name', () => {
    expect(new InvalidInputError('msg').name).toBe('InvalidInputError');
  });

  it('should preserve the input option', () => {
    expect(new InvalidInputError('msg', { input: 42 }).input).toBe(42);
  });

  it('should preserve the cause option', () => {
    const cause = new Error('root cause');
    expect(new InvalidInputError('msg', { cause }).cause).toBe(cause);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('InvalidPercentageError', () => {
  it('should have the INVALID_PERCENTAGE code', () => {
    expect(new InvalidPercentageError('msg').code).toBe('INVALID_PERCENTAGE');
  });

  it('should have the correct name', () => {
    expect(new InvalidPercentageError('msg').name).toBe('InvalidPercentageError');
  });

  it('should preserve the input option', () => {
    expect(new InvalidPercentageError('msg', { input: -5 }).input).toBe(-5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('DivisionByZeroError', () => {
  it('should have the DIVISION_BY_ZERO code', () => {
    expect(new DivisionByZeroError().code).toBe('DIVISION_BY_ZERO');
  });

  it('should have the correct name', () => {
    expect(new DivisionByZeroError().name).toBe('DivisionByZeroError');
  });

  it('should have a built-in message without requiring arguments', () => {
    expect(new DivisionByZeroError().message).toBe('Cannot divide by zero.');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('InvalidAllocationError', () => {
  it('should have the INVALID_ALLOCATION code', () => {
    expect(new InvalidAllocationError('msg').code).toBe('INVALID_ALLOCATION');
  });

  it('should have the correct name', () => {
    expect(new InvalidAllocationError('msg').name).toBe('InvalidAllocationError');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('InvalidRangeError', () => {
  it('should have the INVALID_RANGE code', () => {
    expect(new InvalidRangeError().code).toBe('INVALID_RANGE');
  });

  it('should have the correct name', () => {
    expect(new InvalidRangeError().name).toBe('InvalidRangeError');
  });

  it('should have a built-in message mentioning minimum and maximum', () => {
    const { message } = new InvalidRangeError();
    expect(message).toContain('minimum');
    expect(message).toContain('maximum');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('CurrencyMismatchError', () => {
  it('should have the CURRENCY_MISMATCH code', () => {
    expect(new CurrencyMismatchError('BRL', 'USD').code).toBe('CURRENCY_MISMATCH');
  });

  it('should have the correct name', () => {
    expect(new CurrencyMismatchError('BRL', 'USD').name).toBe('CurrencyMismatchError');
  });

  it('should include both currency codes in the message', () => {
    const { message } = new CurrencyMismatchError('BRL', 'USD');
    expect(message).toContain('BRL');
    expect(message).toContain('USD');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('UnsupportedCurrencyError', () => {
  it('should have the UNSUPPORTED_CURRENCY code', () => {
    expect(new UnsupportedCurrencyError('ZZZ', 'BR, US').code).toBe('UNSUPPORTED_CURRENCY');
  });

  it('should have the correct name', () => {
    expect(new UnsupportedCurrencyError('ZZZ', 'BR, US').name).toBe('UnsupportedCurrencyError');
  });

  it('should include the unsupported code and the supported list in the message', () => {
    const { message } = new UnsupportedCurrencyError('ZZZ', 'BR, US');
    expect(message).toContain('ZZZ');
    expect(message).toContain('BR, US');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('UnsafeIntegerError', () => {
  it('should have the UNSAFE_INTEGER code', () => {
    expect(new UnsafeIntegerError().code).toBe('UNSAFE_INTEGER');
  });

  it('should have the correct name', () => {
    expect(new UnsafeIntegerError().name).toBe('UnsafeIntegerError');
  });

  it('should preserve the input option when provided', () => {
    expect(new UnsafeIntegerError({ input: Number.MAX_SAFE_INTEGER + 1 }).input).toBe(
      Number.MAX_SAFE_INTEGER + 1,
    );
  });
});
