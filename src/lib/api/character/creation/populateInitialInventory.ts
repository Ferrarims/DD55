import { supabase } from '../../supabase';
import { addItemToInventory, syncInventoryEquipSlots } from '../characterInventoryService';
import { findOrFetchItemIdByName } from '../../itemsService';
import { saveChoiceToCharacter } from '../characterRelationalService';
import { CHAR_SELECT_SAFE } from '../characterConstants';
import { processCharacterRow } from '../characterProcessor';

export async function populateInitialInventory(
  charObj: any,
  characterData: any
): Promise<any> {
  const itemsToInsert: any[] = Array.isArray(characterData.inventory) && characterData.inventory.length > 0
    ? characterData.inventory
    : (Array.isArray(characterData.equipment) ? characterData.equipment : []);

  const eqSlots = characterData.equipmentSlots || characterData.equipment_slots || {};

  for (const eq of itemsToInsert) {
    try {
      let rawName = typeof eq === 'string' ? eq : (eq?.name || '');
      let itemId = typeof eq === 'object' && eq?.id ? eq.id : null;
      let qty = typeof eq === 'object' && eq?.quantity ? eq.quantity : 1;

      if (typeof eq === 'string') {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(eq.trim());
        if (isUuid) {
          itemId = eq.trim();
        } else {
          const match = eq.match(/^(\d+)x?\s+/i);
          if (match) qty = parseInt(match[1], 10);
        }
      }

      if (!itemId && rawName) {
        itemId = await findOrFetchItemIdByName(rawName);
      }

      let initialSlot: string | null = null;
      if (rawName && eqSlots) {
        const cleanRawName = rawName.toLowerCase().trim();
        for (const [sKey, sVal] of Object.entries(eqSlots)) {
          if (sVal && typeof sVal === 'string') {
            const cleanSVal = sVal.toLowerCase().trim();
            if (cleanRawName === cleanSVal || (cleanRawName.length > 2 && cleanSVal.includes(cleanRawName)) || (cleanSVal.length > 2 && cleanRawName.includes(cleanSVal))) {
              initialSlot = sKey;
              break;
            }
          }
        }
      }

      if (itemId) {
        await addItemToInventory(charObj.id, itemId, qty, initialSlot);
      } else {
        console.warn("Item não encontrado no banco para:", rawName || eq);
      }
    } catch (e) {
      console.warn("Falha ao adicionar item ao inventário:", eq, e);
    }
  }
  
  if (itemsToInsert.length > 0) {
    try {
      await saveChoiceToCharacter(charObj.id, 'inventory_backup', JSON.stringify(itemsToInsert), 'criacao');
    } catch (e) {
      console.warn("Falha ao salvar backup do inventário em character_choices:", e);
    }
  }

  // Re-fetch character com todas as relações
  const { data: refetched } = await (supabase
     .from('characters') as any)
     .select(CHAR_SELECT_SAFE)
     .eq('id', charObj.id)
     .maybeSingle();

  if (refetched) {
    if (refetched.character_inventory) {
      await syncInventoryEquipSlots(refetched.id, refetched.character_inventory, characterData.equipmentSlots || characterData.equipment_slots || {});
    }
    return processCharacterRow(refetched);
  }

  return processCharacterRow(charObj);
}
