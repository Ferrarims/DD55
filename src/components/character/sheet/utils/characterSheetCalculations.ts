import { getMod } from '../../../../lib/mechanics/hpCalculator';
import { parseAttacks } from '../../../../lib/mechanics/inventoryParser';
import {
  getFighterFeaturesForLevel,
  getClassFeaturesGainedAtLevel,
  DRACONIC_ANCESTRIES,
  GIANT_ANCESTRIES,
  BACKGROUNDS_REFERENCE,
} from '../../../../lib/api/references';

export function getCharacterActiveFeats(char: any): string[] {
  const feats = Array.isArray(char.feats) ? [...char.feats] : [];
  if (char.background) {
    const bgKey = Object.keys(BACKGROUNDS_REFERENCE).find(
      k => k.toLowerCase() === String(char.background).trim().toLowerCase()
    );
    if (bgKey && BACKGROUNDS_REFERENCE[bgKey]?.feat) {
      const bgFeat = BACKGROUNDS_REFERENCE[bgKey].feat;
      if (!feats.includes(bgFeat)) feats.push(bgFeat);
    }
  }
  return feats;
}

export function getDisplayResistances(character: any): string[] {
  const res = character.resistances ? [...character.resistances] : [];
  const raceName = (character.race || '').toLowerCase();

  if (/anão|dwarf/i.test(raceName) && !res.includes('Veneno')) res.push('Veneno');
  if (/aasimar/i.test(raceName)) {
    if (!res.includes('Necrótico')) res.push('Necrótico');
    if (!res.includes('Radiante')) res.push('Radiante');
  }
  if (/tiferino|tiefling/i.test(raceName) && !res.includes('Fogo')) res.push('Fogo');

  if (/draconato|dragonborn/i.test(raceName) && character.draconic_ancestry) {
    const ancestry = DRACONIC_ANCESTRIES.find(a => a.name === character.draconic_ancestry);
    if (ancestry && !res.includes(ancestry.damageType)) {
      res.push(ancestry.damageType);
    }
  }
  if (/golias|goliath/i.test(raceName) && character.giant_ancestry) {
    const ancestry = GIANT_ANCESTRIES.find(g => g.name === character.giant_ancestry);
    if (ancestry && !res.includes(ancestry.benefitName)) {
      res.push(ancestry.benefitName);
    }
  }
  return res;
}

export function getBreathWeaponDetails(character: any) {
  const isDragonborn = /draconato|dragonborn/i.test(character.race || '');
  if (!isDragonborn) return null;

  const level = character.level || 1;
  const conMod = getMod(character.constitution || 10);
  const pbBonus = 2 + Math.floor((level - 1) / 4);
  const dc = 8 + conMod + pbBonus;

  let diceCount = 1;
  if (level >= 17) diceCount = 4;
  else if (level >= 11) diceCount = 3;
  else if (level >= 5) diceCount = 2;

  const ancestry = DRACONIC_ANCESTRIES.find(a => a.name === character.draconic_ancestry);
  const damageType = ancestry?.damageType || 'Energia';

  return {
    dc,
    conMod,
    pb: pbBonus,
    damage: `${diceCount}d10`,
    damageType,
  };
}

export function calculateHpBreakdown(character: any, hitDieVal: number) {
  const activeFeats = getCharacterActiveFeats(character);
  const level = character.level || 1;
  const conMod = getMod(character.constitution || 10);
  const isDwarfRace = ['Anão', 'Dwarf'].includes(character.race);
  const hasTough = activeFeats.some(f => /vigoroso|tough/i.test(f || ''));
  const fortitudeBonus = activeFeats.some(f => /dádiva da fortitude/i.test(f || '')) ? 40 : 0;

  const baseDieVal = hitDieVal;
  const choices = Array.isArray(character.level_choices) ? character.level_choices : [];

  const levelsBreakdown: {
    level: number;
    method: string;
    baseHp: number;
    conMod: number;
    dwarfBonusAtLevel: number;
    toughBonusAtLevel: number;
    totalLevelHp: number;
  }[] = [];

  for (let lvl = 1; lvl <= level; lvl++) {
    const dwarfBonusAtLevel = isDwarfRace ? 1 : 0;
    const toughBonusAtLevel = hasTough ? 2 : 0;

    if (lvl === 1) {
      const baseHp = baseDieVal;
      const totalLevelHp = baseHp + conMod + dwarfBonusAtLevel + toughBonusAtLevel;
      levelsBreakdown.push({
        level: 1,
        method: 'Dado Máximo',
        baseHp,
        conMod,
        dwarfBonusAtLevel,
        toughBonusAtLevel,
        totalLevelHp,
      });
    } else {
      const choice = choices.find((c: any) => c.level === lvl);
      let baseHp = Math.floor(baseDieVal / 2) + 1;
      let method = 'Média';

      if (choice) {
        if (typeof choice.baseHp === 'number' && choice.baseHp > 0) {
          baseHp = choice.baseHp;
          method = choice.hpGainMode === 'roll' ? 'Dado Rolado' : 'Média';
        } else if (choice.hpGain) {
          const match = String(choice.hpGain).match(/\+(\d+)/);
          if (match) {
            const totalGain = parseInt(match[1], 10);
            baseHp = Math.max(1, totalGain - conMod);
            method = String(choice.hpGain).toLowerCase().includes('dado') ? 'Dado Rolado' : 'Média';
          }
        }
      }

      const totalLevelHp = baseHp + conMod + dwarfBonusAtLevel + toughBonusAtLevel;
      levelsBreakdown.push({
        level: lvl,
        method,
        baseHp,
        conMod,
        dwarfBonusAtLevel,
        toughBonusAtLevel,
        totalLevelHp,
      });
    }
  }

  const sumBaseHp = levelsBreakdown.reduce((acc, curr) => acc + curr.baseHp, 0);
  const conBonusTotal = conMod * level;
  const dwarfBonus = isDwarfRace ? level : 0;
  const toughBonus = hasTough ? level * 2 : 0;
  const calculatedTotal = sumBaseHp + conBonusTotal + dwarfBonus + toughBonus + fortitudeBonus;
  const totalMaxHp = calculatedTotal;

  return {
    base: sumBaseHp,
    baseHp: sumBaseHp,
    conBonusTotal,
    conModBonus: conBonusTotal,
    dwarfBonus,
    toughBonus,
    fortitudeBonus,
    totalMaxHp,
    total: totalMaxHp,
    levelsBreakdown,
  };
}

