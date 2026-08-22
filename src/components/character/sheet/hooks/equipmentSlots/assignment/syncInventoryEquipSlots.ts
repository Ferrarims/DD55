import { updateItemEquipSlot } from '../../../../../../lib/api/characterService';

export function syncInventoryEquipSlots(
  character: any,
  updatedSlots: Record<string, string | null>
): void {
  if (!character?.character_inventory || !Array.isArray(character.character_inventory)) {
    return;
  }

  const slotEntries = Object.entries(updatedSlots).filter(([_, v]) => Boolean(v));
  const assigned = new Set<string>();

  for (const [sKey, sItem] of slotEntries) {
    const sName = String(sItem).toLowerCase().trim();
    const invItem = character.character_inventory.find((inv: any) => {
      if (assigned.has(inv.id)) return false;
      const rowName = String(inv.items?.name || inv.name || '').toLowerCase().trim();
      return (
        rowName === sName ||
        (sName.length > 2 && rowName.includes(sName)) ||
        (rowName.length > 2 && sName.includes(rowName))
      );
    });

    if (invItem) {
      assigned.add(invItem.id);
      if (invItem.equip_slot !== sKey) {
        invItem.equip_slot = sKey;
        if (invItem.id) {
          updateItemEquipSlot(invItem.id, sKey).catch(err =>
            console.warn('Erro ao atualizar equip_slot no inventario:', err)
          );
        }
      }
    }
  }

  character.character_inventory.forEach((inv: any) => {
    if (!assigned.has(inv.id)) {
      if (inv.equip_slot !== null) {
        inv.equip_slot = null;
        if (inv.id) {
          updateItemEquipSlot(inv.id, null).catch(err =>
            console.warn('Erro ao desequipar item no inventario:', err)
          );
        }
      }
    }
  });
}
