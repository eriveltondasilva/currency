# Cart Total

A complete checkout flow — from individual line items through discounts, shipping, and tax to a final formatted total.

## The scenario

An e-commerce cart with:
- Multiple items with quantities
- A percentage coupon discount on the subtotal
- A flat shipping fee
- A tax rate applied to the discounted subtotal (not the shipping)

## Implementation

```ts
import { total, from, zero } from '@eriveltondasilva/currency'
import type { MoneyContract, PricedItem } from '@eriveltondasilva/currency'

interface CartItem extends PricedItem {
  name: string
}

interface CartSummary {
  subtotal: MoneyContract
  discount: MoneyContract
  discountedSubtotal: MoneyContract
  tax: MoneyContract
  shipping: MoneyContract
  grandTotal: MoneyContract
}

function calculateCart(
  items: CartItem[],
  discountPercent: number,
  taxPercent: number,
  shippingFee: number,
  country: 'BR' | 'US',
): CartSummary {
  // 1. Subtotal — price × quantity for all items
  const subtotal = total(items, country)

  // 2. Discount amount — computed from the subtotal
  const discount = subtotal.percentOf(discountPercent)

  // 3. Discounted subtotal
  const discountedSubtotal = subtotal.minus(discount)

  // 4. Tax — applied to the discounted subtotal, not to shipping
  const tax = discountedSubtotal.percentOf(taxPercent)

  // 5. Shipping — flat fee, independent of discount and tax
  const shipping = from(shippingFee, country)

  // 6. Grand total — discounted subtotal + tax + shipping
  const grandTotal = discountedSubtotal.plus(tax).plus(shipping)

  return { subtotal, discount, discountedSubtotal, tax, shipping, grandTotal }
}
```

## Usage

```ts
const items: CartItem[] = [
  { name: 'Mechanical Keyboard', price: 349.90, quantity: 1 },
  { name: 'USB-C Cable',         price: 29.90,  quantity: 2 },
  { name: 'Mouse Pad',           price: 49.90,  quantity: 1 },
]

const summary = calculateCart(
  items,
  10,    // 10% coupon discount
  12,    // 12% tax
  15.90, // flat shipping fee
  'BR',
)

console.log(summary.subtotal.format())           // => 'R$ 459,60'
console.log(summary.discount.format())           // => 'R$ 45,96'
console.log(summary.discountedSubtotal.format()) // => 'R$ 413,64'
console.log(summary.tax.format())                // => 'R$ 49,64'
console.log(summary.shipping.format())           // => 'R$ 15,90'
console.log(summary.grandTotal.format())         // => 'R$ 479,18'
```

## Handling an empty cart

`total()` returns `zero(country)` for an empty array. All subsequent operations on zero behave correctly — no special-casing needed.

```ts
const summary = calculateCart([], 10, 12, 15.90, 'BR')

summary.subtotal.isZero()    // => true
summary.discount.isZero()    // => true
summary.grandTotal.format()  // => 'R$ 15,90'  (shipping still applies)
```

## Free shipping threshold

```ts
const FREE_SHIPPING_THRESHOLD = 300

function calculateShipping(subtotal: MoneyContract): number {
  return subtotal.greaterThanOrEqual(FREE_SHIPPING_THRESHOLD) ? 0 : 15.90
}

const subtotal = total(items, 'BR')
const shipping = calculateShipping(subtotal)

// Continue with calculateCart using the resolved shipping fee
```

## Conditional discount

```ts
const MIN_FOR_DISCOUNT = 200

function resolveDiscount(subtotal: MoneyContract, couponPercent: number): number {
  return subtotal.greaterThanOrEqual(MIN_FOR_DISCOUNT) ? couponPercent : 0
}
```

## Displaying the summary

```ts
function printSummary(summary: CartSummary): void {
  const { subtotal, discount, tax, shipping, grandTotal } = summary

  console.log(`Subtotal:   ${subtotal.format()}`)

  if (!discount.isZero()) {
    console.log(`Discount:  -${discount.format()}`)
  }

  console.log(`Tax:        ${tax.format()}`)
  console.log(`Shipping:   ${shipping.format()}`)
  console.log(`─────────────────────────`)
  console.log(`Total:      ${grandTotal.format()}`)
}
```

Output:
```
Subtotal:   R$ 459,60
Discount:  -R$ 45,96
Tax:        R$ 49,64
Shipping:   R$ 15,90
─────────────────────────
Total:      R$ 479,18
```
