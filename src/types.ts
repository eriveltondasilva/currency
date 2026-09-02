import type { CurrencyCode } from './lib/currencies';

/**
 * Controls how a value is rounded when it falls between two representable steps.
 *
 * **Direction-based** (always rounds regardless of the fractional part):
 * - `'ceil'`   — toward +∞   ( 1.1 →  2, -1.1 → -1)
 * - `'floor'`  — toward -∞   ( 1.1 →  1, -1.1 → -2)
 * - `'trunc'`  — toward 0    ( 1.9 →  1, -1.9 → -1)
 * - `'expand'` — away from 0 ( 1.1 →  2, -1.1 → -2)
 *
 * **Nearest-neighbor** (tie-breaking at .5):
 * - `'halfExpand'` — half away from 0 — **default**; symmetric and human-friendly
 *                    ( 1.5 →  2, -1.5 → -2)
 * - `'halfEven'`   — half to nearest even (banker's rounding); reduces statistical bias
 *                    ( 1.5 →  2,  2.5 →  2)
 * - `'halfCeil'`   — half toward +∞; matches `Math.round`, asymmetric for negatives
 *                    ( 1.5 →  2, -1.5 → -1)
 * - `'halfFloor'`  — half toward -∞; asymmetric for positives
 *                    ( 1.5 →  1, -1.5 → -2)
 * - `'halfTrunc'`  — half toward 0; asymmetric in both directions
 *                    ( 1.5 →  1, -1.5 → -1)
 */
export type RoundingMode =
  | 'ceil'
  | 'floor'
  | 'trunc'
  | 'expand'
  | 'halfExpand'
  | 'halfEven'
  | 'halfCeil'
  | 'halfFloor'
  | 'halfTrunc';

/**
 * Display options passed to {@link MoneyContract.format}.
 *
 * All properties are optional. Unset properties fall back to locale-aware
 * defaults derived from the instance's currency.
 */
export interface FormatOptions {
  /**
   * Override the locale used for display only.
   * Does **not** affect internal values or currency code.
   *
   * @example
   * `'en-US'`, `'pt-BR'`, `'de-DE'`
   */
  locale?: string;

  /**
   * Controls how the currency identifier is rendered.
   *
   * - `'symbol'`       — `R$`, `$`, `€`
   * - `'narrowSymbol'` — `$` (shorter; avoids regional ambiguity)
   * - `'code'`         — `BRL`, `USD`, `EUR`
   * - `'name'`         — `real brasileiro`, `US dollar`
   * - `'none'`         — no currency indicator (decimal style)
   *
   * @default 'symbol'
   */
  currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name' | 'none';

  /**
   * Controls the number notation format.
   *
   * - `'standard'` — `1.500.000,00`
   * - `'compact'`  — `1,5 mi` / `1.5M`; useful for dashboards
   *
   * @default 'standard'
   */
  notation?: 'standard' | 'compact';

  /**
   * Controls when the sign character is displayed.
   *
   * - `'auto'`       — only negative values show a sign
   * - `'always'`     — `+R$ 100,00` / `-R$ 50,00`
   * - `'exceptZero'` — sign on all non-zero values
   * - `'negative'`   — only negative; no `+` for positives
   *
   * @default 'auto'
   */
  signDisplay?: 'auto' | 'always' | 'exceptZero' | 'negative';

  /**
   * Whether to render digit-grouping separators (e.g. `1.000` vs `1000`).
   *
   * @default true
   */
  useGrouping?: boolean | 'always' | 'auto' | 'min2';

  /**
   * `'accounting'` renders negatives in parentheses: `(R$ 50,00)`.
   *
   * @default 'standard'
   */
  currencySign?: 'standard' | 'accounting';

  /**
   * Unit label for compact notation.
   *
   * @default 'short'
   */
  compactDisplay?: 'short' | 'long';

  /**
   * Whether to strip trailing zeros when the value is a whole number.
   *
   * @default 'auto'
   */
  trailingZeroDisplay?: 'auto' | 'stripIfInteger';

  /**
   * Rounding mode applied during formatting.
   *
   * @default 'halfExpand'
   */
  roundingMode?: RoundingMode;

