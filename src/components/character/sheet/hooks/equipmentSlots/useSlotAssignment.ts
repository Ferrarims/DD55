import { updateCharacter } from '../../../../../lib/api/characterService';
import { isArmorNotShield, isTwoHandedWeapon } from '../../../../../lib/mechanics/acCalculator';
import { resolveGripSlotConflict } from './assignment/resolveGripSlotConflict';
import { syncInventoryEquipSlots } from './assignment/syncInventoryEquipSlots';

export interface UseSlotAssignmentProps {
  character: any;
  equipmentSlots: Record<string, string | null>;
  setEquipmentSlots: (slots: Record<string, string | null>) => void;
  equippedArmor: string | null;
  setEquippedArmor: (armor: string | null) => void;
  equippedShield: string | null;
  setEquippedShield: (shield: string | null) => void;
  equippedRing: string | null;
  setEquippedRing: (ring: string | null) => void;
  setCurrentAc: (ac: number) => void;
  calculateTotalAc: (
    char: any,
    armor: string | null,
    shield: string | null,
    ring: string | null,
    fStyle?: string | null,
    invItems?: any[]
  ) => number;
  setShopMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void;
  onCharacterUpdated?: () => void;
  isItemCompatibleWithSlot: (itemName: string, slotKey: string) => boolean;
  getInventoryMap: () => Map<string, number>;
  ALL_SLOT_KEYS: string[];
}

export function useSlotAssignment({
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
}: UseSlotAssignmentProps) {
  const handleAssignSlot = async (slotKey: string, itemName: string | null) => {
    const selectedItem = itemName && itemName.trim() !== '' ? itemName : null;

    if (selectedItem && !isItemCompatibleWithSlot(selectedItem, slotKey)) {
      const isArmor = isArmorNotShield(selectedItem);
      const isShield = /escudo|shield/i.test(selectedItem);
      setShopMessage({
        type: 'error',
        text:
          isArmor && (slotKey === 'empunhadura_1' || slotKey === 'empunhadura_2')
            ? `⚠️ Armaduras ("${selectedItem}") não podem ser colocadas na empunhadura, somente no Corpo/Torso!`
            : isShield && slotKey === 'empunhadura_1'
            ? `⚠️ Escudos ("${selectedItem}") devem ser equipados na Empunhadura 2 (Mão Secundária)!`
            : `⚠️ O item "${selectedItem}" não é compatível com este espaço anatômico!`,
      });
      setTimeout(() => setShopMessage(null), 3500);
      return;
    }

    let updatedSlots: Record<string, string | null> = {
      ...equipmentSlots,
      [slotKey]: selectedItem,
    };

    if (selectedItem) {
      const inventoryMap = getInventoryMap();
      const countInInventory = inventoryMap.get(selectedItem) || 0;
      const otherSlotsEquippedCount = Object.entries(equipmentSlots)
        .filter(([k]) => k !== slotKey)
        .filter(([_, v]) => v === selectedItem).length;

      if (otherSlotsEquippedCount >= countInInventory) {
        for (const [otherKey] of Object.entries(equipmentSlots)) {
          if (otherKey !== slotKey && equipmentSlots[otherKey] === selectedItem) {
            updatedSlots[otherKey] = null;
            break;
          }
        }
      }
    }

    let newArmor = equippedArmor;
    let newShield = equippedShield;
    let newRing = equippedRing;

    if (slotKey === 'empunhadura_1' || slotKey === 'empunhadura_2') {
      const gripResult = resolveGripSlotConflict({
        slotKey,
        selectedItem,
        equipmentSlots,
        updatedSlots,
        equippedShield,
        setEquippedShield,
        character,
      });
      updatedSlots = gripResult.newSlots;
      newShield = gripResult.newShield;
    } else if (slotKey === 'corpo_torso') {
      newArmor = selectedItem;
      setEquippedArmor(selectedItem);
      character.equipped_armor = selectedItem;
    } else if (slotKey === 'dedo_anel_1' || slotKey === 'dedo_anel_2') {
      const r1 = slotKey === 'dedo_anel_1' ? selectedItem : updatedSlots.dedo_anel_1;
      const r2 = slotKey === 'dedo_anel_2' ? selectedItem : updatedSlots.dedo_anel_2;
      newRing = r1 || r2 || null;
      setEquippedRing(newRing);
      character.equipped_ring = newRing;
    }

    setEquipmentSlots(updatedSlots);
    character.equipment_slots = updatedSlots;

    syncInventoryEquipSlots(character, updatedSlots);

    const newAc = calculateTotalAc(
      character,
      newArmor,
      newShield,
      newRing,
      character.fighting_style,
      character.character_inventory
    );
    setCurrentAc(newAc);

    try {
      if (character.id) {
        await updateCharacter(character.id, {
          equipment_slots: updatedSlots,
          equipped_armor: newArmor,
          equipped_shield: newShield,
          equipped_ring: newRing,
          armor_class: newAc,
          character_inventory: character.character_inventory,
        });
      }
      const is2H = selectedItem && isTwoHandedWeapon(selectedItem);
      setShopMessage({
        type: 'success',
        text: selectedItem
          ? is2H
            ? `⚔️ "${selectedItem}" (Arma de Duas Mãos) equipada! Ambos os slots de empunhadura foram ocupados.`
            : `🛡️ Item "${selectedItem}" equipado no espaço!`
          : `🧹 Espaço liberado com sucesso!`,
      });
      setTimeout(() => setShopMessage(null), 3500);
      if (onCharacterUpdated) onCharacterUpdated();
    } catch (err: any) {
      console.warn('Erro ao atualizar slots de equipamentos:', err);
    }
  };

  const handleToggleEquipInInventory = async (itemName: string) => {
    const currentlyEquippedSlots = Object.entries(equipmentSlots)
      .filter(([_, val]) => val === itemName)
      .map(([slotKey]) => slotKey);

    if (currentlyEquippedSlots.length > 0) {
      for (const slotKey of currentlyEquippedSlots) {
        await handleAssignSlot(slotKey, null);
      }
      return;
    }

    const compatibleSlots = ALL_SLOT_KEYS.filter(slotKey => isItemCompatibleWithSlot(itemName, slotKey));
    if (compatibleSlots.length === 0) {
      setShopMessage({ type: 'error', text: `⚠️ O item "${itemName}" não pode ser equipado em nenhum espaço.` });
      setTimeout(() => setShopMessage(null), 3500);
      return;
    }

    const emptySlot = compatibleSlots.find(slotKey => !equipmentSlots[slotKey]);
    const targetSlot = emptySlot || compatibleSlots[0];

    await handleAssignSlot(targetSlot, itemName);
  };

  return {
    handleAssignSlot,
    handleToggleEquipInInventory,
  };
}
