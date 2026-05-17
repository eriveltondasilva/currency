# Getting Started

## Installation

::: code-group

```sh [npm]
npm install @eriveltondasilva/currency
```

```sh [bun]
bun add @eriveltondasilva/currency
```

```sh [pnpm]
pnpm add @eriveltondasilva/currency
```

:::

**Requirements:** TypeScript 5.0+ or any modern JavaScript runtime (Node.js 20+, Bun).

## Importing the library

The library supports three import styles. Choose the one that fits your use case.

### Named imports (recommended)

Best for bundle size. Only the functions you import are included.

```ts
import { from, parse, sum, total, ... } from '@eriveltondasilva/currency'
```

### Namespace import

Convenient when you want a single import and don't need to optimize bundle size.

```ts
import Money from '@eriveltondasilva/currency'

Money.from(19.99, 'BR').format()   // => 'R$ 19,99'
Money.sum([10, 20], 'US').format() // => '$30.00'
```

::: warning Tree-shaking
The namespace import bundles the entire library. Prefer named imports in production apps.
:::

### Presets (optional)

Country-specific shorthand functions. Useful when your app operates in a single currency.

```ts
import { br, us, jp, ... } from '@eriveltondasilva/currency/presets'

br(19.99).format() // => 'R$ 19,99'
us(9.99).format()  // => '$9.99'
jp(500).format()   // => '¥500'

// Presets also accept formatted strings
br('R$ 1.999,99').amount() // => 1999.99
```

## Your first monetary value

All amounts are created in **major units** — the same number you'd write on a price tag.

```ts
import { from } from '@eriveltondasilva/currency'

const price = from(19.99, 'BR')

price.amount()       // => 19.99
price.minorUnits()   // => 1999
price.format()       // => 'R$ 19,99'
price.currencyCode() // => 'BRL'
```

The second argument is always a [country code](/reference/supported-countries), not a currency code. `'BR'` maps to `BRL`, `'US'` maps to `USD`, and so on.

## Basic operations

Every method returns a **new instance** — values are never mutated in place.

```ts
import { from } from '@eriveltondasilva/currency'

const price = from(100, 'US')

price.plus(25).format()   // => '$125.00'
price.minus(10).format()  // => '$90.00'
price.times(1.5).format() // => '$150.00'
price.divide(4).format()  // => '$25.00'

price.applyDiscount(20).format()  // => '$80.00'
price.applySurcharge(10).format() // => '$110.00'
```

You can chain operations safely:

```ts
from(200, 'US')
  .applyDiscount(15) // => $170.00
  .plus(9.99)        // => $179.99
  .format()          // => '$179.99'
```

## Parsing a formatted string

Use `parse` when reading a user-provided or locale-formatted value.

```ts
import { parse } from '@eriveltondasilva/currency'

parse('R$ 1.999,99', 'BR').amount() // => 1999.99
parse('$1,999.99', 'US').amount()   // => 1999.99
parse('€ 1.999,99', 'DE').amount()  // => 1999.99
```

The parser strips currency symbols and respects the country's decimal and grouping separators automatically.

## Working with collections

```ts
import { sum, average, total, min, max } from '@eriveltondasilva/currency'

sum([10, 20.50, 5], 'BR').format()   // => 'R$ 35,50'
average([10, 20, 30], 'US').format() // => '$20.00'
min([5, 30, 10], 'US').format()      // => '$5.00'
max([5, 30, 10], 'US').format()      // => '$30.00'

const items = [
  { price: 29.90, quantity: 2 },
  { price: 9.99 },
]
total(items, 'BR').format() // => 'R$ 69,79'
```

## Serialization

Use `toJSON` to persist a value and `fromMinorUnits` to restore it.

```ts
import { from, fromMinorUnits } from '@eriveltondasilva/currency'

// Serialize — safe to store in a database or send over the wire
const payload = from(19.99, 'BR').toJSON()
// => { minorUnits: 1999, currencyCode: 'BRL' }

// Restore
const price = fromMinorUnits(payload.minorUnits, 'BR')
price.format() // => 'R$ 19,99'
```

::: tip
Always store `minorUnits` (integer) in your database, not `amount` (float). This avoids precision loss across serialization boundaries.
:::

## Error handling

All failures throw a typed subclass of `MoneyError`, each with a `.code` property for programmatic handling.

```ts
import { from, MoneyError } from '@eriveltondasilva/currency'

try {
  from(10, 'BR').plus(from(10, 'US'))
} catch (err) {
  if (err instanceof MoneyError) {
    console.error(err.code)    // => 'CURRENCY_MISMATCH'
    console.error(err.message) // => 'Cannot operate on mismatched currencies: BRL and USD.'
  }
}
```

See [Error Handling](/guide/error-handling) for the full list of error codes and recommended patterns.

## Next steps

- [Core concepts](/guide/concepts) — understand minor units, immutability, and MoneyInput
- [API Reference](/api/creation) — full method signatures and examples
- [Supported countries](/reference/supported-countries) — all 14 country codes and their currencies
