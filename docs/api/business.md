# Business

Methods for common monetary business operations — percentage calculations, discounts, surcharges, and allocation. All methods return a **new instance** — the original is never modified.

## percentOf

Returns the given percentage of this instance's amount.

```ts
percentOf(percent: number, roundingMode?: RoundingMode): MoneyContract
```

### Parameters

| Name           | Type           | Default        | Description                                        |
| -------------- | -------------- | -------------- | -------------------------------------------------- |
| `percent`      | `number`       | —              | Non-negative finite number (e.g. `15` for 15%)     |
| `roundingMode` | `RoundingMode` | `'halfExpand'` | Rounding strategy applied to the minor-unit result |

### Throws

| Error                    | Condition                           |
| ------------------------ | ----------------------------------- |
| `InvalidPercentageError` | `percent` is negative or not finite |

### Examples

```ts
import { from } from '@eriveltondasilva/currency'

from(200, 'BR').percentOf(15).amount()   // => 30
from(100, 'US').percentOf(33).amount()   // => 33
from(100, 'US').percentOf(33.5).amount() // => 33.5
from(100, 'US').percentOf(0).isZero()    // => true
from(100, 'US').percentOf(100).amount()  // => 100
```

```ts
// Calculating tax
const subtotal = from(150, 'US')
const tax = subtotal.percentOf(8.5)

tax.format()                // => '$12.75'
subtotal.plus(tax).format() // => '$162.75'
```

```ts
// Rounding control for financial reports
from(1, 'US').percentOf(1 / 3, 'halfEven').amount() // => 0
from(10, 'US').percentOf(1 / 3, 'ceil').amount()    // => 0.04
```

