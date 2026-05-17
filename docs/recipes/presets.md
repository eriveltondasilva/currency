# Presets

Country-specific shorthand functions that eliminate the repeated `country` argument when your application operates in a single currency.

```ts
import { br, us, de, jp } from '@eriveltondasilva/currency/presets'
```

## What presets are

Each preset is a function that wraps `from()` and `parse()` with a fixed country:

```ts
// These are equivalent
import { from } from '@eriveltondasilva/currency'
import { br } from '@eriveltondasilva/currency/presets'

from(19.99, 'BR').format()  // => 'R$ 19,99'
br(19.99).format()          // => 'R$ 19,99'

// Presets also accept strings — equivalent to parse()
br('R$ 1.999,99').amount()  // => 1999.99
```

## Available presets

| Export | Country        | Currency |
| ------ | -------------- | -------- |
| `au`   | Australia      | AUD      |
| `br`   | Brazil         | BRL      |
| `ca`   | Canada         | CAD      |
| `ch`   | Switzerland    | CHF      |
| `cn`   | China          | CNY      |
| `de`   | Germany        | EUR      |
| `fr`   | France         | EUR      |
| `gb`   | United Kingdom | GBP      |
| `ind`  | India          | INR      |
| `jp`   | Japan          | JPY      |
| `mx`   | Mexico         | MXN      |
| `pt`   | Portugal       | EUR      |
| `sg`   | Singapore      | SGD      |
| `us`   | United States  | USD      |

::: info
`in` is a reserved keyword in JavaScript. The India preset is exported as `ind`.
:::

## When to use presets

**Use presets when:**
- Your application operates in a single, known currency (e.g. a Brazilian SaaS, a US-only store)
- You create monetary values in many places and want less repetition
- The country is a compile-time constant, not a runtime variable

**Use `from()` directly when:**
- Your application is multi-currency — the country varies per user, order, or product
- The country comes from a database, API response, or user input
- You want to be explicit about which country is being used at each call site

## Single-currency application

The clearest use case: an application that only ever deals in one currency.

```ts
// currency.ts — define once, import everywhere
import { br } from '@eriveltondasilva/currency/presets'
export { br as money }
```

```ts
// product.service.ts
import { money } from './currency'

function calculateProductTotal(
  unitPrice: number,
  quantity: number,
  discountPercent: number,
) {
  return money(unitPrice)
    .times(quantity)
    .applyDiscount(discountPercent)
}

calculateProductTotal(49.90, 3, 10).format()  // => 'R$ 134,73'
```

This pattern keeps the country decision in one place. If you ever need to change the currency, you update a single file.

## Parsing user input

Presets accept formatted strings directly — useful when reading values from form inputs:

```ts
import { br } from '@eriveltondasilva/currency/presets'

// User typed "R$ 1.999,99" in a form field
const inputValue = 'R$ 1.999,99'
const price = br(inputValue)

price.amount()   // => 1999.99
price.format()   // => 'R$ 1.999,99'
```

```ts
// Form parsing — with error handling
function parseFormPrice(raw: string): MoneyContract | null {
  try {
    return br(raw)
  } catch {
    return null  // invalid input
  }
}

parseFormPrice('R$ 49,90')   // => MoneyContract
parseFormPrice('not-a-price') // => null
```

## Using multiple presets

You can import several presets when your app handles a small, fixed set of currencies:

```ts
import { br, us, gb } from '@eriveltondasilva/currency/presets'

const BRL = br(199.90)
const USD = us(39.99)
const GBP = gb(34.99)

BRL.format()  // => 'R$ 199,90'
USD.format()  // => '$39.99'
GBP.format()  // => '£34.99'
```

## Preset vs from — side by side

```ts
import { from, sum, total } from '@eriveltondasilva/currency'
import { br } from '@eriveltondasilva/currency/presets'

// With from()
from(19.99, 'BR')
sum([10, 20, 30], 'BR')
total([{ price: 9.99, quantity: 2 }], 'BR')

// With presets
br(19.99)
sum([10, 20, 30], 'BR')      // collection functions still require country
total([{ price: 9.99, quantity: 2 }], 'BR')
```

::: info
Presets only shorten the creation step — `from()` and `parse()`. Collection functions like `sum()`, `average()`, and `total()` always require an explicit country argument and do not have preset equivalents.
:::

## Tree-shaking

Each preset is a thin wrapper — importing `br` does not bundle the full preset module. Only the presets you import are included in your bundle.

```ts
// Only br and us are included
import { br, us } from '@eriveltondasilva/currency/presets'
```
