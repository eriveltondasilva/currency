import { bench, describe } from 'vitest';

import type { Currency } from '@/lib/currencies';

import { numberToMinorUnit, stringToMinorUnit } from '@/lib/convert';

// Mocks de moedas
const usd: Currency = { locale: 'en-US', code: 'USD', decimal: '.', group: ',', fractionDigits: 2 };
const brl: Currency = { locale: 'pt-BR', code: 'BRL', decimal: ',', group: '.', fractionDigits: 2 };

describe('Perfil de Performance: stringToMinorUnit', () => {
  // Cenário 1: O "Caminho Feliz" absoluto (sem espaços, sem sinal, decimal simples)
  bench('Cenário Ideal ("100.50" / USD)', () => {
    stringToMinorUnit('100.50', usd);
  });

  // Cenário 2: Exige que o loop while de trim manual trabalhe e pule caracteres
  bench('Com espaços em branco ("   100.50   " / USD)', () => {
    stringToMinorUnit('   100.50   ', usd);
  });

  // Cenário 3: Exige validação de sinal positivo/negativo no if/else inicial
  bench('Com sinal explícito ("+1234.56" / USD)', () => {
    stringToMinorUnit('+1234.56', usd);
  });

  // Cenário 4: Outro caractere de separação (testa se a variável decimalCode impacta)
  bench('Separador decimal vírgula ("1234,56" / BRL)', () => {
    stringToMinorUnit('1234,56', brl);
  });

  // Cenário 5: O pior cenário possível (espaços, sinal, número longo)
  bench('Pior Cenário ("  -9999999.99  " / USD)', () => {
    stringToMinorUnit('  -9999999.99  ', usd);
  });
});

describe.skip('Perfil de Performance: numberToMinorUnit', () => {
  // Testando o core da conversão matemática isoladamente
  bench('Número Inteiro Puro (100 -> 10000)', () => {
    numberToMinorUnit(100, 2);
  });

  bench('Número Fracionado (100.55 -> 10055)', () => {
    numberToMinorUnit(100.55, 2);
  });

  bench('Moeda sem casas decimais (100 -> 100 / JPY)', () => {
    numberToMinorUnit(100, 0);
  });
});