export function getNextProgressionDetails(
  className: string,
  nextLevel: number,
  levelUpSubclass: string
) {
  const fighterFeats = getFighterFeaturesForLevel(nextLevel, levelUpSubclass)
    .filter(f => f.level === nextLevel)
    .map(f => f.name);
  const genericFeats = getClassFeaturesGainedAtLevel(className || 'Guerreiro', nextLevel, levelUpSubclass);
  
  const featureNames = Array.from(
    new Set([
      ...fighterFeats,
      ...(Array.isArray(genericFeats)
        ? genericFeats.map(f => (typeof f === 'string' ? f : (f as any)?.name || String(f)))
        : [])
    ])
  ).filter(Boolean);

  const newFeaturesText = featureNames.length > 0
    ? featureNames.join(', ')
    : 'Recursos de classe atualizados para o novo nível.';

  return {
    nextProgression: { features: featureNames },
    newFeaturesText,
  };
}

export function getAttacksList(character: any, pb: number, spellsList: any[]) {
  const rawInv = character.character_inventory || [];
  const weaponItems = rawInv.map((inv: any) => ({
    name: inv.items?.name || inv.name || '',
    equipped: true,
    category: inv.items?.category || inv.category || 'Armas'
  }));

  const stats = {
    str: character.strength ?? character.str ?? 15,
    dex: character.dexterity ?? character.dex ?? 14,
    con: character.constitution ?? character.con ?? 13,
    int: character.intelligence ?? character.int ?? 14,
    wis: character.wisdom ?? character.wis ?? 11,
    cha: character.charisma ?? character.cha ?? 8,
  };

  const className = (character.class_name || character.charClass || 'Fighter').toLowerCase();
  let attackStat: 'str' | 'dex' | 'int' | 'wis' | 'cha' = 'str';
  if (className.includes('mago') || className.includes('wizard')) attackStat = 'int';
  else if (className.includes('clérigo') || className.includes('cleric') || className.includes('druida') || className.includes('druid')) attackStat = 'wis';
  else if (className.includes('bardo') || className.includes('bard') || className.includes('feiticeiro') || className.includes('sorcerer') || className.includes('bruxo') || className.includes('warlock') || className.includes('paladino') || className.includes('paladin')) attackStat = 'cha';
  else if (className.includes('ladino') || className.includes('rogue') || className.includes('monge') || className.includes('monk')) attackStat = 'dex';

  const parsed = parseAttacks(
    weaponItems,
    spellsList,
    stats,
    attackStat,
    pb,
    getCharacterActiveFeats(character)
  );

  const existingAttacks = Array.isArray(character.attacks) ? character.attacks : [];
  const combined = [...parsed];
  existingAttacks.forEach((ex: any) => {
    if (!combined.some(c => c.name.toLowerCase() === ex.name.toLowerCase())) {
      combined.push({
        name: ex.name,
        bonus: ex.attack_bonus ?? ex.bonus ?? 0,
        damage: ex.damage || '1d6',
        type: ex.damage_type || ex.type || 'Contundente',
        mastery: ex.mastery,
        range: ex.range,
        properties: ex.properties
      });
    }
  });

  return combined.map(a => ({
    ...a,
    attack_bonus: a.bonus ?? (a as any).attack_bonus ?? 0,
    damage_type: a.type ?? (a as any).damage_type ?? 'Cortante'
  }));
}
