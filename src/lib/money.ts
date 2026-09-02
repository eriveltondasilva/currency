import type {
  FormatOptions,
  MoneyComparison,
  MoneyContract,
  MoneyJSON,
  MoneyParts,
  RoundingMode,
} from '@/types';
import type { Currency, CurrencyCode } from './currencies';

import {
  CurrencyMismatchError,
  DivisionByZeroError,
  InvalidAllocationError,
  InvalidInputError,
  InvalidPercentageError,
  InvalidRangeError,
  UnsafeIntegerError,
} from './errors';
import { formatMoney } from './format';
import { DEFAULT_ROUNDING_MODE, ROUND_FUNCTIONS } from './rounding';
import { TAG, isMoney } from './utils';

import type { RoundFunction } from './rounding';

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Concrete implementation of {@link MoneyContract}.
 *
 * All amounts are stored internally as **minor-unit integers**
 * (`Number.isSafeInteger`) to eliminate floating-point errors.
 * Every arithmetic and transformation method returns a **new instance** —
 * this class is fully immutable.
 */
export class Money implements MoneyContract {
  readonly [TAG] = true;

  readonly #currency: Currency;
  readonly #minorUnits: number;

  private constructor(input: number, currency: Currency) {
    this.#currency = currency;
    this.#minorUnits = input;
  }

  // #region Static factories

  /**
   * Creates a `Money` instance from a raw integer in minor units.
   *
   * @param input {number} - Integer minor-unit value (e.g. `1999` for R$ 19,99).
   * @param currency {Currency} - Resolved currency descriptor.
   */
  static fromMinorUnits(input: number, currency: Currency): MoneyContract {
    if (!Number.isSafeInteger(input)) {
      throw new InvalidInputError('Minor units must be a safe integer.', { input });
    }

    return new Money(input, currency);
  }

  /**
   * Creates a `Money` instance with an amount of zero for the given currency.
   */
  static zero(currency: Currency): MoneyContract {
    return new Money(0, currency);
  }

  // #endregion

  // #region Private helpers

  /**
   * @internal Ensures the currency of the other instance is the same as this one.
   */
  #assertSameCurrency(other: MoneyContract): void {
    if (!isMoney(other)) {
      throw new InvalidInputError('Expected a MoneyContract instance.', { input: other });
    }

    if (this.#currency.currencyCode !== other.currencyCode()) {
      throw new CurrencyMismatchError(this.#currency.currencyCode, other.currencyCode());
    }
  }

  /** @internal Constructs a sibling instance, validating the result is safe. */
  #make(input: number): MoneyContract {
    if (!Number.isSafeInteger(input)) {
      throw new UnsafeIntegerError({ input });
    }

    return new Money(input, this.#currency);
  }

  /** @internal */
  #zero() {
    return Money.zero(this.#currency);
  }

  /**
   * @internal Looks up the rounding function for `mode`, validating it.
   * `RoundingMode` is a compile-time-only guarantee — this class can also be
   * consumed from plain JavaScript, where an invalid or misspelled mode
   * (e.g. `'halfUp'` instead of `'halfExpand'`) would otherwise reach
   * `ROUND_FUNCTIONS[mode]` as `undefined` and fail later with a cryptic
   * "is not a function" `TypeError`.
   */
  #getRoundingFunction(roundingMode: RoundingMode): RoundFunction {
    const roundingFunction = ROUND_FUNCTIONS[roundingMode];

    if (!roundingFunction) {
      throw new InvalidInputError(`Invalid rounding mode: "${roundingMode}".`, {
        input: roundingMode,
      });
    }

