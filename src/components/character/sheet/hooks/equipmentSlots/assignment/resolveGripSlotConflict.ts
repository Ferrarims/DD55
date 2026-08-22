import {
  isTwoHandedWeapon,
  isCrossbow,
  blocksShield,
} from '../../../../../../lib/mechanics/acCalculator';

interface ResolveGripProps {
  slotKey: string;
  selectedItem: string | null;
  equipmentSlots: Record<string, string | null>;
  updatedSlots: Record<string, string | null>;
  equippedShield: string | null;
  setEquippedShield: (shield: string | null) => void;
  character: any;
}

export function resolveGripSlotConflict({
  slotKey,
  selectedItem,
  equipmentSlots,
  updatedSlots,
  equippedShield,
  setEquippedShield,
  character,
}: ResolveGripProps): {
  newSlots: Record<string, string | null>;
  newShield: string | null;
} {
  let newShield = equippedShield;
  let finalSlots = { ...updatedSlots };

  const otherSlotKey = slotKey === 'empunhadura_1' ? 'empunhadura_2' : 'empunhadura_1';
  const previousItemThisSlot = equipmentSlots[slotKey];
  const previousItemOtherSlot = equipmentSlots[otherSlotKey];

  if (selectedItem) {
    const isShieldItem = selectedItem.toLowerCase().includes('escudo');
    const is2H = isTwoHandedWeapon(selectedItem);
    const isCross = isCrossbow(selectedItem);

    if (is2H) {
      finalSlots = {
        ...finalSlots,
        empunhadura_1: selectedItem,
        empunhadura_2: selectedItem,
      };
      newShield = null;
      setEquippedShield(null);
      character.equipped_shield = null;
    } else if (isCross) {
      if (isTwoHandedWeapon(previousItemThisSlot) || isTwoHandedWeapon(previousItemOtherSlot)) {
        finalSlots.empunhadura_1 = null;
        finalSlots.empunhadura_2 = null;
      }
      finalSlots = {
        ...finalSlots,
        [slotKey]: selectedItem,
      };
      newShield = null;
      setEquippedShield(null);
      character.equipped_shield = null;
      if (
        slotKey === 'empunhadura_1' &&
        finalSlots.empunhadura_2 &&
        finalSlots.empunhadura_2.toLowerCase().includes('escudo')
      ) {
        finalSlots.empunhadura_2 = null;
      }
      if (
        slotKey === 'empunhadura_2' &&
        finalSlots.empunhadura_1 &&
        finalSlots.empunhadura_1.toLowerCase().includes('escudo')
      ) {
        finalSlots.empunhadura_1 = null;
      }
    } else if (isShieldItem) {
      newShield = selectedItem;
      setEquippedShield(selectedItem);
      character.equipped_shield = selectedItem;

      if (finalSlots.empunhadura_1 && blocksShield(finalSlots.empunhadura_1)) {
        finalSlots.empunhadura_1 = null;
      }
      if (finalSlots.empunhadura_2 && blocksShield(finalSlots.empunhadura_2)) {
        finalSlots.empunhadura_2 = null;
      }
      finalSlots[slotKey] = selectedItem;
    } else {
      if (
        (previousItemOtherSlot && blocksShield(previousItemOtherSlot)) ||
        (previousItemThisSlot && blocksShield(previousItemThisSlot))
      ) {
        finalSlots.empunhadura_1 = null;
        finalSlots.empunhadura_2 = null;
        finalSlots[slotKey] = selectedItem;
      }

      if (slotKey === 'empunhadura_2' && equippedShield && selectedItem !== equippedShield) {
        newShield = null;
        setEquippedShield(null);
        character.equipped_shield = null;
      }
    }
  } else {
    if (
      (previousItemThisSlot && isTwoHandedWeapon(previousItemThisSlot)) ||
      (previousItemOtherSlot &&
        isTwoHandedWeapon(previousItemOtherSlot) &&
        previousItemOtherSlot === previousItemThisSlot)
    ) {
      finalSlots = {
        ...finalSlots,
        empunhadura_1: null,
        empunhadura_2: null,
      };
    }

    if (slotKey === 'empunhadura_2' && equippedShield) {
      newShield = null;
      setEquippedShield(null);
      character.equipped_shield = null;
    }
  }

  return {
    newSlots: finalSlots,
    newShield,
  };
}
