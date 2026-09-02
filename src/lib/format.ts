import type { FormatOptions } from '@/types';
import type { Currency } from './currencies';

type IntlCurrencyDisplay = Exclude<FormatOptions['currencyDisplay'], 'none'>;

/**
 * `Intl.NumberFormat` instances are expensive to construct (locale data lookup)
 * but stateless once built, so identical (locale, options) pairs are reused
 * instead of rebuilding a formatter on every `format()` call.
 */
const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${locale}:${JSON.stringify(options)}`;

  let formatter = formatterCache.get(key);

  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    formatterCache.set(key, formatter);
  }

  return formatter;
}

/**
 * Formats a raw minor-unit value into a human-readable string.
 *
 * @internal
 *
 * @param value {number} - Raw minor-unit value (e.g. `1999` for R$ 19,99).
 * @param currency {Currency} - Resolved currency descriptor.
 * @param options {FormatOptions} - Optional display overrides.
 */
export function formatMoney(
  value: number,
  currency: Currency,
  options: FormatOptions = {},
): string {
  const locale = options.locale ?? currency.locale;

  const isDecimalOnly = options.currencyDisplay === 'none';
  const isCompact = options.notation === 'compact';

  const intlOptions: Intl.NumberFormatOptions = {
    style: isDecimalOnly ? 'decimal' : 'currency',
    currency: isDecimalOnly ? undefined : currency.currencyCode,

    currencySign: options.currencySign ?? 'standard',

    currencyDisplay: isDecimalOnly
      ? undefined
      : ((options.currencyDisplay as IntlCurrencyDisplay) ?? 'symbol'),

    notation: options.notation ?? 'standard',
    compactDisplay: options.compactDisplay ?? 'short',

    signDisplay: options.signDisplay ?? 'auto',
    useGrouping: options.useGrouping ?? true,

    minimumFractionDigits:
      options.minimumFractionDigits ?? (isCompact ? 0 : currency.fractionDigits),
    maximumFractionDigits:
      options.maximumFractionDigits ??
      (isCompact ? Math.min(1, currency.fractionDigits) : currency.fractionDigits),

    trailingZeroDisplay: options.trailingZeroDisplay ?? 'auto',
    roundingMode: options.roundingMode ?? 'halfExpand',
  };

  return getFormatter(locale, intlOptions).format(value);
}
