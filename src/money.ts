import type { RoundingMode } from './lib/constants';
import type { CurrencyConfig } from './lib/currencies';
import type { FormatOptions, MoneyInput } from './types';
import type { MoneyContract, MoneyJSON } from './types/money';

import { ROUNDING_MODES, TAG } from './lib/constants';
import { toMinorUnit } from './lib/convert';
import { DEFAULT_CURRENCY } from './lib/currencies';
import {
  CurrencyMismatchError,
  DivisionByZeroError,
  InvalidAllocationError,
  InvalidInputError,
  InvalidPercentageError,
  InvalidRangeError,
} from './lib/errors';
import { formatMoney } from './lib/format';
import { isMoney } from './lib/utils';

const ROUND_FNS = {
  [ROUNDING_MODES.ROUND]: Math.round,
  [ROUNDING_MODES.FLOOR]: Math.floor,
  [ROUNDING_MODES.CEIL]: Math.ceil,
  [ROUNDING_MODES.TRUNC]: Math.trunc,
} as const satisfies Record<RoundingMode, (v: number) => number>;

const SKIP_CONVERT = Symbol('money.internal');

export class Money implements MoneyContract {
  /** @internal */
  readonly _tag = TAG;

  readonly #amount: number = 0;
  readonly #currency: CurrencyConfig;

  // ─── Constructor ───────────────────────────────────────────────────────────

  constructor(input?: MoneyInput, currency?: CurrencyConfig);
  constructor(sentinel: typeof SKIP_CONVERT, currency?: CurrencyConfig, rawMinorUnits?: number);

  constructor(
    input?: MoneyInput | typeof SKIP_CONVERT,
    currency?: CurrencyConfig,
    rawMinorUnits?: number,
  ) {
    this.#currency = currency ?? DEFAULT_CURRENCY;

    if (input === SKIP_CONVERT) {
      this.#amount = rawMinorUnits ?? 0;
      return;
    }

    this.#amount = toMinorUnit(input, this.#currency);
  }

  // ─── Static factories ──────────────────────────────────────────────────────

  static fromMinorUnits(amount: number, currency?: CurrencyConfig): MoneyContract {
    if (!Number.isFinite(amount)) {
      throw new InvalidInputError(
        `Expected a finite number of minor units, got ${amount}.`,
        amount,
      );
    }

    return new Money(SKIP_CONVERT, currency, Math.round(amount));
  }

