import { describe, expect, it } from 'vitest';

import {
  CurrencyMismatchError,
  DivisionByZeroError,
  InvalidAllocationError,
  InvalidInputError,
  InvalidPercentageError,
  InvalidRangeError,
  MoneyError,
  UnsupportedCurrencyError,
} from '@/lib/errors';

// ─── MoneyError (base) ────────────────────────────────────────────────────────

describe('MoneyError', () => {
  it('should be an instance of Error', () => {
    const error = new InvalidInputError('test');
    expect(error).toBeInstanceOf(Error);
  });

  it('should expose the code property', () => {
    const error = new InvalidInputError('test', { input: 42 });
    expect(error.code).toBe('INVALID_INPUT');
  });

  it('should preserve the input when provided', () => {
    const error = new InvalidInputError('test', { input: 'bad value' });
    expect(error.input).toBe('bad value');
  });

  it('should set input to undefined when not provided', () => {
    const error = new InvalidInputError('test');
    expect(error.input).toBeUndefined();
  });

  it('should chain the cause when provided', () => {
    const cause = new TypeError('root cause');
    const error = new InvalidInputError('wrapper', { cause });
    expect(error.cause).toBe(cause);
  });
});

// ─── InvalidInputError ────────────────────────────────────────────────────────

describe('InvalidInputError', () => {
  it('should be an instance of MoneyError', () => {
    const error = new InvalidInputError('bad input');
    expect(error).toBeInstanceOf(MoneyError);
  });

  it('should be an instance of InvalidInputError', () => {
    const error = new InvalidInputError('bad input');
    expect(error).toBeInstanceOf(InvalidInputError);
  });

  it('should have code INVALID_INPUT', () => {
    const error = new InvalidInputError('bad input');
    expect(error.code).toBe('INVALID_INPUT');
  });

  it('should have name InvalidInputError', () => {
    const error = new InvalidInputError('bad input');
    expect(error.name).toBe('InvalidInputError');
  });

  it('should preserve the error message', () => {
    const error = new InvalidInputError('something went wrong');
    expect(error.message).toBe('something went wrong');
  });
});

// ─── InvalidPercentageError ───────────────────────────────────────────────────

describe('InvalidPercentageError', () => {
  it('should be an instance of MoneyError and InvalidPercentageError', () => {
    const error = new InvalidPercentageError('out of range');
    expect(error).toBeInstanceOf(MoneyError);
    expect(error).toBeInstanceOf(InvalidPercentageError);
  });

  it('should have code INVALID_PERCENTAGE', () => {
    const error = new InvalidPercentageError('out of range');
    expect(error.code).toBe('INVALID_PERCENTAGE');
  });

  it('should have name InvalidPercentageError', () => {
    const error = new InvalidPercentageError('out of range');
    expect(error.name).toBe('InvalidPercentageError');
  });

  it('should preserve input when provided', () => {
    const error = new InvalidPercentageError('out of range', { input: 150 });
    expect(error.input).toBe(150);
  });
});

// ─── DivisionByZeroError ──────────────────────────────────────────────────────

describe('DivisionByZeroError', () => {
  it('should be an instance of MoneyError and DivisionByZeroError', () => {
    const error = new DivisionByZeroError();
    expect(error).toBeInstanceOf(MoneyError);
    expect(error).toBeInstanceOf(DivisionByZeroError);
  });

  it('should have code DIVISION_BY_ZERO', () => {
    const error = new DivisionByZeroError();
    expect(error.code).toBe('DIVISION_BY_ZERO');
  });

  it('should have name DivisionByZeroError', () => {
    const error = new DivisionByZeroError();
    expect(error.name).toBe('DivisionByZeroError');
  });

  it('should have the fixed message about division by zero', () => {
    const error = new DivisionByZeroError();
    expect(error.message).toBe('Cannot divide by zero.');
  });
});

// ─── InvalidAllocationError ───────────────────────────────────────────────────

