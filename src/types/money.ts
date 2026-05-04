import type { RoundingMode } from '@/lib/constants';
import type { FormatOptions, MoneyInput } from '@/types';

export interface MoneyContract {
  // ─── Accessors ────────────────────────────────────────────────────────

  amount(): number;

  value(): number;

  integer(): number;

  fraction(): number;

  units(): [number, number];

  // ─── State ────────────────────────────────────────────────────────────

  isZero(): boolean;

  isPositive(): boolean;

  isNegative(): boolean;

  // ─── Arithmetic ───────────────────────────────────────────────────────

  plus(input: MoneyInput): MoneyContract;

  minus(input: MoneyInput): MoneyContract;

  times(factor: number): MoneyContract;

  dividedBy(divisor: number): MoneyContract;

  // ─── Transformation ───────────────────────────────────────────────────

  absolute(): MoneyContract;

  negate(): MoneyContract;

  max(input: MoneyInput): MoneyContract;

  min(input: MoneyInput): MoneyContract;

  round(precision: number, mode?: RoundingMode): MoneyContract;

  // ─── Comparison ───────────────────────────────────────────────────────

  equals(input: MoneyInput): boolean;

  greaterThan(input: MoneyInput): boolean;

  lessThan(input: MoneyInput): boolean;

  greaterThanOrEqual(input: MoneyInput): boolean;

  lessThanOrEqual(input: MoneyInput): boolean;

  isBetween(min: MoneyInput, max: MoneyInput): boolean;

  // ─── Business ─────────────────────────────────────────────────────────

  percentage(percent: number): MoneyContract;

  applyDiscount(discount: number): MoneyContract;

  applySurcharge(surcharge: number): MoneyContract;

  allocate(parts: number): MoneyContract[];

  // ─── conversion ─────────────────────────────────────────────

  format(options?: FormatOptions): string;

  clone(): MoneyContract;

  toString(): string;

  valueOf(): number;
}
