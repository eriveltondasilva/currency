# Comparison

Methods for comparing `MoneyContract` instances. All methods accept [`MoneyInput`](/reference/types#moneyinput) — either a `number` (major units) or another `MoneyContract`.

## equals

Returns `true` if this instance represents the same amount as `input`.

When `input` is a `MoneyContract` with a different currency, returns `false` instead of throwing — making it safe to use in comparisons without a `try/catch`.

```ts
equals(input: MoneyInput): boolean
```

### Parameters

| Name    | Type         | Description                                                 |
| ------- | ------------ | ----------------------------------------------------------- |
| `input` | `MoneyInput` | Value to compare. A `number` is interpreted as major units. |

### Examples

```ts
import { from } from '@eriveltondasilva/currency'

from(10, 'US').equals(10)             // => true
from(10, 'US').equals(10.00)          // => true
from(10, 'US').equals(from(10, 'US')) // => true

from(10, 'US').equals(9.99)           // => false
from(10, 'BR').equals(from(10, 'US')) // => false  (currency mismatch — no error)
```

::: info Currency mismatch
`equals` is the only comparison method that does **not** throw on currency mismatch. All others (`greaterThan`, `lessThan`, `compare`, etc.) throw `CurrencyMismatchError` when passed a `MoneyContract` with a different currency.
:::

## compare

Compares this instance to `input` for ordering purposes.

Returns `-1` when less than, `0` when equal, and `1` when greater than `input`. Designed for direct use as an `Array.sort` comparator.

```ts
compare(other: MoneyInput): MoneyComparison // -1 | 0 | 1
```

### Parameters

| Name    | Type         | Description                                                 |
| ------- | ------------ | ----------------------------------------------------------- |
| `other` | `MoneyInput` | Comparison value. A `number` is interpreted as major units. |

### Throws

| Error                   | Condition                                              |
| ----------------------- | ------------------------------------------------------ |
| `CurrencyMismatchError` | `other` is a `MoneyContract` with a different currency |

### Examples

```ts
import { from } from '@eriveltondasilva/currency'

from(10, 'US').compare(20) // => -1
from(10, 'US').compare(10) // =>  0
from(20, 'US').compare(10) // =>  1
```

```ts
// Sorting arrays of MoneyContract instances
const prices = [
  from(30, 'US'),
  from(10, 'US'),
  from(20, 'US'),
]

prices.sort((a, b) => a.compare(b)) // ascending:  [$10, $20, $30]
prices.sort((a, b) => b.compare(a)) // descending: [$30, $20, $10]
```

## greaterThan

Returns `true` if this instance is strictly greater than `input`.

```ts
greaterThan(input: MoneyInput): boolean
```

### Throws

| Error                   | Condition                                              |
| ----------------------- | ------------------------------------------------------ |
| `CurrencyMismatchError` | `input` is a `MoneyContract` with a different currency |

### Examples

```ts
import { from } from '@eriveltondasilva/currency'

from(10, 'US').greaterThan(5)  // => true
from(10, 'US').greaterThan(10) // => false  (strict)
from(10, 'US').greaterThan(15) // => false
```

## lessThan

Returns `true` if this instance is strictly less than `input`.

```ts
lessThan(input: MoneyInput): boolean
```

### Throws

| Error                   | Condition                                              |
| ----------------------- | ------------------------------------------------------ |
| `CurrencyMismatchError` | `input` is a `MoneyContract` with a different currency |

### Examples

```ts
import { from } from '@eriveltondasilva/currency'

from(5, 'US').lessThan(10)  // => true
from(10, 'US').lessThan(10) // => false  (strict)
from(15, 'US').lessThan(10) // => false
```

## greaterThanOrEqual

Returns `true` if this instance is greater than or equal to `input`.

```ts
greaterThanOrEqual(input: MoneyInput): boolean
```

### Throws

| Error                   | Condition                                              |
| ----------------------- | ------------------------------------------------------ |
| `CurrencyMismatchError` | `input` is a `MoneyContract` with a different currency |

### Examples

```ts
import { from } from '@eriveltondasilva/currency'

from(10, 'US').greaterThanOrEqual(10) // => true
from(10, 'US').greaterThanOrEqual(9)  // => true
from(10, 'US').greaterThanOrEqual(11) // => false
```

## lessThanOrEqual

Returns `true` if this instance is less than or equal to `input`.

```ts
lessThanOrEqual(input: MoneyInput): boolean
```

### Throws

| Error                   | Condition                                              |
| ----------------------- | ------------------------------------------------------ |
| `CurrencyMismatchError` | `input` is a `MoneyContract` with a different currency |

### Examples

```ts
import { from } from '@eriveltondasilva/currency'

from(10, 'US').lessThanOrEqual(10) // => true
from(10, 'US').lessThanOrEqual(11) // => true
from(10, 'US').lessThanOrEqual(9)  // => false
```

## isBetween

Returns `true` if this instance falls within the **closed interval** `[min, max]` — inclusive on both ends.

```ts
isBetween(min: MoneyInput, max: MoneyInput): boolean
```

### Parameters

| Name  | Type         | Description                                                        |
| ----- | ------------ | ------------------------------------------------------------------ |
| `min` | `MoneyInput` | Lower bound (inclusive). A `number` is interpreted as major units. |
| `max` | `MoneyInput` | Upper bound (inclusive). A `number` is interpreted as major units. |

### Throws

| Error                   | Condition                                                   |
| ----------------------- | ----------------------------------------------------------- |
| `InvalidRangeError`     | `min` is greater than `max`                                 |
| `CurrencyMismatchError` | Either bound is a `MoneyContract` with a different currency |

### Examples

```ts
import { from } from '@eriveltondasilva/currency'

from(5, 'US').isBetween(1, 10)  // => true
from(1, 'US').isBetween(1, 10)  // => true   (inclusive lower bound)
from(10, 'US').isBetween(1, 10) // => true   (inclusive upper bound)
from(11, 'US').isBetween(1, 10) // => false
from(0, 'US').isBetween(1, 10)  // => false
```

```ts
// min > max throws InvalidRangeError
from(5, 'US').isBetween(10, 1) // ❌ InvalidRangeError
```

```ts
// Practical use: validating a price range
const MIN_PRICE = 0.99
const MAX_PRICE = 999.99

function isValidPrice(price: MoneyContract): boolean {
  return price.isBetween(MIN_PRICE, MAX_PRICE)
}
```

## hasSameCurrency

Returns `true` if `other` shares the same currency code as this instance.

Unlike the arithmetic methods, `hasSameCurrency` never throws — it is designed as a safe predicate for validating inputs before performing cross-instance operations.

```ts
hasSameCurrency(other: MoneyContract): boolean
```

### Parameters

| Name    | Type            | Description                               |
| ------- | --------------- | ----------------------------------------- |
| `other` | `MoneyContract` | Another monetary value to compare against |

### Examples

```ts
import { from } from '@eriveltondasilva/currency'

from(10, 'BR').hasSameCurrency(from(20, 'BR')) // => true
from(10, 'BR').hasSameCurrency(from(20, 'US')) // => false

// DE and PT both use EUR
from(10, 'DE').hasSameCurrency(from(10, 'PT')) // => true
```

```ts
// Use as a guard before cross-instance operations
function safeAdd(a: MoneyContract, b: MoneyContract): MoneyContract {
  if (!a.hasSameCurrency(b)) {
    throw new Error(`Currency mismatch: ${a.currencyCode()} vs ${b.currencyCode()}`)
  }
  return a.plus(b)
}
```

## State predicates

Three boolean accessors for checking the sign of an amount.

```ts
isZero(): boolean
isPositive(): boolean
isNegative(): boolean
```

### Examples

```ts
import { from, zero } from '@eriveltondasilva/currency'

zero('US').isZero()       // => true
from(0, 'US').isZero()    // => true
from(0.01, 'US').isZero() // => false

from(1, 'US').isPositive()  // => true
from(0, 'US').isPositive()  // => false  (zero is not positive)
from(-1, 'US').isPositive() // => false

from(-1, 'US').isNegative() // => true
from(0, 'US').isNegative()  // => false  (zero is not negative)
from(1, 'US').isNegative()  // => false
```

```ts
// Common patterns
function applyIfPositive(
  base: MoneyContract,
  adjustment: MoneyContract,
): MoneyContract {
  return adjustment.isPositive() ? base.plus(adjustment) : base
}

function formatWithSign(value: MoneyContract): string {
  return value.format({ signDisplay: 'always' })
}
```

## Quick reference

| Method                  | Returns `true` when                                   |
| ----------------------- | ----------------------------------------------------- |
| `equals(x)`             | `this === x` (by value); `false` on currency mismatch |
| `greaterThan(x)`        | `this > x`                                            |
| `lessThan(x)`           | `this < x`                                            |
| `greaterThanOrEqual(x)` | `this >= x`                                           |
| `lessThanOrEqual(x)`    | `this <= x`                                           |
| `isBetween(min, max)`   | `min <= this <= max`                                  |
| `hasSameCurrency(x)`    | Same ISO 4217 code                                    |
| `isZero()`              | Amount is exactly `0`                                 |
| `isPositive()`          | Amount is `> 0`                                       |
| `isNegative()`          | Amount is `< 0`                                       |
