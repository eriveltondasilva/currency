import * as api from './api';

// ─── Exports ─────────────────────────────────────────────────────────────────

// Types
export type {
  FormatOptions,
  MoneyInput,
  PricedItem,
  RoundingMode,
} from './types';

export {
  CurrencyMismatchError,
  DivisionByZeroError,
  InvalidAllocationError,
  InvalidInputError,
  InvalidPercentageError,
  InvalidRangeError,
  MoneyError,
  UnsupportedCurrencyError,
} from './lib/errors';

// Core class
export const Money = Object.freeze(api);
export {
  average,
  clamp,
  from as money,
  from,
  fromMinorUnits,
  max,
  min,
  percent,
  sum,
  total,
  zero,
} from './api';
export { isMoney, isMoneyInput } from './lib/utils';
export default Money;
