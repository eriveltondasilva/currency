import type { Currency, CurrencyCode } from './lib/currencies';
import type {
  FormatOptions,
  MoneyComparison,
  MoneyContract,
  MoneyInput,
  MoneyJSON,
  MoneyParts,
  RoundingMode,
} from './types';

import { numberToMinorUnit } from './lib/convert';
import {
  CurrencyMismatchError,
  DivisionByZeroError,
  InvalidAllocationError,
  InvalidInputError,
  InvalidPercentageError,
  InvalidRangeError,
  UnsafeIntegerError,
} from './lib/errors';
import { formatMoney } from './lib/format';
import { DEFAULT_ROUNDING_MODE, ROUND_FUNCTIONS } from './lib/rounding';
import { isMoney, tag } from './lib/utils';

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Concrete implementation of {@link MoneyContract}.
 *
 * All amounts are stored internally as **minor-unit integers**
 * (`Number.isSafeInteger`) to eliminate floating-point errors.
 * Every arithmetic and transformation method returns a **new instance** —
 * this class is fully immutable.
 *
 * Instantiate via the static factories ({@link Money.fromMinorUnits},
 * {@link Money.zero}) or the top-level API functions (`from`, `parse`,
 * `fromMinorUnits`, `zero`). Do not call `new Money()` directly.
 */
export class Money implements MoneyContract {
  readonly #currency: Currency;
  readonly #scaleFactor: number;
  readonly #minorUnits: number;

  readonly [tag] = true;

  constructor(input: number, currency: Currency) {
    this.#scaleFactor = 10 ** currency.fractionDigits;
    this.#currency = currency;
    this.#minorUnits = input;
  }

  // #region Static factories

  /**
   * Creates a `Money` instance from a raw integer in minor units.
   *
   * Prefer the top-level `fromMinorUnits(value, country)` for public usage.
   * This factory is intended for internal construction where a resolved
   * {@link Currency} object is already available.
   *
   * @param input — Integer minor-unit value (e.g. `1999` for R$ 19,99).
   * @param currency — Resolved currency descriptor.
   *
   * @returns A new `MoneyContract` instance.
   *
   * @throws `InvalidInputError` — when `input` is not finite or not an integer.
   * @throws `UnsafeIntegerError` — when `input` exceeds `Number.MAX_SAFE_INTEGER`.
   */
  static fromMinorUnits(input: number, currency: Currency): MoneyContract {
    /* v8 ignore if -- @preserve */
    if (!Number.isFinite(input)) {
      throw new InvalidInputError('Expected a finite number of minor units.', {
        input,
      });
    }

    /* v8 ignore if -- @preserve */
    if (!Number.isInteger(input)) {
      throw new InvalidInputError('Minor units must be an integer.', {
        input,
      });
    }

    /* v8 ignore if -- @preserve */
    if (!Number.isSafeInteger(input)) {
      throw new UnsafeIntegerError({ input });
    }

    return new Money(input, currency);
  }

  /**
   * Creates a `Money` instance with an amount of zero for the given currency.
   *
   * Prefer the top-level `zero(country)` for public usage.
   *
   * @param currency — Resolved currency descriptor.
   *
   * @returns A new `MoneyContract` instance with `minorUnits === 0`.
   */
  static zero(currency: Currency): MoneyContract {
    return new Money(0, currency);
  }

  // #endregion

  // #region Private helpers

