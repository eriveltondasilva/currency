import { beforeEach, describe, expect, it } from 'vitest';

import { CalculationService } from '@/lib/calculation-service';
import { Money } from '@/lib/money';

describe('CalculationService', () => {
  let calculator: CalculationService;

  beforeEach(() => {
    calculator = CalculationService.instance;
    calculator.setConfigure({
      currencyCode: 'BRL',
      locale: 'pt-BR',
      showSymbol: true,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  });

  describe('Padrão Singleton', () => {
    it('deve retornar a mesma instância quando chamado múltiplas vezes', () => {
      const instance1 = CalculationService.instance;
      const instance2 = CalculationService.instance;
      expect(instance1).toBe(instance2);
    });
  });

  describe('Operações básicas', () => {
    it('deve SOMAR dois valores monetários corretamente', () => {
      expect(calculator.addition(0.1, 0.2).value).toBe(0.3);
      expect(calculator.addition('10.50', 5.75).value).toBe(16.25);
    });

    it('deve SUBTRAIR valores monetários corretamente', () => {
      expect(calculator.subtraction(0.3, 0.1).value).toBe(0.2);
      expect(calculator.subtraction('10.50', 5.75).value).toBe(4.75);
    });

    it('deve MULTIPLICAR um valor monetário por um fator', () => {
      expect(calculator.multiplication('10.50', 0.5).value).toBe(5.25);
      expect(calculator.multiplication('10.50', 3).value).toBe(31.5);
    });

    it('deve lançar erro ao multiplicar por zero ou número negativo', () => {
      expect(() => calculator.multiplication('10.50', 0)).toThrow();
      expect(() => calculator.multiplication('10.50', -1)).toThrow();
    });

    it('deve DIVIDIR um valor monetário por um divisor', () => {
      expect(calculator.division('10.50', 2).value).toBe(5.25);
      expect(calculator.division('10.00', 3).value).toBe(3.33);
    });

    it('deve lançar erro ao dividir por zero ou número negativo', () => {
      expect(() => calculator.division('10.50', 0)).toThrow();
      expect(() => calculator.division('10.50', -1)).toThrow();
    });

    it('deve calcular porcentagem de um valor monetário', () => {
      expect(calculator.percentage('100.00', 15).value).toBe(15);
      expect(calculator.percentage('100.00', 50).value).toBe(50);
    });

    it('deve lançar erro ao calcular porcentagem zero ou negativa', () => {
      expect(() => calculator.percentage('100.00', 0)).toThrow();
      expect(() => calculator.percentage('100.00', -1)).toThrow();
    });
  });

  describe('Cálculos com listas de itens', () => {
    it('deve calcular o preço médio de uma lista de itens', () => {
      const items = [
        { name: 'Produto 1', price: '10.50' },
        { name: 'Produto 2', price: '15.75' },
        { name: 'Produto 3', price: '20.00' },
      ];
      const result = calculator.calculateAveragePrice(items);
      expect(result.value).toBeCloseTo(15.42, 2);
    });

    it('deve retornar zero para lista vazia ou nula ao calcular preço médio', () => {
      expect(calculator.calculateAveragePrice(null).value).toBe(0);
      expect(calculator.calculateAveragePrice([]).value).toBe(0);
    });

    it('deve calcular o subtotal de um item baseado no preço e quantidade', () => {
      const item = { name: 'Produto', price: '10.50', quantity: 3 };
      const result = calculator.calculateSubtotal(item);
      expect(result.value).toBe(31.5);
    });

    it('deve assumir quantidade 1 se não especificada ao calcular subtotal', () => {
      const item = { name: 'Produto', price: '10.50' };
      const result = calculator.calculateSubtotal(item);
      expect(result.value).toBe(10.5);
    });

    it('deve calcular o total de uma lista de itens com quantidades', () => {
      const items = [
        { name: 'Produto 1', price: '10.50', quantity: 2 },
        { name: 'Produto 2', price: '15.75', quantity: 1 },
        { name: 'Produto 3', price: '20.00', quantity: 3 },
      ];
      const result = calculator.calculateTotal(items);
      expect(result.value).toBe(96.75);
    });

    it('deve retornar zero para lista vazia ou nula ao calcular total', () => {
      expect(calculator.calculateTotal(null).value).toBe(0);
      expect(calculator.calculateTotal([]).value).toBe(0);
    });

    it('deve ignorar itens sem preço ao calcular total', () => {
      const items = [
        { name: 'Produto 1', price: '10.50', quantity: 2 },
        { name: 'Produto 2', price: '12.99', quantity: 1 },
        { name: 'Produto 3', price: '20.00', quantity: 1 },
      ];
      const result = calculator.calculateTotal(items);
      expect(result.value).toBe(53.99);
    });
  });

  describe('Distribuição de parcelas', () => {
    it('deve distribuir um valor em parcelas iguais', () => {
      const installments = calculator.distributeInstallments('100.00', 3);

      expect(installments.length).toBe(3);
      expect(installments[0].value).toBe(33.34);
      expect(installments[1].value).toBe(33.33);
      expect(installments[2].value).toBe(33.33);

      // Verifica se a soma das parcelas é igual ao valor original
      const total = installments.reduce((sum, inst) => sum + inst.value, 0);
      expect(total).toBe(100);
    });

    it('deve lançar erro se o número de parcelas for menor ou igual a zero', () => {
      expect(() => calculator.distributeInstallments('100.00', 0)).toThrow();
      expect(() => calculator.distributeInstallments('100.00', -1)).toThrow();
    });
  });

  describe('Configuração', () => {
    it('deve aplicar as opções de formatação corretamente', () => {
      calculator.setConfigure({
        currencyCode: 'USD',
        locale: 'en-US',
        showSymbol: true,
      });

      const result = calculator.addition('10.50', 5.75);
      expect(result.format()).toBe('$16.25');
    });

    it('deve permitir encadeamento de métodos após configuração', () => {
      const result = calculator.setConfigure({ currencyCode: 'EUR' }).addition('10.50', 5.75);

      expect(result).toBeInstanceOf(Money);
      expect(result.value).toBe(16.25);
    });
  });
});
