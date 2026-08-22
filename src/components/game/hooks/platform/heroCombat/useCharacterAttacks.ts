import { useMemo } from 'react';
import { parseAttacks } from '../../../../../lib/mechanics/inventoryParser';
import { parseEquipmentToList } from '../../../../../lib/mechanics/xpAndLootManager';

export interface UseCharacterAttacksProps {
  character: any;
  versatileTwoHandedWeapons: Record<string, boolean>;
  getActiveFeats: () => string[];
  isVersatileWeapon: (atkName: string, properties?: string) => boolean;
  getVersatileDamage: (atkName: string, properties?: string) => string;
}

export function useCharacterAttacks({
  character,
  versatileTwoHandedWeapons,
  getActiveFeats,
  isVersatileWeapon,
  getVersatileDamage,
}: UseCharacterAttacksProps) {
  const characterAttacks: any[] = useMemo(() => {
    if (!character) return [];

    const equipmentList = parseEquipmentToList(character.equipment);
    const stats = {
      str: character.strength || 10,
      dex: character.dexterity || 10,
      con: character.constitution || 10,
      int: character.intelligence || 10,
      wis: character.wisdom || 10,
      cha: character.charisma || 10,
    };

    const className = (character.class_name || character.charClass || '').toLowerCase();
    let attackStat: 'str' | 'dex' | 'int' | 'wis' | 'cha' = 'str';
    if (className.includes('mago') || className.includes('wizard')) attackStat = 'int';
    else if (className.includes('clérigo') || className.includes('cleric') || className.includes('druida') || className.includes('druid') || className.includes('patrulheiro') || className.includes('ranger')) attackStat = 'wis';
    else if (className.includes('bardo') || className.includes('bard') || className.includes('feiticeiro') || className.includes('sorcerer') || className.includes('bruxo') || className.includes('warlock') || className.includes('paladino') || className.includes('paladin')) attackStat = 'cha';
    else if (className.includes('ladino') || className.includes('rogue') || className.includes('monge') || className.includes('monk')) attackStat = 'dex';

    const pb = 2 + Math.floor(((character.level || 1) - 1) / 4);

    let spellsList: string[] = [];
    if (Array.isArray(character.spells)) {
      spellsList = character.spells.map((s: any) => typeof s === 'string' ? s : s.name);
    } else if (typeof character.spells === 'string') {
      try {
        const parsed = JSON.parse(character.spells);
        if (Array.isArray(parsed)) spellsList = parsed.map((s: any) => typeof s === 'string' ? s : s.name);
      } catch {}
    }

    const weaponItems = equipmentList.map(name => ({ name, equipped: true, category: 'Arma' }));
    const parsedAttacks = parseAttacks(weaponItems, spellsList, stats, attackStat, pb, getActiveFeats());

    const formattedParsedAttacks: (typeof parsedAttacks[0] & { damage_type: string; attack_bonus: number; isVersatileTwoHanded?: boolean })[] = parsedAttacks.map(a => ({
      name: a.name,
      attack_bonus: a.bonus,
      bonus: a.bonus,
      damage: a.damage,
      type: a.type,
      damage_type: a.type,
      range: a.range,
      mastery: a.mastery,
      properties: a.properties
    }));
    const finalAttacksList = [...formattedParsedAttacks];

    let slots: Record<string, string | null> = {};
    if (character.equipment_slots) {
      if (typeof character.equipment_slots === 'string') {
        try { slots = JSON.parse(character.equipment_slots); } catch {}
      } else {
        slots = character.equipment_slots;
      }
    } else if (character.equipmentSlots) {
      slots = character.equipmentSlots;
    }

    const equippedWeaponName = (
      slots['empunhadura_1'] ||
      slots['empunhadura_2'] ||
      character.equipped_weapon ||
      character.equippedWeapon ||
      character.equipped_main_weapon ||
      ''
    ).trim();

    if (equippedWeaponName) {
      const reqLower = equippedWeaponName.toLowerCase();
      const equippedIdx = finalAttacksList.findIndex(atk => {
        const atkLower = (atk.name || '').toLowerCase().trim();
        return atkLower === reqLower || atkLower.includes(reqLower) || reqLower.includes(atkLower);
      });

      if (equippedIdx > 0) {
        const [equippedAtk] = finalAttacksList.splice(equippedIdx, 1);
        finalAttacksList.unshift(equippedAtk);
      }
    }

    const processedAttacks = finalAttacksList.map(atk => {
      let modifiedAtk = { ...atk };
      const isVersatile = isVersatileWeapon(modifiedAtk.name, modifiedAtk.properties);
      const isTwoHandedMode = isVersatile && Boolean(versatileTwoHandedWeapons[modifiedAtk.name]);

      if (isTwoHandedMode) {
        const versatileDie = getVersatileDamage(modifiedAtk.name, modifiedAtk.properties);
        modifiedAtk.damage = modifiedAtk.damage.replace(/^\d+d\d+/, versatileDie);
        modifiedAtk.properties = modifiedAtk.properties ? `${modifiedAtk.properties}, 2 Mãos` : '2 Mãos';
        modifiedAtk.isVersatileTwoHanded = true;

        if (modifiedAtk.properties && modifiedAtk.properties.toLowerCase().includes('duelismo')) {
          modifiedAtk.attack_bonus = (Number(modifiedAtk.attack_bonus) || 0) - 2;
          modifiedAtk.properties = modifiedAtk.properties
            .split(',')
            .map(p => p.trim())
            .filter(p => !p.toLowerCase().includes('duelismo'))
            .join(', ');
        }
      }
      return modifiedAtk;
    });

    return processedAttacks;
  }, [character, versatileTwoHandedWeapons, getActiveFeats, isVersatileWeapon, getVersatileDamage]);

  const getWeaponMastery = (currentSelectedAttack: any) => {
    if (!currentSelectedAttack) return null;

    const charLevel = Number(character?.level || 1);
    if (charLevel < 2) return null;

    const className = (character?.class_name || character?.charClass || '').toLowerCase();
    const characterFeatures = JSON.stringify(character?.features || []).toLowerCase();
    
    const martialClasses = ['guerreiro', 'fighter', 'bárbaro', 'barbarian', 'paladino', 'paladin', 'patrulheiro', 'ranger', 'ladino', 'rogue', 'monge', 'monk'];
    const hasMasteryFeature = martialClasses.some(c => className.includes(c)) || characterFeatures.includes('maestria') || characterFeatures.includes('mastery');

    if (!hasMasteryFeature) return null;

    const atkMastery = currentSelectedAttack.mastery || '';
    const atkName = currentSelectedAttack.name || '';

    if (atkMastery) return { name: atkMastery, source: 'weapon' };

    const lowerName = atkName.toLowerCase();
    if (lowerName.includes('machado grande') || lowerName.includes('glaive') || lowerName.includes('alabarda')) return { name: 'Cleave (Fender)', source: 'derived' };
    if (lowerName.includes('espada grande') || lowerName.includes('espada longa')) return { name: 'Graze (Rozar)', source: 'derived' };
    if (lowerName.includes('machadinha') || lowerName.includes('espada curta') || lowerName.includes('rapieira') || lowerName.includes('arco curto')) return { name: 'Vex (Vexar)', source: 'derived' };
    if (lowerName.includes('adaga') || lowerName.includes('cimitarra') || lowerName.includes('foice')) return { name: 'Nick (Corte Rápido)', source: 'derived' };
    if (lowerName.includes('maça') || lowerName.includes('mangual') || lowerName.includes('lança')) return { name: 'Sap (Enfraquecer)', source: 'derived' };
    if (lowerName.includes('azagaia') || lowerName.includes('arco longo') || lowerName.includes('besta leve') || lowerName.includes('chicote')) return { name: 'Slow (Lentidão)', source: 'derived' };
    if (lowerName.includes('machado de batalha') || lowerName.includes('bordão') || lowerName.includes('malho') || lowerName.includes('tridente')) return { name: 'Topple (Derrubar)', source: 'derived' };
    if (lowerName.includes('besta pesada') || lowerName.includes('martelo de guerra') || lowerName.includes('clava grande')) return { name: 'Push (Empurrar)', source: 'derived' };

    return { name: 'Golpe Tático de Maestria', source: 'class' };
  };

  return { characterAttacks, getWeaponMastery };
}
