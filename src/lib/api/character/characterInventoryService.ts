import { supabase, isSupabaseConfigured } from '../supabase';
import { getLocalCharacters, saveLocalCharacters } from './storage';
import { getItemById, findOrFetchItemIdByName } from '../itemsService';
import { syncInventoryEquipSlotsInternal } from './helpers/characterSlotSync';

export async function addItemToInventory(
  characterId: string,
  itemIdOrName: string,
  quantity: number = 1,
  equipSlot: string | null = null
): Promise<any> {
  let itemId = itemIdOrName;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(itemIdOrName);

  if (!isSupabaseConfigured) {
    const local = getLocalCharacters();
    const char = local.find(c => c.id === characterId);
    const syntheticId = `inv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const itemObj = getItemById(itemId) || { id: itemId, name: itemIdOrName };

    if (char) {
      if (!char.character_inventory) char.character_inventory = [];
      const existing = char.character_inventory.find((i: any) => i.item_id === itemId || i.name === itemIdOrName);
      if (existing) {
        existing.quantity = (existing.quantity || 1) + quantity;
        if (equipSlot) existing.equip_slot = equipSlot;
        saveLocalCharacters(local);
        return existing;
      } else {
        const newEntry = {
          id: syntheticId,
          character_id: characterId,
          item_id: itemId,
          quantity,
          equip_slot: equipSlot,
          items: itemObj,
          name: itemObj?.name || itemIdOrName
        };
        char.character_inventory.push(newEntry);
        saveLocalCharacters(local);
        return newEntry;
      }
    }
    return {
      id: syntheticId,
      character_id: characterId,
      item_id: itemId,
      quantity,
      equip_slot: equipSlot,
      items: itemObj,
      name: itemObj?.name || itemIdOrName
    };
  }

  try {
    if (!isUuid) {
      const fetchedId = await findOrFetchItemIdByName(itemIdOrName);
      if (!fetchedId) {
        throw new Error(`Item "${itemIdOrName}" não foi encontrado na tabela public.items do banco.`);
      }
      itemId = fetchedId;
    }

    // Busca item existente no inventário
    const { data: existing } = await (supabase.from('character_inventory') as any)
      .select('*')
      .eq('character_id', characterId)
      .eq('item_id', itemId)
      .maybeSingle();

    const existingObj: any = existing;

    if (existingObj) {
      const { data, error } = await (supabase
        .from('character_inventory') as any)
        .update({
          quantity: existingObj.quantity + quantity,
          equip_slot: equipSlot ?? existingObj.equip_slot ?? null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingObj.id)
        .select('*, items(*)')
        .maybeSingle();
      if (error) throw error;
      return data;
    }

    const { data, error } = await (supabase
      .from('character_inventory') as any)
      .insert({ character_id: characterId, item_id: itemId, quantity, equip_slot: equipSlot })
      .select('*, items(*)')
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (networkErr) {
    console.warn('Fallback local para addItemToInventory após erro:', networkErr);
    const local = getLocalCharacters();
    const char = local.find(c => c.id === characterId);
    const syntheticId = `inv-${Date.now()}`;
    const itemObj = getItemById(itemId) || { id: itemId, name: itemIdOrName };
    if (char) {
      if (!char.character_inventory) char.character_inventory = [];
      const existing = char.character_inventory.find((i: any) => i.item_id === itemId || i.name === itemIdOrName);
      if (existing) {
        existing.quantity = (existing.quantity || 1) + quantity;
        if (equipSlot) existing.equip_slot = equipSlot;
        saveLocalCharacters(local);
        return existing;
      }
      const newEntry = {
        id: syntheticId,
        character_id: characterId,
        item_id: itemId,
        quantity,
        equip_slot: equipSlot,
        items: itemObj,
        name: itemObj?.name || itemIdOrName
      };
      char.character_inventory.push(newEntry);
      saveLocalCharacters(local);
      return newEntry;
    }
    return {
      id: syntheticId,
      character_id: characterId,
      item_id: itemId,
      quantity,
      equip_slot: equipSlot,
      items: itemObj,
      name: itemObj?.name || itemIdOrName
    };
  }
}

export async function removeItemFromInventory(inventoryId: string): Promise<void> {
  const updateLocal = () => {
    const local = getLocalCharacters();
    let changed = false;
    for (const c of local) {
      if (c.character_inventory && Array.isArray(c.character_inventory)) {
        const lenBefore = c.character_inventory.length;
        c.character_inventory = c.character_inventory.filter((i: any) => i.id !== inventoryId);
        if (c.character_inventory.length !== lenBefore) changed = true;
      }
    }
    if (changed) saveLocalCharacters(local);
  };

  if (!isSupabaseConfigured) {
    updateLocal();
    return;
  }

  try {
    const { error } = await (supabase
      .from('character_inventory') as any)
      .delete()
      .eq('id', inventoryId);

    if (error) {
      console.warn('Aviso ao remover do Supabase:', error);
    }
  } catch (err) {
    console.warn('Aviso de rede ao remover item do inventário no Supabase:', err);
  } finally {
    updateLocal();
  }
}

export async function updateItemQuantity(inventoryId: string, quantity: number): Promise<void> {
  if (quantity <= 0) {
    await removeItemFromInventory(inventoryId);
    return;
  }

  const updateLocal = () => {
    const local = getLocalCharacters();
    let changed = false;
    for (const c of local) {
      if (c.character_inventory && Array.isArray(c.character_inventory)) {
        const item = c.character_inventory.find((i: any) => i.id === inventoryId);
        if (item) {
          item.quantity = quantity;
          changed = true;
        }
      }
    }
    if (changed) saveLocalCharacters(local);
  };

  if (!isSupabaseConfigured) {
    updateLocal();
    return;
  }

  try {
    const { error } = await (supabase
      .from('character_inventory') as any)
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq('id', inventoryId);

    if (error) {
      console.warn('Aviso ao atualizar quantidade no Supabase:', error);
    }
  } catch (err) {
    console.warn('Aviso de rede ao atualizar quantidade no Supabase:', err);
  } finally {
    updateLocal();
  }
}

export async function updateItemEquipSlot(inventoryId: string, equipSlot: string | null): Promise<void> {
  const updateLocal = () => {
    const local = getLocalCharacters();
    let changed = false;
    for (const c of local) {
      if (c.character_inventory && Array.isArray(c.character_inventory)) {
        const item = c.character_inventory.find((i: any) => i.id === inventoryId);
        if (item) {
          item.equip_slot = equipSlot;
          changed = true;
        }
      }
    }
    if (changed) saveLocalCharacters(local);
  };

  if (!isSupabaseConfigured) {
    updateLocal();
    return;
  }

  try {
    const { error } = await (supabase
      .from('character_inventory') as any)
      .update({ equip_slot: equipSlot, updated_at: new Date().toISOString() })
      .eq('id', inventoryId);

    if (error) {
      console.warn('Aviso ao atualizar equip_slot no Supabase:', error);
    }
  } catch (err) {
    console.warn('Aviso de rede ao atualizar equip_slot no Supabase:', err);
  } finally {
    updateLocal();
  }
}

export async function syncInventoryEquipSlots(
  characterId: string,
  characterInventory: any[],
  equipmentSlots: Record<string, string | null>
): Promise<void> {
  return syncInventoryEquipSlotsInternal(characterId, characterInventory, equipmentSlots, updateItemEquipSlot);
}
