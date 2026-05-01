import { describe, expect, it } from 'vitest';

import { ConversionService } from '@/lib/conversion-service';

describe('ConversionService', () => {
  const conversionService = ConversionService.instance;

  describe('Padrão Singleton', () => {
    it('deve retornar a mesma instância quando chamado múltiplas vezes', () => {
      const instance1 = ConversionService.instance;
      const instance2 = ConversionService.instance;

      expect(instance1).toBe(instance2);
    });
  });

  describe('método toCents', () => {
    it('deve lançar erro quando o valor for nulo ou indefinido', () => {
      expect(() => conversionService.toCents(null as never)).toThrow(
        'O valor não pode ser nulo ou indefinido',
      );
      expect(() => conversionService.toCents(undefined as never)).toThrow(
        'O valor não pode ser nulo ou indefinido',
      );
    });

    it('deve retornar cents diretamente quando o objeto tiver a propriedade cents', () => {
      expect(conversionService.toCents({ cents: 1234 } as never)).toBe(1234);
    });

    it('deve converter string para centavos', () => {
      expect(conversionService.toCents('10.50')).toBe(1050);
      expect(conversionService.toCents('R$ 10,50')).toBe(1050);
    });

    it('deve converter número para centavos', () => {
      expect(conversionService.toCents(10.5)).toBe(1050);
      expect(conversionService.toCents(0)).toBe(0);
    });
  });

  describe('método numberToCents (testado indiretamente)', () => {
    it('deve lançar erro quando o valor não for um número válido', () => {
      expect(() => conversionService.toCents(NaN)).toThrow('O valor deve ser um número válido');
    });

    it('deve retornar 0 quando o valor for 0', () => {
      expect(conversionService.toCents(0)).toBe(0);
    });

    it('deve arredondar corretamente o valor para centavos', () => {
      expect(conversionService.toCents(10.505)).toBe(1051); // Arredonda para cima
      expect(conversionService.toCents(10.504)).toBe(1050); // Arredonda para baixo
    });
  });

  describe('método stringToCents (testado indiretamente)', () => {
    it('deve retornar 0 para strings vazias ou apenas com espaços', () => {
      expect(conversionService.toCents('')).toBe(0);
      expect(conversionService.toCents('   ')).toBe(0);
    });

    it('deve limpar caracteres não numéricos da string', () => {
      expect(conversionService.toCents('R$ 10,50')).toBe(1050);
      expect(conversionService.toCents('$10.50')).toBe(1050);
    });

    it('deve preservar sinais de mais e menos', () => {
      expect(conversionService.toCents('+10.50')).toBe(1050);
      expect(conversionService.toCents('-10.50')).toBe(-1050);
    });
  });

  describe('método normalizeDecimalFormat (testado indiretamente)', () => {
    it('deve normalizar corretamente o formato brasileiro (vírgula como separador decimal)', () => {
      expect(conversionService.toCents('10,50')).toBe(1050);
      expect(conversionService.toCents('1.000,50')).toBe(100050);
    });

    it('deve normalizar corretamente o formato internacional (ponto como separador decimal)', () => {
      expect(conversionService.toCents('10.50')).toBe(1050);
      expect(conversionService.toCents('1,000.50')).toBe(100050);
    });

    it('deve lidar com valores negativos em diferentes formatos', () => {
      expect(conversionService.toCents('-10,50')).toBe(-1050);
      expect(conversionService.toCents('-10.50')).toBe(-1050);
    });
  });
});