::: tip
`percentOf` computes the percentage amount — not the result after applying it. To subtract or add the percentage in one step, use [`applyDiscount`](#applydiscount) or [`applySurcharge`](#applysurcharge).
:::

## applyDiscount

Subtracts a percentage discount from this instance and returns the reduced amount.

Equivalent to `minus(percentOf(discount))`, but validated and expressed as a single intent.

```ts
applyDiscount(discount: number, roundingMode?: RoundingMode): MoneyContract
```

### Parameters

| Name           | Type           | Default        | Description                                         |
| -------------- | -------------- | -------------- | --------------------------------------------------- |
| `discount`     | `number`       | —              | Discount percentage between `0` and `100` inclusive |
| `roundingMode` | `RoundingMode` | `'halfExpand'` | Rounding strategy applied to the percentage amount  |

### Throws

| Error                    | Condition                                               |
| ------------------------ | ------------------------------------------------------- |
| `InvalidPercentageError` | `discount` is negative, exceeds `100`, or is not finite |

### Examples

```ts
import { from } from '@eriveltondasilva/currency'

from(100, 'US').applyDiscount(20).format()    // => '$80.00'
from(50, 'BR').applyDiscount(10).format()     // => 'R$ 45,00'
from(199.99, 'US').applyDiscount(15).format() // => '$169.99'

// Boundary values
from(100, 'US').applyDiscount(0).amount()   // => 100  (no change)
from(100, 'US').applyDiscount(100).isZero() // => true
```

```ts
// Tiered discount logic
function getDiscount(quantity: number): number {
  if (quantity >= 100) return 20
  if (quantity >= 50)  return 10
  if (quantity >= 10)  return 5
  return 0
}

const unitPrice = from(29.90, 'BR')
const quantity = 60

unitPrice
  .applyDiscount(getDiscount(quantity))
  .times(quantity)
  .format()
// => 'R$ 1.614,60'
```

```ts
// Chaining discounts — order matters
const price = from(100, 'US')

// 10% then 10% is not 20%
price.applyDiscount(10).applyDiscount(10).amount() // => 81
price.applyDiscount(20).amount()                   // => 80
```

::: warning Compound discounts
Chaining `applyDiscount` calls applies each discount to the already-reduced amount, not to the original. A 10% discount followed by another 10% yields 81% of the original — not 80%.
:::

## applySurcharge

Adds a percentage surcharge to this instance and returns the increased amount.

Equivalent to `plus(percentOf(surcharge))`.

```ts
applySurcharge(surcharge: number, roundingMode?: RoundingMode): MoneyContract
```

### Parameters

| Name           | Type           | Default        | Description                                        |
| -------------- | -------------- | -------------- | -------------------------------------------------- |
| `surcharge`    | `number`       | —              | Non-negative percentage (e.g. `10` for +10%)       |
| `roundingMode` | `RoundingMode` | `'halfExpand'` | Rounding strategy applied to the percentage amount |

### Throws

| Error                    | Condition                             |
| ------------------------ | ------------------------------------- |
| `InvalidPercentageError` | `surcharge` is negative or not finite |

::: info
Unlike `applyDiscount`, `applySurcharge` has no upper bound — surcharges above 100% are valid (e.g. a 150% markup).
:::

### Examples

```ts
import { from } from '@eriveltondasilva/currency'

from(100, 'US').applySurcharge(10).format()  // => '$110.00'
from(50, 'BR').applySurcharge(5).format()    // => 'R$ 52,50'
from(100, 'US').applySurcharge(150).format() // => '$250.00'

// Boundary values
from(100, 'US').applySurcharge(0).amount() // => 100  (no change)
```

```ts
// Applying tax after discount
from(200, 'US')
  .applyDiscount(10)   // => $180.00
  .applySurcharge(8.5) // => $195.30  (8.5% tax on discounted amount)
  .format()            // => '$195.30'
```

## allocate

Splits the amount into `parts` equal shares, distributing any remainder cent-by-cent to the first slots.

This uses the **largest-remainder method**, which guarantees the sum of all parts equals the original amount exactly.

```ts
allocate(parts: number): MoneyContract[]
```

### Parameters

| Name    | Type     | Description                       |
| ------- | -------- | --------------------------------- |
| `parts` | `number` | Positive integer number of shares |

### Returns

An array of `parts` new `MoneyContract` instances.

### Throws

| Error                    | Condition                         |
| ------------------------ | --------------------------------- |
| `InvalidAllocationError` | `parts` is not a positive integer |

### Examples

```ts
import { from } from '@eriveltondasilva/currency'

// Even split
from(90, 'US').allocate(3).map(m => m.format())
// => ['$30.00', '$30.00', '$30.00']

// Remainder distributed to first slots
from(10, 'US').allocate(3).map(m => m.format())
// => ['$3.34', '$3.33', '$3.33']

from(10, 'BR').allocate(3).map(m => m.format())
// => ['R$ 3,34', 'R$ 3,33', 'R$ 3,33']

// Single part returns a copy of the original
from(100, 'US').allocate(1).map(m => m.amount())
// => [100]
```

```ts
// The sum is always exact
const parts = from(10, 'US').allocate(3)
const total = parts.reduce((acc, p) => acc.plus(p), from(0, 'US'))
total.amount() // => 10  ✓
```

```ts
// Negative amounts are split correctly
from(-10, 'US').allocate(3).map(m => m.amount())
// => [-3.34, -3.33, -3.33]

// Zero produces an array of zeros
from(0, 'US').allocate(3).map(m => m.isZero())
// => [true, true, true]
```

```ts
// Instalment plan: splitting R$ 299,90 into 3 payments
from(299.90, 'BR').allocate(3).map(m => m.format())
// => ['R$ 99,97', 'R$ 99,97', 'R$ 99,96']
```

::: tip Why not divide?
`divide(3)` rounds each result independently and loses the remainder. `allocate(3)` distributes the remainder to the first slots, ensuring the sum is exact.

```ts
const price = from(10, 'US')

// divide — loses $0.01
price.divide(3).amount() // => 3.33  (3.33 × 3 = 9.99 ≠ 10.00)

// allocate — exact
price.allocate(3).map(m => m.amount()) // => [3.34, 3.33, 3.33]  ✓
```

:::

## allocateByRatio

Splits the amount proportionally according to `ratios`, distributing any remainder cent-by-cent to the first slots.

Ratios must be **non-negative integers** (e.g. `[1, 2, 3]` or `[30, 70]`). The sum of all parts always equals the original amount exactly.

```ts
allocateByRatio(ratios: number[]): MoneyContract[]
```

### Parameters

| Name     | Type       | Description                                                           |
| -------- | ---------- | --------------------------------------------------------------------- |
| `ratios` | `number[]` | Non-empty array of non-negative integers representing relative shares |

### Returns

An array of new `MoneyContract` instances, one per ratio entry.

### Throws

| Error                    | Condition                                                                  |
| ------------------------ | -------------------------------------------------------------------------- |
| `InvalidAllocationError` | `ratios` is empty, contains non-integers, negative values, or sums to zero |
| `UnsafeIntegerError`     | An intermediate calculation exceeds `Number.MAX_SAFE_INTEGER`              |

### Examples

```ts
import { from } from '@eriveltondasilva/currency'

// 1:3 split — 25% and 75%
from(100, 'US').allocateByRatio([1, 3]).map(m => m.format())
// => ['$25.00', '$75.00']

// 1:1:1 split — equal thirds
from(100, 'US').allocateByRatio([1, 1, 1]).map(m => m.format())
// => ['$33.34', '$33.33', '$33.33']

// 30:70 split
from(100, 'BR').allocateByRatio([30, 70]).map(m => m.format())
// => ['R$ 30,00', 'R$ 70,00']
```

```ts
// Revenue sharing between partners
const revenue = from(1000, 'US')
const shares = revenue.allocateByRatio([50, 30, 20])

shares.map(m => m.format())
// => ['$500.00', '$300.00', '$200.00']
```

```ts
// Zero-value ratios are valid — that slot receives zero
from(100, 'US').allocateByRatio([1, 0, 1]).map(m => m.amount())
// => [50, 0, 50]

// Zero amount produces all zeros
from(0, 'US').allocateByRatio([1, 3]).map(m => m.isZero())
// => [true, true]
```

```ts
// Negative amounts are split proportionally and correctly
from(-100, 'US').allocateByRatio([1, 3]).map(m => m.amount())
// => [-25, -75]
```

::: warning Integer ratios only
Ratios must be integers. Use whole numbers that express the proportion — `[1, 3]` for 25/75, `[1, 1, 1]` for equal thirds.

```ts
// ❌ Float ratios are rejected
from(100, 'US').allocateByRatio([0.25, 0.75]) // InvalidAllocationError

// ✅ Use integer equivalents
from(100, 'US').allocateByRatio([1, 3])   // => [$25.00, $75.00]
from(100, 'US').allocateByRatio([25, 75]) // => [$25.00, $75.00]
```

:::
