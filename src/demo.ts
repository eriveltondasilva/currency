/** biome-ignore-all lint/suspicious/noConsole: demo file */
/** biome-ignore-all assist/source/organizeImports: demo file */

/**
 * @eriveltondasilva/currency — Demo
 *
 * A quick tour of the library's main features.
 * Run with: bun demo.ts  |  npx tsx demo.ts
 */

import {
  // Creation
  from,
  fromMinorUnits,
  fromString,
  money,
  parse,
  zero,
  // Collection
  average,
  clamp,
  max,
  min,
  sum,
  // Business
  percent,
  total,
  // Utils
  isMoney,
  isMoneyInput,
  // Errors
  CurrencyMismatchError,
  DivisionByZeroError,
  InvalidInputError,
  InvalidPercentageError,
  InvalidRangeError,
  MoneyError,
  fromCents,
  fromInt,
} from '.';

import { br, us, jp, de, gb } from './presets';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const section = (title: string) =>
  console.log(`\n${'─'.repeat(52)}\n  ${title}\n${'─'.repeat(52)}`);

const log = (label: string, value: unknown) => console.log(`  ${label.padEnd(38)} →  ${value}`);

// ─────────────────────────────────────────────────────────────────────────────
section('1. CREATION');
// ─────────────────────────────────────────────────────────────────────────────

// from() / money() — major units (number)
const price = from(19.99, 'BR');
log('from(19.99, "BR").format()', price.format());

const sameAsMoney = money(19.99, 'BR');
log('money() is an alias for from()', sameAsMoney.format());

// parse() / fromString() — locale-formatted string
const parsed = parse('R$ 1.999,99', 'BR');
log('parse("R$ 1.999,99", "BR").amount()', parsed.amount());

const parsedUS = fromString('$1,999.99', 'US');
log('fromString("$1,999.99", "US").amount()', parsedUS.amount());

// fromMinorUnits() — already in minor units (e.g. from database)
const restored = fromMinorUnits(1999, 'BR');
log('fromMinorUnits(1999, "BR").amount()', restored.amount());

const restoredCents = fromCents(1999, 'BR');
log('fromCents(1999, "BR").amount()', restoredCents.amount());

const restoredInt = fromInt(1999, 'BR');
log('fromInt(1999, "BR").amount()', restoredInt.amount());

// zero()
const empty = zero('US');
log('zero("US").format()', empty.format());

// ─────────────────────────────────────────────────────────────────────────────
section('2. PRESETS (shorthand)');
// ─────────────────────────────────────────────────────────────────────────────

log('br(49.90).format()', br(49.9).format());
log('us(9.99).format()', us(9.99).format());
log('jp(1500).format()', jp(1500).format()); // JPY has 0 fraction digits
log('de(299.99).format()', de(299.99).format());
log('gb(12.50).format()', gb(12.5).format());

// Presets also accept strings
log('br("R$ 1.200,00").amount()', br('R$ 1.200,00').amount());

// ─────────────────────────────────────────────────────────────────────────────
section('3. ACCESSORS');
// ─────────────────────────────────────────────────────────────────────────────

const value = from(19.99, 'BR');

log('amount()', value.amount());
log('minorUnits()', value.minorUnits());
log('units()', value.units());
log('subunits()', value.subunits());
log('currencyCode()', value.currencyCode());
log('locale()', value.locale());
log('toParts()', JSON.stringify(value.toParts()));
log('toString()', value.toString());
log('toJSON()', JSON.stringify(value.toJSON()));

// ─────────────────────────────────────────────────────────────────────────────
section('4. STATE CHECKS');
// ─────────────────────────────────────────────────────────────────────────────

log('from(0, "US").isZero()', from(0, 'US').isZero());
log('from(5, "US").isPositive()', from(5, 'US').isPositive());
log('from(-3, "US").isNegative()', from(-3, 'US').isNegative());

// ─────────────────────────────────────────────────────────────────────────────
section('5. ARITHMETIC');
// ─────────────────────────────────────────────────────────────────────────────

const base = from(100, 'US');

log('plus(50).amount()', base.plus(50).amount());
log('minus(30).amount()', base.minus(30).amount());
log('times(1.5).amount()', base.times(1.5).amount());
log('divide(4).amount()', base.divide(4).amount());

// Chaining
const chain = from(100, 'US').plus(50).times(2).minus(30).divide(5);
log('(100+50)*2-30)/5  .amount()', chain.amount());

