import type { CurrencyCode } from './lib/currencies';

/**
 * Accepted input for monetary operations.
 *
 * Pass a `number` (major units, e.g. `19.99`) or an existing `MoneyContract`
 * instance. When a `MoneyContract` is passed, the currency must match the
 * receiver's currency — otherwise a `CurrencyMismatchError` is thrown.
 */
export type MoneyInput = number | MoneyContract;

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
  price: MoneyInput;

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
 * const json = money.toJSON();
 * // => { minorUnits: 1999, currencyCode: 'BRL' }
 */
export interface MoneyJSON {
  /** Internal integer value (e.g. `1999` represents `R$ 19,99`). */
  minorUnits: number;
  /** ISO 4217 currency code. */
  currencyCode: CurrencyCode;
}

/**
 * Tuple of `[units, subunits]` returned by {@link MoneyContract.toParts}.
 *
 * Both values are always **non-negative integers**, regardless of the sign of
 * the underlying amount.
 *
 * @example
 * from(19.99, 'BR').toParts() // => [19, 99]
 * from(-5.07, 'US').toParts() // => [5, 7]
 */
export type MoneyParts = [units: number, subunits: number];

/**
 * Public contract for all monetary value objects produced by this library.
 *
 * Instances are **immutable**: every operation returns a new `MoneyContract`.
 * Values are stored internally as minor units (safe integers) to prevent
 * floating-point errors.
 *
 * Supported countries:
 *
 * `AU`, `BR`, `CA`, `CH`, `CN`, `DE`, `FR`, `GB`, `IN`, `JP`, `MX`, `PT`, `SG`, `US`.
 */
export interface MoneyContract {
  // #region Accessors

  /**
   * Returns the raw internal integer (minor units).
   *
   * @returns An integer such that `minorUnits / 10^fractionDigits === amount()`.
   *
   * @example
   * from(19.99, 'BR').minorUnits() // => 1999
   * from(100, 'JP').minorUnits()   // => 100  (JPY has 0 fraction digits)
   */
  minorUnits(): number;

  /**
   * Returns the monetary amount in major units.
   *
   * @returns A floating-point number (e.g. `19.99`). For display, prefer {@link format}.
   *
   * @example
   * from(19.99, 'BR').amount() // => 19.99
   */
  amount(): number;

  /**
   * Returns the whole-unit part of the amount, always non-negative.
   *
   * @returns A non-negative integer (e.g. `19` for `R$ 19,99`).
   *
   * @example
   * from(19.99, 'BR').units() // => 19
   * from(-5.07, 'US').units() // => 5
   */
  units(): number;

  /**
   * Returns the sub-unit part of the amount, always non-negative.
   *
   * @returns A non-negative integer (e.g. `99` for `R$ 19,99`).
   *
   * @example
   * from(19.99, 'BR').subunits() // => 99
   * from(-5.07, 'US').subunits() // => 7
   */
  subunits(): number;

  /**
   * Returns the amount split into `[units, subunits]`.
   * Both parts are always non-negative. See {@link MoneyParts}.
   *
   * @returns A `[units, subunits]` tuple.
   *
   * @example
   * from(19.99, 'BR').toParts() // => [19, 99]
   */
  toParts(): MoneyParts;

  /**
   * Returns the ISO 4217 currency code of this instance.
   *
   * @returns A currency code string such as `'BRL'` or `'USD'`.
   *
   * @example
   * from(10, 'BR').currencyCode() // => 'BRL'
   */
  currencyCode(): CurrencyCode;

  /**
   * Returns the BCP 47 locale tag associated with this instance's country.
   *
   * @returns A locale string such as `'pt-BR'` or `'en-US'`.
   *
   * @example
   * from(10, 'BR').locale() // => 'pt-BR'
   */
  locale(): string;

  // #endregion

  // #region State

  /**
   * Returns `true` if the amount is exactly zero.
   *
   * @example
   * from(0, 'BR').isZero()    // => true
   * from(0.01, 'BR').isZero() // => false
   */
  isZero(): boolean;

  /**
   * Returns `true` if the amount is greater than zero.
   *
   * @example
   * from(1, 'US').isPositive()  // => true
   * from(-1, 'US').isPositive() // => false
   */
  isPositive(): boolean;

  /**
   * Returns `true` if the amount is less than zero.
   *
   * @example
   * from(-1, 'US').isNegative() // => true
   * from(1, 'US').isNegative()  // => false
   */
  isNegative(): boolean;

