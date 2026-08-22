import { useMemo } from 'react';
import { CombatEntity } from '../../../../../game/types';
import { parseEquipmentToList } from '../../../../../lib/mechanics/xpAndLootManager';
import { calculateAC } from '../../../../../lib/mechanics/acCalculator';

export interface UseHeroArmorClassProps {
  character: any;
  currentSelectedAttack: any;
  entities: CombatEntity[];
  getActiveFeats: () => string[];
  versatileTwoHandedWeapons: Record<string, boolean>;
}

export function useHeroArmorClass({
  character,
  currentSelectedAttack,
  entities,
  getActiveFeats,
  versatileTwoHandedWeapons,
}: UseHeroArmorClassProps) {
  const heroACDetails = useMemo(() => {
    if (!character) return { ac: 14, shieldActive: false, twoHandedWeaponBlockedShield: false, shieldPenalty: false };

    let slots: Record<string, string | null> = {};
    if (character.equipment_slots) {
      if (typeof character.equipment_slots === 'string') {
        try { slots = JSON.parse(character.equipment_slots); } catch {}
      } else {
        slots = character.equipment_slots;
      }
    } else if (character.equipmentSlots) {
      if (typeof character.equipmentSlots === 'string') {
        try { slots = JSON.parse(character.equipmentSlots); } catch {}
      } else {
        slots = character.equipmentSlots;
      }
    }

    const equipmentList = parseEquipmentToList(character.equipment);
    const relationalItems: any[] = [];
    if (Array.isArray(character.character_inventory)) {
      character.character_inventory.forEach((inv: any) => {
        const itemName = inv.items?.name || inv.name;
        if (itemName) {
          const isEquipped = !!inv.equip_slot || inv.equipped === true;
          relationalItems.push({ name: itemName, equipped: isEquipped, equip_slot: inv.equip_slot });
        }
      });
    } else if (Array.isArray(character.inventory)) {
      character.inventory.forEach((inv: any) => {
        const itemName = inv.name || inv.items?.name;
        if (itemName) {
          relationalItems.push({ name: itemName, equipped: !!inv.equipped || !!inv.equip_slot, equip_slot: inv.equip_slot });
        }
      });
    }
    const combinedInventory = [...equipmentList, ...relationalItems];

    const armorFromSlot = slots['corpo_torso'] || character.equipped_armor || null;
    const shieldFromSlot = slots['empunhadura_2'] || slots['empunhadura_1'] || character.equipped_shield || null;

    const res = calculateAC({
      charClass: character.class_name || character.charClass || '',
      stats: {
        str: character.strength ?? character.str ?? 10,
        dex: character.dexterity ?? character.dex ?? 10,
        con: character.constitution ?? character.con ?? 10,
        wis: character.wisdom ?? character.wis ?? 10,
      },
      equippedArmor: armorFromSlot,
      equippedShield: shieldFromSlot,
      equippedRing: character.equipped_ring || slots['dedo_anel_1'] || slots['dedo_anel_2'] || null,
      fightingStyle: character.fighting_style,
      inventoryItems: combinedInventory,
      selectedWeaponName: currentSelectedAttack?.name || null,
      equipmentSlots: slots,
      feats: getActiveFeats(),
      versatileTwoHanded: currentSelectedAttack ? Boolean(versatileTwoHandedWeapons[currentSelectedAttack.name]) : false
    });

    const rawW2 = slots['empunhadura_2'] || slots['empunhadura_1'] || character?.equipped_shield || '';
    const hasShield = Boolean(rawW2 && (rawW2.toLowerCase().includes('escudo') || rawW2.toLowerCase().includes('shield')));

    const heroEntity = entities.find(e => e.type === 'hero');
    const offHandUsed = Boolean(heroEntity?.offHandAttackUsedThisTurn);
    if (hasShield && offHandUsed) {
      const shieldVal = res.shieldBonus || 2;
      return {
        ...res,
        ac: Math.max(10, res.armor_class - shieldVal),
        shieldActive: false,
        shieldPenalty: true
      };
    }

    return { ...res, shieldPenalty: false };
  }, [character, currentSelectedAttack, entities, getActiveFeats, versatileTwoHandedWeapons]);

  return { heroACDetails };
}
