import { STAT_NAMES } from '../../constants';

export const extractBaseHpFromLevelChoice = (choice: any, defaultHitDieVal: number, conMod: number): number => {
  if (typeof choice?.baseHp === 'number') return choice.baseHp;
  const match = choice?.hpGain ? String(choice.hpGain).match(/\+(\d+)/) : null;
  if (match) {
    return Math.max(1, parseInt(match[1], 10) - conMod);
  }
  return Math.floor(defaultHitDieVal / 2) + 1;
};

export function calculateHpBonus(character: any, nextLevel: number, currentActiveFeats: string[]) {
  const isDwarf = ['Anão', 'Dwarf'].includes(character.race);
  const hasTough = currentActiveFeats.some(f => /vigoroso|tough/i.test(f || ''));
  const toughBonus = hasTough ? nextLevel * 2 : 0;
  const dwarfBonus = isDwarf ? nextLevel : 0;
  const fortitudeBonus = currentActiveFeats.some(f => /dádiva da fortitude/i.test(f || '')) ? 40 : 0;

  return { toughBonus, dwarfBonus, fortitudeBonus };
}

export function applyAsiStats(params: {
  character: any;
  nextLevel: number;
  levelUpAsiChoice: 'asi' | 'feat';
  asiMode: 'single' | 'double';
  asiStat1: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
  asiStat2: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
  selectedFeatName: string;
  featsList: string[];
}): {
  newStr: number;
  newDex: number;
  newCon: number;
  newInt: number;
  newWis: number;
  newCha: number;
  asiSummaryText: string;
  success: boolean;
} {
  const {
    character,
    nextLevel,
    levelUpAsiChoice,
    asiMode,
    asiStat1,
    asiStat2,
    selectedFeatName,
    featsList,
  } = params;

  let newStr = character.strength || 10;
  let newDex = character.dexterity || 10;
  let newCon = character.constitution || 10;
  let newInt = character.intelligence || 10;
  let newWis = character.wisdom || 10;
  let newCha = character.charisma || 10;
  let asiSummaryText = 'Nenhum';

  if (levelUpAsiChoice === 'asi') {
    if (asiMode === 'single' || (asiMode as any) === '+2') {
      if (asiStat1 === 'str') newStr = Math.min(20, newStr + 2);
      else if (asiStat1 === 'dex') newDex = Math.min(20, newDex + 2);
      else if (asiStat1 === 'con') newCon = Math.min(20, newCon + 2);
      else if (asiStat1 === 'int') newInt = Math.min(20, newInt + 2);
      else if (asiStat1 === 'wis') newWis = Math.min(20, newWis + 2);
      else if (asiStat1 === 'cha') newCha = Math.min(20, newCha + 2);
      asiSummaryText = `+2 em ${STAT_NAMES[asiStat1] || asiStat1.toUpperCase()}`;
    } else {
      if (asiStat1 === 'str') newStr = Math.min(20, newStr + 1);
      else if (asiStat1 === 'dex') newDex = Math.min(20, newDex + 1);
      else if (asiStat1 === 'con') newCon = Math.min(20, newCon + 1);
      else if (asiStat1 === 'int') newInt = Math.min(20, newInt + 1);
      else if (asiStat1 === 'wis') newWis = Math.min(20, newWis + 1);
      else if (asiStat1 === 'cha') newCha = Math.min(20, newCha + 1);

      if (asiStat2 === 'str') newStr = Math.min(20, newStr + 1);
      else if (asiStat2 === 'dex') newDex = Math.min(20, newDex + 1);
      else if (asiStat2 === 'con') newCon = Math.min(20, newCon + 1);
      else if (asiStat2 === 'int') newInt = Math.min(20, newInt + 1);
      else if (asiStat2 === 'wis') newWis = Math.min(20, newWis + 1);
      else if (asiStat2 === 'cha') newCha = Math.min(20, newCha + 1);
      asiSummaryText = `+1 em ${STAT_NAMES[asiStat1] || asiStat1.toUpperCase()} e +1 em ${
        STAT_NAMES[asiStat2] || asiStat2.toUpperCase()
      }`;
    }
  } else if (levelUpAsiChoice === 'feat') {
    if (selectedFeatName) {
      if (selectedFeatName === 'Mestre em Armas Grandes' || selectedFeatName === 'Great Weapon Master') {
        if (nextLevel < 4 || newStr < 13) {
          alert('⚠️ Mestre em Armas Grandes requer Nível 4+ e Força 13+!');
          return { newStr, newDex, newCon, newInt, newWis, newCha, asiSummaryText, success: false };
        }
        newStr = Math.min(20, newStr + 1);
      } else if (selectedFeatName === 'Mestre-Atirador' || selectedFeatName === 'Sharpshooter') {
        if (nextLevel < 4 || newDex < 13) {
          alert('⚠️ Mestre-Atirador requer Nível 4+ e Destreza 13+!');
          return { newStr, newDex, newCon, newInt, newWis, newCha, asiSummaryText, success: false };
        }
        newDex = Math.min(20, newDex + 1);
      } else if (selectedFeatName === 'Perfurador' || selectedFeatName === 'Piercer') {
        if (nextLevel < 4) {
          alert('⚠️ Perfurador requer Nível 4+!');
          return { newStr, newDex, newCon, newInt, newWis, newCha, asiSummaryText, success: false };
        }
        newDex = Math.min(20, newDex + 1);
      }

      if (!featsList.includes(selectedFeatName)) {
        featsList.push(selectedFeatName);
      }
    }
    asiSummaryText = `Talento: ${selectedFeatName}`;
  }

  return {
    newStr: Math.min(20, newStr),
    newDex: Math.min(20, newDex),
    newCon: Math.min(20, newCon),
    newInt: Math.min(20, newInt),
    newWis: Math.min(20, newWis),
    newCha: Math.min(20, newCha),
    asiSummaryText,
    success: true,
  };
}
