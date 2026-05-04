export const TAG = Symbol('@eriveltondasilva/currency');

export const ROUNDING_MODES = {
  ROUND: 'round',
  FLOOR: 'floor',
  CEIL: 'ceil',
  TRUNC: 'trunc',
} as const;
export type RoundingMode = (typeof ROUNDING_MODES)[keyof typeof ROUNDING_MODES];

export const FORMAT_STYLES = {
  CURRENCY: 'currency',
  DECIMAL: 'decimal',
} as const;
