import type { CountryCode } from './lib/currencies';

import { from, fromMinorUnits, parse, zero } from './api/creation';

function createPreset(country: CountryCode) {
  return {
    from: (value: number) => from(value, country),
    parse: (value: string) => parse(value, country),
    fromMinorUnits: (value: number) => fromMinorUnits(value, country),
    zero: () => zero(country),
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export const ae = createPreset('AE')
export const ar = createPreset('AR')
export const au = createPreset('AU')
export const br = createPreset('BR')
export const ca = createPreset('CA')
export const ch = createPreset('CH')
export const cl = createPreset('CL')
export const cn = createPreset('CN')
export const co = createPreset('CO')
export const de = createPreset('DE')
export const fr = createPreset('FR')
export const gb = createPreset('GB')
export const ind = createPreset('IN')
export const jp = createPreset('JP')
export const kr = createPreset('KR')
export const mx = createPreset('MX')
export const no = createPreset('NO')
export const nz = createPreset('NZ')
export const pt = createPreset('PT')
export const ru = createPreset('RU')
export const sa = createPreset('SA')
export const se = createPreset('SE')
export const sg = createPreset('SG')
export const us = createPreset('US')
export const za = createPreset('ZA')
