/**
 * @module presets
 *
 * Country-specific shorthand factories. Each preset is a function that accepts
 * a `number` (major units) or a `string` (parsed according to the country's
 * decimal and grouping separators) and returns a `MoneyContract`.
 *
 * Import from the `/presets` entry point:
 *
 * @example
 * import { br, us } from '@eriveltondasilva/currency/presets'
 *
 * br(19.99).format()     // => 'R$ 19,99'
 * us('1,500.00').format() // => '$1,500.00'
 */

import type { CountryCode } from './lib/currencies';
import type { MoneyContract } from './types';

import { from, parse } from './api';

/**
 * A country-bound factory that creates a `MoneyContract` from a `number` or
 * a locale-formatted `string`.
 *
 * - `number` — interpreted as major units (e.g. `19.99`) {@link from}.
 * - `string` — parsed using the country's decimal and grouping separators {@link parse}.
 *
 * @throws `InvalidInputError` — when the string cannot be parsed as a monetary amount.
 */
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