describe('InvalidAllocationError', () => {
  it('should be an instance of MoneyError and InvalidAllocationError', () => {
    const error = new InvalidAllocationError();
    expect(error).toBeInstanceOf(MoneyError);
    expect(error).toBeInstanceOf(InvalidAllocationError);
  });

  it('should have code INVALID_ALLOCATION', () => {
    const error = new InvalidAllocationError();
    expect(error.code).toBe('INVALID_ALLOCATION');
  });

  it('should have name InvalidAllocationError', () => {
    const error = new InvalidAllocationError();
    expect(error.name).toBe('InvalidAllocationError');
  });

  it('should have the fixed message about positive integer parts', () => {
    const error = new InvalidAllocationError();
    expect(error.message).toBe('Number of parts must be a positive integer.');
  });
});

// ─── InvalidRangeError ────────────────────────────────────────────────────────

describe('InvalidRangeError', () => {
  it('should be an instance of MoneyError and InvalidRangeError', () => {
    const error = new InvalidRangeError();
    expect(error).toBeInstanceOf(MoneyError);
    expect(error).toBeInstanceOf(InvalidRangeError);
  });

  it('should have code INVALID_RANGE', () => {
    const error = new InvalidRangeError();
    expect(error.code).toBe('INVALID_RANGE');
  });

  it('should have name InvalidRangeError', () => {
    const error = new InvalidRangeError();
    expect(error.name).toBe('InvalidRangeError');
  });

  it('should have the fixed message about min/max ordering', () => {
    const error = new InvalidRangeError();
    expect(error.message).toBe('The minimum value cannot be greater than the maximum value.');
  });
});

// ─── CurrencyMismatchError ────────────────────────────────────────────────────

describe('CurrencyMismatchError', () => {
  it('should be an instance of MoneyError and CurrencyMismatchError', () => {
    const error = new CurrencyMismatchError('USD', 'BRL');
    expect(error).toBeInstanceOf(MoneyError);
    expect(error).toBeInstanceOf(CurrencyMismatchError);
  });

  it('should have code CURRENCY_MISMATCH', () => {
    const error = new CurrencyMismatchError('USD', 'BRL');
    expect(error.code).toBe('CURRENCY_MISMATCH');
  });

  it('should have name CurrencyMismatchError', () => {
    const error = new CurrencyMismatchError('USD', 'BRL');
    expect(error.name).toBe('CurrencyMismatchError');
  });

  it('should include both currency codes in the message', () => {
    const error = new CurrencyMismatchError('USD', 'BRL');
    expect(error.message).toBe('Cannot operate on mismatched currencies: USD and BRL.');
  });
});

// ─── UnsupportedCurrencyError ─────────────────────────────────────────────────

describe('UnsupportedCurrencyError', () => {
  it('should be an instance of MoneyError and UnsupportedCurrencyError', () => {
    const error = new UnsupportedCurrencyError('XX', 'US, BR');
    expect(error).toBeInstanceOf(MoneyError);
    expect(error).toBeInstanceOf(UnsupportedCurrencyError);
  });

  it('should have code UNSUPPORTED_CURRENCY', () => {
    const error = new UnsupportedCurrencyError('XX', 'US, BR');
    expect(error.code).toBe('UNSUPPORTED_CURRENCY');
  });

  it('should have name UnsupportedCurrencyError', () => {
    const error = new UnsupportedCurrencyError('XX', 'US, BR');
    expect(error.name).toBe('UnsupportedCurrencyError');
  });

  it('should include the invalid country and supported codes in the message', () => {
    const error = new UnsupportedCurrencyError('XX', 'US, BR');
    expect(error.message).toBe(
      "'XX' is not a supported currency country. Supported codes: US, BR.",
    );
  });
});

// ─── instanceof hierarchy isolation ──────────────────────────────────────────

describe('error hierarchy isolation', () => {
  it('should not treat DivisionByZeroError as InvalidInputError', () => {
    const error = new DivisionByZeroError();
    expect(error).not.toBeInstanceOf(InvalidInputError);
  });

  it('should not treat InvalidRangeError as CurrencyMismatchError', () => {
    const error = new InvalidRangeError();
    expect(error).not.toBeInstanceOf(CurrencyMismatchError);
  });

  it('should not treat UnsupportedCurrencyError as InvalidAllocationError', () => {
    const error = new UnsupportedCurrencyError('XX', 'US');
    expect(error).not.toBeInstanceOf(InvalidAllocationError);
  });
});