// Rounding modes in times()
const oneThird = from(1, 'US').times(1 / 3, 'halfEven');
log('from(1,"US").times(1/3,"halfEven")', oneThird.amount());

// ─────────────────────────────────────────────────────────────────────────────
section('6. TRANSFORMATION');
// ─────────────────────────────────────────────────────────────────────────────

log('from(-15,"US").abs().amount()', from(-15, 'US').abs().amount());
log('from(20,"BR").negate().amount()', from(20, 'BR').negate().amount());
log('from(5,"US").max(10).amount()', from(5, 'US').max(10).amount());
log('from(5,"US").min(3).amount()', from(5, 'US').min(3).amount());

// round() — snap to nearest denomination
log('from(1.03,"US").round(0.05)', from(1.03, 'US').round(0.05).amount()); // => 1.05
log('from(1.02,"US").round(0.05)', from(1.02, 'US').round(0.05).amount()); // => 1.00
log('from(1.50,"US").round(1)   ', from(1.5, 'US').round(1).amount()); // => 2.00

// ─────────────────────────────────────────────────────────────────────────────
section('7. COMPARISON');
// ─────────────────────────────────────────────────────────────────────────────

const a = from(10, 'US');
const b = from(20, 'US');

log('a.equals(10)', a.equals(10));
log('a.greaterThan(5)', a.greaterThan(5));
log('a.lessThan(b)', a.lessThan(b));
log('a.greaterThanOrEqual(10)', a.greaterThanOrEqual(10));
log('a.lessThanOrEqual(10)', a.lessThanOrEqual(10));
log('a.compare(b)  (-1|0|1)', a.compare(b));
log('a.isBetween(5, 15)', a.isBetween(5, 15));
log('a.hasSameCurrency(b)', a.hasSameCurrency(b));

// sort() via compare()
const prices = [from(30, 'US'), from(10, 'US'), from(20, 'US')];
const sorted = prices.sort((x, y) => x.compare(y)).map((m) => m.amount());
log('sorted ascending', JSON.stringify(sorted));

// ─────────────────────────────────────────────────────────────────────────────
section('8. BUSINESS — percentOf / discount / surcharge');
// ─────────────────────────────────────────────────────────────────────────────

const product = from(200, 'BR');

log('percentOf(15)', product.percentOf(15).format()); // R$ 30
log('applyDiscount(20)', product.applyDiscount(20).format()); // R$ 160
log('applySurcharge(10)', product.applySurcharge(10).format()); // R$ 220

// ─────────────────────────────────────────────────────────────────────────────
section('9. BUSINESS — allocate / allocateByRatio');
// ─────────────────────────────────────────────────────────────────────────────

// allocate — split equally, remainder goes to first slots
const shares = from(10, 'BR')
  .allocate(3)
  .map((m) => m.amount());
log('from(10,"BR").allocate(3)', JSON.stringify(shares)); // [3.34, 3.33, 3.33]

// allocateByRatio — proportional split
const ratioShares = from(100, 'US')
  .allocateByRatio([1, 3])
  .map((m) => m.amount());
log('allocateByRatio([1, 3])', JSON.stringify(ratioShares)); // [25, 75]

const threeWay = from(100, 'US')
  .allocateByRatio([30, 30, 40])
  .map((m) => m.amount());
log('allocateByRatio([30,30,40])', JSON.stringify(threeWay)); // [30, 30, 40]

// ─────────────────────────────────────────────────────────────────────────────
section('10. COLLECTION — sum / average / max / min / clamp');
// ─────────────────────────────────────────────────────────────────────────────

const values = [10, 20.5, 5, 100];

log('sum([10,20.50,5,100],"BR")', sum(values, 'BR').format());
log('average([10,20.50,5,100])', average(values, 'US').format());
log('max([10,20.50,5,100],"US")', max(values, 'US').amount());
log('min([10,20.50,5,100],"US")', min(values, 'US').amount());

log('clamp(150, 0, 100, "US")', clamp(150, 0, 100, 'US').amount()); // => 100
log('clamp(-10, 0, 100, "US")', clamp(-10, 0, 100, 'US').amount()); // => 0
log('clamp(50,  0, 100, "US")', clamp(50, 0, 100, 'US').amount()); // => 50

// sum() with MoneyContract instances mixed with numbers
const moneySum = sum([from(10, 'US'), 20, from(30, 'US')], 'US');
log('sum([Money(10), 20, Money(30)])', moneySum.format());

