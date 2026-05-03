import { describe, expect, test } from 'vitest';

import { toMinorUnit } from '@/lib/convert';

describe('convert', () => {
  test('converts a number to cents', () => {
    expect(toMinorUnit(1.23)).toBe(123);
  });
});

describe('convert', () => {
  test('converts a string to cents', () => {
    expect(toMinorUnit('1.23')).toBe(123);
  });
});
