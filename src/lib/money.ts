import type {
  FormatOptions,
  MoneyComparison,
  MoneyContract,
  MoneyJSON,
  MoneyParts,
  RoundingMode,
} from '@/types';
import type { Currency, CurrencyCode } from './currencies';

import { numberToMinorUnit } from './convert';
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

  readonly #scaleFactor: number;
  readonly #minorUnits: number;

  constructor(input: number, currency: Currency) {
    this.#currency = currency;

    this.#scaleFactor = 10 ** currency.fractionDigits;
    this.#minorUnits = input;
  }

  // #region Static factories

  /**
   * Creates a `Money` instance from a raw integer in minor units.
   *
   * @param input — Integer minor-unit value (e.g. `1999` for R$ 19,99).
   * @param currency — Resolved currency descriptor.
   */
  static fromMinorUnits(input: number, currency: Currency): MoneyContract {
    /* v8 ignore if -- @preserve */
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

  /** @internal */
  #assertSameCurrency(input: MoneyContract): void {
    if (isMoney(input) && this.#currency.code === input.currencyCode()) return;

    throw new CurrencyMismatchError(this.#currency.code, input.currencyCode());
  }

  /** @internal Constructs a sibling instance, validating the result is safe. */
  #make(input: number): MoneyContract {
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
  toParts(): MoneyParts {
    const abs = Math.abs(this.#minorUnits);
    return {
      units: Math.floor(abs / this.#scaleFactor),
      subunits: abs % this.#scaleFactor,
      isNegative: this.#minorUnits < 0,
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

  /** @inheritdoc */
  isInteger(): boolean {
  return this.#minorUnits % this.#scaleFactor === 0;
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
  max(other: MoneyContract): MoneyContract {
    this.#assertSameCurrency(other);

    return this.#minorUnits >= other.minorUnits() ? this.#copy() : this.#make(other.minorUnits());
  }

  /** @inheritdoc */
  min(other: MoneyContract): MoneyContract {
     this.#assertSameCurrency(other);

    return this.#minorUnits <= other.minorUnits() ? this.#copy() : this.#make(other.minorUnits());
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

  clamp(min: MoneyContract, max: MoneyContract): MoneyContract {
  this.#assertSameCurrency(min);
  this.#assertSameCurrency(max);

  if (min.minorUnits() > max.minorUnits()) throw new InvalidRangeError();

  return this.#make(
    Math.min(Math.max(this.#minorUnits, min.minorUnits()), max.minorUnits()),
  );
}

  // #endregion

  // #region Comparison

  /** @inheritdoc */
  equals(input: MoneyContract): boolean {
    if (isMoney(input)) {
      return (
        input.currencyCode() === this.#currency.code && this.#minorUnits === input.minorUnits()
      );
    }

    return this.#minorUnits === numberToMinorUnit(input, this.#currency.fractionDigits);
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

    if (min.minorUnits() > max.minorUnits()) throw new InvalidRangeError();

    return this.#minorUnits >= min.minorUnits() && this.#minorUnits <= max.minorUnits();
  }

  /** @inheritdoc */
  hasSameCurrency(other: MoneyContract): boolean {
    if (!isMoney(other)) return false;

    return this.#currency.code === other.currencyCode();
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

    if (percent === 100) return this.#copy();

    return this.#make(ROUND_FUNCTIONS[roundingMode](this.#minorUnits * (percent / 100)));
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

    if (discount === 0) return this.#copy();

    if (discount === 100) return this.#zero();

    const discountAmount = ROUND_FUNCTIONS[roundingMode](this.#minorUnits * (discount / 100));
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

    if (surcharge === 0) return this.#copy();

    const surchargeAmount = ROUND_FUNCTIONS[roundingMode](this.#minorUnits * (surcharge / 100));
    return this.#make(this.#minorUnits + surchargeAmount);
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
    if (!Array.isArray(ratios) || ratios.length === 0) {
      throw new InvalidAllocationError('Ratios must be a non-empty array.');
    }

    let total = 0;

    for (const ratio of ratios) {
      if (!Number.isInteger(ratio) || ratio < 0) {
        throw new InvalidAllocationError(
          'Ratios must be integers. Use whole numbers like [1, 2, 3] or [30, 70].',
        );
      }
      total += ratio;
    }

    if (!Number.isSafeInteger(total)) {
      /* v8 ignore if -- @preserve */
      throw new InvalidAllocationError('The sum of ratios exceeds the safe integer range.');
    }

    if (total === 0) throw new InvalidAllocationError('The sum of ratios cannot be zero.');

    if (this.isZero()) return ratios.map(() => this.#zero());

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
    return `${this.#currency.code} ${this.amount().toFixed(this.#currency.fractionDigits)}`;
  }

  /** @inheritdoc */
  toJSON(): MoneyJSON {
    return { minorUnits: this.#minorUnits, currencyCode: this.#currency.code };
  }

  // #endregion
}