// empty array
log('sum([], "US").isZero()', sum([], 'US').isZero());

// ─────────────────────────────────────────────────────────────────────────────
section('11. BUSINESS — total / percent');
// ─────────────────────────────────────────────────────────────────────────────

const cartItems = [
  { price: 29.9, quantity: 2 },
  { price: 9.99, quantity: 3 },
  { price: 4.99 }, // quantity defaults to 1
];

log('total(cartItems, "BR")', total(cartItems, 'BR').format());
// => R$ 94,76 (29.90*2 + 9.99*3 + 4.99)

log('percent(25, 200, "US")', percent(25, 200, 'US')); // => 12.5
log('percent(1, 3, "BR")', percent(1, 3, 'BR').toFixed(4)); // => 33.3333...

// ─────────────────────────────────────────────────────────────────────────────
section('12. FORMAT OPTIONS');
// ─────────────────────────────────────────────────────────────────────────────

const amount = from(1999.9, 'BR');

log('default', amount.format());
log('currencyDisplay: "code"', amount.format({ currencyDisplay: 'code' }));
log('currencyDisplay: "name"', amount.format({ currencyDisplay: 'name' }));
log('currencyDisplay: "none"', amount.format({ currencyDisplay: 'none' }));
log('notation: "compact"', amount.format({ notation: 'compact' }));
log('signDisplay: "always"', from(100, 'US').format({ signDisplay: 'always' }));
log('currencySign: "accounting"', from(-50, 'US').format({ currencySign: 'accounting' }));

// Override locale for display only (currency stays BRL)
log('locale: "en-US" (BRL)', amount.format({ locale: 'en-US' }));

// ─────────────────────────────────────────────────────────────────────────────
section('13. UTILS — isMoney / isMoneyInput');
// ─────────────────────────────────────────────────────────────────────────────

log('isMoney(from(10,"BR"))', isMoney(from(10, 'BR')));
log('isMoney(10)', isMoney(10));
log('isMoney(null)', isMoney(null));

log('isMoneyInput(19.99)', isMoneyInput(19.99));
log('isMoneyInput(from(10,"BR"))', isMoneyInput(from(10, 'BR')));
log('isMoneyInput("19.99")', isMoneyInput('19.99'));

// ─────────────────────────────────────────────────────────────────────────────
section('14. JSON ROUND-TRIP (serialization)');
// ─────────────────────────────────────────────────────────────────────────────

const original = from(19.99, 'BR');
const json = original.toJSON();
log('original.toJSON()', JSON.stringify(json));

const reconstructed = fromMinorUnits(json.minorUnits, 'BR');
log('reconstructed.format()', reconstructed.format());
log('original.equals(reconstructed)', original.equals(reconstructed));

// ─────────────────────────────────────────────────────────────────────────────
section('15. ERROR HANDLING');
// ─────────────────────────────────────────────────────────────────────────────

function tryCatch(label: string, fn: () => void) {
  try {
    fn();
  } catch (err) {
    if (err instanceof MoneyError) {
      log(label, `[${err.name}] ${err.message}`);
    }
  }
}

tryCatch('divide by zero', () => from(10, 'US').divide(0));
tryCatch('currency mismatch', () => from(10, 'BR').plus(from(10, 'US')));
tryCatch('invalid discount (> 100)', () => from(50, 'US').applyDiscount(150));
tryCatch('invalid range in isBetween', () => from(5, 'US').isBetween(10, 1));
tryCatch('unsupported country', () => from(10, 'XX' as never));
tryCatch('invalid percent base (zero)', () => percent(5, 0, 'US'));
tryCatch('null input', () => from(null as never, 'US'));

// Catching by error code (no instanceof required)
try {
  from(10, 'US').divide(0);
} catch (err) {
  if (err instanceof MoneyError) {
    const handled = err.code === 'DIVISION_BY_ZERO' ? 'handled ✓' : 'unhandled';
    log('catch by err.code', `${err.code} — ${handled}`);
  }
}

// Specific error classes
console.log('\n  Available error classes:');
[
  MoneyError,
  InvalidInputError,
  InvalidPercentageError,
  DivisionByZeroError,
  CurrencyMismatchError,
  InvalidRangeError,
  // biome-ignore lint/suspicious/useIterableCallbackReturn: explanation
].forEach((E) => console.log(`    ✓ ${E.name}`));

console.log(`\n${'─'.repeat(52)}`);
console.log('  Demo complete.');
console.log(`${'─'.repeat(52)}\n`);
