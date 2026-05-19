import { describe, expect, it } from 'vitest';

import {
  ae,
  ar,
  au,
  br,
  ca,
  ch,
  cl,
  cn,
  co,
  de,
  fr,
  gb,
  ind,
  jp,
  kr,
  mx,
  no,
  nz,
  pt,
  ru,
  sa,
  se,
  sg,
  us,
  za,
} from '@/presets';

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
    it.each([
      [ae, 'AED'],
      [ar, 'ARS'],
      [au, 'AUD'],
      [br, 'BRL'],
      [ca, 'CAD'],
      [ch, 'CHF'],
      [cl, 'CLP'],
      [cn, 'CNY'],
      [co, 'COP'],
      [de, 'EUR'],
      [fr, 'EUR'],
      [gb, 'GBP'],
      [ind, 'INR'],
      [jp, 'JPY'],
      [kr, 'KRW'],
      [mx, 'MXN'],
      [no, 'NOK'],
      [nz, 'NZD'],
      [pt, 'EUR'],
      [ru, 'RUB'],
      [sa, 'SAR'],
      [se, 'SEK'],
      [sg, 'SGD'],
      [us, 'USD'],
      [za, 'ZAR'],
    ])('should assign correct currency codes for all presets', (fn, code) => {
      expect(fn(1).currencyCode()).toBe(code);
    });
  });
});
