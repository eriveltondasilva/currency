import { describe, expect, it } from 'vitest';

import { ROUND_FUNCTIONS } from '@/lib/rounding';

// Direction-based (no tie-breaking — always rounds in a fixed direction)

describe('ceil', () => {
  it('should round a positive fraction up toward +∞', () => {
    expect(ROUND_FUNCTIONS.ceil(1.1)).toBe(2);
  });

  it('should round a negative fraction up toward +∞', () => {
    expect(ROUND_FUNCTIONS.ceil(-1.9)).toBe(-1);
  });

  it('should not change an integer', () => {
    expect(ROUND_FUNCTIONS.ceil(3)).toBe(3);
  });
});

describe('floor', () => {
  it('should round a positive fraction down toward -∞', () => {
    expect(ROUND_FUNCTIONS.floor(1.9)).toBe(1);
  });

  it('should round a negative fraction down toward -∞', () => {
    expect(ROUND_FUNCTIONS.floor(-1.1)).toBe(-2);
  });

  it('should not change an integer', () => {
    expect(ROUND_FUNCTIONS.floor(3)).toBe(3);
  });
});

describe('trunc', () => {
  it('should truncate a positive value toward zero', () => {
    expect(ROUND_FUNCTIONS.trunc(1.9)).toBe(1);
  });

  it('should truncate a negative value toward zero', () => {
    expect(ROUND_FUNCTIONS.trunc(-1.9)).toBe(-1);
  });
});

describe('expand', () => {
  it('should expand a positive value away from zero', () => {
    expect(ROUND_FUNCTIONS.expand(1.1)).toBe(2);
  });

  it('should expand a negative value away from zero', () => {
    expect(ROUND_FUNCTIONS.expand(-1.1)).toBe(-2);
  });
});

// Nearest-neighbor (tie-breaking at exactly .5)

describe('halfExpand', () => {
  it('should round 1.5 away from zero to 2', () => {
    expect(ROUND_FUNCTIONS.halfExpand(1.5)).toBe(2);
  });

  it('should round -1.5 away from zero to -2', () => {
    expect(ROUND_FUNCTIONS.halfExpand(-1.5)).toBe(-2);
  });

  it('should round 1.4 down to 1', () => {
    expect(ROUND_FUNCTIONS.halfExpand(1.4)).toBe(1);
  });

  it('should round 1.6 up to 2', () => {
    expect(ROUND_FUNCTIONS.halfExpand(1.6)).toBe(2);
  });
});

describe('halfEven', () => {
  it('should round 1.5 to 2 because 2 is even', () => {
    expect(ROUND_FUNCTIONS.halfEven(1.5)).toBe(2);
  });

  it('should round 2.5 to 2 because 2 is even', () => {
    expect(ROUND_FUNCTIONS.halfEven(2.5)).toBe(2);
  });

  it('should round 3.5 to 4 because 4 is even', () => {
    expect(ROUND_FUNCTIONS.halfEven(3.5)).toBe(4);
  });

  it('should round non-tie values normally', () => {
    expect(ROUND_FUNCTIONS.halfEven(1.4)).toBe(1);
    expect(ROUND_FUNCTIONS.halfEven(1.6)).toBe(2);
  });
});

describe('halfCeil', () => {
  it('should round 1.5 toward +∞ to 2', () => {
    expect(ROUND_FUNCTIONS.halfCeil(1.5)).toBe(2);
  });

  it('should round -1.5 toward +∞ to -1', () => {
    expect(ROUND_FUNCTIONS.halfCeil(-1.5)).toBe(-1);
  });
});

describe('halfFloor', () => {
  it('should round 1.5 toward -∞ to 1', () => {
    expect(ROUND_FUNCTIONS.halfFloor(1.5)).toBe(1);
  });

  it('should round -1.5 toward -∞ to -2', () => {
    expect(ROUND_FUNCTIONS.halfFloor(-1.5)).toBe(-2);
  });
});

describe('halfTrunc', () => {
  it('should round positive 1.5 toward zero to 1', () => {
    expect(ROUND_FUNCTIONS.halfTrunc(1.5)).toBe(1);
  });

  it('should round negative -1.5 toward zero to -1', () => {
    expect(ROUND_FUNCTIONS.halfTrunc(-1.5)).toBe(-1);
  });
});
