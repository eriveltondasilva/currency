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

// ─── Creation ────────────────────────────────────────────────────────────────

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

// ─── Collection ──────────────────────────────────────────────────────────────

export {
  average,
  clamp,
  max,
  min,
  sum,
} from './api/collection';

// ─── Business ────────────────────────────────────────────────────────────────

export {
  percent,
  total,
} from './api/business';

// ─── Type Guards ─────────────────────────────────────────────────────────────

export {
  isMoney,
  isMoneyInput,
} from './api/type-guards';

// ─── Other ───────────────────────────────────────────────────────────────────

export { api as Money };
export default api;
