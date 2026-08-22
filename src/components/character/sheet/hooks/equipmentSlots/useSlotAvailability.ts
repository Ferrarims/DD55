import { getCachedEquipmentReference } from '../../../../../lib/api/itemsService';

export interface UseSlotAvailabilityProps {
  character: any;
  equipmentSlots: Record<string, string | null>;
  isItemCompatibleWithSlot: (itemName: string, slotKey: string) => boolean;
}

export function useSlotAvailability({
  character,
  equipmentSlots,
  isItemCompatibleWithSlot,
}: UseSlotAvailabilityProps) {
  const getInventoryMap = () => {
    const inventoryMap = new Map<string, number>();
    const itemsRef = getCachedEquipmentReference();
    const rawInv =
      character.character_inventory && character.character_inventory.length > 0
        ? character.character_inventory
        : Array.isArray(character.equipment)
        ? character.equipment
        : Array.isArray(character.inventory)
        ? character.inventory
        : [];

    rawInv.forEach((inv: any) => {
      let itemName =
        typeof inv === 'string'
          ? inv
          : inv.items?.name ||
            inv.name ||
            inv.item_name ||
            (inv.item_id && itemsRef[inv.item_id] ? itemsRef[inv.item_id].name : null);
      let qty = typeof inv === 'object' && inv?.quantity ? inv.quantity : 1;
      if (typeof inv === 'string') {
        const match = inv.match(/^(\d+)x?\s+(.+)$/i);
        if (match) {
          qty = parseInt(match[1], 10);
          itemName = match[2];
        }
      }
      if (itemName) {
        inventoryMap.set(itemName, (inventoryMap.get(itemName) || 0) + qty);
      }
    });
    return inventoryMap;
  };

  const getAvailableItemsForSlot = (slotKey: string, currentValue: string) => {
    const inventoryMap = getInventoryMap();
    const uniqueItems = Array.from(inventoryMap.keys());
    return uniqueItems
      .filter(item => {
        if (currentValue && item === currentValue) return true;
        if (!isItemCompatibleWithSlot(item, slotKey)) return false;

        const countInInventory = inventoryMap.get(item) || 0;
        const countEquippedElsewhere = Object.entries(equipmentSlots)
          .filter(([k]) => k !== slotKey)
          .filter(([_, v]) => v === item).length;

        return countInInventory > countEquippedElsewhere;
      })
      .sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
  };

  return {
    getInventoryMap,
    getAvailableItemsForSlot,
  };
}
