# Core Concepts

Understanding these four concepts will help you use the library correctly and avoid common mistakes.

## Minor units

Monetary values are stored internally as **minor-unit integers**.

The minor unit is the smallest denomination of a currency — cents for USD and BRL, pence for GBP, and so on. Storing values as integers eliminates the floating-point rounding errors that plague decimal arithmetic in JavaScript.

```ts
// This is a well-known JavaScript problem:
0.1 + 0.2 === 0.3 // => false (!)

// This library works in integers internally:
from(0.1, 'US').plus(0.2).equals(0.3) // => true ✓
```

The conversion is transparent — you always provide amounts in **major units** (e.g. `19.99`) and read them back in major units. The internal representation is an implementation detail.

```ts
const price = from(19.99, 'BR')

price.amount()     // => 19.99 (major units — what you see)
price.minorUnits() // => 1999  (minor units — how it's stored)
```

### Fraction digits

Each currency defines how many decimal places its minor unit has. Most currencies use 2, but some differ:

| Currency            | Fraction digits | Example         |
| ------------------- | --------------- | --------------- |
| USD, BRL, EUR, GBP… | 2               | `100` → `$1.00` |
| JPY                 | 0               | `100` → `¥100`  |

```ts
from(19.99, 'BR').minorUnits() // => 1999 (2 fraction digits)
from(500, 'JP').minorUnits()   // => 500  (0 fraction digits)
```

### Persistence

When storing values in a database or transmitting over the wire, always use minor units to avoid precision loss:

```ts
// ✅ Store the integer
db.save({ amount: price.minorUnits() }) // 1999

// ❌ Never store the float
db.save({ amount: price.amount() }) // 19.99 — precision may be lost
```

Use `toJSON()` for a complete, round-trippable payload:

```ts
price.toJSON()
// => { minorUnits: 1999, currencyCode: 'BRL' }
```

## Immutability

Every operation returns a **new `MoneyContract` instance**. The original is never modified.

```ts
const price = from(100, 'US')

const discounted = price.applyDiscount(20)
const withTax = price.applySurcharge(8.5)

price.amount()      // => 100 — unchanged
discounted.amount() // => 80
withTax.amount()    // => 108.5
```

This makes instances safe to share across functions, store in state, and use as immutable records — no defensive copying needed.

Chaining works naturally because each step returns a new value:

```ts
const finalPrice = from(200, 'BR')
  .applyDiscount(10) // => 180.00
  .plus(15.9)        // => 195.90
  .times(1.05)       // => 205.70 (5% tax)
```

## MoneyInput

Several methods accept `MoneyInput` instead of a plain `number`. `MoneyInput` is a union type:

```ts
type MoneyInput = number | MoneyContract
```

When you pass a **number**, it is interpreted as **major units**:

```ts
from(100, 'US').plus(25)     // 25 is treated as $25.00
from(100, 'US').minus(9.99)  // 9.99 is treated as $9.99
```

When you pass a **`MoneyContract`**, the currencies must match — otherwise a `CurrencyMismatchError` is thrown:

```ts
const a = from(100, 'US')
const b = from(25, 'US')
const c = from(25, 'BR')

a.plus(b) // ✅ same currency
a.plus(c) // ❌ throws CurrencyMismatchError
```

Use `isMoney` and `isMoneyInput` to guard external inputs before passing them into the API:

```ts
import { isMoney, isMoneyInput } from '@eriveltondasilva/currency'

isMoney(from(10, 'BR')) // => true
isMoney(10)             // => false

isMoneyInput(19.99)          // => true  (number)
isMoneyInput(from(10, 'BR')) // => true  (MoneyContract)
isMoneyInput('19.99')        // => false (string — not accepted)
```

## CountryCode vs CurrencyCode

The library is addressed by **country code**, not by currency code.

```ts
from(10, 'BR')  // ✅ country code
from(10, 'BRL') // ❌ not valid
```

The reason: a country code carries more than just the currency — it also defines the locale, decimal separator, and grouping separator needed for parsing and formatting. A currency code alone (e.g. `'EUR'`) is ambiguous between `'DE'`, `'FR'`, and `'PT'`, which all use `EUR` but format numbers differently.

```ts
from(1999.99, 'DE').format() // => '1.999,99 €'
from(1999.99, 'FR').format() // => '1 999,99 €'
from(1999.99, 'PT').format() // => '1 999,99 €'
```

The `currencyCode()` accessor returns the ISO 4217 code if you need it:

```ts
from(10, 'BR').currencyCode() // => 'BRL'
from(10, 'US').currencyCode() // => 'USD'
from(10, 'DE').currencyCode() // => 'EUR'
```

See [Supported Countries](/reference/supported-countries) for the full mapping table.

## The MoneyContract interface

All values returned by this library implement `MoneyContract` — a stable public interface. You should type your functions against this interface, not against the concrete `Money` class, which is an internal implementation detail.

```ts
import type { MoneyContract } from '@eriveltondasilva/currency'

// ✅ Type against the interface
function applyShipping(price: MoneyContract, shipping: number): MoneyContract {
  return price.plus(shipping)
}

// ❌ Don't import or reference Money directly
import { Money } from '@eriveltondasilva/currency' // not exported
```

The interface is fully documented in the [Types reference](/reference/types).
