import { describe, expect, it } from 'vitest';

import { CurrencyMismatchError, from, InvalidInputError, total } from '@/index';

describe('total', () => {
  it('should return the sum of all item prices', () => {
    const items = [{ price: 10 }, { price: 20 }, { price: 30 }];
    expect(total(items, 'US').minorUnits()).toBe(6000);
  });

  it('should multiply price by quantity when provided', () => {
    const items = [{ price: 10, quantity: 3 }];
    expect(total(items, 'US').minorUnits()).toBe(3000);
  });

  it('should default quantity to 1 when omitted', () => {
    const items = [{ price: 10 }];
    expect(total(items, 'US').minorUnits()).toBe(1000);
  });

  it('should handle quantity of 0 and contribute nothing to the total', () => {
    const items = [
      { price: 50, quantity: 0 },
      { price: 10, quantity: 1 },
    ];
    expect(total(items, 'US').minorUnits()).toBe(1000);
  });

  it('should handle a mix of numbers and Money instances as prices', () => {
    const items = [{ price: from(10, 'US') }, { price: 20 }];
    expect(total(items, 'US').minorUnits()).toBe(3000);
  });

  it('should return zero for an empty array', () => {
    expect(total([], 'US').isZero()).toBe(true);
  });

  it('should produce the correct currency code', () => {
    expect(total([{ price: 10 }], 'BR').currencyCode()).toBe('BRL');
  });

  it('should throw InvalidInputError for a non-object item', () => {
    expect(() => total([null as never], 'US')).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError for a fractional quantity', () => {
    expect(() => total([{ price: 10, quantity: 1.5 }], 'US')).toThrow(InvalidInputError);
  });

  it('should throw InvalidInputError for a negative quantity', () => {
    expect(() => total([{ price: 10, quantity: -1 }], 'US')).toThrow(InvalidInputError);
  });

  it('should throw CurrencyMismatchError when a Money price has a different currency', () => {
    const items = [{ price: from(10, 'BR') }];
    expect(() => total(items, 'US')).toThrow(CurrencyMismatchError);
  });
});
