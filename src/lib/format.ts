import type { FormatOptions } from '@/types';
import type { MoneyContract } from '@/types/money';
import type { CurrencyConfig } from './currencies';

import { FORMAT_STYLES } from '@/lib/constants';

type IntlCurrencyDisplay = Exclude<FormatOptions['currencyDisplay'], 'none'>;

export function formatMoney(
  money: MoneyContract,
  currency: CurrencyConfig,
  options: FormatOptions = {},
): string {
  const locale = options.locale ?? currency.locale;
  const code = currency.code;

  const isDecimalOnly = options.currencyDisplay === 'none';
  const isCompact = options.notation === 'compact';

  const currencyDisplay = isDecimalOnly
    ? undefined
    : ((options.currencyDisplay ?? 'symbol') as IntlCurrencyDisplay);

  return new Intl.NumberFormat(locale, {
    style: isDecimalOnly ? FORMAT_STYLES.DECIMAL : FORMAT_STYLES.CURRENCY,
    currency: isDecimalOnly ? undefined : code,

    currencyDisplay,

    notation: options.notation || 'standard',
    signDisplay: options.signDisplay ?? 'auto',
    useGrouping: options.useGrouping ?? true,

    minimumFractionDigits: isCompact ? 0 : currency.fractionDigits,
    maximumFractionDigits: isCompact ? 1 : currency.fractionDigits,
  }).format(money.value());
}
