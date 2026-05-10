import type { CountryCode } from './lib/currencies';
import type { MoneyContract } from './types';

import { from, parse } from './api';

type CreatePreset = (value: number | string) => MoneyContract;

function createPreset(country: CountryCode): CreatePreset {
  return (value: number | string) =>
    typeof value === 'string' ? parse(value, country) : from(value, country);
}

export const au = createPreset('AU');
export const br = createPreset('BR');
export const ca = createPreset('CA');
export const ch = createPreset('CH');
export const cn = createPreset('CN');
export const de = createPreset('DE');
export const fr = createPreset('FR');
export const gb = createPreset('GB');
export const ind = createPreset('IN');
export const jp = createPreset('JP');
export const mx = createPreset('MX');
export const sg = createPreset('SG');
export const pt = createPreset('PT');
export const us = createPreset('US');
