import type { CountryCode } from '@/lib/currencies';
import type { MoneyInput } from '@/types';
import type { MoneyContract } from '@/types/contract';

import { DEFAULT_COUNTRY, resolveCurrency } from '@/lib/currencies';
import { Money } from '@/money';

export function from(value: MoneyInput, country: CountryCode = DEFAULT_COUNTRY): MoneyContract {
  return new Money(value, resolveCurrency(country));
}

export function fromMinorUnits(
  amount: number,
  country: CountryCode = DEFAULT_COUNTRY,
): MoneyContract {
  return Money.fromMinorUnits(amount, resolveCurrency(country));
}

export function zero(country: CountryCode = DEFAULT_COUNTRY): MoneyContract {
  return Money.zero(resolveCurrency(country));
}
