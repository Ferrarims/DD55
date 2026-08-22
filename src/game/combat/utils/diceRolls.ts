import { DiceRoll } from '../../types';

export function rollDice(
  count: number,
  sides: number,
  modifier: number = 0,
  rng: () => number = Math.random
): DiceRoll {
  const safeCount = Math.max(1, count);
  const safeSides = Math.max(1, sides);
  const rolls: number[] = [];
  let sum = 0;
  for (let i = 0; i < safeCount; i++) {
    const val = Math.floor(rng() * safeSides) + 1;
    rolls.push(val);
    sum += val;
  }
  return {
    count: safeCount,
    sides: safeSides,
    modifier,
    rolls,
    total: Math.max(0, sum + modifier),
    isCritical: safeCount === 1 && safeSides === 20 && rolls[0] === 20,
    isFumble: safeCount === 1 && safeSides === 20 && rolls[0] === 1,
  };
}

export function rollD20(
  modifier: number = 0,
  advantageType: 'normal' | 'advantage' | 'disadvantage' = 'normal',
  rng: () => number = Math.random
): { total: number; naturalRoll: number; droppedRoll?: number; isCritical: boolean; isFumble: boolean } {
  const r1 = Math.floor(rng() * 20) + 1;
  if (advantageType === 'normal') {
    return {
      total: r1 + modifier,
      naturalRoll: r1,
      isCritical: r1 === 20,
      isFumble: r1 === 1,
    };
  }
  const r2 = Math.floor(rng() * 20) + 1;
  let chosen = r1;
  let dropped = r2;
  if (advantageType === 'advantage') {
    chosen = Math.max(r1, r2);
    dropped = Math.min(r1, r2);
  } else if (advantageType === 'disadvantage') {
    chosen = Math.min(r1, r2);
    dropped = Math.max(r1, r2);
  }
  return {
    total: chosen + modifier,
    naturalRoll: chosen,
    droppedRoll: dropped,
    isCritical: chosen === 20,
    isFumble: chosen === 1,
  };
}

export function resolveAttackRoll(params: {
  attackBonus: number;
  targetAC: number;
  advantageType?: 'normal' | 'advantage' | 'disadvantage';
  rng?: () => number;
}): { isHit: boolean; isCritical: boolean; isFumble: boolean; total: number; naturalRoll: number } {
  const { attackBonus, targetAC, advantageType = 'normal', rng = Math.random } = params;
  const d20 = rollD20(attackBonus, advantageType, rng);

  if (d20.isCritical) {
    return { isHit: true, isCritical: true, isFumble: false, total: d20.total, naturalRoll: d20.naturalRoll };
  }
  if (d20.isFumble) {
    return { isHit: false, isCritical: false, isFumble: true, total: d20.total, naturalRoll: d20.naturalRoll };
  }

  const isHit = d20.total >= targetAC;
  return { isHit, isCritical: false, isFumble: false, total: d20.total, naturalRoll: d20.naturalRoll };
}
