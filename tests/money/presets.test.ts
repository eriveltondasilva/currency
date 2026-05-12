import { describe, expect, it } from 'vitest';

import { au, br, ca, ch, cn, de, fr, gb, ind, jp, mx, pt, sg, us } from '@/presets';

// ─────────────────────────────────────────────────────────────────────────────

describe('presets', () => {
  describe('when called with a number', () => {
    it('should create a BRL instance via br()', () => {
      const money = br(10.5);
      expect(money.currencyCode()).toBe('BRL');
      expect(money.minorUnits()).toBe(1050);
    });

    it('should create a USD instance via us()', () => {
      const money = us(9.99);
      expect(money.currencyCode()).toBe('USD');
      expect(money.minorUnits()).toBe(999);
    });

    it('should create a JPY instance via jp() with no fraction digits', () => {
      const money = jp(1500);
      expect(money.currencyCode()).toBe('JPY');
      expect(money.minorUnits()).toBe(1500);
    });

    it('should create a GBP instance via gb()', () => {
      expect(gb(5).currencyCode()).toBe('GBP');
    });

    it('should create a EUR instance via de()', () => {
      expect(de(5).currencyCode()).toBe('EUR');
    });
  });

  describe('when called with a string', () => {
    it('should parse a BRL-formatted string via br()', () => {
      const money = br('1.234,56');
      expect(money.currencyCode()).toBe('BRL');
      expect(money.minorUnits()).toBe(123456);
    });

    it('should parse a USD-formatted string via us()', () => {
      const money = us('1,234.56');
      expect(money.currencyCode()).toBe('USD');
      expect(money.minorUnits()).toBe(123456);
    });

    it('should parse a CHF-formatted string via ch()', () => {
      const money = ch("1'234.56");
      expect(money.currencyCode()).toBe('CHF');
      expect(money.minorUnits()).toBe(123456);
    });
  });

  describe('currency code coverage', () => {
    it('should assign correct currency codes for all presets', () => {
      expect(au(1).currencyCode()).toBe('AUD');
      expect(br(1).currencyCode()).toBe('BRL');
      expect(ca(1).currencyCode()).toBe('CAD');
      expect(ch(1).currencyCode()).toBe('CHF');
      expect(cn(1).currencyCode()).toBe('CNY');
      expect(de(1).currencyCode()).toBe('EUR');
      expect(fr(1).currencyCode()).toBe('EUR');
      expect(gb(1).currencyCode()).toBe('GBP');
      expect(ind(1).currencyCode()).toBe('INR');
      expect(jp(1).currencyCode()).toBe('JPY');
      expect(mx(1).currencyCode()).toBe('MXN');
      expect(pt(1).currencyCode()).toBe('EUR');
      expect(sg(1).currencyCode()).toBe('SGD');
      expect(us(1).currencyCode()).toBe('USD');
    });
  });
});
