import { describe, expect, it } from 'vitest';

import type { MoneyInput } from '@/types';

import { FormattingService } from '@/lib/formatting-service';

describe('FormattingService', () => {
  describe('Padrão Singleton', () => {
    it('deve retornar a mesma instância quando chamado múltiplas vezes', () => {
      const instance1 = FormattingService.instance;
      const instance2 = FormattingService.instance;

      expect(instance1).toBe(instance2);
    });
  });

  describe('método format', () => {
    const formattingService = FormattingService.instance;

    it('deve formatar um valor numérico com as configurações padrão', () => {
      const result = formattingService.format(1234.56);

      // Formato padrão para USD: $1,234.56
      expect(result).toMatch(/\$1,234\.56/);
    });

    it('deve formatar um valor de objeto Money', () => {
      const result = formattingService.format({ value: 1234.56 } as MoneyInput);

      expect(result).toMatch(/\$1,234\.56/);
    });

    it('deve formatar com moeda BRL quando especificado', () => {
      const result = formattingService.format(1234.56, {
        currencyCode: 'BRL',
      });

      // Formato para BRL: R$ 1.234,56
      expect(result).toMatch(/R\$\s1\.234,56/);
    });

    it('deve ocultar o símbolo da moeda quando showSymbol é false', () => {
      const result = formattingService.format(1234.56, {
        showSymbol: false,
      });

      // Sem símbolo: 1,234.56
      expect(result).not.toMatch(/\$/);
      expect(result).toMatch(/1,234\.56/);
    });

    it('deve respeitar o número de casas decimais especificado', () => {
      const result = formattingService.format(1234.56789, {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      });

      // Com 3 casas decimais: $1,234.568
      expect(result).toMatch(/\$1,234\.568/);
    });

    it('deve usar o locale especificado', () => {
      const result = formattingService.format(1234.56, {
        locale: 'de-DE',
        currencyCode: 'EUR',
      });

      // Formato alemão para EUR: 1.234,56 €
      expect(result).toMatch(/1\.234,56\s€/);
    });

    it('deve lançar erro quando o valor é nulo', () => {
      expect(() => formattingService.format(null as never)).toThrow(
        'O valor não pode ser nulo ou indefinido',
      );
    });

    it('deve lançar erro quando o valor é indefinido', () => {
      expect(() => formattingService.format(undefined as never)).toThrow(
        'O valor não pode ser nulo ou indefinido',
      );
    });
  });
});
