import { useState } from 'react';
import { isTwoHandedWeapon, isArmorNotShield, calculateAC } from '../../../../lib/mechanics/acCalculator';
import { isConsumableItem } from '../utils';
import { useSlotCompatibility } from './equipmentSlots/useSlotCompatibility';
import { useSlotAcCalculator } from './equipmentSlots/useSlotAcCalculator';
import { useSlotAvailability } from './equipmentSlots/useSlotAvailability';
import { useSlotAssignment } from './equipmentSlots/useSlotAssignment';

const ALL_SLOT_KEYS = [
  'cabeca',
  'rosto_olhos',
  'pescoco',
  'ombros_costas',
  'corpo_torso',
  'bracos_pulsos',
  'maos_vestuario',
  'cintura',
  'pes',
  'roupa_clima',
  'empunhadura_1',
  'empunhadura_2',
  'dedo_anel_1',
  'dedo_anel_2',
];

export const useEquipmentSlots = (
  character: any,
  getCharacterActiveFeats: (char: any) => string[],
  setShopMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void,
  onCharacterUpdated?: () => void,
  currentHp?: number,
  setCurrentHp?: (hp: number) => void
) => {
  const [showSlotsModal, setShowSlotsModal] = useState(false);
  const [showAcModal, setShowAcModal] = useState(false);

  const [equippedArmor, setEquippedArmor] = useState<string | null>(
    character.equipped_armor || character.equipment_slots?.corpo_torso || null
  );
  const [equippedShield, setEquippedShield] = useState<string | null>(
    character.equipped_shield ||
      (character.equipment_slots?.empunhadura_2 &&
      /escudo|shield/i.test(character.equipment_slots.empunhadura_2)
        ? character.equipment_slots.empunhadura_2
        : null)
  );
  const [equippedRing, setEquippedRing] = useState<string | null>(
    character.equipped_ring ||
      character.equipment_slots?.dedo_anel_1 ||
      character.equipment_slots?.dedo_anel_2 ||
      null
  );

  const [equipmentSlots, setEquipmentSlots] = useState<Record<string, string | null>>(() => {
    const defaultSlots: Record<string, string | null> = {
      cabeca: null,
      rosto_olhos: null,
      pescoco: null,
      ombros_costas: null,
      corpo_torso: character?.equipped_armor || null,
      bracos_pulsos: null,
      maos_vestuario: null,
      cintura: null,
      pes: null,
      roupa_clima: character?.equipment_slots?.roupa_clima || null,
      empunhadura_1: null,
      empunhadura_2: character?.equipped_shield || null,
      dedo_anel_1: character?.equipped_ring || null,
      dedo_anel_2: null,
    };

    let parsed = defaultSlots;
    if (character?.equipment_slots) {
      if (typeof character.equipment_slots === 'string') {
        try {
          parsed = { ...defaultSlots, ...JSON.parse(character.equipment_slots) };
        } catch (e) {
          parsed = defaultSlots;
        }
      } else {
        parsed = { ...defaultSlots, ...character.equipment_slots };
      }
    }

    if (parsed.empunhadura_1 && (isArmorNotShield(parsed.empunhadura_1) || isConsumableItem(parsed.empunhadura_1))) {
      parsed.empunhadura_1 = null;
    }
    if (parsed.empunhadura_2 && (isArmorNotShield(parsed.empunhadura_2) || isConsumableItem(parsed.empunhadura_2))) {
      parsed.empunhadura_2 = null;
    }

    if (parsed.empunhadura_1 && /escudo|shield/i.test(parsed.empunhadura_1)) {
      const shieldItem = parsed.empunhadura_1;
      parsed.empunhadura_1 = null;
      if (!parsed.empunhadura_2) {
        parsed.empunhadura_2 = shieldItem;
      }
    }

    if (parsed.empunhadura_1 && isTwoHandedWeapon(parsed.empunhadura_1)) {
      parsed.empunhadura_2 = parsed.empunhadura_1;
    } else if (parsed.empunhadura_2 && isTwoHandedWeapon(parsed.empunhadura_2)) {
      parsed.empunhadura_1 = parsed.empunhadura_2;
    }

    return parsed;
  });

  const {
    getItemCategory,
    isItemCompatibleWithSlot,
    canItemBeEquipped,
    isItemEquippedAnywhere,
    getEquipmentType,
  } = useSlotCompatibility({ equipmentSlots, ALL_SLOT_KEYS });

  const { getInventoryMap, getAvailableItemsForSlot } = useSlotAvailability({
    character,
    equipmentSlots,
    isItemCompatibleWithSlot,
  });

  const [currentAc, setCurrentAc] = useState<number>(() => {
    const res = calculateAC({
      charClass: character.class_name || character.charClass || '',
      stats: {
        dex: character.dexterity || character.dex || 10,
        con: character.constitution || character.con || 10,
        wis: character.wisdom || character.wis || 10,
      },
      equippedArmor: character.equipped_armor || null,
      equippedShield: character.equipped_shield || null,
      equippedRing: character.equipped_ring || null,
      fightingStyle: character.fighting_style,
      inventoryItems: character.character_inventory,
      equipmentSlots,
      feats: getCharacterActiveFeats(character),
    });
    return res.armor_class;
  });

  const { calculateTotalAc, acDetails } = useSlotAcCalculator({
    character,
    equippedArmor,
    equippedShield,
    equippedRing,
    equipmentSlots,
    getCharacterActiveFeats,
    currentAc,
    setCurrentAc,
  });

  const { handleAssignSlot, handleToggleEquipInInventory } = useSlotAssignment({
    character,
    equipmentSlots,
    setEquipmentSlots,
    equippedArmor,
    setEquippedArmor,
    equippedShield,
    setEquippedShield,
    equippedRing,
    setEquippedRing,
    setCurrentAc,
    calculateTotalAc,
    setShopMessage,
    onCharacterUpdated,
    isItemCompatibleWithSlot,
    getInventoryMap,
    ALL_SLOT_KEYS,
  });

  return {
    showSlotsModal,
    setShowSlotsModal,
    showAcModal,
    setShowAcModal,
    equippedArmor,
    setEquippedArmor,
    equippedShield,
    setEquippedShield,
    equippedRing,
    setEquippedRing,
    equipmentSlots,
    setEquipmentSlots,
    currentAc,
    setCurrentAc,
    acDetails,
    calculateTotalAc,
    handleAssignSlot,
    handleToggleEquipInInventory,
    isItemCompatibleWithSlot,
    canItemBeEquipped,
    isItemEquippedAnywhere,
    getEquipmentType,
    getItemCategory,
    getAvailableItemsForSlot,
  };
};
