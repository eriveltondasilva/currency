import * as factories from './factories';

// ─── Exports ─────────────────────────────────────────────────────────────────

// Types
export type { RoundingMode } from './lib/constants';
export type {
  FormatOptions,
  MoneyInput,
  PricedItem,
} from './types';

export {
  CurrencyMismatchError,
  DivisionByZeroError,
  InvalidAllocationError,
  InvalidInputError,
  InvalidPercentageError,
  InvalidRangeError,
  MoneyError,
} from './lib/errors';

// Core class
export const Money = Object.freeze(factories);
export const { from: money } = factories;
export default Money;
