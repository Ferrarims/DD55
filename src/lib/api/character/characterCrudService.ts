import { supabase, isSupabaseConfigured } from '../supabase';
import { getLocalCharacters, saveLocalCharacters, getAuthUserId } from './storage';
import { processCharacterRow } from './characterProcessor';
import { syncInventoryEquipSlots } from './characterInventoryService';
import { CHAR_SELECT_WITH_ATTACKS, CHAR_SELECT_SAFE } from './characterConstants';
import { prepareAndSyncUpdatePayload } from './helpers/characterPayloadSanitizer';

export async function getCharacters(): Promise<any[]> {
  const currentUserId = await getAuthUserId();
  if (!currentUserId) {
    return [];
  }

  if (!isSupabaseConfigured) {
    const allLocal = getLocalCharacters();
    const filteredLocal = allLocal.filter(c => c.user_id === currentUserId);
    return filteredLocal.map(processCharacterRow);
  }

  try {
    const res = await supabase
      .from('characters')
      .select(CHAR_SELECT_SAFE)
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false });

    if (res.error) {
      console.warn('Erro ao buscar personagens no Supabase:', res.error);
      const allLocal = getLocalCharacters();
      const filteredLocal = allLocal.filter(c => c.user_id === currentUserId);
      return filteredLocal.map(processCharacterRow);
    }

    const processed = (res.data || []).map(processCharacterRow);
    return processed;
  } catch (err) {
    console.warn('Falha de rede em getCharacters:', err);
    return [];
  }
}

/**
 * Busca todos os personagens pertencentes a um usuário específico (útil para administradores).
 */
export async function getCharactersByUserId(targetUserId: string): Promise<any[]> {
  if (!targetUserId) {
    return [];
  }

  if (!isSupabaseConfigured) {
    const allLocal = getLocalCharacters();
    const filteredLocal = allLocal.filter(c => c.user_id === targetUserId);
    return filteredLocal.map(processCharacterRow);
  }

  try {
    const res = await supabase
      .from('characters')
      .select(CHAR_SELECT_SAFE)
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false });

    if (res.error) {
      console.warn('Erro ao buscar personagens por usuário no Supabase:', res.error);
      const allLocal = getLocalCharacters();
      const filteredLocal = allLocal.filter(c => c.user_id === targetUserId);
      return filteredLocal.map(processCharacterRow);
    }

    const rawChars = res.data || [];
    const processedChars = await Promise.all(
      rawChars.map(async (char: any) => {
        if (!char.character_inventory || char.character_inventory.length === 0) {
          try {
            const { data: invData } = await (supabase
              .from('character_inventory') as any)
              .select('*, items(*)')
              .eq('character_id', char.id);
            if (invData && invData.length > 0) {
              char.character_inventory = invData;
            }
          } catch (e) {}
        }
        return processCharacterRow(char);
      })
    );

    return processedChars;
  } catch (err) {
    console.warn('Falha de rede em getCharactersByUserId:', err);
    return [];
  }
}

export async function getCharacterById(charId: string): Promise<any> {
  if (!isSupabaseConfigured) {
    const local = getLocalCharacters().find(c => c.id === charId);
    return local ? processCharacterRow(local) : null;
  }

  try {
    const queryRes = await supabase
      .from('characters')
      .select(CHAR_SELECT_SAFE)
      .eq('id', charId)
      .maybeSingle();

    const resObj: any = queryRes;
    if (resObj.error) {
      console.warn('Erro ao buscar personagem por ID no Supabase, buscando local:', resObj.error);
      const local = getLocalCharacters().find(c => c.id === charId);
      return local ? processCharacterRow(local) : null;
    }

    if (resObj.data) {
      const char = resObj.data;
      if (!char.character_inventory || char.character_inventory.length === 0) {
        try {
          const { data: invData } = await (supabase
            .from('character_inventory') as any)
            .select('*, items(*)')
            .eq('character_id', char.id);
          if (invData && invData.length > 0) {
            char.character_inventory = invData;
          }
        } catch (e) {}
      }
      return processCharacterRow(char);
    }
    const local = getLocalCharacters().find(c => c.id === charId);
    return local ? processCharacterRow(local) : null;
  } catch (err) {
    console.warn('Falha de rede em getCharacterById:', err);
    const local = getLocalCharacters().find(c => c.id === charId);
    return local ? processCharacterRow(local) : null;
  }
}

export async function deleteCharacter(id: string): Promise<void> {
  const localList = getLocalCharacters().filter(c => c.id !== id);
  saveLocalCharacters(localList);

  if (!isSupabaseConfigured) {
    return;
  }

  try {
    try {
      await supabase.from('character_inventory').delete().eq('character_id', id);
      await supabase.from('character_feats').delete().eq('character_id', id);
      await supabase.from('character_spells').delete().eq('character_id', id);
      await supabase.from('character_classes').delete().eq('character_id', id);
      await supabase.from('character_choices').delete().eq('character_id', id);
    } catch (e) {}

    const { error: charError } = await supabase
      .from('characters')
      .delete()
      .eq('id', id);

    if (charError) {
      console.warn('Erro ao deletar personagem no Supabase:', charError);
    }
  } catch (err) {
    console.warn('Falha de conexão ao deletar personagem do Supabase:', err);
  }
}

export async function updateCharacter(id: string, payload: any): Promise<void> {
  // Atualizar cópia local no localStorage
  const localList = getLocalCharacters();
  const localIdx = localList.findIndex(c => c.id === id);
  if (localIdx !== -1) {
    localList[localIdx] = {
      ...localList[localIdx],
      ...payload,
      updated_at: new Date().toISOString()
    };
    saveLocalCharacters(localList);
  }

  if (!isSupabaseConfigured) {
    return;
  }

  const cleanPayload = await prepareAndSyncUpdatePayload(id, payload);

  try {
    const { error } = await (supabase
      .from('characters') as any)
      .update({
        ...cleanPayload,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.warn("Aviso ao atualizar no Supabase:", error);
    }
  } catch (updateErr) {
    console.warn("Erro de conexão ao atualizar no Supabase:", updateErr);
  }

  if (payload.equipment_slots || payload.equipmentSlots) {
    try {
      await syncInventoryEquipSlots(
        id,
        payload.character_inventory || [],
        payload.equipment_slots || payload.equipmentSlots
      );
    } catch (invErr) {
      console.warn("Erro ao sincronizar equip_slot em updateCharacter:", invErr);
    }
  }
}

export async function saveCharacterFeatures(characterId: string, coreData: any, featuresData: any): Promise<void> {
  if (!characterId) return;

  try {
    const cleanFeatures = { ...featuresData };
    delete cleanFeatures.race;
    delete cleanFeatures.class_name;
    delete cleanFeatures.background;
    
    const combinedPayload = {
      ...coreData,
      ...cleanFeatures
    };

    await updateCharacter(characterId, combinedPayload);
  } catch (err) {
    console.warn("Erro ao atualizar characters em saveCharacterFeatures:", err);
  }
}
