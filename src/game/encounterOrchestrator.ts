import { MonsterTemplate } from './types';
import { MONSTER_XP_BY_CR } from '../lib/api/references';
import { BESTIARY_TEMPLATES } from './bestiaryData';

export interface XPBudgetTable {
  easy: number;
  medium: number;
  hard: number;
  deadly: number;
}

export const XP_BUDGET_BY_LEVEL: Record<number, XPBudgetTable> = {
  1: { easy: 25, medium: 50, hard: 75, deadly: 100 },
  2: { easy: 50, medium: 100, hard: 150, deadly: 200 },
  3: { easy: 75, medium: 150, hard: 225, deadly: 400 },
  4: { easy: 125, medium: 250, hard: 375, deadly: 500 },
  5: { easy: 250, medium: 500, hard: 750, deadly: 1100 },
  6: { easy: 300, medium: 600, hard: 900, deadly: 1400 },
  7: { easy: 350, medium: 750, hard: 1100, deadly: 1700 },
  8: { easy: 450, medium: 900, hard: 1400, deadly: 2100 },
  9: { easy: 550, medium: 1100, hard: 1600, deadly: 2400 },
  10: { easy: 600, medium: 1200, hard: 1900, deadly: 2800 },
  11: { easy: 800, medium: 1600, hard: 2400, deadly: 3600 },
  12: { easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
  13: { easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
  14: { easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
  15: { easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
  16: { easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
  17: { easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
  18: { easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
  19: { easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
  20: { easy: 2800, medium: 5700, hard: 8500, deadly: 12700 }
};

export function getActionMultiplier(monsterCount: number, partySize: number): { baseMultiplier: number; finalMultiplier: number; hasOverride: boolean } {
  let baseMultiplier = 1;
  if (monsterCount === 1) baseMultiplier = 1;
  else if (monsterCount === 2) baseMultiplier = 1.5;
  else if (monsterCount >= 3 && monsterCount <= 6) baseMultiplier = 2;
  else if (monsterCount >= 7 && monsterCount <= 10) baseMultiplier = 2.5;
  else if (monsterCount > 10) baseMultiplier = 3;

  let finalMultiplier = baseMultiplier;
  let hasOverride = false;

  // Regra de Override: Grupos pequenos (1 ou 2 personagens) avançam o multiplicador para a próxima categoria
  if (partySize <= 2) {
    hasOverride = true;
    if (baseMultiplier === 1) finalMultiplier = 1.5;
    else if (baseMultiplier === 1.5) finalMultiplier = 2;
    else if (baseMultiplier === 2) finalMultiplier = 2.5;
    else if (baseMultiplier === 2.5) finalMultiplier = 3;
    else finalMultiplier = 3.5;
  }

  return { baseMultiplier, finalMultiplier, hasOverride };
}

export interface EncounterParsingResult {
  logText: string;
  adjustedXP: number;
  baseXP: number;
  multiplier: number;
  targetXP: number;
  isValid: boolean;
}

export function parseAndValidateEncounter(
  partySize: number = 1,
  characterLevel: number = 1,
  selectedMonsters: MonsterTemplate[],
  targetDifficulty: 'easy' | 'medium' | 'hard' | 'deadly' = 'medium'
): EncounterParsingResult {
  const levelTable = XP_BUDGET_BY_LEVEL[characterLevel] || XP_BUDGET_BY_LEVEL[5];
  const unitBudget = levelTable[targetDifficulty];
  const targetXP = unitBudget * partySize;

  let baseXP = 0;
  selectedMonsters.forEach(m => {
    const xp = m.xp || MONSTER_XP_BY_CR[m.cr] || 50;
    baseXP += xp;
  });

  const monsterCount = selectedMonsters.length;
  const { finalMultiplier, hasOverride } = getActionMultiplier(monsterCount, partySize);
  const adjustedXP = Math.round(baseXP * finalMultiplier);

  const isValid = adjustedXP <= levelTable.deadly * partySize * 1.5;

  const logText = `### PARSING DE BALANCEAMENTO MATEMÁTICO
1. STATUS DO GRUPO: ${partySize} Jogador(es) de Nível ${characterLevel}.
2. ORÇAMENTO ALVO (${targetDifficulty.toUpperCase()}): ${targetXP} XP (${partySize} x ${unitBudget} XP).
3. SELEÇÃO PRIMÁRIA: ${selectedMonsters.map(m => `${m.name} (CR ${m.cr} = ${m.xp || 50} XP)`).join(', ')} | XP Base Total: ${baseXP} XP.
4. APLICAÇÃO DE MULTIPLICADOR: ${monsterCount} monstro(s) [Multiplicador base: ${monsterCount === 1 ? 'x1' : monsterCount === 2 ? 'x1.5' : 'x2'}] ${hasOverride ? `+ Regra de Grupo Pequeno (Party Size <= 2) -> Multiplicador Final: x${finalMultiplier}` : `-> Multiplicador Final: x${finalMultiplier}`}.
5. CÁLCULO DE XP AJUSTADO: ${baseXP} XP * ${finalMultiplier} = ${adjustedXP} XP.
6. VALIDAÇÃO TÉCNICA: ${isValid ? 'APROVADO - O encontro está matematicamente balanceado e adequado ao orçamento.' : 'ALERTA - O encontro excede o limiar mortal permitido.'}`;

  return {
    logText,
    adjustedXP,
    baseXP,
    multiplier: finalMultiplier,
    targetXP,
    isValid
  };
}
