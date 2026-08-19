import { PlayerStats, Resource } from '../../types/character';
import { normalizeHitDice } from './hpCalculator';

export interface ShortRestResult {
  updatedHp: number;
  remainingHitDice: number;
  hpHealed: number;
  diceSpent: number;
  rolls: number[];
  resourcesRestored: string[];
}

export interface LongRestResult {
  updatedHp: number;
  updatedHitDice: number;
  hitDiceRecovered: number;
  exhaustionReduced: number;
  newExhaustionLevel: number;
  resourcesRestored: string[];
}

export function applyShortRest(
  character: PlayerStats,
  hitDiceToSpend: number,
  rng: () => number = Math.random
): ShortRestResult {
  const currentHD = Math.max(0, character.hitDiceCount ?? character.level ?? 1);
  const actualDiceSpent = Math.min(Math.max(0, hitDiceToSpend), currentHD);

  const hitDieInfo = normalizeHitDice(character.hitDice, character.level, character.charClass);
  const sides = hitDieInfo.sides;
  const conMod = Math.floor(((character.con ?? character.constitution ?? 10) - 10) / 2);

  let totalHealed = 0;
  const rolls: number[] = [];

  for (let i = 0; i < actualDiceSpent; i++) {
    const roll = Math.floor(rng() * sides) + 1;
    rolls.push(roll);
    const healFromDie = Math.max(1, roll + conMod);
    totalHealed += healFromDie;
  }

  const currentHp = character.hp ?? character.maxHp ?? 10;
  const maxHp = character.maxHp ?? 10;
  const updatedHp = Math.min(maxHp, currentHp + totalHealed);
  const actualHpHealed = updatedHp - currentHp;

  const resourcesRestored: string[] = [];
  if (character.resources && Array.isArray(character.resources)) {
    character.resources.forEach((r: Resource) => {
      const resetType = (r.reset || '').toLowerCase();
      if (resetType.includes('curto') || resetType.includes('short')) {
        resourcesRestored.push(r.name);
      }
    });
  }

  return {
    updatedHp,
    remainingHitDice: currentHD - actualDiceSpent,
    hpHealed: actualHpHealed,
    diceSpent: actualDiceSpent,
    rolls,
    resourcesRestored,
  };
}

export function applyLongRest(character: PlayerStats): LongRestResult {
  const maxHp = character.maxHp ?? 10;
  const totalHitDice = Math.max(1, character.level ?? 1);
  const currentHitDice = Math.max(0, character.hitDiceCount ?? totalHitDice);

  // D&D 2024 / 5e: Recupera metade dos Dados de Vida totais (mínimo de 1)
  const recoveryPool = Math.max(1, Math.floor(totalHitDice / 2));
  const newHitDice = Math.min(totalHitDice, currentHitDice + recoveryPool);
  const hitDiceRecovered = newHitDice - currentHitDice;

  // Reduz 1 nível de exaustão
  const currentExhaustion = Math.max(0, character.exhaustionLevel ?? 0);
  const newExhaustionLevel = Math.max(0, currentExhaustion - 1);
  const exhaustionReduced = currentExhaustion - newExhaustionLevel;

  const resourcesRestored: string[] = [];
  if (character.resources && Array.isArray(character.resources)) {
    character.resources.forEach((r: Resource) => {
      resourcesRestored.push(r.name);
    });
  }

  return {
    updatedHp: maxHp,
    updatedHitDice: newHitDice,
    hitDiceRecovered,
    exhaustionReduced,
    newExhaustionLevel,
    resourcesRestored,
  };
}
