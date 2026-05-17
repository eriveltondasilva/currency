# Arithmetic

Methods for performing arithmetic on a `MoneyContract` instance. All methods return a **new instance** — the original is never modified.

All methods accept [`MoneyInput`](/reference/types#moneyinput) — either a `number` (major units) or another `MoneyContract`.

## plus

Adds a value to this instance.

```ts
plus(input: MoneyInput): MoneyContract
```

### Parameters

| Name    | Type         | Description                                              |
| ------- | ------------ | -------------------------------------------------------- |
| `input` | `MoneyInput` | Amount to add. A `number` is interpreted as major units. |

### Throws

| Error                   | Condition                                              |
| ----------------------- | ------------------------------------------------------ |
| `CurrencyMismatchError` | `input` is a `MoneyContract` with a different currency |
| `UnsafeIntegerError`    | Result exceeds `Number.MAX_SAFE_INTEGER`               |

### Examples

```ts
import { from } from '@eriveltondasilva/currency'

from(10, 'US').plus(5).amount()             // => 15
from(10, 'US').plus(0.99).amount()          // => 10.99
from(10, 'BR').plus(from(5, 'BR')).amount() // => 15

// Adding to a negative
from(-10, 'US').plus(3).amount() // => -7
```

## minus

Subtracts a value from this instance.

```ts
minus(input: MoneyInput): MoneyContract
```

### Parameters

| Name    | Type         | Description                                                   |
| ------- | ------------ | ------------------------------------------------------------- |
| `input` | `MoneyInput` | Amount to subtract. A `number` is interpreted as major units. |

### Throws

| Error                   | Condition                                              |
| ----------------------- | ------------------------------------------------------ |
| `CurrencyMismatchError` | `input` is a `MoneyContract` with a different currency |
| `UnsafeIntegerError`    | Result exceeds `Number.MAX_SAFE_INTEGER`               |

### Examples

```ts
import { from } from '@eriveltondasilva/currency'

from(10, 'US').minus(3.50).amount()           // => 6.5
from(10, 'BR').minus(from(3, 'BR')).amount()  // => 7

// Result can be negative
from(5, 'US').minus(10).amount()              // => -5
from(5, 'US').minus(10).isNegative()          // => true
```

## times

Multiplies this instance by a scalar factor.

The result is rounded to the nearest minor unit using the specified `roundingMode`.

```ts
times(factor: number, roundingMode?: RoundingMode): MoneyContract
```

### Parameters

| Name           | Type           | Default        | Description                                        |
| -------------- | -------------- | -------------- | -------------------------------------------------- |
| `factor`       | `number`       | —              | Finite scalar multiplier                           |
| `roundingMode` | `RoundingMode` | `'halfExpand'` | Rounding strategy applied to the minor-unit result |

### Throws

| Error                | Condition                                  |
| -------------------- | ------------------------------------------ |
| `InvalidInputError`  | `factor` is not finite (`NaN`, `Infinity`) |
| `UnsafeIntegerError` | Result exceeds `Number.MAX_SAFE_INTEGER`   |

### Examples

```ts
import { from } from '@eriveltondasilva/currency'

from(10, 'US').times(3).amount()   // => 30
from(10, 'US').times(1.5).amount() // => 15
from(10, 'US').times(0.1).amount() // => 1

// Factor of 0 or 1 is handled without rounding
from(99.99, 'US').times(0).isZero() // => true
from(99.99, 'US').times(1).amount() // => 99.99
```

```ts
// Rounding at the minor-unit level
// $1.00 = 100 minor units
// 100 * (1/3) = 33.333... → rounded to 33 minor units = $0.33
from(1, 'US').times(1 / 3).amount() // => 0.33

// Controlling rounding mode
from(1, 'US').times(1 / 3, 'ceil').amount()  // => 0.34
from(1, 'US').times(1 / 3, 'floor').amount() // => 0.33
```

```ts
// Quantity pricing
const unitPrice = from(29.90, 'BR')
const quantity = 4
unitPrice.times(quantity).format() // => 'R$ 119,60'
```

::: tip Prefer `total()` for cart calculations
When multiplying price × quantity across multiple items, use the top-level [`total()`](/api/collection#total) function. It handles edge cases and accumulates in minor units to avoid compound rounding.
:::

## divide

Divides this instance by a scalar divisor.

The result is rounded to the nearest minor unit using the specified `roundingMode`.

```ts
divide(divisor: number, roundingMode?: RoundingMode): MoneyContract
```

### Parameters

| Name           | Type           | Default        | Description                                        |
| -------------- | -------------- | -------------- | -------------------------------------------------- |
| `divisor`      | `number`       | —              | Finite, non-zero scalar                            |
| `roundingMode` | `RoundingMode` | `'halfExpand'` | Rounding strategy applied to the minor-unit result |

### Throws

| Error                 | Condition                                   |
| --------------------- | ------------------------------------------- |
| `DivisionByZeroError` | `divisor` is `0`                            |
| `InvalidInputError`   | `divisor` is not finite (`NaN`, `Infinity`) |
| `UnsafeIntegerError`  | Result exceeds `Number.MAX_SAFE_INTEGER`    |

### Examples

```ts
import { from } from '@eriveltondasilva/currency'

from(10, 'US').divide(4).amount() // => 2.5
from(10, 'US').divide(3).amount() // => 3.33
from(9, 'BR').divide(2).amount()  // => 4.5

// Divisor of 1 returns a copy with no rounding applied
from(19.99, 'US').divide(1).amount() // => 19.99
```

```ts
// Rounding mode affects how the minor-unit result is rounded
// $1.00 = 100 minor units
// 100 / 3 = 33.333... minor units
from(1, 'US').divide(3).amount()             // => 0.33  (halfExpand)
from(1, 'US').divide(3, 'ceil').amount()     // => 0.34
from(1, 'US').divide(3, 'halfEven').amount() // => 0.33
```

```ts
// Splitting a bill evenly — use allocate() instead to avoid remainder loss
from(10, 'US').divide(3).amount() // => 3.33 (loses $0.01)

// Prefer:
from(10, 'US').allocate(3).map(m => m.format())
// => ['$3.34', '$3.33', '$3.33'] — sums to exactly $10.00
```

::: warning Fair splitting
`divide` may lose remainders due to rounding. Use [`allocate()`](/api/business#allocate) when the sum of parts must equal the original amount exactly.
:::

## Chaining

All arithmetic methods return a new `MoneyContract`, so they can be chained:

```ts
import { from } from '@eriveltondasilva/currency'

const result = from(200, 'US')
  .applyDiscount(10) // => $180.00
  .plus(14.99)       // => $194.99
  .times(1.08)       // => $210.59  (8% tax)

result.format() // => '$210.59'
```

## Rounding in arithmetic

`plus` and `minus` operate entirely in minor units (integers) — no rounding ever occurs. `times` and `divide` convert the result back to an integer using the specified `roundingMode`.

See [Rounding Modes](/reference/rounding-modes) for a full breakdown of all available strategies and their behaviour on tie cases.