  /**
   * Minimum number of fraction digits to display.
   *
   * @default currency.fractionDigits
   */
  minimumFractionDigits?: number;

  /**
   * Maximum number of fraction digits to display.
   *
   * @default currency.fractionDigits
   */
  maximumFractionDigits?: number;
}

/**
 * Represents an item with a price and an optional integer quantity.
 * Used as input for {@link total}.
 */
export interface PricedItem {
  /** Unit price of the item, as a number (major units) or a `MoneyContract` instance. */
  price: MoneyContract | number;

  /**
   * Number of units. Must be a **non-negative integer**.
   * Fractional quantities are rejected at runtime with `InvalidInputError`.
   *
   * @default 1
   */
  quantity?: number;
}

/**
 * Plain-object representation of a `MoneyContract`, safe for JSON serialization.
 * Use with {@link MoneyContract.toJSON} and `Money.fromMinorUnits` for round-tripping.
 *
 * @example
 * from(19.99, 'BR').toJSON();
 * // => { minorUnits: 1999, currencyCode: 'BRL' }
 */
export interface MoneyJSON {
  /** Internal integer value (e.g. `1999` represents `R$ 19,99`). */
  minorUnits: number;

  /** ISO 4217 currency code. */
  currencyCode: CurrencyCode;
}

/**
 * Comparison result of two `MoneyContract` instances.
 *
 * @example
 * from(19.99, 'BR').compare(from(10, 'US'))
 * // => 1
 */
export type MoneyComparison = -1 | 0 | 1;

/**
 * Represents the internal integer components of a `MoneyContract` instance.
 *
 * @example
 * from(19.99, 'BR').toParts()
 * // => { units: 19, subunits: 99, isNegative: false }
 *
 * from(-5.07, 'BR').toParts()
 * // => { units: 5, subunits: 7, isNegative: true  }
 */
export interface MoneyParts {
  units: number;
  subunits: number;
  isNegative: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Public contract for all monetary value objects produced by this library.
 *
 * Instances are **immutable**: every operation returns a new `MoneyContract`.
 * Values are stored internally as minor units (safe integers) to prevent
 * floating-point errors.
 */
export interface MoneyContract {
  // #region Accessors

  /**
   * Returns the raw internal integer (minor units).
   *
   * @example
   * from(19.99, 'BR').minorUnits()
   * // => 1999
   */
  minorUnits(): number;

  /**
   * Returns the monetary amount in major units. For display, prefer {@link format}.
   *
   * @example
   * from(19.99, 'BR').amount()
   * // => 19.99
   */
  amount(): number;

  /**
   * Returns the amount split into its constituent parts.
   *
   * `units` and `subunits` are always non-negative integers.
   * Use `isNegative` to determine the sign of the original amount.
   *
   * @example
   * from( 19.99, 'BR').toParts()
   * // => { units: 19, subunits: 99, isNegative: false }
   *
   * from(-19.99, 'BR').toParts()
   * // => { units: 19, subunits: 99, isNegative: true  }
   *
   * from( -0.99, 'US').toParts()
   * // => { units: 0,  subunits: 99, isNegative: true  }
   */
  toParts(): MoneyParts;

  /**
   * Returns the ISO 4217 currency code of this instance.
   *
   * @example
   * from(10, 'BR').currencyCode()
   * // => 'BRL'
   */
  currencyCode(): CurrencyCode;

  /**
   * Returns the BCP 47 locale tag associated with this instance's country.
   *
   * @example
   * from(10, 'BR').locale()
   * // => 'pt-BR'
   */
  locale(): string;

  // #endregion

  // #region State

  /**
   * Returns `true` if the amount is exactly zero.
   *
   * @example
   * from(0, 'BR').isZero()
   * // => true
   *
   * from(0.01, 'BR').isZero()
   * // => false
   */
  isZero(): boolean;

  /**
   * Returns `true` if the amount is greater than zero.
   *
   * @example
   * from(1, 'US').isPositive()
   * // => true
   *
   * from(-1, 'US').isPositive()
   * // => false
   */
  isPositive(): boolean;

  /**
   * Returns `true` if the amount is less than zero.
   *
   * @example
   * from(-1, 'US').isNegative()
   * // => true
   *
   * from(1, 'US').isNegative()
   * // => false
   */
  isNegative(): boolean;

