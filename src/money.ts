import type { Currency } from './lib/currencies';
import type { FormatOptions, MoneyInput, RoundingMode } from './types';
import type { MoneyContract, MoneyJSON } from './types/contract';

import { TAG } from './lib/constants';
import { toMinorUnit } from './lib/convert';
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

type RoundFn = (v: number) => number;

const ROUND_FNS = {
  ceil: Math.ceil,
  floor: Math.floor,
  round: Math.round,
  trunc: Math.trunc,
} as const satisfies Record<RoundingMode, RoundFn>;

const SKIP_CONVERT = Symbol('money.internal');

export class Money implements MoneyContract {
  /** @internal */
  readonly _tag = TAG;

  readonly #amount: number;
  readonly #currency: Currency;
  readonly #minorUnit: number;

  // ─── Constructor ───────────────────────────────────────────────────────────

  constructor(input: MoneyInput, currency: Currency);
  constructor(sentinel: typeof SKIP_CONVERT, currency: Currency, rawMinorUnits: number);

  constructor(
    input: MoneyInput | typeof SKIP_CONVERT,
    currency: Currency,
    rawMinorUnits: number = 0,
  ) {
    this.#currency = currency;
    this.#minorUnit = 10 ** currency.fractionDigits;

    if (input === SKIP_CONVERT) {
      this.#amount = rawMinorUnits;
      return;
    }

    this.#amount = toMinorUnit(input, this.#currency);
  }

  // ─── Static factories ──────────────────────────────────────────────────────

  static fromMinorUnits(amount: number, currency: Currency): MoneyContract {
    if (!Number.isFinite(amount)) {
      throw new InvalidInputError(`Expected a finite number of minor units, got ${amount}.`, {
        input: amount,
      });
    }

    if (!Number.isInteger(amount)) {
      throw new InvalidInputError(`Minor units must be an integer, got ${amount}.`, {
        input: amount,
      });
    }

    return new Money(SKIP_CONVERT, currency, amount);
  }

  static zero(currency: Currency): MoneyContract {
    return new Money(SKIP_CONVERT, currency, 0);
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  #assertSameCurrency(input: MoneyInput): void {
    if (isMoney(input) && input.currencyCode() !== this.#currency.code) {
      throw new CurrencyMismatchError(this.#currency.code, input.currencyCode());
    }
  }

  #resolve(input: MoneyInput): number {
    this.#assertSameCurrency(input);
    return toMinorUnit(input, this.#currency);
  }

  #make(amount: number): MoneyContract {
    return new Money(SKIP_CONVERT, this.#currency, Math.round(amount));
  }

  // ─── Accessors ────────────────────────────────────────────────────────────

  amount(): number {
    return this.#amount;
  }

  value(): number {
    return this.#amount / this.#minorUnit;
  }

  integer(): number {
    return Math.floor(Math.abs(this.#amount) / this.#minorUnit);
  }

  cents(): number {
    return Math.abs(this.#amount % this.#minorUnit);
  }

  units(): [integer: number, cents: number] {
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
    return this.#make(this.#amount + this.#resolve(input));
  }

  minus(input: MoneyInput): MoneyContract {
    return this.#make(this.#amount - this.#resolve(input));
  }

  times(factor: number): MoneyContract {
    if (!Number.isFinite(factor)) {
      throw new InvalidInputError(`Factor must be a finite number, got ${factor}.`, {
        input: factor,
      });
    }

    if (factor === 0) return Money.zero(this.#currency);

    return this.#make(this.#amount * factor);
  }

  dividedBy(divisor: number): MoneyContract {
    if (divisor === 0) throw new DivisionByZeroError();

    if (!Number.isFinite(divisor)) {
      throw new InvalidInputError(`Divisor must be a finite number, got ${divisor}.`, {
        input: divisor,
      });
    }

    if (divisor === 1) return this.#make(this.#amount);

    return this.#make(this.#amount / divisor);
  }

  // ─── Transformation ───────────────────────────────────────────────────────

  absolute(): MoneyContract {
    return this.#make(Math.abs(this.#amount));
  }

  negate(): MoneyContract {
    return this.#make(-this.#amount);
  }

  max(input: MoneyInput): MoneyContract {
    const other = this.#resolve(input);
    return this.#amount >= other ? this.#make(this.#amount) : this.#make(other);
  }

  min(input: MoneyInput): MoneyContract {
    const other = this.#resolve(input);
    return this.#amount <= other ? this.#make(this.#amount) : this.#make(other);
  }

  round(step: number, mode: RoundingMode = 'round'): MoneyContract {
    if (!Number.isInteger(step) || step < 1)
      throw new InvalidInputError(`Step must be a positive integer, got ${step}.`, { input: step });

    if (step === 1 || this.isZero()) return this.#make(this.#amount);

    const abs = Math.abs(this.#amount);
    const result = ROUND_FNS[mode](abs / step) * step;
    const finalAmount = this.#amount < 0 ? -result : result;

    return this.#make(finalAmount);
  }

  // ─── Comparison ───────────────────────────────────────────────────────────

  equals(input: MoneyInput): boolean {
    return this.#amount === this.#resolve(input);
  }

  greaterThan(input: MoneyInput): boolean {
    return this.#amount > this.#resolve(input);
  }

  lessThan(input: MoneyInput): boolean {
    return this.#amount < this.#resolve(input);
  }

  greaterThanOrEqual(input: MoneyInput): boolean {
    return this.#amount >= this.#resolve(input);
  }

  lessThanOrEqual(input: MoneyInput): boolean {
    return this.#amount <= this.#resolve(input);
  }

  isBetween(min: MoneyInput, max: MoneyInput): boolean {
    const minAmount = this.#resolve(min);
    const maxAmount = this.#resolve(max);

    if (minAmount > maxAmount) throw new InvalidRangeError();

    return this.#amount >= minAmount && this.#amount <= maxAmount;
  }

  // ─── Business ─────────────────────────────────────────────────────────────

  percentage(percent: number): MoneyContract {
    if (percent < 0)
      throw new InvalidPercentageError('Percentage must be non-negative.', { input: percent });

    if (percent === 0) return Money.zero(this.#currency);

    if (percent === 100) return this.#make(this.#amount);

    return this.#make(this.#amount * (percent / 100));
  }

  applyDiscount(discount: number): MoneyContract {
    if (discount < 0)
      throw new InvalidPercentageError('Discount cannot be negative.', { input: discount });

    if (discount > 100)
      throw new InvalidPercentageError('Discount cannot exceed 100%.', { input: discount });

    if (discount === 0) return this.#make(this.#amount);

    if (discount === 100) return Money.zero(this.#currency);

    return this.minus(this.percentage(discount));
  }

  applySurcharge(surcharge: number): MoneyContract {
    if (surcharge < 0)
      throw new InvalidPercentageError('Surcharge must be non-negative.', { input: surcharge });

    if (surcharge === 0) return this.#make(this.#amount);

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
    return { amount: this.#amount, currencyCode: this.#currency.code };
  }

  valueOf(): number {
    return this.value();
  }
}
