import { describe, expect, it } from 'vitest';

import { ROUNDING_MODES } from '@/config/constants';
import { RoundingService } from '@/lib/rounding-service';

// TODO: Adicionar testes unitários para a classe RoundingService
describe('RoundingService', () => {
  const roundingService = RoundingService.instance;

  describe('Padrão Singleton', () => {
    it('deve retornar a mesma instância', () => {
      const instance1 = RoundingService.instance;
      const instance2 = RoundingService.instance;

      expect(instance1).toBe(instance2);
    });
  });

  describe('Método round', () => {
    describe('Validação de parâmetros', () => {
      it('deve lançar erro quando a precisão for menor ou igual a zero', () => {
        expect(() => roundingService.round(100, 0)).toThrow(
          'A precisão deve ser um número positivo',
        );

        expect(() => roundingService.round(100, -1)).toThrow(
          'A precisão deve ser um número positivo',
        );
      });
    });

    describe('Casos especiais', () => {
      it('deve retornar 0 quando o valor for 0', () => {
        expect(roundingService.round(0)).toBe(0);
      });

      it('deve retornar o mesmo valor quando a precisão for 1 e o valor for inteiro', () => {
        expect(roundingService.round(100, 1)).toBe(100);
      });
    });

    describe('ROUNDING_MODES.ROUND', () => {
      it('deve arredondar corretamente com precisão padrão (1)', () => {
        expect(roundingService.round(1056)).toBe(1056);
      });

      it('deve arredondar corretamente com precisão 10', () => {
        expect(roundingService.round(1056, 10)).toBe(1060);
        expect(roundingService.round(1054, 10)).toBe(1050);
      });

      it('deve arredondar corretamente valores negativos', () => {
        expect(roundingService.round(-1056, 10)).toBe(-1060);
        expect(roundingService.round(-1054, 10)).toBe(-1050);
      });
    });

    describe('ROUNDING_MODES.FLOOR', () => {
      it('deve arredondar para baixo com precisão 10', () => {
        expect(roundingService.round(1056, 10, ROUNDING_MODES.FLOOR)).toBe(1050);
        expect(roundingService.round(1050, 10, ROUNDING_MODES.FLOOR)).toBe(1050);
      });

      it('deve arredondar valores negativos para baixo', () => {
        expect(roundingService.round(-1056, 10, ROUNDING_MODES.FLOOR)).toBe(-1050);
        expect(roundingService.round(-1050, 10, ROUNDING_MODES.FLOOR)).toBe(-1050);
      });
    });

    describe('ROUNDING_MODES.CEIL', () => {
      it('deve arredondar para cima com precisão 10', () => {
        expect(roundingService.round(1056, 10, ROUNDING_MODES.CEIL)).toBe(1060);
        expect(roundingService.round(1050, 10, ROUNDING_MODES.CEIL)).toBe(1050);
      });

      it('deve arredondar valores negativos para cima', () => {
        expect(roundingService.round(-1056, 10, ROUNDING_MODES.CEIL)).toBe(-1060);
        expect(roundingService.round(-1050, 10, ROUNDING_MODES.CEIL)).toBe(-1050);
      });
    });

    describe('ROUNDING_MODES.TRUNC', () => {
      it('deve truncar com precisão 10', () => {
        expect(roundingService.round(1056, 10, ROUNDING_MODES.TRUNC)).toBe(1050);
        expect(roundingService.round(1050, 10, ROUNDING_MODES.TRUNC)).toBe(1050);
      });

      it('deve truncar valores negativos', () => {
        expect(roundingService.round(-1056, 10, ROUNDING_MODES.TRUNC)).toBe(-1050);
        expect(roundingService.round(-1050, 10, ROUNDING_MODES.TRUNC)).toBe(-1050);
      });
    });

    describe('Precisões diferentes', () => {
      it('deve arredondar corretamente com precisão 5', () => {
        expect(roundingService.round(1053, 5)).toBe(1055);
        expect(roundingService.round(1052, 5)).toBe(1050);
      });

      it('deve arredondar corretamente com precisão 25', () => {
        expect(roundingService.round(1060, 25)).toBe(1050);
        expect(roundingService.round(1062, 25)).toBe(1050);
        expect(roundingService.round(1037, 25)).toBe(1025);
      });

      it('deve arredondar corretamente com precisão 100', () => {
        expect(roundingService.round(1550, 100)).toBe(1600);
        expect(roundingService.round(1549, 100)).toBe(1500);
      });
    });
  });
});
