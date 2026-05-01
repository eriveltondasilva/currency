import { describe, expect, it } from 'vitest';

import { ROUNDING_MODES } from '@/config/constants';
import { Money } from '@/lib/money';

describe('Money', () => {
  // Testes de criação de instâncias
  describe('Criação de instâncias', () => {
    it('deve criar uma instância com valor numérico', () => {
      const money = new Money(10.5);
      expect(money.value).toBe(10.5);
      expect(money.cents).toBe(1050);
    });

    it('deve criar uma instância a partir de centavos', () => {
      const money = Money.fromCents(1050);
      expect(money.value).toBe(10.5);
    });

    it('deve criar uma instância com valor zero', () => {
      const money = Money.zero();
      expect(money.value).toBe(0);
      expect(money.isZero).toBe(true);
    });
  });

  // Testes de propriedades
  describe('Propriedades', () => {
    it('deve retornar a parte inteira corretamente', () => {
      const money = new Money(10.5);
      expect(money.integer).toBe(10);
    });

    it('deve retornar a parte decimal corretamente', () => {
      const money = new Money(10.5);
      expect(money.decimal).toBe(0.5);
    });

    it('deve identificar valores positivos, negativos e zero', () => {
      expect(new Money(10.5).isPositive).toBe(true);
      expect(new Money(-10.5).isNegative).toBe(true);
      expect(new Money(0).isZero).toBe(true);
    });
  });

  // Testes de formatação
  describe('Formatação', () => {
    it('deve formatar o valor corretamente', () => {
      const money = new Money(1234.56, { currencyCode: 'BRL', locale: 'pt-BR' });
      expect(money.format()).toContain('1.234,56');
    });

    it('deve converter para string corretamente', () => {
      const money = new Money(10.5);
      expect(money.toString()).toBe('10.50');
    });
  });

  // Testes de comparação
  describe('Comparações', () => {
    it('deve comparar igualdade corretamente', () => {
      const a = new Money(10.5);
      const b = new Money(10.5);
      const c = new Money(20);

      expect(a.equals(b)).toBe(true);
      expect(a.equals(c)).toBe(false);
    });

    it('deve verificar se está entre valores', () => {
      const price = new Money(50);
      expect(price.isBetween(10, 100)).toBe(true);
      expect(price.isBetween(60, 100)).toBe(false);
    });

    it('deve comparar maior e menor corretamente', () => {
      const a = new Money(10.5);
      const b = new Money(5.25);

      expect(a.greaterThan(b)).toBe(true);
      expect(b.lessThan(a)).toBe(true);
      expect(a.greaterThanOrEqual(a)).toBe(true);
      expect(a.lessThanOrEqual(a)).toBe(true);
    });
  });

  // Testes de operações aritméticas
  describe('Operações aritméticas', () => {
    it('deve somar corretamente', () => {
      const a = new Money(10.5);
      const sum = a.plus(5.25);
      expect(sum.value).toBe(15.75);
      expect(a.value).toBe(10.5);
    });

    it('deve subtrair corretamente', () => {
      const a = new Money(10.5);
      const diff = a.minus(5.25);
      expect(diff.value).toBe(5.25);
      expect(a.value).toBe(10.5);
    });

    it('deve multiplicar corretamente', () => {
      const price = new Money(10.5);
      const doubled = price.times(2);
      expect(doubled.value).toBe(21);
      expect(price.value).toBe(10.5);
    });

    it('deve dividir corretamente', () => {
      const price = new Money(10.5);
      const half = price.dividedBy(2);
      expect(half.value).toBe(5.25);
      expect(price.value).toBe(10.5);
    });

    it('deve lançar erro ao dividir por zero', () => {
      const price = new Money(10.5);
      expect(() => price.dividedBy(0)).toThrow();
    });
  });

  // Testes de transformação
  describe('Transformações', () => {
    it('deve retornar valor absoluto', () => {
      const negative = new Money(-10.5);
      const absolute = negative.absolute();
      expect(absolute.value).toBe(10.5);
    });

    it('deve negar o valor corretamente', () => {
      const positive = new Money(10.5);
      const negative = positive.negate();
      expect(negative.value).toBe(-10.5);
    });

    it('deve retornar o valor máximo', () => {
      const a = new Money(10.5);
      const b = new Money(5.25);
      const max = a.max(b);
      expect(max.value).toBe(10.5);
    });

    it('deve retornar o valor mínimo', () => {
      const a = new Money(10.5);
      const b = new Money(5.25);
      const min = a.min(b);
      expect(min.value).toBe(5.25);
    });
  });

  // Testes de arredondamento
  describe('Arredondamento', () => {
    it('deve arredondar com diferentes modos', () => {
      const price = new Money(10.56);

      expect(price.round(10, ROUNDING_MODES.ROUND).value).toBe(10.6);
      expect(price.round(10, ROUNDING_MODES.FLOOR).value).toBe(10.5);
      expect(price.round(10, ROUNDING_MODES.CEIL).value).toBe(10.6);
      expect(price.round(10, ROUNDING_MODES.TRUNC).value).toBe(10.5);
    });
  });

  // Testes de operações de negócio
  describe('Operações de negócio', () => {
    it('deve alocar valores corretamente', () => {
      const money = new Money(10);
      const parts = money.allocate(3);

      expect(parts.length).toBe(3);
      expect(parts[0].value).toBe(3.34);
      expect(parts[1].value).toBe(3.33);
      expect(parts[2].value).toBe(3.33);

      // A soma deve ser igual ao valor original
      const sum = parts.reduce((acc, part) => acc.plus(part), Money.zero());
      expect(sum.value).toBe(10);
    });

    it('deve aplicar desconto corretamente', () => {
      const price = new Money(100);
      const discounted = price.applyDiscount(20);
      expect(discounted.value).toBe(80);
    });

    it('deve aplicar acréscimo corretamente', () => {
      const price = new Money(100);
      const increased = price.applySurcharge(20);
      expect(increased.value).toBe(120);
    });

    it('deve calcular porcentagem corretamente', () => {
      const price = new Money(100);
      const tenPercent = price.percentage(10);
      expect(tenPercent.value).toBe(10);
    });

    it('deve lançar erro para percentuais inválidos', () => {
      const price = new Money(100);
      expect(() => price.percentage(0)).toThrow();
      expect(() => price.percentage(-10)).toThrow();
    });
  });

  // Testes de encadeamento
  describe('Encadeamento de operações', () => {
    it('deve permitir encadear operações', () => {
      const result = new Money(100).applyDiscount(10).applySurcharge(5).times(2).round(20);

      // 100 - 10% = 90, +5% = 94.5, *2 = 189, arredondado para 189
      expect(result.value).toBe(189);
    });
  });
});