  /**
   * Returns `true` if the amount is an integer.
   *
   * @example
   * from(10, 'BR').isInteger()
   * // => true
   *
   * from(10.01, 'BR').isInteger()
   * // => false
   */
  isInteger(): boolean;

  // #endregion

  // #region Arithmetic

  /**
   * Adds a monetary value to this instance.
   *
   * @param other {MoneyContract} - Amount to add.
   *
   * @example
   * from(10, 'BR').plus(from(5, 'BR')).amount()
   * // => 15
   */
  plus(other: MoneyContract): MoneyContract;

  /**
   * Subtracts a monetary value from this instance.
   *
   * @param other {MoneyContract} - Amount to subtract.
   *
   * @example
   * from(10, 'BR').minus(from(3.50, 'BR')).amount()
   * // => 6.5
   */
  minus(other: MoneyContract): MoneyContract;

  /**
   * Multiplies this instance by a scalar factor.
   *
   * The result is rounded in minor units using the specified `roundingMode`.
   * Defaults to `'halfExpand'`.
   *
   * @param factor {number} - Finite scalar multiplier.
   * @param roundingMode {RoundingMode} - Rounding strategy applied to the minor-unit result. Defaults to `'halfExpand'`.
   *
   * @example
   * from(10, 'BR').times(1.5).amount()
   * // => 15
   */
  times(factor: number, roundingMode?: RoundingMode): MoneyContract;

  /**
   * Divides this instance by a scalar divisor.
   *
   * The result is rounded in minor units using the specified `roundingMode`.
   * Defaults to `'halfExpand'`.
   *
   * @param divisor {number} - Finite, non-zero scalar.
   * @param roundingMode {RoundingMode} - Rounding strategy applied to the minor-unit result. Defaults to `'halfExpand'`.
   *
   * @example
   * from(10, 'BR').divide(4).amount()
   * // => 2.5
   */
  divide(divisor: number, roundingMode?: RoundingMode): MoneyContract;

  // #endregion

  // #region Transformation

  /**
   * Returns a new instance with the absolute (non-negative) amount.
   *
   * @example
   * from(-15, 'BR').abs().amount()
   * // => 15
   */
  abs(): MoneyContract;

  /**
   * Returns a new instance with the sign of the amount flipped.
   *
   * @example
   * from(20, 'BR').negate().amount()
   * // => -20
   *
   * from(-20, 'BR').negate().amount()
   * // => 20
   */
  negate(): MoneyContract;

  /**
   * Returns the greater of this instance and `input`.
   *
   * @param other {MoneyContract} - Comparison value.
   *
   * @example
   * from(5, 'BR').max(from(10, 'BR')).amount()
   * // => 10
   *
   * from(5, 'BR').max(from(3, 'BR')).amount()
   * // => 5
   */
  max(other: MoneyContract): MoneyContract;

  /**
   * Returns the lesser of this instance and `input`.
   *
   * @param other {MoneyContract} - Comparison value.
   *
   * @example
   * from(5, 'BR').min(from(10, 'BR')).amount()
   * // => 5
   *
   * from(5, 'BR').min(from(3, 'BR')).amount()
   * // => 3
   */
  min(other: MoneyContract): MoneyContract;

  /**
   * Rounds the amount to the nearest multiple of `step` in major units.
   *
   * Useful for currencies or payment systems that require rounding to specific
   * denominations (e.g. rounding to the nearest $0.05 or $1.00).
   *
   * @param step {number} - Positive number in major units specifying the rounding step.
   * @param roundingMode {RoundingMode} - Rounding strategy. Defaults to `'halfExpand'`.
   *
   * @example
   * from(1.03, 'BR').round(0.05).amount()
   * // => 1.05  (nearest 5 cents)
   *
   * from(1.02, 'BR').round(0.05).amount()
   * // => 1.00  (nearest 5 cents)
   *
   * from(1.50, 'BR').round(1).amount()
   * // => 2.00  (nearest real)
   *
   * from(1499, 'BR').round(500).amount()
   * // => 1500  (nearest R$ 500)
   */
  round(step: number, roundingMode?: RoundingMode): MoneyContract;