  // #endregion

  // #region Arithmetic

  /**
   * Adds a monetary value to this instance.
   *
   * @param input — Amount to add. A `number` is interpreted as major units.
   *
   * @returns A new `MoneyContract` with the sum.
   *
   * @throws `CurrencyMismatchError` — when `input` is a `MoneyContract` with a different currency.
   * @throws `InvalidInputError` — when the result is not a finite number.
   * @throws `UnsafeIntegerError` — when the result exceeds `Number.MAX_SAFE_INTEGER`.
   *
   * @example
   * from(10, 'BR').plus(5).amount()             // => 15
   * from(10, 'BR').plus(from(5, 'BR')).amount() // => 15
   */
  plus(input: MoneyInput): MoneyContract;

  /**
   * Subtracts a monetary value from this instance.
   *
   * @param input — Amount to subtract. A `number` is interpreted as major units.
   *
   * @returns A new `MoneyContract` with the difference.
   *
   * @throws `CurrencyMismatchError` — when `input` is a `MoneyContract` with a different currency.
   * @throws `UnsafeIntegerError` — when the result exceeds `Number.MAX_SAFE_INTEGER`.
   *
   * @example
   * from(10, 'US').minus(3.50).amount() // => 6.5
   */
  minus(input: MoneyInput): MoneyContract;

  /**
   * Multiplies this instance by a scalar factor.
   *
   * The result is rounded in minor units using the specified `roundingMode`.
   * Defaults to `'halfExpand'`.
   *
   * @param factor — Finite scalar multiplier.
   * @param roundingMode — Rounding strategy applied to the minor-unit result. Defaults to `'halfExpand'`.
   *
   * @returns A new `MoneyContract` with the product.
   *
   * @throws `InvalidInputError` — when `factor` is not finite.
   * @throws `UnsafeIntegerError` — when the result exceeds `Number.MAX_SAFE_INTEGER`.
   *
   * @example
   * from(10, 'BR').times(1.5).amount()              // => 15
   * from(1, 'US').times(1/3, 'halfEven').amount()   // => 0.33
   */
  times(factor: number, roundingMode?: RoundingMode): MoneyContract;

  /**
   * Divides this instance by a scalar divisor.
   *
   * The result is rounded in minor units using the specified `roundingMode`.
   * Defaults to `'halfExpand'`.
   *
   * @param divisor — Finite, non-zero scalar.
   * @param roundingMode — Rounding strategy applied to the minor-unit result. Defaults to `'halfExpand'`.
   *
   * @returns A new `MoneyContract` with the quotient.
   *
   * @throws `DivisionByZeroError` — when `divisor` is `0`.
   * @throws `InvalidInputError` — when `divisor` is not finite.
   * @throws `UnsafeIntegerError` — when the result exceeds `Number.MAX_SAFE_INTEGER`.
   *
   * @example
   * from(10, 'BR').divide(4).amount() // => 2.5
   * from(1, 'US').divide(3).amount()  // => 0.33
   */
  divide(divisor: number, roundingMode?: RoundingMode): MoneyContract;

  // #endregion

  // #region Transformation

  /**
   * Returns a new instance with the absolute (non-negative) amount.
   *
   * @returns A new `MoneyContract` with `amount >= 0`.
   *
   * @example
   * from(-15, 'US').abs().amount() // => 15
   */
  abs(): MoneyContract;

  /**
   * Returns a new instance with the sign of the amount flipped.
   *
   * @returns A new `MoneyContract` with the negated amount.
   *
   * @example
   * from(20, 'BR').negate().amount()  // => -20
   * from(-20, 'BR').negate().amount() // => 20
   */
  negate(): MoneyContract;

  /**
   * Returns the greater of this instance and `input`.
   *
   * @param input — Comparison value. A `number` is interpreted as major units.
   *
   * @returns The larger of the two values as a new `MoneyContract`.
   *
   * @throws `CurrencyMismatchError` — when `input` is a `MoneyContract` with a different currency.
   *
   * @example
   * from(5, 'US').max(10).amount() // => 10
   * from(5, 'US').max(3).amount()  // => 5
   */
  max(input: MoneyInput): MoneyContract;

