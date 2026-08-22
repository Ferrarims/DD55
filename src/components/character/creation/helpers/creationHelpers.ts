import { CLASS_REFERENCE, RACES_REFERENCE, DRACONIC_ANCESTRIES, getRaceIcon } from '../../../../lib/api/references';
import { formatEquipmentChoiceDescription } from '../../../../lib/mechanics/equipmentParser';
import { StatKey, CLASSES, GIANT_ANCESTRIES_INFO } from '../constants';
import { calculateTotalMaxHp } from '../../../../lib/mechanics/hpCalculator';
import { parseInventory, parseAttacks, calculateTotalCoinsFromEquipment } from '../../../../lib/mechanics/inventoryParser';
import { calculateResources, calculateRaceResources } from '../../../../lib/mechanics/resourcesParser';

export const POINT_COSTS: Record<number, number> = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };

export const getPointsSpent = (baseStats: Record<StatKey, number>): number => {
  return (Object.values(baseStats) as number[]).reduce<number>((acc, val) => acc + (POINT_COSTS[val] || 0), 0);
};

export const calculateModifier = (score: number) => Math.floor((score - 10) / 2);

export const getFinalStat = (stat: StatKey, baseStats: Record<StatKey, number>, bgBonuses: {stat: StatKey, value: number}[]) => {
  const bonus = bgBonuses.find(b => b.stat === stat)?.value || 0;
  return Math.min(20, (baseStats[stat] || 0) + bonus);
};

export const generateRolledStats = (): number[] => {
  return Array.from({ length: 6 }, () => {
    const dice = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1).sort();
    return dice[1] + dice[2] + dice[3]; // Drop lowest
  });
};

export const getStandardClassEquipment = (cls: string, option: 'A' | 'B' | 'C') => {
  const classData = (CLASS_REFERENCE as any)[cls];
  if (classData && classData.equipmentOptions) {
    return formatEquipmentChoiceDescription(classData.equipmentOptions, option);
  }
  
  switch(cls) {
    case 'Fighter': 
      return '155 PO';
    default: 
      if (option === 'A') return 'Armas e armaduras básicas';
      if (option === 'B') return 'Opção alternativa';
      return '50 PO';
  }
};

export const calculateResistances = (race: string, draconicAncestry: string | undefined, giantAncestry: string | undefined, DRACONIC_ANCESTRIES_LIST: any[], GIANT_ANCESTRIES_INFO_LIST: any) => {
  const res = [];
  if (['Aasimar'].includes(race)) res.push('Radiante', 'Necrótico');
  if (['Anão', 'Dwarf'].includes(race)) res.push('Veneno');
  if (['Draconato', 'Dragonborn'].includes(race)) {
    const ancestry = DRACONIC_ANCESTRIES_LIST.find((a: any) => a.name === draconicAncestry);
    res.push(ancestry ? ancestry.damageType : 'Elemento Dracônico');
  }
  if (['Tiferino', 'Tiefling'].includes(race)) res.push('Fogo');
  if (['Golias', 'Goliath'].includes(race)) {
    if (giantAncestry) {
      const ancestry = GIANT_ANCESTRIES_INFO_LIST[giantAncestry];
      res.push(ancestry ? ancestry.benefit : 'Resistência de Gigante');
    } else {
      res.push('Físico (Depende do Gigante)');
    }
  }
  return res;
};

export const calculateSenses = (race: string, RACES_REFERENCE_LIST: any) => {
  const senses = [];
  const raceInfo = RACES_REFERENCE_LIST[race];
  if (raceInfo && raceInfo.traits) {
    const darkvision = raceInfo.traits.find((t: any) => t.name.includes('Visão no Escuro'));
    if (darkvision) senses.push(darkvision.name);
  }
  return senses;
};

export const calculateSpellSaveDC = (charClass: string, getFinalStatFn: (s: StatKey) => number) => {
  let spellcastingStat = null;
  if (['Wizard'].includes(charClass)) spellcastingStat = 'int';
  if (['Cleric', 'Druid', 'Ranger'].includes(charClass)) spellcastingStat = 'wis';
  if (['Bard', 'Sorcerer', 'Warlock', 'Paladin'].includes(charClass)) spellcastingStat = 'cha';
  return spellcastingStat ? 8 + 2 + calculateModifier(getFinalStatFn(spellcastingStat as StatKey)) : undefined;
};

export interface BuildFinalStatsProps {
  name: string;
  charClass: string;
  race: string;
  draconicAncestry: string | undefined;
  giantAncestry: string | undefined;
  background: string;
  humanFeat: string;
  currentBg: any;
  currentClass: any;
  currentRace: any;
  selectedSkills: string[];
  selectedTools: string[];
  alignment: string;
  selectedCantrips: string[];
  selectedSpells: string[];
  fightingStyle: string;
  bgBonuses: {stat: StatKey, value: number}[];
  getFinalStat: (s: StatKey) => number;
  getEquipmentAndAC: () => any;
}

