# Installments

Splitting a monetary amount into equal installment payments — ensuring the sum is always exact and no cent is lost or duplicated.

## The scenario

A checkout that offers installment plans. The total must be split into `n` equal payments, with any indivisible remainder distributed fairly across the first installments.

## Why not divide?

The naive approach — dividing the total by the number of installments — produces rounding errors that cause the sum of parts to differ from the original:

```ts
import { from } from '@eriveltondasilva/currency'

const price = from(100, 'BR')

// ❌ divide — loses R$ 0,01
const installment = price.divide(3)
installment.format()  // => 'R$ 33,33'

// 33.33 × 3 = 99.99 ≠ 100.00
```

`allocate()` uses the **largest-remainder method** to distribute the indivisible cent to the first slot, guaranteeing the sum is exact:

```ts
// ✅ allocate — exact
price.allocate(3).map(m => m.format())
// => ['R$ 33,34', 'R$ 33,33', 'R$ 33,33']
// 33.34 + 33.33 + 33.33 = 100.00 ✓
```

## Implementation

```ts
import { from } from '@eriveltondasilva/currency'
import type { MoneyContract } from '@eriveltondasilva/currency'

interface InstallmentPlan {
  count: number
  installments: MoneyContract[]
  total: MoneyContract
}

function buildInstallmentPlan(
  amount: MoneyContract,
  count: number,
): InstallmentPlan {
  const installments = amount.allocate(count)

  // Verify sum is exact (defensive — allocate guarantees this)
  const total = installments.reduce((acc, p) => acc.plus(p), from(0, 'BR'))

  return { count, installments, total }
}
```

## Usage

```ts
const price = from(299.90, 'BR')

const plan3  = buildInstallmentPlan(price, 3)
const plan6  = buildInstallmentPlan(price, 6)
const plan12 = buildInstallmentPlan(price, 12)

// 3 installments
plan3.installments.map(m => m.format())
// => ['R$ 99,97', 'R$ 99,97', 'R$ 99,96']

plan3.total.equals(price)  // => true ✓

// 12 installments
plan12.installments.map(m => m.format())
// => ['R$ 25,00', 'R$ 25,00', 'R$ 24,99', ...(×10)]

plan12.total.equals(price)  // => true ✓
```

## Installment plan with interest

When installments carry interest (a common pattern in Brazilian e-commerce), apply the surcharge before allocating:

```ts
interface InterestRate {
  installments: number
  rate: number  // percentage surcharge per plan
}

const INTEREST_TABLE: InterestRate[] = [
  { installments: 1,  rate: 0    },  // no interest
  { installments: 2,  rate: 0    },
  { installments: 3,  rate: 0    },
  { installments: 6,  rate: 4.5  },
  { installments: 12, rate: 10.2 },
]

function buildPlanWithInterest(
  price: MoneyContract,
  count: number,
): InstallmentPlan {
  const rateEntry = INTEREST_TABLE.find(e => e.installments === count)

  if (!rateEntry) {
    throw new Error(`No interest rate configured for ${count} installments.`)
  }

  const total = rateEntry.rate > 0
    ? price.applySurcharge(rateEntry.rate)
    : price

  return buildInstallmentPlan(total, count)
}
```

```ts
const price = from(1000, 'BR')

const plan1  = buildPlanWithInterest(price, 1)
const plan12 = buildPlanWithInterest(price, 12)

plan1.installments[0].format()  // => 'R$ 1.000,00'
plan12.installments[0].format() // => 'R$ 91,84'  (with 10.2% interest)
plan12.total.format()           // => 'R$ 1.102,00'
```

## Displaying the plan options

```ts
function printPlanOptions(price: MoneyContract, counts: number[]): void {
  console.log(`Price: ${price.format()}\n`)

  for (const count of counts) {
    const plan = buildInstallmentPlan(price, count)
    const first = plan.installments[0]

    if (count === 1) {
      console.log(`  1× ${first.format()} (full)`)
    } else {
      console.log(`  ${count}× ${first.format()}`)
    }
  }
}

printPlanOptions(from(599.90, 'BR'), [1, 2, 3, 6, 12])
```

Output:
```
Price: R$ 599,90

  1× R$ 599,90 (full)
  2× R$ 299,95
  3× R$ 199,97
  6× R$ 99,99
  12× R$ 50,00
```
