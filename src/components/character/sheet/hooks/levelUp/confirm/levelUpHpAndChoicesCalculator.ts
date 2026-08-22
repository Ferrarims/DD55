import { calculateHpBonus } from '../levelUpHelpers';

interface CalculateHpChoicesParams {
  character: any;
  nextLevel: number;
  hitDieVal: number;
  hpGainMode: 'avg' | 'roll';
  rolledValue: number | null;
  newConMod: number;
  finalSubclassName: string;
  finalFightingStyle: string;
  isCurrentLevelAsi: boolean;
  asiSummaryText?: string;
  needsSubclassChoice: boolean;
  needsFightingStyleChoice: boolean;
  featsList: any[];
  getCharacterActiveFeats: (char: any) => string[];
}

export function calculateHpAndChoices({
  character,
  nextLevel,
  hitDieVal,
  hpGainMode,
  rolledValue,
  newConMod,
  finalSubclassName,
  finalFightingStyle,
  isCurrentLevelAsi,
  asiSummaryText,
  needsSubclassChoice,
  needsFightingStyleChoice,
  featsList,
  getCharacterActiveFeats,
}: CalculateHpChoicesParams) {
  const baseDieHp =
    hpGainMode === 'avg' ? Math.floor(hitDieVal / 2) + 1 : rolledValue || Math.floor(hitDieVal / 2) + 1;

  const pastChoices = Array.isArray(character.level_choices) ? [...character.level_choices] : [];
  const choiceEntry: any = {
    level: nextLevel,
    date: new Date().toLocaleDateString('pt-BR'),
    baseHp: baseDieHp,
    hpGainMode,
    hpGain: `+${baseDieHp + newConMod} PV (${
      hpGainMode === 'avg' ? 'Média' : 'Dado Rolado'
    } + ${newConMod >= 0 ? '+' : ''}${newConMod} Con)`,
    locked: true,
  };

  if (needsSubclassChoice || nextLevel === 3) {
    choiceEntry.subclass = finalSubclassName;
  }
  if (needsFightingStyleChoice || nextLevel === 1) {
    choiceEntry.fightingStyle = finalFightingStyle;
  }
  if (isCurrentLevelAsi && asiSummaryText && asiSummaryText !== 'Nenhum') {
    choiceEntry.asiOrFeat = asiSummaryText;
  }

  const newLevelChoices = [...pastChoices, choiceEntry];

  let sumBaseHp = hitDieVal;
  pastChoices.forEach((lc: any) => {
    if (lc.level === 1) return;
    const match = lc.hpGain ? String(lc.hpGain).match(/\+(\d+)/) : null;
    const entryBaseHp = typeof lc.baseHp === 'number' ? lc.baseHp : (match ? Math.max(1, parseInt(match[1], 10) - newConMod) : Math.floor(hitDieVal / 2) + 1);
    sumBaseHp += entryBaseHp;
  });
  sumBaseHp += baseDieHp;

  const currentActiveFeats = getCharacterActiveFeats({ ...character, feats: featsList });
  const { toughBonus, dwarfBonus, fortitudeBonus } = calculateHpBonus(character, nextLevel, currentActiveFeats);
  const newMaxHp = sumBaseHp + newConMod * nextLevel + dwarfBonus + toughBonus + fortitudeBonus;
  const newCurrentHp = newMaxHp;
  const newHitDice = `${nextLevel}d${hitDieVal}`;

  return {
    baseDieHp,
    choiceEntry,
    newLevelChoices,
    newMaxHp,
    newCurrentHp,
    newHitDice,
  };
}
