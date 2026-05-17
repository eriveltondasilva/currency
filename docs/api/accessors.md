# Accessors

Read-only properties that expose the internal state of a `MoneyContract` instance. None of these methods modify the instance or accept arguments.

## amount

Returns the monetary amount in major units as a floating-point number.

```ts
amount(): number
```

Use this when you need the numeric value for calculations outside the library, or for display in contexts where `format()` is not appropriate. For end-user display, prefer `format()`.

### Examples

```ts
import { from } from '@eriveltondasilva/currency'

from(19.99, 'BR').amount() // => 19.99
from(100, 'US').amount()   // => 100
from(0.5, 'US').amount()   // => 0.5
from(500, 'JP').amount()   // => 500
```

```ts
// Use in non-monetary calculations
const price = from(29.90, 'BR')
const taxRate = 0.12
const taxAmount = price.amount() * taxRate // plain number arithmetic
// But prefer: price.applySurcharge(12) to stay in the Money domain
```

::: warning Floating-point
`amount()` returns a JavaScript `number`, which is subject to floating-point representation. Do not use it for monetary comparisons or arithmetic — use the library's methods instead.

```ts
// ❌ Unreliable
from(0.1, 'US').amount() + from(0.2, 'US').amount() === 0.3 // false

// ✅ Reliable
from(0.1, 'US').plus(0.2).equals(0.3) // true
```
:::

## minorUnits

Returns the raw internal integer in minor units.

```ts
minorUnits(): number
```

Use this for database persistence, wire transfer, or any context where you need the canonical integer representation.

### Examples

```ts
import { from } from '@eriveltondasilva/currency'

from(19.99, 'BR').minorUnits() // => 1999
from(19.99, 'US').minorUnits() // => 1999
from(500, 'JP').minorUnits()   // => 500  (JPY has 0 fraction digits)
from(0.01, 'US').minorUnits()  // => 1    (one cent)
from(0, 'US').minorUnits()     // => 0
```

```ts
// Persisting to a database
const price = from(19.99, 'BR')

await db.product.update({
  where: { id },
  data: { price_minor_units: price.minorUnits() }, // store 1999
})
```

## units

Returns the whole-unit part of the amount, always non-negative.

```ts
units(): number
```

### Examples

```ts
import { from } from '@eriveltondasilva/currency'

from(19.99, 'BR').units() // => 19
from(0.99, 'US').units()  // => 0
from(-5.07, 'US').units() // => 5   (always non-negative)
from(100, 'US').units()   // => 100
```

## subunits

Returns the sub-unit part of the amount, always non-negative.

```ts
subunits(): number
```

### Examples

```ts
import { from } from '@eriveltondasilva/currency'

from(19.99, 'BR').subunits() // => 99
from(19.90, 'US').subunits() // => 90
from(-5.07, 'US').subunits() // => 7  (always non-negative)
from(100, 'US').subunits()   // => 0
from(500, 'JP').subunits()   // => 0  (JPY has 0 fraction digits)
```

## toParts

Returns the amount split into its constituent parts as a plain object.

```ts
toParts(): MoneyParts
```

```ts
interface MoneyParts {
  units: number       // whole-unit part, always non-negative
  subunits: number    // sub-unit part, always non-negative
  isNegative: boolean // true when the amount is less than zero
}
```

Both `units` and `subunits` are always non-negative. Use `isNegative` to determine the sign of the original amount.

### Examples

```ts
import { from } from '@eriveltondasilva/currency'

from(19.99, 'BR').toParts()
// => { units: 19, subunits: 99, isNegative: false }

from(-19.99, 'BR').toParts()
// => { units: 19, subunits: 99, isNegative: true }

from(0.99, 'US').toParts()
// => { units: 0, subunits: 99, isNegative: false }

from(-0.99, 'US').toParts()
// => { units: 0, subunits: 99, isNegative: true }

from(0, 'US').toParts()
// => { units: 0, subunits: 0, isNegative: false }

from(500, 'JP').toParts()
// => { units: 500, subunits: 0, isNegative: false }
```

```ts
// Rendering a price with styled subunits
function PriceDisplay({ price }: { price: MoneyContract }) {
  const { units, subunits, isNegative } = price.toParts()
  const sign = isNegative ? '-' : ''
  const sub = String(subunits).padStart(2, '0')

  return (
    <span>
      {sign}${units}
      <sup>.{sub}</sup>
    </span>
  )
}
```

## currencyCode

Returns the ISO 4217 currency code of this instance.

```ts
currencyCode(): CurrencyCode
```

### Examples

```ts
import { from } from '@eriveltondasilva/currency'

from(10, 'BR').currencyCode() // => 'BRL'
from(10, 'US').currencyCode() // => 'USD'
from(10, 'DE').currencyCode() // => 'EUR'
from(10, 'JP').currencyCode() // => 'JPY'

// Countries that share a currency
from(10, 'DE').currencyCode() // => 'EUR'
from(10, 'FR').currencyCode() // => 'EUR'
from(10, 'PT').currencyCode() // => 'EUR'
```

## locale

Returns the BCP 47 locale tag associated with the instance's country.

```ts
locale(): string
```

### Examples

```ts
import { from } from '@eriveltondasilva/currency'

from(10, 'BR').locale() // => 'pt-BR'
from(10, 'US').locale() // => 'en-US'
from(10, 'DE').locale() // => 'de-DE'
from(10, 'JP').locale() // => 'ja-JP'
```

```ts
// Passing the locale to a third-party formatter
const price = from(1999.99, 'BR')

new Intl.NumberFormat(price.locale(), {
  style: 'currency',
  currency: price.currencyCode(),
}).format(price.amount())
// => 'R$ 1.999,99'
```

## Quick reference

| Accessor         | Returns                                  | Example (`from(19.99, 'BR')`)                    |
| ---------------- | ---------------------------------------- | ------------------------------------------------ |
| `amount()`       | `number` — major units                   | `19.99`                                          |
| `minorUnits()`   | `number` — internal integer              | `1999`                                           |
| `units()`        | `number` — whole-unit part, non-negative | `19`                                             |
| `subunits()`     | `number` — sub-unit part, non-negative   | `99`                                             |
| `toParts()`      | `MoneyParts` — structured breakdown      | `{ units: 19, subunits: 99, isNegative: false }` |
| `currencyCode()` | `CurrencyCode` — ISO 4217                | `'BRL'`                                          |
| `locale()`       | `string` — BCP 47                        | `'pt-BR'`                                        |
