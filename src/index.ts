import * as api from './api';

// ─── Types ───────────────────────────────────────────────────────────────────

export type { CountryCode, CurrencyCode } from './lib/currencies';
export type {
  FormatOptions,
  MoneyComparison,
  MoneyContract,
  MoneyInput,
  MoneyJSON,
  MoneyParts,
  PricedItem,
  RoundingMode,
} from './types';

// ─── Errors ──────────────────────────────────────────────────────────────────

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

// ─── API ────────────────────────────────────────────────────────────────

export {
  clamp,
  percent,
} from './api/arithmetic';
export { total } from './api/business';
export {
  average,
  max,
  min,
  sum,
} from './api/collection';
export {
  from as money,
  from,
  fromMinorUnits,
  fromMinorUnits as fromCents,
  fromMinorUnits as fromInt,
  parse as fromString,
  parse,
  zero,
} from './api/creation';
export {
  isMoney,
  isMoneyInput,
} from './api/type-guards';

// ─── Other ───────────────────────────────────────────────────────────────────

export { api as Money };
export default api;
