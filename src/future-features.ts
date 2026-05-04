// // ─── Arithmetic ───────────────────────────────────────────────────────────────

// function add(a: MoneyInput, b: MoneyInput, options?: MoneyOptions): MoneyContract {
//   return Money.fromCents(toMinorUnit(a) + toMinorUnit(b), options);
// }

// function subtract(a: MoneyInput, b: MoneyInput, options?: MoneyOptions): MoneyContract {
//   return Money.fromCents(toMinorUnit(a) - toMinorUnit(b), options);
// }

// function multiply(value: MoneyInput, factor: number, options?: MoneyOptions): MoneyContract {
//   return from(value, options).times(factor);
// }

// function divide(value: MoneyInput, divisor: number, options?: MoneyOptions): MoneyContract {
//   return from(value, options).dividedBy(divisor);
// }

// function percentage(value: MoneyInput, percent: number, options?: MoneyOptions): MoneyContract {
//   return from(value, options).percentage(percent);
// }

// // ─── Business utilities ───────────────────────────────────────────────────────

// function calculateTotal(
//   items: PricedItem[] | null | undefined,
//   options: MoneyOptions,
// ): MoneyContract {
//   if (isNil(items) || isEmpty(items)) return Money.zero(options);

//   const totalCents = items.reduce((sum, { price, quantity = 1 }) => {
//     if (isNil(price)) return sum;
//     return sum + toMinorUnit(price) * quantity;
//   }, 0);

//   return Money.fromCents(totalCents, options);
// }

// function calculateSubtotal(item: PricedItem, options: MoneyOptions): MoneyContract {
//   const { price, quantity = 1 } = item;
//   if (isNil(price)) return Money.zero(options);
//   return Money.fromCents(toMinorUnit(price) * quantity, options);
// }

// function calculateAverage(values: Maybe<MoneyInput>[], options: MoneyOptions): MoneyContract {
//   if (isEmpty(values)) return Money.zero(options);

//   const validValues = values.filter((value): value is MoneyInput => !isNil(value));

//   if (isEmpty(validValues)) return Money.zero(options);

//   const totalCents = validValues.reduce<number>((sum, value) => sum + toMinorUnit(value), 0);
//   return Money.fromCents(totalCents / validValues.length, options);
// }

// function distributeInstallments(
//   value: MoneyInput,
//   parts: number,
//   options: MoneyOptions,
// ): MoneyContract[] {
//   return from(value, options).allocate(parts);
// }
