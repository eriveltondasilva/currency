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
  UnsafeIntegerError,
  UnsupportedCurrencyError,
} from './lib/errors';

// Core class
export const Money = Object.freeze(api);

export {
  percent,
  total,
} from './api/business';
export {
  average,
  clamp,
  max,
  min,
  sum,
} from './api/collection';
export {
  from as money,
  from,
  fromMinorUnits,
  parse,
  zero,
} from './api/creation';
export { isMoney, isMoneyInput } from './lib/utils';
export default Money;
