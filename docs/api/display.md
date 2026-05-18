# Display

Methods for converting a `MoneyContract` instance to a human-readable or serializable representation.

## format

Formats the amount as a locale-aware currency string using the native `Intl.NumberFormat` API.

```ts
format(options?: FormatOptions): string
```

### Parameters

| Name      | Type            | Description                                              |
| --------- | --------------- | -------------------------------------------------------- |
| `options` | `FormatOptions` | Optional display overrides. All properties are optional. |

When `options` is omitted, the output uses the instance's locale, currency symbol, standard notation, and the currency's default fraction digits.

### Examples

**Default formatting**

```ts
import { from } from '@eriveltondasilva/currency'

from(1999.90, 'BR').format() // => 'R$ 1.999,90'
from(1999.90, 'US').format() // => '$1,999.90'
from(1999.90, 'DE').format() // => '1.999,90 €'
from(1999.90, 'JP').format() // => '¥2,000'
from(1999.90, 'CH').format() // => 'CHF 1'999.90'
```

**`currencyDisplay`** — controls how the currency identifier is rendered

```ts
const price = from(1999.90, 'BR')

price.format({ currencyDisplay: 'symbol' }) // => 'R$ 1.999,90'  (default)
price.format({ currencyDisplay: 'code' })   // => 'BRL 1.999,90'
price.format({ currencyDisplay: 'name' })   // => '1.999,90 reais brasileiros'
price.format({ currencyDisplay: 'none' })   // => '1.999,90'  (decimal only)
```

**`notation`** — controls the number format

```ts
const large = from(1500000, 'BR')

large.format({ notation: 'standard' }) // => 'R$ 1.500.000,00'  (default)
large.format({ notation: 'compact' })  // => 'R$ 1,5 mi'
```

```ts
from(1500000, 'US').format({ notation: 'compact' }) // => '$1.5M'
from(1500000, 'US').format({ notation: 'compact', compactDisplay: 'long' })
// => '$1.5 million'
```

**`signDisplay`** — controls when the sign character is rendered

```ts
const price = from(100, 'US')

price.format({ signDisplay: 'auto' })       // => '$100.00'   (default — negative only)
price.format({ signDisplay: 'always' })     // => '+$100.00'
price.format({ signDisplay: 'exceptZero' }) // => '+$100.00'
price.format({ signDisplay: 'negative' })   // => '$100.00'   (no '+' for positives)

from(-50, 'US').format({ signDisplay: 'always' }) // => '-$50.00'
```

**`currencySign`** — accounting notation for negatives

```ts
from(-50, 'US').format({ currencySign: 'accounting' }) // => '($50.00)'
from(50, 'US').format({ currencySign: 'accounting' })  // => '$50.00'
```

**`useGrouping`** — digit grouping separators

```ts
from(1000000, 'US').format({ useGrouping: true })  // => '$1,000,000.00'  (default)
from(1000000, 'US').format({ useGrouping: false }) // => '$1000000.00'
```

**`trailingZeroDisplay`** — trailing zeros on whole amounts

```ts
from(100, 'US').format({ trailingZeroDisplay: 'auto' })
// => '$100.00' (default)
from(100, 'US').format({ trailingZeroDisplay: 'stripIfInteger' })
// => '$100'
```

**`minimumFractionDigits` / `maximumFractionDigits`** — fraction digit control

```ts
from(9.9, 'US').format({ minimumFractionDigits: 2 })   // => '$9.90' (default)
from(9.9, 'US').format({ minimumFractionDigits: 0 })   // => '$10'
from(9.999, 'US').format({ maximumFractionDigits: 1 }) // => '$10.0'
```

**`locale`** — override the display locale without changing the currency

```ts
// Display BRL amount using US number formatting conventions
from(1999.90, 'BR').format({ locale: 'en-US' }) // => 'R$ 1,999.90'
```

**`roundingMode`** — rounding strategy used during formatting

```ts
from(1.005, 'US').format({ roundingMode: 'halfExpand' }) // => '$1.01'
from(1.005, 'US').format({ roundingMode: 'floor' })      // => '$1.00'
```

::: tip
`roundingMode` in `format` only affects the visual output. The underlying `minorUnits` value is never modified by formatting.
:::

## toString

Returns a plain string with the currency code and amount in major units.

The number of decimal places matches the currency's `fractionDigits`. For display to end users, prefer `format()`.

```ts
toString(): string
```

### Examples

```ts
import { from } from '@eriveltondasilva/currency'

from(19.99, 'BR').toString() // => 'BRL 19.99'
from(19.99, 'US').toString() // => 'USD 19.99'
from(500, 'JP').toString()   // => 'JPY 500'
from(0, 'US').toString()     // => 'USD 0.00'
```

```ts
// Automatically called by template literals and string coercion
const price = from(9.99, 'US')
console.log(`Price: ${price}`) // => 'Price: USD 9.99'
```

## toJSON

Returns a plain object safe for JSON serialization.

```ts
toJSON(): MoneyJSON
```

```ts
interface MoneyJSON {
  minorUnits: number   // internal integer (e.g. 1999)
  currencyCode: string // ISO 4217 code (e.g. 'BRL')
}
```

`JSON.stringify` calls `toJSON` automatically, so the output is correct when serializing directly.

### Examples

```ts
import { from, fromMinorUnits } from '@eriveltondasilva/currency'

from(19.99, 'BR').toJSON()
// => { minorUnits: 1999, currencyCode: 'BRL' }

from(9.99, 'US').toJSON()
// => { minorUnits: 999, currencyCode: 'USD' }

from(500, 'JP').toJSON()
// => { minorUnits: 500, currencyCode: 'JPY' }
```

```ts
// JSON.stringify integration
const price = from(19.99, 'BR')

JSON.stringify({ price })
// => '{"price":{"minorUnits":1999,"currencyCode":"BRL"}}'
```

```ts
// Round-tripping through JSON
const original = from(19.99, 'BR')
const json = original.toJSON()
// => { minorUnits: 1999, currencyCode: 'BRL' }

// Restore — map currencyCode back to a CountryCode on your side
const restored = fromMinorUnits(json.minorUnits, 'BR')
restored.equals(original)  // => true
```

::: warning CurrencyCode vs CountryCode on restore
`toJSON` emits `currencyCode` (e.g. `'BRL'`), but `fromMinorUnits` requires a `CountryCode` (e.g. `'BR'`). You are responsible for maintaining that mapping in your application.

When multiple countries share the same currency (e.g. `'EUR'` for `'DE'`, `'FR'`, `'PT'`), store the country alongside the `MoneyJSON` payload if locale-aware formatting on restore is required.
:::

## FormatOptions reference

See [Format Options](/reference/format-options) for a full reference with output examples for every option and value.
