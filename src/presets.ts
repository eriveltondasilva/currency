import type { CountryCode } from './lib/currencies';
import type { MoneyContract } from './types';

import { from, parse } from './api';

type CreatePreset = (value: number | string) => MoneyContract;

function createPreset(country: CountryCode): CreatePreset {
  return (value: number | string) =>
    typeof value === 'string' ? parse(value, country) : from(value, country);
}

// ─────────────────────────────────────────────────────────────────────────────

export const au: CreatePreset = createPreset('AU');
export const br: CreatePreset = createPreset('BR');
export const ca: CreatePreset = createPreset('CA');
export const ch: CreatePreset = createPreset('CH');
export const cn: CreatePreset = createPreset('CN');
export const de: CreatePreset = createPreset('DE');
export const fr: CreatePreset = createPreset('FR');
export const gb: CreatePreset = createPreset('GB');
export const ind: CreatePreset = createPreset('IN');
export const jp: CreatePreset = createPreset('JP');
export const mx: CreatePreset = createPreset('MX');
export const sg: CreatePreset = createPreset('SG');
export const pt: CreatePreset = createPreset('PT');
export const us: CreatePreset = createPreset('US');
