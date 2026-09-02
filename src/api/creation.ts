import type { CountryCode } from '@/lib/currencies';
// @ts-expect-error: false positive
import type { UnsupportedCurrencyError } from '@/lib/errors';
import type { MoneyContract } from '@/types';

import { numberToMinorUnit, stringToMinorUnit } from '@/lib/convert';
import { resolveCurrency } from '@/lib/currencies';
import { InvalidInputError } from '@/lib/errors';
import { Money } from '@/lib/money';

/**
 * Creates a `MoneyContract` from a `number` in major units.
 *
 * The value is converted to minor units internally using the currency's
 * `fractionDigits`. Rounding is applied with `'halfExpand'` when the
 * conversion produces a non-integer result.
 *
 * @param value {number} Amount in major units (e.g. `19.99`).
 * @param country {CountryCode} Supported country code (e.g. `'BR'`, `'US'`).
 *
 * @returns {MoneyContract} A new `MoneyContract` instance.
 *
 * @throws {InvalidInputError} When `value` is not a finite number, is null/undefined, or exceeds the safe integer range after conversion to minor units.
 * @throws {UnsupportedCurrencyError} When `country` is not a supported code.
 *
 * @example
 * from(19.99, 'BR').format() // => 'R$ 19,99'
 * from(0, 'US').isZero()     // => true
 */
export function from(value: number, country: CountryCode): MoneyContract {
  if (typeof value !== 'number') {
    throw new InvalidInputError('Value must be a number.', { input: value });
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
 * @param value {string} A locale-formatted string (e.g. `'R$ 1.999,99'`, `'1,999.99'`).
 * @param country {CountryCode} Supported country code that defines the decimal/grouping separators.
 *
 * @returns {MoneyContract} A new `MoneyContract` instance.
 *
 * @throws {InvalidInputError} When `value` is not a string, cannot be parsed as a monetary amount, or contains multiple decimal separators.
 * @throws {UnsupportedCurrencyError} When `country` is not a supported code.
 *
 * @example
 * parse('R$ 1.999,99', 'BR').amount() // => 1999.99
 * parse('$1,999.99', 'US').amount()   // => 1999.99
 */
export function parse(value: string, country: CountryCode): MoneyContract {
  if (typeof value !== 'string') {
    throw new InvalidInputError('Value must be a string.', { input: value });
  }

  const currency = resolveCurrency(country);
  const amount = stringToMinorUnit(value, currency.decimal, currency.fractionDigits);

  return Money.fromMinorUnits(amount, currency);
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a {@link MoneyContract} directly from an integer in minor units.
 *
 * Use this when the value is already in minor units — for example, when
 * reconstructing from a database or a {@link MoneyContract.toJSON} payload.
 *
 * @param value {number} Integer minor-unit value (e.g. `1999` for R$ 19,99).
 * @param country {CountryCode} Supported country code.
 *
 * @returns A new `MoneyContract` instance.
 *
 * @throws {InvalidInputError} When `value` is not a finite integer or exceeds `Number.MAX_SAFE_INTEGER`.
 * @throws {UnsupportedCurrencyError} When `country` is not a supported code.
 *
 * @example
 * fromMinorUnits(1999, 'BR').amount()
 * // => 19.99
 */
export function fromMinorUnits(value: number, country: CountryCode): MoneyContract {
  const currency = resolveCurrency(country);
  return Money.fromMinorUnits(value, currency);
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a `MoneyContract` with an amount of zero for the given country.
 * Useful as an identity value for reductions or as a neutral starting point.
 *
 * @param country {CountryCode} Supported country code.
 *
 * @returns A new `MoneyContract` with `minorUnits === 0`.
 *
 * @throws {UnsupportedCurrencyError} When `country` is not a supported code.
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
