import { describe, expect, it } from 'vitest';

import { from, zero } from '@/api/creation';

// ─── format() — default ───────────────────────────────────────────────────────

describe('Money.format — defaults', () => {
  it('should format USD with symbol by default', () => {
    expect(from(10.5, 'US').format()).toBe('$10.50');
  });

  it('should format BRL with symbol by default', () => {
    expect(from(1500, 'BR').format()).toBe('R$\u00a01.500,00');
  });

  it('should format JPY as a whole number with symbol', () => {
    expect(from(1500, 'JP').format()).toBe('￥1,500');
  });

  it('should format zero correctly', () => {
    expect(zero('US').format()).toBe('$0.00');
  });

  it('should format a negative value with a minus sign by default', () => {
    expect(from(-10, 'US').format()).toBe('-$10.00');
  });
});

// ─── format() — currencyDisplay ───────────────────────────────────────────────

describe('Money.format — currencyDisplay', () => {
  it('should format with currency code when currencyDisplay is "code"', () => {
    expect(from(10, 'US').format({ currencyDisplay: 'code' })).toBe('USD\u00a010.00');
  });

  it('should format with currency name when currencyDisplay is "name"', () => {
    const result = from(10, 'US').format({ currencyDisplay: 'name' });
    expect(result).toContain('dollar');
  });

  it('should format without any currency indicator when currencyDisplay is "none"', () => {
    expect(from(10.5, 'US').format({ currencyDisplay: 'none' })).toBe('10.50');
  });

  it('should format BRL without currency indicator when currencyDisplay is "none"', () => {
    expect(from(1500, 'BR').format({ currencyDisplay: 'none' })).toBe('1.500,00');
  });
});

// ─── format() — notation ──────────────────────────────────────────────────────

describe('Money.format — notation', () => {
  it('should format in standard notation by default', () => {
    expect(from(1500, 'US').format({ notation: 'standard' })).toBe('$1,500.00');
  });

  it('should format in compact notation', () => {
    const result = from(1500000, 'US').format({ notation: 'compact' });
    expect(result).toContain('M');
  });

  it('should format a small value in compact notation without a suffix', () => {
    const result = from(500, 'US').format({ notation: 'compact' });
    expect(result).toBeTruthy();
  });
});

// ─── format() — signDisplay ───────────────────────────────────────────────────

describe('Money.format — signDisplay', () => {
  it('should show sign only for negative values with "auto" (default)', () => {
    expect(from(10, 'US').format({ signDisplay: 'auto' })).toBe('$10.00');
    expect(from(-10, 'US').format({ signDisplay: 'auto' })).toBe('-$10.00');
  });

  it('should show sign for both positive and negative with "always"', () => {
    expect(from(10, 'US').format({ signDisplay: 'always' })).toContain('+');
    expect(from(-10, 'US').format({ signDisplay: 'always' })).toContain('-');
  });

  it('should not show sign for zero with "exceptZero"', () => {
    const result = zero('US').format({ signDisplay: 'exceptZero' });
    expect(result).not.toContain('+');
    expect(result).not.toContain('-');
  });
});

// ─── format() — useGrouping ───────────────────────────────────────────────────

describe('Money.format — useGrouping', () => {
  it('should include grouping separators by default', () => {
    expect(from(1500, 'US').format()).toBe('$1,500.00');
  });

  it('should omit grouping separators when useGrouping is false', () => {
    expect(from(1500, 'US').format({ useGrouping: false })).toBe('$1500.00');
  });
});

// ─── format() — locale override ───────────────────────────────────────────────

describe('Money.format — locale override', () => {
  it('should format USD using a pt-BR locale override', () => {
    const result = from(1500, 'US').format({ locale: 'pt-BR' });
    expect(result).toContain('1.500');
  });

  it('should not change the internal currency code when locale is overridden', () => {
    const money = from(10, 'US');
    money.format({ locale: 'de-DE' });
    expect(money.currencyCode()).toBe('USD');
  });
});

// ─── format() — combined options ─────────────────────────────────────────────

describe('Money.format — combined options', () => {
  it('should format with code display and no grouping', () => {
    const result = from(1500, 'US').format({ currencyDisplay: 'code', useGrouping: false });
    expect(result).toContain('USD');
    expect(result).not.toContain(',');
  });

  it('should format a negative value with always sign and no currency indicator', () => {
    const result = from(-50, 'US').format({ currencyDisplay: 'none', signDisplay: 'always' });
    expect(result).toContain('-');
    expect(result).not.toContain('$');
  });
});
