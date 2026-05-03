import type { Maybe, MoneyInput, MoneyOptions, PricedItem } from './types';
import type { MoneyContract } from './types/money';

import { toMinorUnit } from './lib/convert';
import { isEmpty, isMoney as isMoneyGuard, isNil } from './lib/utils';
import { Money } from './money';

// ─── Type guard ───────────────────────────────────────────────────────────────

function isMoney(value: unknown): value is MoneyContract {
  return isMoneyGuard(value);
}

// ─── Creation ─────────────────────────────────────────────────────────

function from(value: MoneyInput = 0, options: MoneyOptions): MoneyContract {
  return new Money(value, options);
}

function fromCents(cents: number, options: MoneyOptions): MoneyContract {
  return Money.fromCents(cents, options);
}

function zero(options: MoneyOptions): MoneyContract {
  return Money.zero(options);
}

// ─── Arithmetic ───────────────────────────────────────────────────────────────

function add(a: MoneyInput, b: MoneyInput, options: MoneyOptions): MoneyContract {
  return Money.fromCents(toMinorUnit(a) + toMinorUnit(b), options);
}

function subtract(a: MoneyInput, b: MoneyInput, options: MoneyOptions): MoneyContract {
  return Money.fromCents(toMinorUnit(a) - toMinorUnit(b), options);
}

function multiply(value: MoneyInput, factor: number, options: MoneyOptions): MoneyContract {
  return from(value, options).times(factor);
}

function divide(value: MoneyInput, divisor: number, options: MoneyOptions): MoneyContract {
  return from(value, options).dividedBy(divisor);
}

function percentage(value: MoneyInput, percent: number, options: MoneyOptions): MoneyContract {
  return from(value, options).percentage(percent);
}

// ─── Business utilities ───────────────────────────────────────────────────────

function calculateTotal(
  items: PricedItem[] | null | undefined,
  options: MoneyOptions,
): MoneyContract {
  if (isNil(items) || isEmpty(items)) return Money.zero(options);

  const totalCents = items.reduce((sum, { price, quantity = 1 }) => {
    if (isNil(price)) return sum;
    return sum + toMinorUnit(price) * quantity;
  }, 0);

  return Money.fromCents(totalCents, options);
}

function calculateSubtotal(item: PricedItem, options: MoneyOptions): MoneyContract {
  const { price, quantity = 1 } = item;
  if (isNil(price)) return Money.zero(options);
  return Money.fromCents(toMinorUnit(price) * quantity, options);
}

function calculateAverage(values: Maybe<MoneyInput>[], options: MoneyOptions): MoneyContract {
  if (isEmpty(values)) return Money.zero(options);

  const validValues = values.filter((value): value is MoneyInput => !isNil(value));

  if (isEmpty(validValues)) return Money.zero(options);

  const totalCents = validValues.reduce<number>((sum, value) => sum + toMinorUnit(value), 0);
  return Money.fromCents(totalCents / validValues.length, options);
}

function distributeInstallments(
  value: MoneyInput,
  parts: number,
  options: MoneyOptions,
): MoneyContract[] {
  return from(value, options).allocate(parts);
}

// biome-ignore format: off
export const factories = {
  // Type guard
  isMoney,
  // Creation
  from,
  fromCents,
  zero,
  // Arithmetic
  add,
  subtract,
  multiply,
  divide,
  percentage,
  // Business utilities
  calculateTotal,
  calculateSubtotal,
  calculateAverage,
  distributeInstallments,
};