  /**
   * Returns a new instance with the amount clamped between `min` and `max`.
   *
   * @param min {MoneyContract} - Minimum amount.
   * @param max {MoneyContract} - Maximum amount.
   *
   * @example
   * from(5, 'BR').clamp(from(3, 'BR'), from(10, 'BR')).amount()
   * // => 5
   *
   * from(5, 'BR').clamp(from(10, 'BR'), from(30, 'BR')).amount()
   * // => 10
   */
  clamp(min: MoneyContract, max: MoneyContract): MoneyContract;

  // #endregion

  // #region Comparison

  /**
   * Returns `true` if this instance represents the same amount and currency as `input`.
   *
   * @param other {MoneyContract} - Value to compare.
   *
   * @example
   * from(10, 'BR').equals(from(10, 'BR'))
   * // => true
   *
   * from(10, 'BR').equals(from(10, 'US'))
   * // => false
   */
  equals(other: MoneyContract): boolean;

  /**
   * Compares this instance to `input` for ordering purposes.
   *
   * Returns `-1` when less than, `0` when equal, or `1` when greater than `input`.
   * Designed for direct use as an `Array.sort` comparator.
   *
   * @param other {MoneyContract} - Comparison value.
   *
   * @returns `-1`, `0`, or `1`.
   *
   * @example
   * from(10, 'BR').compare(from(20, 'BR'))
   * // => -1
   *
   * from(10, 'BR').compare(from(10, 'BR'))
   * // => 0
   *
   * from(20, 'BR').compare(from(10, 'BR'))
   * // => 1
   *
   * @example
   * // Sorting
   * prices.sort((a, b) => a.compare(b))
   * // ascending
   *
   * prices.sort((a, b) => b.compare(a))
   * // descending
   */
  compare(other: MoneyContract): MoneyComparison;

  /**
   * Returns `true` if this instance is strictly greater than `input`.
   *
   * @param other {MoneyContract} - Comparison value.
   *
   * @example
   * from(10, 'BR').greaterThan(from(5, 'BR'))
   * // => true
   */
  greaterThan(other: MoneyContract): boolean;

  /**
   * Returns `true` if this instance is strictly less than `input`.
   *
   * @param other {MoneyContract} - Comparison value.
   *
   * @example
   * from(3, 'BR').lessThan(from(10, 'BR'))
   * // => true
   */
  lessThan(other: MoneyContract): boolean;

  /**
   * Returns `true` if this instance is greater than or equal to `input`.
   *
   * @param other {MoneyContract} - Comparison value.
   *
   * @example
   * from(10, 'BR').greaterThanOrEqual(from(10, 'BR'))
   * // => true
   */
  greaterThanOrEqual(other: MoneyContract): boolean;

  /**
   * Returns `true` if this instance is less than or equal to `input`.
   *
   * @param other {MoneyContract} - Comparison value.
   *
   * @example
   * from(5, 'BR').lessThanOrEqual(from(10, 'BR'))
   * // => true
   */
  lessThanOrEqual(other: MoneyContract): boolean;

  /**
   * Returns `true` if this instance falls within the closed interval `[min, max]`.
   *
   * @param min {MoneyContract} - Lower bound.
   * @param max {MoneyContract} - Upper bound.
   *
   * @example
   * from(5, 'BR').isBetween(from(1, 'BR'), from(10, 'BR'))
   * // => true
   *
   * from(11, 'BR').isBetween(from(1, 'BR'), from(10, 'BR'))
   * // => false
   */
  isBetween(min: MoneyContract, max: MoneyContract): boolean;

  /**
   * Returns `true` if `input` shares the same currency as this instance.
   *
   * @param other {MoneyContract} - Another `MoneyContract` to compare against.
   *
   * @example
   * from(10, 'BR').hasSameCurrency(from(20, 'BR')) // => true
   * from(10, 'BR').hasSameCurrency(from(20, 'US')) // => false
   */
  hasSameCurrency(other: MoneyContract): boolean;

  // #endregion

  // #region Business

