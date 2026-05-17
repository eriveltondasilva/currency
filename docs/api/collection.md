# Collection

Top-level functions that operate on **arrays** of monetary values. All functions accept [`MoneyInput`](/reference/types#moneyinput) — either a `number` (major units) or a `MoneyContract` — and return a new `MoneyContract`.

```ts
import { sum, average, min, max, clamp, total } from '@eriveltondasilva/currency'
```

## sum

Sums an array of monetary values.

Returns `zero(country)` when `values` is empty.

```ts
function sum(values: MoneyInput[], country: CountryCode): MoneyContract
```

### Parameters

| Name      | Type           | Description                                                            |
| --------- | -------------- | ---------------------------------------------------------------------- |
| `values`  | `MoneyInput[]` | Array of amounts as numbers (major units) or `MoneyContract` instances |
| `country` | `CountryCode`  | Supported country code that defines the output currency                |

### Throws

| Error                      | Condition                                                               |
| -------------------------- | ----------------------------------------------------------------------- |
| `CurrencyMismatchError`    | Any `MoneyContract` in `values` has a different currency than `country` |
| `UnsupportedCurrencyError` | `country` is not a supported code                                       |
| `UnsafeIntegerError`       | Accumulated sum exceeds `Number.MAX_SAFE_INTEGER`                       |

### Examples

```ts
import { sum, from } from '@eriveltondasilva/currency'

sum([10, 20.50, 5], 'BR').format()      // => 'R$ 35,50'
sum([9.99, 19.99, 4.99], 'US').format() // => '$34.97'

// Empty array returns zero
sum([], 'US').isZero() // => true

// Mix of numbers and MoneyContract instances
const a = from(10, 'US')
const b = from(20, 'US')
sum([a, b, 5], 'US').format() // => '$35.00'
```

```ts
// Summing prices from a product list
const prices = products.map(p => p.price)
const total = sum(prices, 'BR')
```

## average

Computes the arithmetic mean of an array of monetary values.

The result is rounded to the nearest minor unit. Returns `zero(country)` when `values` is empty.

```ts
function average(
  values: MoneyInput[],
  country: CountryCode,
  roundingMode?: RoundingMode,
): MoneyContract
```

### Parameters

| Name           | Type           | Default        | Description                                              |
| -------------- | -------------- | -------------- | -------------------------------------------------------- |
| `values`       | `MoneyInput[]` | —              | Array of amounts as numbers or `MoneyContract` instances |
| `country`      | `CountryCode`  | —              | Supported country code                                   |
| `roundingMode` | `RoundingMode` | `'halfExpand'` | Rounding strategy for the mean                           |

### Throws

| Error                      | Condition                                                |
| -------------------------- | -------------------------------------------------------- |
| `CurrencyMismatchError`    | Any `MoneyContract` in `values` has a different currency |
| `UnsupportedCurrencyError` | `country` is not a supported code                        |

### Examples

```ts
import { average } from '@eriveltondasilva/currency'

average([10, 20, 30], 'US').amount() // => 20
average([1, 2], 'BR').amount()       // => 1.5

// Rounding when the mean is not a whole minor unit
average([1, 2, 3], 'US').amount() // => 2    (600 / 3 = 200 minor units)
average([1, 2, 4], 'US').amount() // => 2.33 (700 / 3 = 233.33 → 233 minor units)

// Empty array returns zero
average([], 'US').isZero() // => true

// Rounding mode
average([1, 2, 4], 'US', 'ceil').amount() // => 2.34
```

## min

Returns the smallest value in an array of monetary values.

Unlike `sum` and `average`, `min` requires at least one element.

```ts
function min(values: MoneyInput[], country: CountryCode): MoneyContract
```

### Parameters

| Name      | Type           | Description                |
| --------- | -------------- | -------------------------- |
| `values`  | `MoneyInput[]` | Non-empty array of amounts |
| `country` | `CountryCode`  | Supported country code     |

### Throws

| Error                      | Condition                                                |
| -------------------------- | -------------------------------------------------------- |
| `InvalidInputError`        | `values` is empty                                        |
| `CurrencyMismatchError`    | Any `MoneyContract` in `values` has a different currency |
| `UnsupportedCurrencyError` | `country` is not a supported code                        |

### Examples

```ts
import { min } from '@eriveltondasilva/currency'

min([5, 30, 10], 'US').amount() // => 5
min([5, 30, 10], 'BR').format() // => 'R$ 5,00'
min([99.99], 'US').amount()     // => 99.99

min([], 'US') // ❌ InvalidInputError
```

```ts
// Lowest price among competing offers
const offers = [129.99, 115.00, 134.50, 119.90]
min(offers, 'US').format() // => '$115.00'
```

::: tip Instance method vs collection function
`instance.min(x)` compares `this` against a single value and returns the lesser.
`min(array, country)` finds the minimum across an entire array.
:::

## max

Returns the largest value in an array of monetary values.

Unlike `sum` and `average`, `max` requires at least one element.

```ts
function max(values: MoneyInput[], country: CountryCode): MoneyContract
```

### Parameters

| Name      | Type           | Description                |
| --------- | -------------- | -------------------------- |
| `values`  | `MoneyInput[]` | Non-empty array of amounts |
| `country` | `CountryCode`  | Supported country code     |

### Throws

| Error                      | Condition                                                |
| -------------------------- | -------------------------------------------------------- |
| `InvalidInputError`        | `values` is empty                                        |
| `CurrencyMismatchError`    | Any `MoneyContract` in `values` has a different currency |
| `UnsupportedCurrencyError` | `country` is not a supported code                        |

### Examples

```ts
import { max } from '@eriveltondasilva/currency'

max([5, 30, 10], 'US').amount() // => 30
max([5, 30, 10], 'BR').format() // => 'R$ 30,00'
max([99.99], 'US').amount()     // => 99.99

max([], 'US') // ❌ InvalidInputError
```

```ts
// Highest transaction in a list
const transactions = [250.00, 89.99, 412.50, 175.00]
max(transactions, 'US').format() // => '$412.50'
```

::: tip Instance method vs collection function
`instance.max(x)` compares `this` against a single value and returns the greater.
`max(array, country)` finds the maximum across an entire array.
:::

## clamp

Constrains a monetary value within a `[min, max]` closed interval.

- Returns `min` when `value < min`
- Returns `max` when `value > max`
- Returns `value` unchanged when it falls within the interval

```ts
function clamp(
  value: MoneyInput,
  min: MoneyInput,
  max: MoneyInput,
  country: CountryCode,
): MoneyContract
```

### Parameters

| Name      | Type          | Description                             |
| --------- | ------------- | --------------------------------------- |
| `value`   | `MoneyInput`  | The amount to constrain                 |
| `min`     | `MoneyInput`  | Lower bound of the interval (inclusive) |
| `max`     | `MoneyInput`  | Upper bound of the interval (inclusive) |
| `country` | `CountryCode` | Supported country code                  |

### Throws

| Error                      | Condition                                             |
| -------------------------- | ----------------------------------------------------- |
| `InvalidRangeError`        | `min` is greater than `max`                           |
| `CurrencyMismatchError`    | Any `MoneyContract` argument has a different currency |
| `UnsupportedCurrencyError` | `country` is not a supported code                     |

### Examples

```ts
import { clamp } from '@eriveltondasilva/currency'

clamp(150, 0, 100, 'US').amount() // => 100 (above max)
clamp(-10, 0, 100, 'US').amount() // => 0   (below min)
clamp(50, 0, 100, 'US').amount()  // => 50  (within range)
clamp(0, 0, 100, 'US').amount()   // => 0   (at lower bound)
clamp(100, 0, 100, 'US').amount() // => 100 (at upper bound)
```

```ts
// Constraining a user-entered tip amount
const MIN_TIP = 0
const MAX_TIP = 500

function sanitizeTip(input: number): MoneyContract {
  return clamp(input, MIN_TIP, MAX_TIP, 'US')
}

sanitizeTip(25).format()  // => '$25.00'
sanitizeTip(-5).format()  // => '$0.00'
sanitizeTip(999).format() // => '$500.00'
```

```ts
// min > max throws InvalidRangeError
clamp(50, 100, 0, 'US')  // ❌ InvalidRangeError
```

## total

Computes the total cost of an array of priced items.

Each item must have a `price` and an optional integer `quantity` (defaults to `1`). Returns `zero(country)` when `items` is empty.

```ts
function total(items: PricedItem[], country: CountryCode): MoneyContract
```

### Parameters

| Name      | Type           | Description                             |
| --------- | -------------- | --------------------------------------- |
| `items`   | `PricedItem[]` | Array of `{ price, quantity? }` objects |
| `country` | `CountryCode`  | Supported country code                  |

The `PricedItem` type:

```ts
interface PricedItem {
  price: MoneyInput // unit price — number (major units) or MoneyContract
  quantity?: number // non-negative integer, defaults to 1
}
```

### Throws

| Error                      | Condition                                                                   |
| -------------------------- | --------------------------------------------------------------------------- |
| `InvalidInputError`        | Any item is not a plain object, or `quantity` is not a non-negative integer |
| `CurrencyMismatchError`    | Any `price` is a `MoneyContract` with a different currency                  |
| `UnsupportedCurrencyError` | `country` is not a supported code                                           |
| `UnsafeIntegerError`       | Accumulated total exceeds `Number.MAX_SAFE_INTEGER`                         |

### Examples

```ts
import { total } from '@eriveltondasilva/currency'

const items = [
  { price: 29.90, quantity: 2 },
  { price: 9.99 }, // quantity defaults to 1
]

total(items, 'BR').format() // => 'R$ 69,79' (29.90×2 + 9.99×1)
```

```ts
// quantity: 0 is valid — the item contributes zero to the total
const items = [
  { price: 9.99, quantity: 0 },
  { price: 4.99, quantity: 2 },
]
total(items, 'US').format() // => '$9.98'
```

```ts
// Empty array returns zero
total([], 'US').isZero() // => true
```

```ts
// Using MoneyContract as price
import { from, total } from '@eriveltondasilva/currency'

const items = [
  { price: from(49.99, 'US'), quantity: 3 },
  { price: from(9.99, 'US') },
]
total(items, 'US').format() // => '$159.96'
```

```ts
// Full cart example
const cart = [
  { price: 299.90, quantity: 1 }, // laptop bag
  { price: 49.90,  quantity: 2 }, // cables
  { price: 19.90,  quantity: 3 }, // adapters
]

const subtotal = total(cart, 'BR')
const shipping = 15.90
const grandTotal = subtotal.plus(shipping).applySurcharge(12)
// 12% tax

subtotal.format()   // => 'R$ 459,40'
grandTotal.format() // => 'R$ 532,34'
```

::: warning Fractional quantities
`quantity` must be a **non-negative integer**. Fractional quantities (e.g. `1.5`) are rejected with `InvalidInputError` because they produce ambiguous sub-minor-unit values that cannot be represented precisely.

```ts
total([{ price: 9.99, quantity: 1.5 }], 'US')  // ❌ InvalidInputError
```

If you need to handle fractional quantities, multiply the price before passing it to `total`:

```ts
total([{ price: from(9.99, 'US').times(1.5) }], 'US')  // ✅
```

:::
