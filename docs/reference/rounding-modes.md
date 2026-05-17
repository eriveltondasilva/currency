# Rounding Modes

Several methods accept an optional `roundingMode` parameter that controls how a value is rounded when it falls between two representable minor-unit steps.

```ts
type RoundingMode =
  | 'ceil'
  | 'floor'
  | 'trunc'
  | 'expand'
  | 'halfExpand'
  | 'halfEven'
  | 'halfCeil'
  | 'halfFloor'
  | 'halfTrunc'
```

The default across all methods is `'halfExpand'`.

**Methods that accept `roundingMode`:** `times`, `divide`, `round`, `percentOf`, `applyDiscount`, `applySurcharge`, `average`, and `format`.

## Understanding the two groups

Rounding modes fall into two groups based on when they trigger:

**Direction-based** modes always round — regardless of the fractional part — toward a fixed direction. They never produce a tie case.

**Nearest-neighbor** modes round to the closest representable value. When the value falls exactly halfway between two steps (the `.5` case), a tie-breaking rule is applied.

## Direction-based modes

These modes round unconditionally in a fixed direction.

### ceil

Rounds toward **+∞** (up for positives, up for negatives toward zero).

```ts
from(1, 'US').times(1 / 3, 'ceil').amount()
// 33.33... minor units → 34 → $0.34
from(-1, 'US').times(1 / 3, 'ceil').amount()
// -33.33... minor units → -33 → -$0.33
```

| Input (minor units) | Result |
| ------------------- | ------ |
| `33.1`              | `34`   |
| `33.5`              | `34`   |
| `33.9`              | `34`   |
| `-33.1`             | `-33`  |
| `-33.5`             | `-33`  |
| `-33.9`             | `-33`  |

**When to use:** fee calculations where you must never under-charge (e.g. service fees, processing costs).

### floor

Rounds toward **−∞** (down for positives, down for negatives away from zero).

```ts
from(1, 'US').times(1 / 3, 'floor').amount()
// 33.33... → 33 → $0.33
from(-1, 'US').times(1 / 3, 'floor').amount()
// -33.33... → -34 → -$0.34
```

| Input (minor units) | Result |
| ------------------- | ------ |
| `33.1`              | `33`   |
| `33.5`              | `33`   |
| `33.9`              | `33`   |
| `-33.1`             | `-34`  |
| `-33.5`             | `-34`  |
| `-33.9`             | `-34`  |

**When to use:** interest calculations that must never over-credit, or tax calculations that round in the payer's favor.

### trunc

Rounds toward **0** — drops the fractional part regardless of sign.

```ts
from(1, 'US').times(1 / 3, 'trunc').amount()
// 33.33... → 33 → $0.33
from(-1, 'US').times(1 / 3, 'trunc').amount()
// -33.33... → -33 → -$0.33
```

| Input (minor units) | Result |
| ------------------- | ------ |
| `33.1`              | `33`   |
| `33.5`              | `33`   |
| `33.9`              | `33`   |
| `-33.1`             | `-33`  |
| `-33.5`             | `-33`  |
| `-33.9`             | `-33`  |

**When to use:** truncating sub-cent amounts when a conservative floor toward zero is desired regardless of sign.

### expand

Rounds **away from 0** — the opposite of `trunc`.

```ts
from(1, 'US').times(1 / 3, 'expand').amount()
// 33.33... → 34 → $0.34
from(-1, 'US').times(1 / 3, 'expand').amount()
// -33.33... → -34 → -$0.34
```

| Input (minor units) | Result |
| ------------------- | ------ |
| `33.1`              | `34`   |
| `33.5`              | `34`   |
| `33.9`              | `34`   |
| `-33.1`             | `-34`  |
| `-33.5`             | `-34`  |
| `-33.9`             | `-34`  |

**When to use:** conservative over-estimation in both directions, such as provisioning or reserve calculations.

## Nearest-neighbor modes

These modes round to the closest value. The tie-breaking rule (what happens at exactly `.5`) is what distinguishes them.

### halfExpand *(default)*

Rounds to the nearest value; ties go **away from 0**.

This is the most common rounding mode — it matches the behavior most people expect from "round half up" and is symmetric around zero.

```ts
from(1, 'US').times(0.5, 'halfExpand').amount()
// 50 minor units → 50 → $0.50 (exact, no tie)
from(1, 'US').divide(3, 'halfExpand').amount()
// 33.33... → 33 → $0.33
```

