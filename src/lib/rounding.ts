import type { RoundingMode } from '@/types';

type RoundFunction = (value: number) => number;

// ─────────────────────────────────────────────────────────────────────────────

function roundExpand(value: number): number {
  return value >= 0 ? Math.ceil(value) : Math.floor(value);
}

function roundHalfExpand(value: number): number {
  return Math.sign(value) * Math.round(Math.abs(value));
}

function roundHalfEven(value: number): number {
  const floored = Math.floor(value);
  const fractionalPart = value - floored;

  if (fractionalPart !== 0.5) return Math.round(value);

  return floored % 2 === 0 ? floored : floored + 1;
}

function roundHalfFloor(value: number): number {
  return Math.ceil(value - 0.5);
}

function roundHalfTrunc(value: number): number {
  return value >= 0 ? Math.ceil(value - 0.5) : Math.floor(value + 0.5);
}

// ─────────────────────────────────────────────────────────────────────────────

export const ROUND_FUNCTIONS = {
  ceil: Math.ceil,
  floor: Math.floor,
  trunc: Math.trunc,
  expand: roundExpand,
  //
  halfExpand: roundHalfExpand,
  halfEven: roundHalfEven,
  halfCeil: Math.round,
  halfFloor: roundHalfFloor,
  halfTrunc: roundHalfTrunc,
} as const satisfies Record<RoundingMode, RoundFunction>;

export const DEFAULT_ROUNDING_MODE: RoundingMode = 'halfExpand';
export const DEFAULT_ROUND_FN = ROUND_FUNCTIONS[DEFAULT_ROUNDING_MODE];
