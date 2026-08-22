import { supabase, isSupabaseConfigured } from '../../supabase';
import { getCachedEquipmentReference } from '../../itemsService';

export async function syncInventoryEquipSlotsInternal(
  characterId: string,
  characterInventory: any[],
  equipmentSlots: Record<string, string | null>,
  updateItemEquipSlotFn: (inventoryId: string, equipSlot: string | null) => Promise<void>
): Promise<void> {
  if (!characterId) return;

  const slotEntries = Object.entries(equipmentSlots || {}).filter(([_, name]) => name && typeof name === 'string');

  if (Array.isArray(characterInventory) && characterInventory.length > 0) {
    for (const inv of characterInventory) {
      if (inv && inv.id) {
        try {
          await updateItemEquipSlotFn(inv.id, inv.equip_slot ?? null);
        } catch (e) {
          console.warn(`Erro ao atualizar equip_slot para inv.id=${inv.id}:`, e);
        }
      }
    }
  }

  if (!isSupabaseConfigured) return;

  let currentInvRows: any[] = Array.isArray(characterInventory) ? [...characterInventory] : [];

  try {
    const { data: invData, error } = await (supabase
      .from('character_inventory') as any)
      .select('id, item_id, equip_slot, items(name)')
      .eq('character_id', characterId);

    if (!error && invData) {
      currentInvRows = invData as any[];
    }

    const itemsRef = getCachedEquipmentReference();
    const assignedInvIds = new Set<string>();

    // 1. Sincronizar equip_slot na tabela character_inventory
    for (const [slotKey, itemName] of slotEntries) {
      if (!itemName) continue;
      const cleanSlotItemName = String(itemName).toLowerCase().trim();

      const matchedInv = currentInvRows.find((inv: any) => {
        if (assignedInvIds.has(inv.id)) return false;
        const rName = String(inv.items?.name || inv.name || (inv.item_id && itemsRef[inv.item_id] ? itemsRef[inv.item_id].name : '')).toLowerCase().trim();
        return rName === cleanSlotItemName || (cleanSlotItemName.length > 2 && rName.includes(cleanSlotItemName)) || (rName.length > 2 && cleanSlotItemName.includes(rName));
      });

      if (matchedInv) {
        assignedInvIds.add(matchedInv.id);
        if (matchedInv.equip_slot !== slotKey) {
          matchedInv.equip_slot = slotKey;
          await updateItemEquipSlotFn(matchedInv.id, slotKey);
        }
      }
    }

    for (const inv of currentInvRows) {
      if (!assignedInvIds.has(inv.id) && inv.equip_slot !== null) {
        const memMatch = Array.isArray(characterInventory) ? characterInventory.find(i => i.id === inv.id) : null;
        if (!memMatch || !memMatch.equip_slot) {
          inv.equip_slot = null;
          await updateItemEquipSlotFn(inv.id, null);
        }
      }
    }

    if (Array.isArray(characterInventory)) {
      characterInventory.forEach((inv: any) => {
        const rowMatch = currentInvRows.find(r => r.id === inv.id);
        if (rowMatch) {
          inv.equip_slot = rowMatch.equip_slot;
        }
      });
    }
  } catch (err) {
    console.warn('Erro em syncInventoryEquipSlots:', err);
  }
}