    return roundingFunction;
  }

  // #endregion

  // #region Accessors

  /** @inheritdoc */
  minorUnits(): number {
    return this.#minorUnits;
  }

  /** @inheritdoc */
  amount(): number {
    return this.#minorUnits / this.#currency.scaleFactor;
  }

  /** @inheritdoc */
  toParts(): MoneyParts {
    const abs = Math.abs(this.#minorUnits);

    return {
      units: Math.floor(abs / this.#currency.scaleFactor),
      subunits: abs % this.#currency.scaleFactor,
      isNegative: this.#minorUnits < 0,
    };
  }

  /** @inheritdoc */
  currencyCode(): CurrencyCode {
    return this.#currency.currencyCode;
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

  /** @inheritdoc */
  isInteger(): boolean {
    return this.#minorUnits % this.#currency.scaleFactor === 0;
  }

  // #endregion

  // #region Arithmetic

  /** @inheritdoc */
  plus(other: MoneyContract): MoneyContract {
    this.#assertSameCurrency(other);

    return this.#make(this.#minorUnits + other.minorUnits());
  }

  /** @inheritdoc */
  minus(other: MoneyContract): MoneyContract {
    this.#assertSameCurrency(other);

    return this.#make(this.#minorUnits - other.minorUnits());
  }

  /** @inheritdoc */
  times(factor: number, roundingMode: RoundingMode = DEFAULT_ROUNDING_MODE): MoneyContract {
    if (!Number.isFinite(factor)) {
      throw new InvalidInputError('Factor must be a finite number.', {
        input: factor,
      });
    }

    if (factor === 0) return this.#zero();
    if (factor === 1) return this;

    const roundingFunction = this.#getRoundingFunction(roundingMode);

    return this.#make(roundingFunction(this.#minorUnits * factor));
  }

  /** @inheritdoc */
  divide(divisor: number, roundingMode: RoundingMode = DEFAULT_ROUNDING_MODE): MoneyContract {
    if (!Number.isFinite(divisor)) {
      throw new InvalidInputError('Divisor must be a finite number.', {
        input: divisor,
      });
    }

    if (divisor === 0) throw new DivisionByZeroError();
    if (divisor === 1) return this;

    const roundingFunction = this.#getRoundingFunction(roundingMode);

    return this.#make(roundingFunction(this.#minorUnits / divisor));
  }

  // #endregion

  // #region Transformation

  /** @inheritdoc */
  abs(): MoneyContract {
    return this.#minorUnits < 0 ? this.#make(-this.#minorUnits) : this;
  }

  /** @inheritdoc */
  negate(): MoneyContract {
    return this.isZero() ? this : this.#make(-this.#minorUnits);
  }

  /** @inheritdoc */
  max(other: MoneyContract): MoneyContract {
    this.#assertSameCurrency(other);

    return this.#minorUnits >= other.minorUnits() ? this : other;
  }

  /** @inheritdoc */
  min(other: MoneyContract): MoneyContract {
    this.#assertSameCurrency(other);

    return this.#minorUnits <= other.minorUnits() ? this : other;
  }

  /** @inheritdoc */
  round(step: number, roundingMode: RoundingMode = DEFAULT_ROUNDING_MODE): MoneyContract {
    if (!Number.isFinite(step) || step <= 0) {
      throw new InvalidInputError('Step must be a positive finite number.', { input: step });
    }

    if (this.isZero()) return this;

    const stepInMinorUnits = Math.round(step * this.#currency.scaleFactor);

    if (stepInMinorUnits < 1) {
      throw new InvalidInputError(
        'Step is too small to be represented in minor units for this currency.',
        { input: step },
      );
    }

    if (stepInMinorUnits === 1) return this;

    const roundingFunction = this.#getRoundingFunction(roundingMode);

    return this.#make(roundingFunction(this.#minorUnits / stepInMinorUnits) * stepInMinorUnits);
  }

  clamp(min: MoneyContract, max: MoneyContract): MoneyContract {
    this.#assertSameCurrency(min);
    this.#assertSameCurrency(max);

    const minValue = min.minorUnits();
    const maxValue = max.minorUnits();

    if (minValue > maxValue) throw new InvalidRangeError();

    if (this.#minorUnits < minValue) return min;
    if (this.#minorUnits > maxValue) return max;

    return this;
  }

  // #endregion

  // #region Comparison

  /** @inheritdoc */
  equals(other: MoneyContract): boolean {
    if (!isMoney(other)) return false;

    return (
      this.#currency.currencyCode === other.currencyCode() &&
      this.#minorUnits === other.minorUnits()
    );
  }

  /** @inheritdoc */
  compare(other: MoneyContract): MoneyComparison {
    this.#assertSameCurrency(other);

    if (this.#minorUnits < other.minorUnits()) return -1;
    if (this.#minorUnits > other.minorUnits()) return 1;

    return 0;
  }

  /** @inheritdoc */
  greaterThan(other: MoneyContract): boolean {
    this.#assertSameCurrency(other);

    return this.#minorUnits > other.minorUnits();
  }

  /** @inheritdoc */
  lessThan(other: MoneyContract): boolean {
    this.#assertSameCurrency(other);

    return this.#minorUnits < other.minorUnits();
  }

  /** @inheritdoc */
  greaterThanOrEqual(other: MoneyContract): boolean {
    this.#assertSameCurrency(other);

    return this.#minorUnits >= other.minorUnits();
  }

  /** @inheritdoc */
  lessThanOrEqual(other: MoneyContract): boolean {
    this.#assertSameCurrency(other);

    return this.#minorUnits <= other.minorUnits();
  }

  /** @inheritdoc */
  isBetween(min: MoneyContract, max: MoneyContract): boolean {
    this.#assertSameCurrency(min);
    this.#assertSameCurrency(max);

    const minValue = min.minorUnits();
    const maxValue = max.minorUnits();

    if (minValue > maxValue) throw new InvalidRangeError();

    return this.#minorUnits >= minValue && this.#minorUnits <= maxValue;
  }

  /** @inheritdoc */
  hasSameCurrency(other: MoneyContract): boolean {
    if (!isMoney(other)) return false;

    return this.#currency.currencyCode === other.currencyCode();
  }

  // #endregion

  // #region Business

  /** @inheritdoc */
  percentOf(percent: number, roundingMode: RoundingMode = DEFAULT_ROUNDING_MODE): MoneyContract {
    if (!Number.isFinite(percent) || percent < 0) {
      throw new InvalidPercentageError('Percentage must be a non-negative finite number.', {
        input: percent,
      });
    }

    if (percent === 0) return this.#zero();
    if (percent === 100) return this;

    const roundingFunction = this.#getRoundingFunction(roundingMode);

    return this.#make(roundingFunction(this.#minorUnits * (percent / 100)));
  }

  /** @inheritdoc */
  applyDiscount(
    discount: number,
    roundingMode: RoundingMode = DEFAULT_ROUNDING_MODE,
  ): MoneyContract {
    if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
      throw new InvalidPercentageError('Discount must be a finite number between 0 and 100.', {
        input: discount,
      });
    }

    if (discount === 0) return this;
    if (discount === 100) return this.#zero();

    const roundingFunction = this.#getRoundingFunction(roundingMode);
    const discountAmount = roundingFunction(this.#minorUnits * (discount / 100));

    return this.#make(this.#minorUnits - discountAmount);
  }

  /** @inheritdoc */
  applySurcharge(
    surcharge: number,
    roundingMode: RoundingMode = DEFAULT_ROUNDING_MODE,
  ): MoneyContract {
    if (!Number.isFinite(surcharge) || surcharge < 0) {
      throw new InvalidPercentageError('Surcharge must be a non-negative finite number.', {
        input: surcharge,
      });
    }

    if (surcharge === 0) return this;

    const roundingFunction = this.#getRoundingFunction(roundingMode);
    const surchargeAmount = roundingFunction(this.#minorUnits * (surcharge / 100));

    return this.#make(this.#minorUnits + surchargeAmount);
  }

  /** @inheritdoc */
  allocate(parts: number): MoneyContract[] {
    if (!Number.isSafeInteger(parts) || parts < 1) {
      throw new InvalidAllocationError('Number of parts must be a positive integer.');
    }

    if (parts === 1) return [this];

    if (this.isZero()) {
      const zero = this.#zero();
      return Array.from({ length: parts }, () => zero);
    }

    const isNegative = this.isNegative();
    const absoluteAmount = Math.abs(this.#minorUnits);
    const base = Math.floor(absoluteAmount / parts);
    const remainder = absoluteAmount % parts;

    const lower = this.#make(isNegative ? -base : base);

    if (remainder === 0) return Array.from({ length: parts }, () => lower);

    const higher = this.#make(isNegative ? -(base + 1) : base + 1);

    return [
      ...Array.from({ length: remainder }, () => higher),
      ...Array.from({ length: parts - remainder }, () => lower),
    ];
  }

  /** @inheritdoc */
  allocateByRatio(ratios: number[]): MoneyContract[] {
    if (!Array.isArray(ratios) || ratios.length === 0) {
      throw new InvalidAllocationError('Ratios must be a non-empty array.');
    }

    let total = 0;

    for (const ratio of ratios) {
      if (!Number.isSafeInteger(ratio) || ratio < 0) {
        throw new InvalidAllocationError(
          'Ratios must be integers. Use whole numbers like [1, 2, 3] or [30, 70].',
        );
      }

      total += ratio;
    }

    if (!Number.isSafeInteger(total)) {
      throw new InvalidAllocationError('The sum of ratios exceeds the safe integer range.');
    }

    if (total === 0) {
      throw new InvalidAllocationError('The sum of ratios cannot be zero.');
    }

    if (this.isZero()) {
      const zero = this.#zero();
      return ratios.map(() => zero);
    }

    const isNegative = this.isNegative();
    const absoluteValue = Math.abs(this.#minorUnits);

    let distributed = 0;

    const shares = ratios.map((ratio) => {
      const calculated = absoluteValue * ratio;

      if (!Number.isSafeInteger(calculated)) {
        throw new UnsafeIntegerError({ input: calculated });
      }

      const share = Math.floor(calculated / total);
      distributed += share;

      return share;
    });

    const remainder = absoluteValue - distributed;

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
    return `${this.#currency.currencyCode} ${this.amount().toFixed(this.#currency.fractionDigits)}`;
  }

  /** @inheritdoc */
  toJSON(): MoneyJSON {
    return { minorUnits: this.#minorUnits, currencyCode: this.#currency.currencyCode };
  }

  // #endregion
}
