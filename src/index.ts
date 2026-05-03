import { factories } from './factories';

// ─── Exports ─────────────────────────────────────────────────────────────────

// Types
export type {
  CurrencyCode,
  CurrencyLocale,
  FormatOptions,
  MoneyInput,
  PricedItem,
  RoundingMode,
} from './types';

export {
  DivisionByZeroError,
  InvalidAllocationError,
  InvalidInputError,
  InvalidPercentageError,
  InvalidRangeError,
  MoneyError,
} from './errors';
export { BRL, CNY, EUR, GBP, JPY, USD } from './presets';

// Core class
export const Money = Object.freeze(factories);
export const { from: money } = factories;
export default Money;
