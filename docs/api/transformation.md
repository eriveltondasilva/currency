# Transformation

Methods that derive a new `MoneyContract` from an existing one without performing arithmetic with an external value. All methods return a **new instance** — the original is never modified.

## abs

Returns a new instance with the absolute (non-negative) value of the amount.

```ts
abs(): MoneyContract
```

### Examples

```ts
import { from } from '@eriveltondasilva/currency'

from(-15, 'US').abs().amount() // => 15
from(15, 'US').abs().amount()  // => 15
from(0, 'US').abs().isZero()   // => true
```

```ts
// Useful when the sign is unknown but you need a positive amount
function absoluteDifference(a: MoneyContract, b: MoneyContract): MoneyContract {
  return a.minus(b).abs()
}

absoluteDifference(from(30, 'US'), from(50, 'US')).format() // => '$20.00'
absoluteDifference(from(50, 'US'), from(30, 'US')).format() // => '$20.00'
```

## negate

Returns a new instance with the sign of the amount flipped.

```ts
negate(): MoneyContract
```

### Examples

```ts
import { from } from '@eriveltondasilva/currency'

from(20, 'BR').negate().amount()  // => -20
from(-20, 'BR').negate().amount() // => 20
from(0, 'US').negate().isZero()   // => true
```

```ts
// Representing a refund or credit
const charge = from(49.99, 'US')
const refund = charge.negate()

refund.format()     // => '-$49.99'
refund.isNegative() // => true
```

## max

Returns the greater of this instance and `input`.

```ts
max(input: MoneyInput): MoneyContract
```

### Parameters

| Name    | Type         | Description                                                 |
| ------- | ------------ | ----------------------------------------------------------- |
| `input` | `MoneyInput` | Comparison value. A `number` is interpreted as major units. |

### Throws

| Error                   | Condition                                              |
| ----------------------- | ------------------------------------------------------ |
| `CurrencyMismatchError` | `input` is a `MoneyContract` with a different currency |

### Examples

```ts
import { from } from '@eriveltondasilva/currency'

from(5, 'US').max(10).amount() // => 10
from(5, 'US').max(3).amount()  // => 5
from(5, 'US').max(5).amount()  // => 5  (equal — returns copy of this)
```

```ts
// Enforcing a minimum charge
const MIN_FEE = 2.50

function calculateFee(amount: MoneyContract): MoneyContract {
  return amount.times(0.03).max(MIN_FEE)
}

calculateFee(from(10, 'US')).format()  // => '$2.50'  (3% = $0.30, below minimum)
calculateFee(from(200, 'US')).format() // => '$6.00'  (3% = $6.00, above minimum)
```

::: tip Collection max
To find the maximum value across an array, use the top-level [`max()`](/api/collection#max) function instead.
:::

## min

Returns the lesser of this instance and `input`.

```ts
min(input: MoneyInput): MoneyContract
```

### Parameters

| Name    | Type         | Description                                                 |
| ------- | ------------ | ----------------------------------------------------------- |
| `input` | `MoneyInput` | Comparison value. A `number` is interpreted as major units. |

### Throws

| Error                   | Condition                                              |
| ----------------------- | ------------------------------------------------------ |
| `CurrencyMismatchError` | `input` is a `MoneyContract` with a different currency |

### Examples

```ts
import { from } from '@eriveltondasilva/currency'

from(5, 'US').min(10).amount() // => 5
from(5, 'US').min(3).amount()  // => 3
from(5, 'US').min(5).amount()  // => 5  (equal — returns copy of this)
```

```ts
// Capping a discount
const MAX_DISCOUNT = from(50, 'US')

function applyCredit(price: MoneyContract, credit: MoneyContract): MoneyContract {
  const applicable = credit.min(price) // can't discount more than the price
  return price.minus(applicable)
}

applyCredit(from(30, 'US'), from(50, 'US')).format()  // => '$0.00'
applyCredit(from(80, 'US'), from(50, 'US')).format()  // => '$30.00'
```

::: tip Collection min
To find the minimum value across an array, use the top-level [`min()`](/api/collection#min) function instead.
:::

## round

Rounds the amount to the nearest multiple of `step` in major units.

Useful for payment systems or currencies that require specific denominations — for example, rounding to the nearest $0.05 or $0.50.

```ts
round(step: number, mode?: RoundingMode): MoneyContract
```

### Parameters

| Name   | Type           | Default        | Description                                                       |
| ------ | -------------- | -------------- | ----------------------------------------------------------------- |
| `step` | `number`       | —              | Positive number in major units specifying the rounding increment  |
| `mode` | `RoundingMode` | `'halfExpand'` | Rounding strategy applied when the amount falls between two steps |

### Throws

| Error               | Condition                                                                                          |
| ------------------- | -------------------------------------------------------------------------------------------------- |
| `InvalidInputError` | `step` is not a positive finite number, or too small to represent in minor units for this currency |

### Examples

```ts
import { from } from '@eriveltondasilva/currency'

// Round to nearest 5 cents
from(1.03, 'US').round(0.05).amount()  // => 1.05
from(1.02, 'US').round(0.05).amount()  // => 1.00
from(1.025, 'US').round(0.05).amount() // => 1.05  (halfway rounds to nearest even step)

// Round to nearest dollar
from(1.49, 'US').round(1).amount() // => 1.00
from(1.50, 'US').round(1).amount() // => 2.00

// Round to nearest R$ 0.50
from(9.74, 'BR').round(0.50).amount() // => 9.50
from(9.75, 'BR').round(0.50).amount() // => 10.00

// Round to nearest R$ 500
from(1499, 'BR').round(500).amount() // => 1500
from(1249, 'BR').round(500).amount() // => 1000
```

```ts
// Controlling rounding mode
from(1.025, 'US').round(0.05, 'ceil').amount()  // => 1.05
from(1.025, 'US').round(0.05, 'floor').amount() // => 1.00
```

```ts
// Zero is returned as-is
from(0, 'US').round(0.05).isZero() // => true
```

::: warning JPY and zero-decimal currencies
For currencies with 0 fraction digits (e.g. JPY), `step` must be at least `1`. Smaller values like `0.05` cannot be represented and will throw `InvalidInputError`.

```ts
from(150, 'JP').round(50).amount()   // => 150  ✅
from(150, 'JP').round(0.05).amount() // ❌ InvalidInputError
```

:::

## Quick reference

| Method               | Description                          |
| -------------------- | ------------------------------------ |
| `abs()`              | Non-negative value — sign is removed |
| `negate()`           | Flipped sign                         |
| `max(x)`             | Greater of `this` and `x`            |
| `min(x)`             | Lesser of `this` and `x`             |
| `round(step, mode?)` | Nearest multiple of `step`           |