| Input (minor units) | Result |
| ------------------- | ------ |
| `33.4`              | `33`   |
| `33.5`              | `34`   |
| `33.6`              | `34`   |
| `-33.4`             | `-33`  |
| `-33.5`             | `-34`  |
| `-33.6`             | `-34`  |

**When to use:** the default for most monetary calculations. Human-friendly and symmetric.

### halfEven

Rounds to the nearest value; ties go to the **nearest even** integer (banker's rounding).

Statistically neutral — over many operations, tie cases are split evenly between rounding up and down, reducing cumulative bias.

```ts
from(0.5, 'US').round(1, 'halfEven').amount()
// 50 minor units — 0 is even → $0
from(1.5, 'US').round(1, 'halfEven').amount()
// 150 minor units — 2 is even → $2
from(2.5, 'US').round(1, 'halfEven').amount()
// 250 minor units — 2 is even → $2
from(3.5, 'US').round(1, 'halfEven').amount()
// 350 minor units — 4 is even → $4
```

| Input (minor units) | Nearest even | Result |
| ------------------- | :----------: | ------ |
| `33.5`              |     `34`     | `34`   |
| `34.5`              |     `34`     | `34`   |
| `35.5`              |     `36`     | `36`   |
| `-33.5`             |    `-34`     | `-34`  |
| `-34.5`             |    `-34`     | `-34`  |

**When to use:** financial reports, statistical aggregations, or any context where minimising cumulative rounding bias matters. Required by IEEE 754 and used in accounting systems.

### halfCeil

Rounds to the nearest value; ties go toward **+∞**.

Matches the behavior of `Math.round` in JavaScript. Asymmetric for negative values — `-0.5` rounds to `0`, not `-1`.

| Input (minor units) | Result |
| ------------------- | ------ |
| `33.5`              | `34`   |
| `-33.5`             | `-33`  |
| `34.5`              | `35`   |
| `-34.5`             | `-34`  |

**When to use:** when compatibility with `Math.round` semantics is required, or for UI display where the positive direction is preferred for tie cases.

### halfFloor

Rounds to the nearest value; ties go toward **−∞**.

The mirror of `halfCeil`. Asymmetric for positive values — `0.5` rounds to `0`, not `1`.

| Input (minor units) | Result |
| ------------------- | ------ |
| `33.5`              | `33`   |
| `-33.5`             | `-34`  |
| `34.5`              | `34`   |
| `-34.5`             | `-35`  |

**When to use:** scenarios where the negative direction is preferred at tie cases, such as refunds or credit calculations.

### halfTrunc

Rounds to the nearest value; ties go toward **0**.

| Input (minor units) | Result |
| ------------------- | ------ |
| `33.5`              | `33`   |
| `-33.5`             | `-33`  |
| `34.5`              | `34`   |
| `-34.5`             | `-34`  |

**When to use:** conservative rounding where ties are always resolved in the direction that produces a smaller absolute value.

## Summary table

The table below shows how each mode handles the same set of inputs in minor units.

| Mode                     | `33.1` | `33.5` | `33.9` | `-33.1` | `-33.5` | `-33.9` |
| ------------------------ | :----: | :----: | :----: | :-----: | :-----: | :-----: |
| `ceil`                   |  `34`  |  `34`  |  `34`  |  `-33`  |  `-33`  |  `-33`  |
| `floor`                  |  `33`  |  `33`  |  `33`  |  `-34`  |  `-34`  |  `-34`  |
| `trunc`                  |  `33`  |  `33`  |  `33`  |  `-33`  |  `-33`  |  `-33`  |
| `expand`                 |  `34`  |  `34`  |  `34`  |  `-34`  |  `-34`  |  `-34`  |
| `halfExpand` *(default)* |  `33`  |  `34`  |  `34`  |  `-33`  |  `-34`  |  `-34`  |
| `halfEven`               |  `33`  |  `34`  |  `34`  |  `-33`  |  `-34`  |  `-34`  |
| `halfCeil`               |  `33`  |  `34`  |  `34`  |  `-33`  |  `-33`  |  `-34`  |
| `halfFloor`              |  `33`  |  `33`  |  `34`  |  `-33`  |  `-34`  |  `-34`  |
| `halfTrunc`              |  `33`  |  `33`  |  `34`  |  `-33`  |  `-33`  |  `-34`  |

::: tip Choosing a mode
For most applications, the default `'halfExpand'` is the right choice. Consider `'halfEven'` for financial reports where statistical neutrality matters, `'ceil'` when you must never under-charge, and `'floor'` when you must never over-credit.
:::
