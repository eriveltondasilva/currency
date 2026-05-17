# Format Options

`FormatOptions` is the optional argument accepted by [`format()`](/api/display#format). All properties are optional — omitted properties fall back to locale-aware defaults derived from the instance's currency.

```ts
import type { FormatOptions } from '@eriveltondasilva/currency'

format(options?: FormatOptions): string
```

## locale

Overrides the locale used for formatting. Does **not** affect the currency code, `minorUnits`, or any internal value — purely cosmetic.

```ts
locale?: string // BCP 47 locale tag
// default: the locale associated with the instance's country
```

```ts
const price = from(1999.99, 'BR') // BRL, pt-BR

price.format()                    // => 'R$ 1.999,99'  (pt-BR)
price.format({ locale: 'en-US' }) // => 'R$ 1,999.99'  (en-US separators, still BRL)
price.format({ locale: 'de-DE' }) // => 'R$ 1.999,99'  (de-DE — same as pt-BR here)
```

::: tip
Use `locale` when you need to display a foreign currency using the user's local number formatting conventions.
:::

## currencyDisplay

Controls how the currency identifier is rendered next to the number.

```ts
currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name' | 'none'
// default: 'symbol'
```

| Value            | Description                               | `from(1999.99, 'BR')`        | `from(1999.99, 'US')` |
| ---------------- | ----------------------------------------- | ---------------------------- | --------------------- |
| `'symbol'`       | Locale currency symbol                    | `R$ 1.999,99`                | `$1,999.99`           |
| `'narrowSymbol'` | Shorter symbol, avoids regional ambiguity | `R$1.999,99`                 | `$1,999.99`           |
| `'code'`         | ISO 4217 currency code                    | `BRL 1.999,99`               | `USD 1,999.99`        |
| `'name'`         | Full currency name                        | `1.999,99 reais brasileiros` | `1,999.99 US dollars` |
| `'none'`         | No currency identifier (decimal style)    | `1.999,99`                   | `1,999.99`            |

```ts
const price = from(1999.99, 'US')

price.format({ currencyDisplay: 'symbol' })       // => '$1,999.99'
price.format({ currencyDisplay: 'narrowSymbol' }) // => '$1,999.99'
price.format({ currencyDisplay: 'code' })         // => 'USD 1,999.99'
price.format({ currencyDisplay: 'name' })         // => '1,999.99 US dollars'
price.format({ currencyDisplay: 'none' })         // => '1,999.99'
```

## notation

Controls the number format style.

```ts
notation?: 'standard' | 'compact'
// default: 'standard'
```

| Value        | Description                  | `from(1500000, 'US')` |
| ------------ | ---------------------------- | --------------------- |
| `'standard'` | Full number with grouping    | `$1,500,000.00`       |
| `'compact'`  | Abbreviated with unit suffix | `$1.5M`               |

```ts
const amount = from(1500000, 'US')

amount.format({ notation: 'standard' }) // => '$1,500,000.00'
amount.format({ notation: 'compact' })  // => '$1.5M'
```

```ts
// Portuguese compact notation
from(1500000, 'BR').format({ notation: 'compact' }) // => 'R$ 1,5 mi'
from(1500000, 'DE').format({ notation: 'compact' }) // => '1,5 Mio. €'
```

Compact notation reduces `maximumFractionDigits` to `1` and `minimumFractionDigits` to `0` by default. Override with explicit values if needed:

```ts
from(1500000, 'US').format({
  notation: 'compact',
  minimumFractionDigits: 2,
}) // => '$1.50M'
```

## compactDisplay

Controls the unit label used with `notation: 'compact'`. Ignored when `notation` is `'standard'`.

```ts
compactDisplay?: 'short' | 'long'
// default: 'short'
```

```ts
from(1500000, 'US').format({ notation: 'compact', compactDisplay: 'short' })
// => '$1.5M'
from(1500000, 'US').format({ notation: 'compact', compactDisplay: 'long' })
// => '$1.5 million'

from(1500000, 'BR').format({ notation: 'compact', compactDisplay: 'long' })
// => 'R$ 1,5 milhão'
```

## signDisplay

Controls when the sign character (`+` or `-`) is rendered.

```ts
signDisplay?: 'auto' | 'always' | 'exceptZero' | 'negative'
// default: 'auto'
```

| Value          |  Positive  |   Zero   | Negative  |
| -------------- | :--------: | :------: | :-------: |
| `'auto'`       | `$100.00`  | `$0.00`  | `-$50.00` |
| `'always'`     | `+$100.00` | `+$0.00` | `-$50.00` |
| `'exceptZero'` | `+$100.00` | `$0.00`  | `-$50.00` |
| `'negative'`   | `$100.00`  | `$0.00`  | `-$50.00` |

```ts
const profit = from(100, 'US')
const loss   = from(-50, 'US')
const zero   = from(0, 'US')

profit.format({ signDisplay: 'always' })   // => '+$100.00'
loss.format({ signDisplay: 'always' })     // => '-$50.00'
zero.format({ signDisplay: 'always' })     // => '+$0.00'
zero.format({ signDisplay: 'exceptZero' }) // => '$0.00'
```

```ts
// P&L display — always show sign except for zero
function formatPnL(value: MoneyContract): string {
  return value.format({ signDisplay: 'exceptZero' })
}

formatPnL(from(250, 'US')) // => '+$250.00'
formatPnL(from(-80, 'US')) // => '-$80.00'
formatPnL(from(0, 'US'))   // => '$0.00'
```

## currencySign

Controls how negative values are rendered.

```ts
currencySign?: 'standard' | 'accounting'
// default: 'standard'
```

| Value          | Positive  |  Negative  |
| -------------- | :-------: | :--------: |
| `'standard'`   | `$100.00` | `-$50.00`  |
| `'accounting'` | `$100.00` | `($50.00)` |

```ts
from(100, 'US').format({ currencySign: 'accounting' }) // => '$100.00'
from(-50, 'US').format({ currencySign: 'accounting' }) // => '($50.00)'
from(-50, 'BR').format({ currencySign: 'accounting' }) // => '(R$ 50,00)'
```

## useGrouping

Controls whether digit-grouping separators are rendered.

```ts
useGrouping?: boolean | 'always' | 'auto' | 'min2'
// default: true
```

| Value               | `from(1000000, 'US')`      |
| ------------------- | -------------------------- |
| `true` / `'always'` | `$1,000,000.00`            |
| `false`             | `$1000000.00`              |
| `'auto'`            | locale-dependent           |
| `'min2'`            | groups only when 5+ digits |

```ts
from(1000000, 'US').format({ useGrouping: true })  // => '$1,000,000.00'
from(1000000, 'US').format({ useGrouping: false }) // => '$1000000.00'
from(1000, 'US').format({ useGrouping: 'min2' })   // => '$1,000.00'
from(999, 'US').format({ useGrouping: 'min2' })    // => '$999.00'
```

## trailingZeroDisplay

Controls whether trailing zeros are stripped when the amount is a whole number.

```ts
trailingZeroDisplay?: 'auto' | 'stripIfInteger'
// default: 'auto'
```

| Value              | `from(100, 'US')` | `from(100.5, 'US')` |
| ------------------ | :---------------: | :-----------------: |
| `'auto'`           |     `$100.00`     |      `$100.50`      |
| `'stripIfInteger'` |      `$100`       |      `$100.50`      |

```ts
from(100, 'US').format({ trailingZeroDisplay: 'auto' })
// => '$100.00'
from(100, 'US').format({ trailingZeroDisplay: 'stripIfInteger' })
// => '$100'
from(100.5, 'US').format({ trailingZeroDisplay: 'stripIfInteger' })
// => '$100.50'
```

## roundingMode

Rounding strategy applied during formatting. Affects only the visual output — the internal `minorUnits` value is never modified.

```ts
roundingMode?: RoundingMode
// default: 'halfExpand'
```

```ts
from(1.005, 'US').format()                          // => '$1.01'  (halfExpand)
from(1.005, 'US').format({ roundingMode: 'floor' }) // => '$1.00'
from(1.005, 'US').format({ roundingMode: 'ceil' })  // => '$1.01'
```

See [Rounding Modes](/reference/rounding-modes) for the full reference.

## minimumFractionDigits

Minimum number of fraction digits to display. Pads with zeros when the value has fewer decimals.

```ts
minimumFractionDigits?: number
// default: currency.fractionDigits
```

```ts
from(9.9, 'US').format()                             // => '$9.90' (default: 2)
from(9.9, 'US').format({ minimumFractionDigits: 0 }) // => '$10'
from(9.9, 'US').format({ minimumFractionDigits: 3 }) // => '$9.900'
```

## maximumFractionDigits

Maximum number of fraction digits to display. Truncates (with rounding) when the value has more decimals.

```ts
maximumFractionDigits?: number
// default: currency.fractionDigits
```

```ts
from(9.999, 'US').format()                             // => '$10.00' (default: 2)
from(9.999, 'US').format({ maximumFractionDigits: 1 }) // => '$10.0'
from(9.999, 'US').format({ maximumFractionDigits: 3 }) // => '$9.999'
```

::: warning
`minimumFractionDigits` must be less than or equal to `maximumFractionDigits`. Passing conflicting values will throw a `RangeError` from the underlying `Intl.NumberFormat` API.
:::

## Combining options

Options compose freely — any combination is valid as long as the underlying `Intl.NumberFormat` constraints are respected.

```ts
// Invoice line item — code, no trailing zeros, always signed
from(1500, 'US').format({
  currencyDisplay: 'code',
  trailingZeroDisplay: 'stripIfInteger',
  signDisplay: 'always',
})
// => '+USD 1,500'

// Dashboard KPI — compact, short label
from(4250000, 'US').format({
  notation: 'compact',
  compactDisplay: 'short',
  currencyDisplay: 'narrowSymbol',
})
// => '$4.3M'

// Accounting report — accounting sign, full precision
from(-2399.5, 'US').format({
  currencySign: 'accounting',
  currencyDisplay: 'code',
})
// => '(USD 2,399.50)'

// Raw number for a custom renderer
from(1999.99, 'BR').format({
  currencyDisplay: 'none',
  useGrouping: false,
})
// => '1999,99'
```