  /**
   * Returns the given percentage of this instance's amount.
   *
   * The result is rounded in minor units. Defaults to `'halfExpand'`.
   *
   * @param percent {number} - Non-negative finite number representing a percentage (e.g. `15` for 15%).
   * @param roundingMode {RoundingMode} - Rounding strategy. Defaults to `'halfExpand'`.
   *
   * @example
   * from(200, 'BR').percentOf(15).amount()
   * // => 30
   *
   * from(100, 'BR').percentOf(33).amount()
   * // => 33
   */
  percentOf(percent: number, roundingMode?: RoundingMode): MoneyContract;

  /**
   * Applies a percentage discount and returns the reduced amount.
   *
   * Equivalent to `minus(percentOf(discount))`. The result is rounded in minor
   * units using `roundingMode`. Defaults to `'halfExpand'`.
   *
   * @param discount {number} - Discount percentage between `0` and `100` inclusive.
   * @param roundingMode {RoundingMode} - Rounding strategy. Defaults to `'halfExpand'`.
   *
   * @example
   * from(100, 'BR').applyDiscount(20).amount()
   * // => 80
   *
   * from(50, 'BR').applyDiscount(10).amount()
   * // => 45
   */
  applyDiscount(discount: number, roundingMode?: RoundingMode): MoneyContract;

  /**
   * Applies a percentage surcharge and returns the increased amount.
   *
   * Equivalent to `plus(percentOf(surcharge))`. The result is rounded in minor
   * units using `roundingMode`. Defaults to `'halfExpand'`.
   *
   * @param surcharge {number} - Non-negative surcharge percentage (e.g. `10` for +10%).
   * @param roundingMode {RoundingMode} - Rounding strategy. Defaults to `'halfExpand'`.
   *
   * @example
   * from(100, 'BR').applySurcharge(10).amount()
   * // => 110
   *
   * from(50, 'BR').applySurcharge(5).amount()
   * // => 52.5
   */
  applySurcharge(surcharge: number, roundingMode?: RoundingMode): MoneyContract;

  /**
   * Splits the amount into `parts` equal shares, distributing any remainder
   * cent-by-cent to the first slots (largest-remainder method).
   *
   * Guarantees that the sum of all parts equals the original amount.
   *
   * @param parts {number} - Positive integer number of shares.
   *
   * @example
   * from(10, 'BR').allocate(3).map((m) => m.amount())
   * // => [3.34, 3.33, 3.33]
   */
  allocate(parts: number): MoneyContract[];

  /**
   * Splits the amount proportionally according to `ratios`, distributing any
   * remainder cent-by-cent to the first slots (largest-remainder method).
   *
   * Ratios must be **non-negative integers** (e.g. `[1, 2, 3]` or `[30, 70]`).
   * Guarantees that the sum of all parts equals the original amount.
   *
   * @param ratios {number[]} - Non-empty array of non-negative integers representing relative shares.
   *
   * @example
   * from(100, 'BR').allocateByRatio([1, 3]).map((m) => m.amount())
   * // => [25, 75]
   */
  allocateByRatio(ratios: number[]): MoneyContract[];

  // #endregion

  // #region Display/Formatting

  /**
   * Formats the amount as a locale-aware currency string using `Intl.NumberFormat`.
   *
   * @param options {FormatOptions} - Optional display overrides.
   *
   * @see {@link FormatOptions}.
   *
   * @example
   * from(1999.9, 'BR').format()
   * // => 'R$ 1.999,90'
   *
   * from(1999.9, 'US').format({ currencyDisplay: 'code', notation: 'compact' })
   * // => 'USD 2K'
   */
  format(options?: FormatOptions): string;

  /**
   * Returns a string with the currency code and amount in major units.
   *
   * The number of decimal places matches the currency's `fractionDigits`.
   * For display purposes, prefer {@link format}.
   *
   * @example
   * from(19.99, 'BR').toString()
   * // => 'BRL 19.99'
   *
   * `Total: ${from(10, 'BR')}`
   * // => "Total: BRL 10.00"
   */
  toString(): string;

  /**
   * Returns a plain object safe for JSON serialization.
   *
   * Use {@link fromMinorUnits} to reconstruct the instance from this value.
   *
   * @returns A `MoneyJSON` object with `minorUnits` and `currencyCode`.
   *
   * @example
   * from(19.99, 'BR').toJSON()
   * // => { minorUnits: 1999, currencyCode: 'BRL' }
   */
  toJSON(): MoneyJSON;

  // #endregion
}
