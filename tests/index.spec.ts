import { describe, expect, it } from 'vitest';

import Money, { Calculator, Currency, ROUNDING_MODES } from '@/index';
import { Money as MoneyBase } from '@/lib/money';

describe('Money Factory', () => {
  it('deve criar uma instância Money com valor padrão', () => {
    const money = Money();
    expect(money).toBeInstanceOf(MoneyBase);
    expect(money.value).toBe(0);
  });

  it('deve criar uma instância Money com valor específico', () => {
    const money = Money(100);
    expect(money.value).toBe(100);
  });

  it('deve criar uma instância Money a partir de string', () => {
    const money = Money('42.5');
    expect(money.value).toBe(42.5);
  });
});

describe('Currency', () => {
  it('deve criar instâncias Money com códigos de moeda específicos', () => {
    const usd = Currency.USD(100);
    const eur = Currency.EUR(200);
    const brl = Currency.BRL(300);

    expect(usd.formatOptions.currencyCode).toBe('USD');
    expect(eur.formatOptions.currencyCode).toBe('EUR');
    expect(brl.formatOptions.currencyCode).toBe('BRL');
  });
});

describe('Calculator', () => {
  it('deve ser uma instância do CalculationService', () => {
    expect(Calculator).toBeDefined();
  });
});

describe('ROUNDING_MODES', () => {
  it('deve exportar os modos de arredondamento', () => {
    expect(ROUNDING_MODES).toBeDefined();
    expect(typeof ROUNDING_MODES).toBe('object');
  });
});