  /** @internal */
  #assertSameCurrency(input: MoneyContract): void {
    if (input.currencyCode() === this.#currency.code) return;

    throw new CurrencyMismatchError(this.#currency.code, input.currencyCode());
  }

  /** @internal Resolves a `MoneyInput` to its minor-unit integer. */
  #resolve(input: MoneyInput): number {
    if (isMoney(input)) {
      this.#assertSameCurrency(input);
      return input.minorUnits();
    }

    return numberToMinorUnit(input, this.#currency.fractionDigits);
  }

  /** @internal Constructs a sibling instance, validating the result is safe. */
  #make(input: number): MoneyContract {
    /* v8 ignore if -- @preserve */
    if (!Number.isFinite(input)) {
      throw new InvalidInputError('Operation produced a non-finite result.', { input });
    }

    if (!Number.isSafeInteger(input)) {
      throw new UnsafeIntegerError({ input });
    }

    return new Money(input, this.#currency);
  }

  /** @internal Copies the current instance without revalidation — only use when #minorUnits is already known to be safe. */
  #copy(): MoneyContract {
    return new Money(this.#minorUnits, this.#currency);
  }

  /** @internal */
  #zero() {
    return Money.zero(this.#currency);
  }

  // #endregion

  // #region Accessors

  /** @inheritdoc */
  minorUnits(): number {
    return this.#minorUnits;
  }

  /** @inheritdoc */
  amount(): number {
    return this.#minorUnits / this.#scaleFactor;
  }

  /** @inheritdoc */
  units(): number {
    return Math.floor(Math.abs(this.#minorUnits) / this.#scaleFactor);
  }

  /** @inheritdoc */
  subunits(): number {
    return Math.abs(this.#minorUnits) % this.#scaleFactor;
  }

  /** @inheritdoc */
  toParts(): MoneyParts {
    return {
      units: this.units(),
      subunits: this.subunits(),
      isNegative: this.isNegative(),
    };
  }

  /** @inheritdoc */
  currencyCode(): CurrencyCode {
    return this.#currency.code;
  }

  /** @inheritdoc */
  locale(): string {
    return this.#currency.locale;
  }

  // #endregion

  // #region State

  /** @inheritdoc */
  isZero(): boolean {
    return this.#minorUnits === 0;
  }

  /** @inheritdoc */
  isPositive(): boolean {
    return this.#minorUnits > 0;
  }

  /** @inheritdoc */
  isNegative(): boolean {
    return this.#minorUnits < 0;
  }

  // #endregion

  // #region Arithmetic

  /** @inheritdoc */
  plus(input: MoneyInput): MoneyContract {
    return this.#make(this.#minorUnits + this.#resolve(input));
  }

  /** @inheritdoc */
  minus(input: MoneyInput): MoneyContract {
    return this.#make(this.#minorUnits - this.#resolve(input));
  }

  /** @inheritdoc */
  times(factor: number, roundingMode: RoundingMode = DEFAULT_ROUNDING_MODE): MoneyContract {
    if (!Number.isFinite(factor)) {
      throw new InvalidInputError('Factor must be a finite number.', {
        input: factor,
      });
    }

    if (factor === 0) return this.#zero();
    if (factor === 1) return this.#copy();

    return this.#make(ROUND_FUNCTIONS[roundingMode](this.#minorUnits * factor));
  }

  /** @inheritdoc */
  divide(divisor: number, roundingMode: RoundingMode = DEFAULT_ROUNDING_MODE): MoneyContract {
    if (divisor === 0) throw new DivisionByZeroError();

    if (!Number.isFinite(divisor)) {
      throw new InvalidInputError('Divisor must be a finite number.', {
        input: divisor,
      });
    }

    if (divisor === 1) return this.#copy();

    return this.#make(ROUND_FUNCTIONS[roundingMode](this.#minorUnits / divisor));
  }

  // #endregion

  // #region Transformation

  /** @inheritdoc */
  abs(): MoneyContract {
    return this.#make(Math.abs(this.#minorUnits));
  }

  /** @inheritdoc */
  negate(): MoneyContract {
    return this.#make(-this.#minorUnits);
  }

  /** @inheritdoc */
  max(input: MoneyInput): MoneyContract {
    const other = this.#resolve(input);
    return this.#minorUnits >= other ? this.#copy() : this.#make(other);
  }

  /** @inheritdoc */
  min(input: MoneyInput): MoneyContract {
    const other = this.#resolve(input);
    return this.#minorUnits <= other ? this.#copy() : this.#make(other);
  }

  /** @inheritdoc */
  round(step: number, mode: RoundingMode = DEFAULT_ROUNDING_MODE): MoneyContract {
    if (!Number.isFinite(step) || step <= 0) {
      throw new InvalidInputError('Step must be a positive finite number.', { input: step });
    }

    if (this.isZero()) return this.#copy();

    const stepInMinorUnits = Math.round(step * this.#scaleFactor);

    /* v8 ignore if -- @preserve */
    if (stepInMinorUnits < 1) {
      throw new InvalidInputError(
        'Step is too small to be represented in minor units for this currency.',
        { input: step },
      );
    }

    if (stepInMinorUnits === 1) return this.#copy();

    return this.#make(
      ROUND_FUNCTIONS[mode](this.#minorUnits / stepInMinorUnits) * stepInMinorUnits,
    );
  }

  // #endregion

  // #region Comparison

  /** @inheritdoc */
  equals(input: MoneyInput): boolean {
    const hasDifferentCurrency = isMoney(input) && input.currencyCode() !== this.#currency.code;
    if (hasDifferentCurrency) return false;

    return this.#minorUnits === this.#resolve(input);
  }

  /** @inheritdoc */
  compare(other: MoneyInput): MoneyComparison {
    const otherMinorUnits = this.#resolve(other);

    if (this.#minorUnits < otherMinorUnits) return -1;
    if (this.#minorUnits > otherMinorUnits) return 1;

    return 0;
  }

  /** @inheritdoc */
  greaterThan(input: MoneyInput): boolean {
    return this.#minorUnits > this.#resolve(input);
  }

  /** @inheritdoc */
  lessThan(input: MoneyInput): boolean {
    return this.#minorUnits < this.#resolve(input);
  }

  /** @inheritdoc */
  greaterThanOrEqual(input: MoneyInput): boolean {
    return this.#minorUnits >= this.#resolve(input);
  }

  /** @inheritdoc */
  lessThanOrEqual(input: MoneyInput): boolean {
    return this.#minorUnits <= this.#resolve(input);
  }

  /** @inheritdoc */
  isBetween(min: MoneyInput, max: MoneyInput): boolean {
    const minAmount = this.#resolve(min);
    const maxAmount = this.#resolve(max);

    if (minAmount > maxAmount) throw new InvalidRangeError();

    return this.#minorUnits >= minAmount && this.#minorUnits <= maxAmount;
  }

  /** @inheritdoc */
  hasSameCurrency(input: MoneyContract): boolean {
    if (!isMoney(input)) return false;
    return this.#currency.code === input.currencyCode();
  }

  // #endregion

  // #region Business

  /** @inheritdoc */
  percentOf(percent: number, roundingMode: RoundingMode = DEFAULT_ROUNDING_MODE): MoneyContract {
    if (!Number.isFinite(percent)) {
      throw new InvalidPercentageError('Percentage must be a finite number.', { input: percent });
    }

    if (percent < 0) {
      throw new InvalidPercentageError('Percentage must be non-negative.', { input: percent });
    }

    if (percent === 0) return this.#zero();

    if (percent === 100) return this.#copy();

    return this.#make(ROUND_FUNCTIONS[roundingMode](this.#minorUnits * (percent / 100)));
  }

  /** @inheritdoc */
  applyDiscount(
    discount: number,
    roundingMode: RoundingMode = DEFAULT_ROUNDING_MODE,
  ): MoneyContract {
    if (!Number.isFinite(discount)) {
      throw new InvalidPercentageError('Discount must be a finite number.', { input: discount });
    }

    if (discount < 0) {
      throw new InvalidPercentageError('Discount cannot be negative.', { input: discount });
    }

    if (discount > 100) {
      throw new InvalidPercentageError('Discount cannot exceed 100%.', { input: discount });
    }

    if (discount === 0) return this.#copy();

    if (discount === 100) return this.#zero();

    return this.minus(this.percentOf(discount, roundingMode));
  }

  /** @inheritdoc */
  applySurcharge(
    surcharge: number,
    roundingMode: RoundingMode = DEFAULT_ROUNDING_MODE,
  ): MoneyContract {
    if (!Number.isFinite(surcharge)) {
      throw new InvalidPercentageError('Surcharge must be a finite number.', { input: surcharge });
    }

    if (surcharge < 0)
      throw new InvalidPercentageError('Surcharge must be non-negative.', { input: surcharge });

    if (surcharge === 0) return this.#copy();

    return this.plus(this.percentOf(surcharge, roundingMode));
  }

  /** @inheritdoc */
  allocate(parts: number): MoneyContract[] {
    const hasInvalidParts = !Number.isInteger(parts) || parts < 1;
    if (hasInvalidParts) {
      throw new InvalidAllocationError('Number of parts must be a positive integer.');
    }

    if (parts === 1) return [this.#copy()];

    if (this.isZero()) return Array.from({ length: parts }, () => this.#zero());

    const isNegative = this.isNegative();
    const absoluteAmount = Math.abs(this.#minorUnits);
    const base = Math.floor(absoluteAmount / parts);
    const remainder = absoluteAmount % parts;

    return Array.from({ length: parts }, (_, i) => {
      const value = base + (i < remainder ? 1 : 0);
      return this.#make(isNegative ? -value : value);
    });
  }

  /** @inheritdoc */
  allocateByRatio(ratios: number[]): MoneyContract[] {
    const hasInvalidRatios =
      ratios.length === 0 || ratios.some((ratio) => !Number.isFinite(ratio) || ratio < 0);
    if (hasInvalidRatios) {
      throw new InvalidAllocationError(
        'Ratios must be a non-empty array of non-negative finite numbers.',
      );
    }

    const hasNonIntegerRatios = ratios.some((ratio) => !Number.isInteger(ratio));
    if (hasNonIntegerRatios) {
      throw new InvalidAllocationError(
        'Ratios must be integers. Use whole numbers like [1, 2, 3] or [30, 70].',
      );
    }

    const total = ratios.reduce((acc, ratio) => acc + ratio, 0);

    /* v8 ignore if -- @preserve */
    if (!Number.isSafeInteger(total)) {
      throw new InvalidAllocationError('The sum of ratios exceeds the safe integer range.');
    }

    if (total === 0) {
      throw new InvalidAllocationError('The sum of ratios cannot be zero.');
    }

    if (this.isZero()) return ratios.map(() => this.#zero());

    const isNegative = this.isNegative();
    const absoluteAmount = Math.abs(this.#minorUnits);

    const shares = ratios.map((ratio) => {
      const intermediate = absoluteAmount * ratio;

      if (!Number.isSafeInteger(intermediate)) {
        throw new UnsafeIntegerError({ input: intermediate });
      }

      return Math.floor(intermediate / total);
    });

    const distributed = shares.reduce((acc, share) => acc + share, 0);
    const remainder = absoluteAmount - distributed;

    return shares.map((share, i) => {
      const value = share + (i < remainder ? 1 : 0);
      return this.#make(isNegative ? -value : value);
    });
  }

  // #endregion

  // #region Display

  /** @inheritdoc */
  format(options?: FormatOptions): string {
    return formatMoney(this.amount(), this.#currency, options);
  }

  /** @inheritdoc */
  toString(): string {
    return `${this.#currency.code} ${this.amount().toFixed(this.#currency.fractionDigits)}`;
  }

  /** @inheritdoc */
  toJSON(): MoneyJSON {
    return { minorUnits: this.#minorUnits, currencyCode: this.#currency.code };
  }

  // #endregion
}
