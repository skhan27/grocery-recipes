import { Unit } from '../models/unit';

export function determineLargerUnit(unit1: Unit, unit2: Unit): Unit {
  const order: Record<Unit, number> = {
    [Unit.CUPS]: 0,
    [Unit.TABLESPOONS]: 1,
    [Unit.TEASPOONS]: 2,
    [Unit.PINCH]: 3,
    [Unit.ITEM]: -1,
  };
  return order[unit1] > order[unit2] ? unit1 : unit2;
}

export function getUnitConversionFactor(unit: Unit, toUnit: Unit): number {
  const conversionRecord: Record<Unit, Record<Unit, number>> = {
    [Unit.CUPS]: {
      [Unit.CUPS]: 1,
      [Unit.TABLESPOONS]: 16,
      [Unit.TEASPOONS]: 48,
      [Unit.PINCH]: 384,
      [Unit.ITEM]: 0,
    },
    [Unit.TABLESPOONS]: {
      [Unit.CUPS]: 1 / 16,
      [Unit.TABLESPOONS]: 1,
      [Unit.TEASPOONS]: 3,
      [Unit.PINCH]: 24,
      [Unit.ITEM]: 0,
    },
    [Unit.TEASPOONS]: {
      [Unit.CUPS]: 1 / 48,
      [Unit.TABLESPOONS]: 1 / 3,
      [Unit.TEASPOONS]: 1,
      [Unit.PINCH]: 8,
      [Unit.ITEM]: 0,
    },
    [Unit.PINCH]: {
      [Unit.CUPS]: 1 / 384,
      [Unit.TABLESPOONS]: 1 / 24,
      [Unit.TEASPOONS]: 1 / 8,
      [Unit.PINCH]: 1,
      [Unit.ITEM]: 0,
    },
    [Unit.ITEM]: {
      [Unit.CUPS]: 0,
      [Unit.TABLESPOONS]: 0,
      [Unit.TEASPOONS]: 0,
      [Unit.PINCH]: 0,
      [Unit.ITEM]: 1,
    },
  };
  return conversionRecord[unit][toUnit];
}
