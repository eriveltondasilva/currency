import type { RoundingMode } from '@/types';

function roundExpand(value: number) {
  return value >= 0 ? Math.ceil(value) : Math.floor(value);
}

function roundHalfExpand(value: number) {
  return Math.sign(value) * Math.round(Math.abs(value));
}

function roundHalfEven(value: number) {
  const floor = Math.floor(value);
  const fractionalPart = value - floor;
  if (fractionalPart !== 0.5) return Math.round(value);
  return floor % 2 === 0 ? floor : floor + 1;
}

function roundHalfFloor(value: number) {
  return Math.ceil(value - 0.5);
}

function roundHalfTrunc(value: number) {
  return value >= 0 ? Math.ceil(value - 0.5) : Math.floor(value + 0.5);
}

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
} as const satisfies Record<RoundingMode, (value: number) => number>;

export const DEFAULT_ROUNDING_MODE: RoundingMode = 'halfExpand';