  /**
   * Returns the lesser of this instance and `input`.
   *
   * @param input — Comparison value. A `number` is interpreted as major units.
   *
   * @returns The smaller of the two values as a new `MoneyContract`.
   *
   * @throws `CurrencyMismatchError` — when `input` is a `MoneyContract` with a different currency.
   *
   * @example
   * from(5, 'US').min(10).amount() // => 5
   * from(5, 'US').min(3).amount()  // => 3
   */
  min(input: MoneyInput): MoneyContract;

  /**
   * Rounds the amount to the nearest multiple of `increment` minor units.
   *
   * Useful for currencies or payment systems that require rounding to specific
   * denominations (e.g. rounding to 5-cent increments).
   *
   * @param increment — Positive integer specifying the rounding step in minor units.
   * @param mode — Rounding strategy. Defaults to `'halfExpand'`
   * .
   * @returns A new `MoneyContract` rounded to the nearest `increment`.
   *
   * @throws `InvalidInputError` — when `increment` is not a positive integer.
   *
   * @example
   * from(1.03, 'US').round(5).amount() // => 1.05
   * from(1.02, 'US').round(5).amount() // => 1.00
   */
  round(increment: number, mode?: RoundingMode): MoneyContract;

  // #endregion

  // #region Comparison

  /**
   * Returns `true` if this instance represents the same amount and currency as `input`.
   *
   * When `input` is a `MoneyContract` with a different currency, returns `false`
   * instead of throwing.
   *
   * @param input — Value to compare. A `number` is interpreted as major units.
   *
   * @example
   * from(10, 'BR').equals(10)          // => true
   * from(10, 'BR').equals(from(10, 'US')) // => false
   */
  equals(input: MoneyInput): boolean;

  /**
   * Returns `true` if this instance is strictly greater than `input`.
   *
   * @param input — Comparison value. A `number` is interpreted as major units.
   *
   * @throws `CurrencyMismatchError` — when `input` is a `MoneyContract` with a different currency.
   *
   * @example
   * from(10, 'US').greaterThan(5) // => true
   */
  greaterThan(input: MoneyInput): boolean;

  /**
   * Returns `true` if this instance is strictly less than `input`.
   *
   * @param input — Comparison value. A `number` is interpreted as major units.
   *
   * @throws `CurrencyMismatchError` — when `input` is a `MoneyContract` with a different currency.
   *
   * @example
   * from(3, 'US').lessThan(10) // => true
   */
  lessThan(input: MoneyInput): boolean;

  /**
   * Returns `true` if this instance is greater than or equal to `input`.
   *
   * @param input — Comparison value. A `number` is interpreted as major units.
   *
   * @throws `CurrencyMismatchError` — when `input` is a `MoneyContract` with a different currency.
   *
   * @example
   * from(10, 'US').greaterThanOrEqual(10) // => true
   */
  greaterThanOrEqual(input: MoneyInput): boolean;

  /**
   * Returns `true` if this instance is less than or equal to `input`.
   *
   * @param input — Comparison value. A `number` is interpreted as major units.
   *
   * @throws `CurrencyMismatchError` — when `input` is a `MoneyContract` with a different currency.
   *
   * @example
   * from(5, 'US').lessThanOrEqual(10) // => true
   */
  lessThanOrEqual(input: MoneyInput): boolean;

  /**
   * Returns `true` if this instance falls within the closed interval `[min, max]`.
   *
   * @param min — Lower bound. A `number` is interpreted as major units.
   * @param max — Upper bound. A `number` is interpreted as major units.
   *
   * @throws `InvalidRangeError` — when `min` is greater than `max`.
   * @throws `CurrencyMismatchError` — when either bound is a `MoneyContract` with a different currency.
   *
   * @example
   * from(5, 'US').isBetween(1, 10)  // => true
   * from(11, 'US').isBetween(1, 10) // => false
   */
  isBetween(min: MoneyInput, max: MoneyInput): boolean;

  /**
   * Returns `true` if `input` shares the same currency as this instance.
   *
   * @param input — Another `MoneyContract` to compare against.
   *
   * @example
   * from(10, 'BR').hasSameCurrency(from(20, 'BR')) // => true
   * from(10, 'BR').hasSameCurrency(from(20, 'US')) // => false
   */
  hasSameCurrency(input: MoneyContract): boolean;

  // #endregion

  // #region Business

