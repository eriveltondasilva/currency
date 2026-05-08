import type { CurrencyCode } from './lib/currencies';

export type MoneyInput = number | MoneyContract;

/**
 * Controls how rounding is applied when the value falls between two steps.
 *
 * Direction-based (no tie):
 * - `'ceil'`   → toward +∞   ( 1.1 →  2, -1.1 → -1)
 * - `'floor'`  → toward -∞   ( 1.1 →  1, -1.1 → -2)
 * - `'trunc'`  → toward 0    ( 1.9 →  1, -1.9 → -1)
 * - `'expand'` → away from 0 ( 1.1 →  2, -1.1 → -2)
 *
 * Nearest neighbor (tie-breaking at .5):
 * - `'halfExpand'` → half away from 0 — default, symmetric, human-friendly
 *                    ( 1.5 →  2, -1.5 → -2)
 * - `'halfEven'`   → half to nearest even — banker's rounding, reduces statistical bias
 *                    ( 1.5 →  2,  2.5 →  2, -1.5 → -2)
 * - `'halfCeil'`   → half toward +∞ — matches Math.round, asymmetric in negatives
 *                    ( 1.5 →  2, -1.5 → -1)
 * - `'halfFloor'`  → half toward -∞ — matches Math.round, asymmetric in positives
 *                    ( 1.5 →  1, -1.5 → -2)
 * - `'halfTrunc'`  → half toward 0 — matches Math.round, asymmetric in both directions
 *                    ( 1.5 →  1, -1.5 → -1)
 */
export type RoundingMode =
  | 'ceil'
  | 'floor'
  | 'trunc'
  | 'expand'
  //
  | 'halfExpand'
  | 'halfEven'
  | 'halfCeil'
  | 'halfFloor'
  | 'halfTrunc';

export interface FormatOptions {
  /**
   * Controls how the currency symbol/code is displayed.
   *
   * - `'symbol'`       → R$, $, €
   * - `'narrowSymbol'` → $ (shorter, avoids ambiguity)
   * - `'code'`         → BRL, USD, EUR
   * - `'name'`         → real brasileiro, US dollar
   * - `'none'`         → no currency indicator (decimal style)
   */
  currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name' | 'none';

  /**
   * Controls the number notation format.
   *
   * - `'standard'` → 1.500.000,00  (default)
   * - `'compact'`  → 1,5 mi / 1.5M (useful for dashboards)
   */
  notation?: 'standard' | 'compact';

  /**
   * Controls when the +/- sign is displayed.
   *
   * - `'auto'`       → only negative values show sign (default)
   * - `'always'`     → +R$ 100,00 / -R$ 50,00
   * - `'exceptZero'` → sign on all except zero
   * - `'negative'`   → only negative, no + for positives
   */
  signDisplay?: 'auto' | 'always' | 'exceptZero' | 'negative';

  /** Whether to use grouping separators (e.g. 1.000 vs 1000). Defaults to `true`. */
  useGrouping?: boolean;

  /** Override the locale for display only — does not affect internal values. */
  locale?: string;
}

export interface PricedItem {
  price: MoneyInput;
  quantity?: number;
}

export interface MoneyJSON {
  amount: number;
  currencyCode: CurrencyCode;
}

export interface MoneyContract {
  // #region Accessors

  amount(): number;

  value(): number;

  integer(): number;

  cents(): number;

  units(): [integer: number, cents: number];

  currencyCode(): string;

  locale(): string;

  // #endregion

  // #region State

  isZero(): boolean;

  isPositive(): boolean;

  isNegative(): boolean;

  // #endregion

  // #region Arithmetic

  plus(input: MoneyInput): MoneyContract;

  minus(input: MoneyInput): MoneyContract;

  times(factor: number, roundingMode?: RoundingMode): MoneyContract;

  dividedBy(divisor: number, roundingMode?: RoundingMode): MoneyContract;

  // #endregion

  // #region Transformation

  absolute(): MoneyContract;

  negate(): MoneyContract;

  max(input: MoneyInput): MoneyContract;

  min(input: MoneyInput): MoneyContract;

  round(increment: number, mode?: RoundingMode): MoneyContract;

  // #endregion

  // #region Comparison

  equals(input: MoneyInput): boolean;

  greaterThan(input: MoneyInput): boolean;

  lessThan(input: MoneyInput): boolean;

  greaterThanOrEqual(input: MoneyInput): boolean;

  lessThanOrEqual(input: MoneyInput): boolean;

  isBetween(min: MoneyInput, max: MoneyInput): boolean;

  // #endregion

  // #region Business

  percentage(percent: number): MoneyContract;

  applyDiscount(discount: number): MoneyContract;

  applySurcharge(surcharge: number): MoneyContract;

  allocate(parts: number): MoneyContract[];

  allocateByRatio(ratios: number[]): MoneyContract[];

  // #endregion

  // #region Display/Formatting

  format(options?: FormatOptions): string;

  clone(): MoneyContract;

  toString(): string;

  toJSON(): MoneyJSON;

  valueOf(): number;

  // #endregion
}