export function buildFinalStats(params: BuildFinalStatsProps) {
  const {
    name, charClass, race, draconicAncestry, giantAncestry, background, humanFeat,
    currentBg, currentClass, currentRace, selectedSkills, selectedTools, alignment,
    selectedCantrips, selectedSpells, fightingStyle, bgBonuses, getFinalStat, getEquipmentAndAC
  } = params;

  const conMod = calculateModifier(getFinalStat('con'));
  const dexMod = calculateModifier(getFinalStat('dex'));
  
  let attackStat: StatKey = 'str';
  if (['Rogue'].includes(charClass)) attackStat = 'dex';
  if (['Wizard'].includes(charClass)) attackStat = 'int';
  if (['Cleric', 'Druid'].includes(charClass)) attackStat = 'wis';
  if (['Bard', 'Sorcerer', 'Warlock'].includes(charClass)) attackStat = 'cha';
  if (['Fighter', 'Paladin', 'Ranger', 'Monk'].includes(charClass)) {
     attackStat = getFinalStat('dex') > getFinalStat('str') ? 'dex' : 'str';
  }

  const attackMod = calculateModifier(getFinalStat(attackStat));
  const pb = 2;

  const { ac, weaponDice, weaponCount, equipmentList, rawEquipmentList } = getEquipmentAndAC();
  const startingCoins = calculateTotalCoinsFromEquipment(rawEquipmentList);

  const featArray: string[] = [];
  if (currentBg?.feat) {
    currentBg.feat.split(',').forEach((f: string) => {
      const t = f.trim();
      if (t && !featArray.includes(t)) featArray.push(t);
    });
  }

  if (race === 'Human' || race === 'Humano') {
    const chosenHumanFeat = humanFeat || 'Alerta';
    if (!featArray.includes(chosenHumanFeat)) {
      featArray.push(chosenHumanFeat);
    }
  }
  const finalFeat = featArray.join(', ');
  const hpBase = currentClass.hpBase + conMod;
  const finalHp = calculateTotalMaxHp(hpBase, currentRace?.name || 'Humano', 1, finalFeat);

  return {
    name,
    charClass: currentClass.name,
    race: currentRace?.name || 'Desconhecido',
    draconicAncestry,
    giantAncestry,
    background: currentBg?.name || 'Desconhecido',
    originFeat: finalFeat,
    feats: featArray,
    icon: currentRace?.icon || getRaceIcon(currentRace?.name),
    maxHp: finalHp,
    hp: finalHp,
    armor_class: ac,
    initiative: dexMod + (finalFeat.includes('Alerta') || finalFeat.includes('Alert') || currentBg?.feat === 'Alerta' || currentBg?.feat === 'Alert' ? pb : 0),
    attackBonus: attackMod + pb,
    damageDiceSides: weaponDice,
    damageDiceCount: weaponCount,
    damageBonus: attackMod,
    str: getFinalStat('str'),
    dex: getFinalStat('dex'),
    con: getFinalStat('con'),
    int: getFinalStat('int'),
    wis: getFinalStat('wis'),
    cha: getFinalStat('cha'),
    strength: getFinalStat('str'),
    dexterity: getFinalStat('dex'),
    constitution: getFinalStat('con'),
    intelligence: getFinalStat('int'),
    wisdom: getFinalStat('wis'),
    charisma: getFinalStat('cha'),
    bgBonuses,
    skillProficiencies: selectedSkills,
    toolProficiencies: selectedTools,
    alignment,
    equipment: equipmentList,
    inventory: parseInventory(equipmentList).items,
    coins: startingCoins,
    attacks: parseAttacks(parseInventory(equipmentList).items, selectedCantrips, { str: getFinalStat('str'), dex: getFinalStat('dex'), con: getFinalStat('con'), int: getFinalStat('int'), wis: getFinalStat('wis'), cha: getFinalStat('cha') }, attackStat as any, 2, [finalFeat]),
    spells: [...selectedCantrips, ...selectedSpells],
    speed: String(RACES_REFERENCE[race]?.speed || '9m'),
    savingThrows: (CLASS_REFERENCE as any)[charClass]?.savingThrows || [],
    level: 1,
    proficiencyBonus: 2,
    fighting_style: charClass === 'Fighter' ? fightingStyle : undefined,
    fighting_style_locked: charClass === 'Fighter' ? true : undefined,
    level_choices: charClass === 'Fighter' ? [{ level: 1, fightingStyle }] : [],
    resources: [...calculateResources(charClass, 1, { str: getFinalStat('str'), dex: getFinalStat('dex'), con: getFinalStat('con'), int: getFinalStat('int'), wis: getFinalStat('wis'), cha: getFinalStat('cha') }), ...calculateRaceResources(race, 1, draconicAncestry, giantAncestry)],
    passivePerception: 10 + calculateModifier(getFinalStat('wis')) + ((currentBg?.skillProficiencies || []).includes('Percepção') ? 2 : 0),
    hitDice: `d${CLASSES[charClass as keyof typeof CLASSES].hpBase}`,
    hitDiceCount: 1,
    resistances: calculateResistances(race, draconicAncestry, giantAncestry, DRACONIC_ANCESTRIES, GIANT_ANCESTRIES_INFO),
    senses: calculateSenses(race, RACES_REFERENCE),
    spellSaveDC: calculateSpellSaveDC(charClass, getFinalStat)
  };
}