  static zero(currency?: CurrencyConfig): MoneyContract {
    return new Money(SKIP_CONVERT, currency);
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  // TODO: implementar #assertSameCurrency
  #assertSameCurrency(input: MoneyInput): void {
    if (isMoney(input) && input.currencyCode() !== this.#currency.code) {
      throw new CurrencyMismatchError(this.#currency.code, input.currencyCode());
    }
  }

  #make(amount: number): MoneyContract {
    return new Money(SKIP_CONVERT, this.#currency, Math.round(amount));
  }

  // #clone(): MoneyContract {
  //   return new Money(SKIP_CONVERT, this.#currency, this.#amount);
  // }

  // ─── Accessors ────────────────────────────────────────────────────────────

  amount(): number {
    return this.#amount;
  }

  value(): number {
    return this.#amount / this.#currency.minorUnit;
  }

  integer(): number {
    return Math.floor(Math.abs(this.#amount) / this.#currency.minorUnit);
  }

  cents(): number {
    return Math.abs(this.#amount % this.#currency.minorUnit);
  }

  units(): [number, number] {
    return [this.integer(), this.cents()];
  }

  currencyCode(): string {
    return this.#currency.code;
  }

  locale(): string {
    return this.#currency.locale;
  }

  // ─── State ────────────────────────────────────────────────────────────────

  isZero(): boolean {
    return this.#amount === 0;
  }
  isPositive(): boolean {
    return this.#amount > 0;
  }
  isNegative(): boolean {
    return this.#amount < 0;
  }

  // ─── Arithmetic ───────────────────────────────────────────────────────────

  plus(input: MoneyInput): MoneyContract {
    this.#assertSameCurrency(input);
    const addend = toMinorUnit(input, this.#currency);
    return addend === 0 ? this.#make(this.#amount) : this.#make(this.#amount + addend);
  }

  minus(input: MoneyInput): MoneyContract {
    this.#assertSameCurrency(input);
    const subtrahend = toMinorUnit(input, this.#currency);
    return subtrahend === 0 ? this.#make(this.#amount) : this.#make(this.#amount - subtrahend);
  }

  times(factor: number): MoneyContract {
    if (!Number.isFinite(factor)) {
      throw new InvalidInputError(`Factor must be a finite number, got ${factor}.`, factor);
    }

    if (factor === 0) return Money.zero(this.#currency);
    if (factor === 1) return this.#make(this.#amount);

    return this.#make(this.#amount * factor);
  }

  dividedBy(divisor: number): MoneyContract {
    if (divisor === 0) throw new DivisionByZeroError();

    if (!Number.isFinite(divisor)) {
      throw new InvalidInputError(`Divisor must be a finite number, got ${divisor}.`, divisor);
    }

    if (divisor === 1) return this.#make(this.#amount);

    return this.#make(this.#amount / divisor);
  }

  // ─── Transformation ───────────────────────────────────────────────────────

  absolute(): MoneyContract {
    return this.#amount >= 0 ? this.#make(this.#amount) : this.#make(Math.abs(this.#amount));
  }

  negate(): MoneyContract {
    return this.isZero() ? this.#make(this.#amount) : this.#make(-this.#amount);
  }

  max(input: MoneyInput): MoneyContract {
    this.#assertSameCurrency(input);
    const other = toMinorUnit(input, this.#currency);
    return this.#amount >= other ? this.#make(this.#amount) : this.#make(other);
  }

  min(input: MoneyInput): MoneyContract {
    this.#assertSameCurrency(input);
    const other = toMinorUnit(input, this.#currency);
    return this.#amount <= other ? this.#make(this.#amount) : this.#make(other);
  }

  round(precision: number, mode: RoundingMode = ROUNDING_MODES.ROUND): MoneyContract {
    if (!Number.isInteger(precision) || precision < 1) {
      throw new InvalidInputError(
        `Precision must be a positive integer, got ${precision}.`,
        precision,
      );
    }

    if (precision === 1 || this.isZero()) return this.#make(this.#amount);

    const abs = Math.abs(this.#amount);
    const result = ROUND_FNS[mode](abs / precision) * precision;
    const finalAmount = this.#amount < 0 ? -result : result;

    return this.#make(finalAmount);
  }

  // ─── Comparison ───────────────────────────────────────────────────────────

  equals(input: MoneyInput): boolean {
    this.#assertSameCurrency(input);
    return this.#amount === toMinorUnit(input, this.#currency);
  }
  greaterThan(input: MoneyInput): boolean {
    this.#assertSameCurrency(input);
    return this.#amount > toMinorUnit(input, this.#currency);
  }
  lessThan(input: MoneyInput): boolean {
    this.#assertSameCurrency(input);
    return this.#amount < toMinorUnit(input, this.#currency);
  }
  greaterThanOrEqual(input: MoneyInput): boolean {
    this.#assertSameCurrency(input);
    return this.#amount >= toMinorUnit(input, this.#currency);
  }
  lessThanOrEqual(input: MoneyInput): boolean {
    this.#assertSameCurrency(input);
    return this.#amount <= toMinorUnit(input, this.#currency);
  }

  isBetween(min: MoneyInput, max: MoneyInput): boolean {
    this.#assertSameCurrency(min);
    this.#assertSameCurrency(max);

    const minAmount = toMinorUnit(min, this.#currency);
    const maxAmount = toMinorUnit(max, this.#currency);

    if (minAmount > maxAmount) throw new InvalidRangeError();

    return this.#amount >= minAmount && this.#amount <= maxAmount;
  }

  // ─── Business ─────────────────────────────────────────────────────────────

  percentage(percent: number): MoneyContract {
    if (percent <= 0) throw new InvalidPercentageError('Percentage must be greater than zero.');

    if (percent === 100) return this.#make(this.#amount);

    return this.times(percent / 100);
  }

  applyDiscount(discount: number): MoneyContract {
    if (discount < 0) throw new InvalidPercentageError('Discount cannot be negative.');

    if (discount > 100) throw new InvalidPercentageError('Discount cannot exceed 100%.');

    if (discount === 0) return this.#make(this.#amount);

    if (discount === 100) return Money.zero(this.#currency);

    return this.minus(this.percentage(discount));
  }

  applySurcharge(surcharge: number): MoneyContract {
    if (surcharge <= 0) throw new InvalidPercentageError('Surcharge must be greater than zero.');

    return this.plus(this.percentage(surcharge));
  }

  allocate(parts: number): MoneyContract[] {
    if (!Number.isInteger(parts) || parts <= 0) throw new InvalidAllocationError();

    if (this.isZero()) {
      return Array.from({ length: parts }, () => Money.zero(this.#currency));
    }

    const isNegative = this.#amount < 0;
    const absoluteAmount = Math.abs(this.#amount);
    const base = Math.floor(absoluteAmount / parts);
    const remainder = absoluteAmount % parts;

    return Array.from({ length: parts }, (_, i) => {
      const value = base + (i < remainder ? 1 : 0);
      return this.#make(isNegative ? -value : value);
    });
  }

  // ─── Display ──────────────────────────────────────────────────────────────

  format(options?: FormatOptions): string {
    return formatMoney(this, this.#currency, options);
  }

  clone(): MoneyContract {
    return this.#make(this.#amount);
  }

  toString(): string {
    return this.value().toFixed(this.#currency.fractionDigits);
  }

  toJSON(): MoneyJSON {
    return { amount: this.#amount, currency: this.#currency.code };
  }

  valueOf(): number {
    return this.value();
  }
}
