import type { CountryCode } from '@/lib/currencies';
import type { MoneyContract } from '@/types';

import { numberToMinorUnit, stringToMinorUnit } from '@/lib/convert';
import { resolveCurrency } from '@/lib/currencies';
import { InvalidInputError } from '@/lib/errors';
import { Money } from '@/lib/money';

function assertNotNull(value: unknown): void {
  if (value != null) return;
  throw new InvalidInputError('Value cannot be null or undefined.', { input: value });
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a `MoneyContract` from a `number` in major units.
 *
 * The value is converted to minor units internally using the currency's
 * `fractionDigits`. Rounding is applied with `'halfExpand'` when the
 * conversion produces a non-integer result.
 *
 * Also exported as `money` for more expressive usage.
 *
 * @param value - Amount in major units (e.g. `19.99`).
 * @param country - Supported country code (e.g. `'BR'`, `'US'`).
 *
 * @returns A new `MoneyContract` instance.
 *
 * @throws `InvalidInputError` - when `value` is not a finite number, is null/undefined, or exceeds the safe integer range after conversion to minor units.
 * @throws `UnsupportedCurrencyError` - when `country` is not a supported code.
 *
 * @example
 * from(19.99, 'BR').format() // => 'R$ 19,99'
 * from(0, 'US').isZero()     // => true
 */
export function from(value: number, country: CountryCode): MoneyContract {
  assertNotNull(value);

  if (typeof value !== 'number') {
    throw new InvalidInputError(`Expected a number.`, { input: value });
  }

  const currency = resolveCurrency(country);
  const amount = numberToMinorUnit(value, currency.fractionDigits);

  return Money.fromMinorUnits(amount, currency);
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a `MoneyContract` by parsing a locale-formatted currency string.
 *
 * The string is parsed according to the country's decimal and grouping
 * separators. Currency symbols and unknown characters are stripped before
 * parsing.
 *
 * @param value - A locale-formatted string (e.g. `'R$ 1.999,99'`, `'1,999.99'`).
 * @param country - Supported country code that defines the decimal/grouping separators.
 *
 * @returns A new `MoneyContract` instance.
 *
 * @throws `InvalidInputError` - when `value` is not a string, cannot be parsed as a monetary amount, or contains multiple decimal separators.
 * @throws `UnsupportedCurrencyError` - when `country` is not a supported code.
 *
 * @example
 * parse('R$ 1.999,99', 'BR').amount() // => 1999.99
 * parse('$1,999.99', 'US').amount()   // => 1999.99
 */
export function parse(value: string, country: CountryCode): MoneyContract {
  assertNotNull(value);

  if (typeof value !== 'string') {
    throw new InvalidInputError(`Expected a string.`, { input: value });
  }

  const currency = resolveCurrency(country);
  const amount = stringToMinorUnit(value, currency);

  return Money.fromMinorUnits(amount, currency);
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a `MoneyContract` directly from an integer in minor units.
 *
 * Use this when the value is already in minor units — for example, when
 * reconstructing from a database or a {@link MoneyContract.toJSON} payload.
 *
 * @param value - Integer minor-unit value (e.g. `1999` for R$ 19,99).
 * @param country - Supported country code.
 *
 * @returns A new `MoneyContract` instance.
 *
 * @throws `InvalidInputError` - when `value` is not a finite integer or exceeds `Number.MAX_SAFE_INTEGER`.
 * @throws `UnsupportedCurrencyError` - when `country` is not a supported code.
 *
 * @example
 * fromMinorUnits(1999, 'BR').amount() // => 19.99
 * fromMinorUnits(500, 'JP').amount()  // => 500  (JPY has 0 fraction digits)
 */
export function fromMinorUnits(value: number, country: CountryCode): MoneyContract {
  assertNotNull(value);

  if (!Number.isFinite(value)) {
    throw new InvalidInputError('fromMinorUnits(): value must be a finite number.', {
      input: value,
    });
  }

  if (!Number.isInteger(value)) {
    throw new InvalidInputError('fromMinorUnits(): value must be an integer.', { input: value });
  }

  if (!Number.isSafeInteger(value)) {
    throw new InvalidInputError('fromMinorUnits(): value exceeds safe integer range.', {
      input: value,
    });
  }

  const currency = resolveCurrency(country);
  return Money.fromMinorUnits(value, currency);
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a `MoneyContract` with an amount of zero for the given country.
 * Useful as an identity value for reductions or as a neutral starting point.
 *
 * @param country - Supported country code.
 *
 * @returns A new `MoneyContract` with `minorUnits === 0`.
 *
 * @throws `UnsupportedCurrencyError` - when `country` is not a supported code.
 *
 * @example
 * zero('BR').isZero()       // => true
 * zero('BR').format()       // => 'R$ 0,00'
 * zero('US').currencyCode() // => 'USD'
 */
export function zero(country: CountryCode): MoneyContract {
  const currency = resolveCurrency(country);
  return Money.zero(currency);
}
