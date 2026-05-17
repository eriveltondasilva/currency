# Discount Chain

Applying multiple discounts and surcharges in sequence — and understanding when order matters.

## Single discount

The straightforward case: one percentage off the original price.

```ts
import { from } from '@eriveltondasilva/currency'

const price = from(200, 'US')

price.applyDiscount(20).format()  // => '$160.00'  (20% off)
```

## Compound vs simple discounts

When two discounts are applied in sequence, each discount is applied to the **already-reduced** amount — not the original. This is **not** equivalent to adding the percentages together.

```ts
const price = from(100, 'US')

// Two 10% discounts applied in sequence
price.applyDiscount(10).applyDiscount(10).amount() // => 81 ⚠

// A single 20% discount
price.applyDiscount(20).amount() // => 80

// Compound formula: 100 × (1 - 0.10) × (1 - 0.10) = 81
```

**When to use compound discounts:** loyalty tiers, stacked promotions, or any context where each discount is applied independently to the running total.

**When to combine into a single discount:** when the intent is a flat total reduction and the compounding effect is undesirable.

## Coupon + loyalty discount

A common pattern: a coupon discount applied first, then a membership discount on the result.

```ts
interface DiscountConfig {
  couponPercent: number     // e.g. 15 for a 15% coupon
  membershipPercent: number // e.g. 5 for a 5% loyalty tier
}

function applyDiscounts(
  price: MoneyContract,
  config: DiscountConfig,
): MoneyContract {
  return price
    .applyDiscount(config.couponPercent)
    .applyDiscount(config.membershipPercent)
}

const price = from(200, 'US')
const config = { couponPercent: 15, membershipPercent: 5 }

applyDiscounts(price, config).format() // => '$161.50'
// 200 × 0.85 = 170.00 → 170.00 × 0.95 = 161.50
```

## Discount then tax

Tax is typically applied **after** the discount, to the reduced amount:

```ts
const price = from(300, 'BR')

price
  .applyDiscount(10)   // R$ 270,00  (10% off)
  .applySurcharge(12)  // R$ 302,40  (12% tax on discounted amount)
  .format()            // => 'R$ 302,40'
```

Compare with tax applied **before** discount — a different result:

```ts
price
  .applySurcharge(12)  // R$ 336,00  (tax first)
  .applyDiscount(10)   // R$ 302,40  (then discount)
  .format()            // => 'R$ 302,40'

// In this case the result is the same — mathematically equivalent
// when both operations use the same base. This is not always true.
```

**Order matters when discounts and surcharges use different bases.** Always clarify which amount each operation is applied to.

## Coupon validation and application

```ts
interface Coupon {
  code: string
  type: 'percent' | 'fixed'
  value: number          // percent: 0–100 | fixed: amount in major units
  minOrderValue?: number // minimum subtotal to activate the coupon
}

function applyCoupon(
  price: MoneyContract,
  coupon: Coupon,
  country: 'BR' | 'US',
): MoneyContract {
  // Check minimum order value
  if (coupon.minOrderValue && price.lessThan(coupon.minOrderValue)) {
    return price  // coupon not applicable — return price unchanged
  }

  if (coupon.type === 'percent') {
    return price.applyDiscount(coupon.value)
  }

  // Fixed discount — clamp to zero so price never goes negative
  const discount = from(coupon.value, country)
  return price.minus(discount).max(0)
}
```

```ts
const price = from(150, 'US')

const percentCoupon: Coupon = {
  code: 'SAVE15',
  type: 'percent',
  value: 15,
  minOrderValue: 100,
}

const fixedCoupon: Coupon = {
  code: 'FLAT20',
  type: 'fixed',
  value: 20,
}

applyCoupon(price, percentCoupon, 'US').format()  // => '$127.50'
applyCoupon(price, fixedCoupon, 'US').format()    // => '$130.00'

// Minimum order not met
const smallOrder = from(50, 'US')
applyCoupon(smallOrder, percentCoupon, 'US').format()  // => '$50.00'  (unchanged)
```

## Stacking multiple coupons

When your business rules allow stacking, collect all applicable discounts and apply them in order:

```ts
type DiscountSource = 'coupon' | 'membership' | 'volume' | 'seasonal'

interface AppliedDiscount {
  source: DiscountSource
  percent: number
}

function applyAllDiscounts(
  price: MoneyContract,
  discounts: AppliedDiscount[],
): { final: MoneyContract; applied: AppliedDiscount[] } {
  const final = discounts.reduce(
    (current, discount) => current.applyDiscount(discount.percent),
    price,
  )

  return { final, applied: discounts }
}
```

```ts
const price = from(500, 'US')

const discounts: AppliedDiscount[] = [
  { source: 'seasonal',   percent: 10 },  // summer sale
  { source: 'membership', percent: 5  },  // gold member
  { source: 'volume',     percent: 3  },  // 10+ items
]

const { final } = applyAllDiscounts(price, discounts)

final.format()
// 50000 → ×0.90 → 45000 → ×0.95 → 42750 → ×0.97 → 41467
// => '$414.67'
```

## Showing savings

```ts
function formatSavings(original: MoneyContract, final: MoneyContract): string {
  const saved = original.minus(final)
  const percent = saved.amount() / original.amount() * 100

  return `Save ${saved.format()} (${percent.toFixed(0)}% off)`
}

const original = from(200, 'US')
const final = from(161, 'US')

formatSavings(original, final)  // => 'Save $39.00 (20% off)'
```
