# Precision Model

This library stores all values as **minor-unit integers** — so any `number` you pass in major units must cross a conversion boundary before it can be stored. That boundary is where rounding happens.

Understanding this model will prevent the most common source of surprise when working with the library.

See [Core Concepts — Minor units](/guide/concepts#minor-units) for a primer on why integer storage matters.

## Where rounding happens

Rounding does **not** happen on the result of an operation. It happens **on input**, at the moment a `number` is converted to minor units.

```ts
// BRL has 2 fraction digits — the smallest unit is R$ 0,01
// 0.015 × 100 = 1.5 → halfExpand → 2 minor units
from(0.015, 'BR').minorUnits() // => 2
from(0.015, 'BR').amount()     // => 0.02
```

The same conversion runs every time a plain `number` enters the library — whether through `from()`, `parse()`, or as an argument to `plus()`, `minus()`, `isBetween()`, and any other method that accepts `MoneyInput`.

## Accumulated rounding

Because each number is rounded independently on the way in, adding two sub-cent values rounds **twice** — once per input:

```ts
from(0.015, 'BR').plus(0.015).format()
// ❌ Might expect R$ 0,03
// ✅ Actually R$ 0,04 — 2 minor units + 2 minor units = 4
```

This is not a bug. `R$ 0,015` does not exist in BRL; the library rounds to the nearest representable value at each entry point. The result is internally consistent — but it may not match what plain floating-point arithmetic would produce.

When accumulation matters, use `fromMinorUnits()` to bypass the conversion entirely:

```ts
// No conversion, no rounding, no surprises
fromMinorUnits(2, 'BR').plus(fromMinorUnits(2, 'BR')).format() // => 'R$ 0,04'
```

See [Creation — fromMinorUnits](/api/creation#fromminorUnits).

## Rounding in `times` and `divide`

`plus` and `minus` add integers to integers — the result is always exact. `times` and `divide` are different: multiplying or dividing minor units by a scalar can produce a non-integer, which must be rounded back to a whole number.

That rounding happens **on the result**, not on the input, and it is controlled by `roundingMode`:

```ts
// 100 minor units ÷ 3 = 33.333... → halfExpand → 33
from(1, 'US').divide(3).amount() // => 0.33

// 100 minor units ÷ 3 = 33.333... → ceil → 34
from(1, 'US').divide(3, 'ceil').amount() // => 0.34
```

See [Arithmetic — Rounding in arithmetic](/api/arithmetic#rounding-in-arithmetic) and the full [Rounding Modes](/reference/rounding-modes) reference.

## Choosing a rounding mode

The default `'halfExpand'` is appropriate for most use cases. Use the table below as a quick guide:

| Context                          | Recommended mode |
| -------------------------------- | :--------------: |
| General use                      |   `halfExpand`   |
| Financial reports / accounting   |    `halfEven`    |
| Must never under-charge (fees)   |      `ceil`      |
| Must never over-credit (refunds) |     `floor`      |

---

::: tip Prefer `fromMinorUnits` for values from trusted sources
If your values come from a database or an API, they are already in minor units. Use `fromMinorUnits()` directly — no conversion, no rounding, no accumulation risk.

```ts
// Reading from a database column that stores minor units
const price = fromMinorUnits(row.price_minor, 'BR')
```

See [Serialization](/recipes/serialization) for recommended persistence patterns.
:::
