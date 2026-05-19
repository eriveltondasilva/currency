import { describe, expect, it } from 'vitest';

import { resolveMinorUnits } from '@/api/_shared';
import { from } from '@/api/creation';
import { resolveCurrency } from '@/lib/currencies';
import { CurrencyMismatchError, InvalidInputError } from '@/lib/errors';

const usd = resolveCurrency('US');

describe('resolveMinorUnits', () => {
  it('should throw InvalidInputError when value is null', () => {
    expect(() => resolveMinorUnits(null as never, usd, 'test')).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError when value is undefined', () => {
    expect(() => resolveMinorUnits(undefined as never, usd, 'test')).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError when value is a string', () => {
    expect(() => resolveMinorUnits('abc' as never, usd, 'test')).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError when value is a plain object', () => {
    expect(() => resolveMinorUnits({} as never, usd, 'test')).toThrow(InvalidInputError);
  });

  it('should re-throw MoneyError from numberToMinorUnit when value is Infinity', () => {
    expect(() => resolveMinorUnits(Infinity, usd, 'test')).toThrow(InvalidInputError);
  });

  it('should return minor units for a valid number', () => {
    expect(resolveMinorUnits(10, usd, 'test')).toBe(1000);
  });

  it('should return minor units for a valid MoneyContract', () => {
    expect(resolveMinorUnits(from(10, 'US'), usd, 'test')).toBe(1000);
  });

  it('should throw CurrencyMismatchError for a MoneyContract with a different currency', () => {
    expect(() => resolveMinorUnits(from(10, 'BR'), usd, 'test')).toThrow(CurrencyMismatchError);
  });
});
