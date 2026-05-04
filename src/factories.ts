import type { CountryCode } from './lib/currencies';
import type { MoneyInput } from './types';
import type { MoneyContract } from './types/money';

import { isMoney as isMoneyGuard, resolveCurrency } from './lib/utils';
import { Money } from './money';

// ─── Type guard ───────────────────────────────────────────────────────────────

export function isMoney(value: unknown): value is MoneyContract {
  return isMoneyGuard(value);
}

// ─── Creation ─────────────────────────────────────────────────────────

export function from(value: MoneyInput, country?: CountryCode): MoneyContract {
  return new Money(value, country && resolveCurrency(country));
}

export function fromMinorUnits(amount: number, country?: CountryCode): MoneyContract {
  return Money.fromMinorUnits(amount, country && resolveCurrency(country));
}

export function zero(country?: CountryCode): MoneyContract {
  return Money.zero(country && resolveCurrency(country));
}