  /**
   * Returns the given percentage of this instance's amount.
   *
   * The result is rounded in minor units. Defaults to `'halfExpand'`.
   *
   * @param percent — Non-negative finite number representing a percentage (e.g. `15` for 15%).
   * @param roundingMode — Rounding strategy. Defaults to `'halfExpand'`.
   *
   * @returns A new `MoneyContract` representing the percentage amount.
   *
   * @throws `InvalidPercentageError` — when `percent` is negative or not finite.
   *
   * @example
   * from(200, 'BR').percentOf(15).amount() // => 30
   * from(100, 'US').percentOf(33).amount() // => 33
   */
  percentOf(percent: number, roundingMode?: RoundingMode): MoneyContract;

  /**
   * Applies a percentage discount and returns the reduced amount.
   *
   * Equivalent to `minus(percentOf(discount))`. The result is rounded in minor
   * units using `roundingMode`. Defaults to `'halfExpand'`.
   *
   * @param discount — Discount percentage between `0` and `100` inclusive.
   * @param roundingMode — Rounding strategy. Defaults to `'halfExpand'`.
   *
   * @returns A new `MoneyContract` with the discount applied.
   *
   * @throws `InvalidPercentageError` — when `discount` is negative, exceeds 100, or is not finite.
   *
   * @example
   * from(100, 'US').applyDiscount(20).amount() // => 80
   * from(50, 'BR').applyDiscount(10).amount()  // => 45
   */
  applyDiscount(discount: number, roundingMode?: RoundingMode): MoneyContract;

  /**
   * Applies a percentage surcharge and returns the increased amount.
   *
   * Equivalent to `plus(percentOf(surcharge))`. The result is rounded in minor
   * units using `roundingMode`. Defaults to `'halfExpand'`.
   *
   * @param surcharge — Non-negative surcharge percentage (e.g. `10` for +10%).
   * @param roundingMode — Rounding strategy. Defaults to `'halfExpand'`.
   *
   * @returns A new `MoneyContract` with the surcharge applied.
   *
   * @throws `InvalidPercentageError` — when `surcharge` is negative or not finite.
   *
   * @example
   * from(100, 'US').applySurcharge(10).amount() // => 110
   * from(50, 'BR').applySurcharge(5).amount()   // => 52.5
   */
  applySurcharge(surcharge: number, roundingMode?: RoundingMode): MoneyContract;

  /**
   * Splits the amount into `parts` equal shares, distributing any remainder
   * cent-by-cent to the first slots (largest-remainder method).
   *
   * Guarantees that the sum of all parts equals the original amount.
   *
   * @param parts — Positive integer number of shares.
   *
   * @returns An array of `parts` new `MoneyContract` instances.
   *
   * @throws `InvalidAllocationError` — when `parts` is not a positive integer.
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
   * @param ratios — Non-empty array of non-negative integers representing relative shares.
   *
   * @returns An array of new `MoneyContract` instances, one per ratio entry.
   *
   * @throws `InvalidAllocationError` — when `ratios` is empty, contains non-integers, negative values, sums to zero, or the sum exceeds `Number.MAX_SAFE_INTEGER`.
   * @throws `UnsafeIntegerError` — when an intermediate calculation exceeds the safe integer range.
   *
   * @example
   * from(100, 'US').allocateByRatio([1, 3]).map((m) => m.amount())
   * // => [25, 75]
   */
  allocateByRatio(ratios: number[]): MoneyContract[];

  // #endregion

  // #region Display/Formatting

  /**
   * Formats the amount as a locale-aware currency string using `Intl.NumberFormat`.
   *
   * @param options — Optional display overrides. See {@link FormatOptions}.
   *
   * @returns A formatted string.
   *
   * @example
   * from(1999.9, 'BR').format() // => 'R$ 1.999,90'
   * from(1999.9, 'US').format({ currencyDisplay: 'code', notation: 'compact' })
   * // => 'USD 2K'
   */
  format(options?: FormatOptions): string;

  /**
   * Returns a new `MoneyContract` with the same amount and currency.
   *
   * @returns A new independent instance (same minor units and currency).
   *
   * @example
   * const a = from(10, 'US');
   * const b = a.clone();
   *
   * a === b     // => false
   * a.equals(b) // => true
   */
  clone(): MoneyContract;

  /**
   * Returns the amount as a fixed-decimal string in major units.
   *
   * The number of decimal places matches the currency's `fractionDigits`.
   * For display purposes, prefer {@link format}.
   *
   * @returns A string such as `'19.99'` or `'100'` (for JPY).
   *
   * @example
   * from(19.99, 'BR').toString() // => '19.99'
   * from(500, 'JP').toString()   // => '500'
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
