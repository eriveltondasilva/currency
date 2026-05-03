import type { CURRENCY_LOCALES, ROUNDING_MODES } from '../constants';
import type { MoneyContract } from './money';

// ─── Primitives ───────────────────────────────────────────────────────────────

export type CurrencyCode = keyof typeof CURRENCY_LOCALES;
export type CurrencyLocale = (typeof CURRENCY_LOCALES)[CurrencyCode];
export type RoundingMode = (typeof ROUNDING_MODES)[keyof typeof ROUNDING_MODES];

// ─── Input ────────────────────────────────────────────────────────────────────

/**
 * Accepted input for any Money-related operation.
 *
 * - `number`        → treated as a monetary value (e.g. 10.99)
 * - `string`        → supports Brazilian (1.234,56) and international (1,234.56) formats
 * - `MoneyContract` → re-uses the cents value directly, avoids circular imports
 */
export type MoneyInput = number | string | MoneyContract;

// ─── Options ──────────────────────────────────────────────────────────────────

export interface FormatOptions {
  currencyCode: CurrencyCode;
  locale: CurrencyLocale;
}

export type DisplayOptions = FormatOptions & {
  showSymbol: boolean;
  minimumFractionDigits: number;
  maximumFractionDigits: number;
};

// ─── Domain ───────────────────────────────────────────────────────────────────

/**
 * Represents an item with a price and an optional quantity.
 * Used by business utility functions such as `calculateTotal` and `calculateSubtotal`.
 *
 * Does not include an index signature so TypeScript catches unexpected properties.
 * Use an intersection type to extend it when needed:
 *
 * @example
 * type CartItem = PricedItem & { name: string; sku: string }
 */
export interface PricedItem {
  price: MoneyInput;
  quantity?: number;
}

export type Maybe<T> = T | null | undefined;
