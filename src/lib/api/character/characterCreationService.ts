import { supabase, isSupabaseConfigured } from '../supabase';
import { getAuthUserId } from './storage';
import { classTranslation, raceTranslation, CHAR_SELECT_WITH_ATTACKS, CHAR_SELECT_SAFE } from './characterConstants';
import { createLocalCharacter } from './helpers/localCharacterCreator';
import { resolveCreationIds, buildCharacterRow } from './creation/buildCharacterRowPayload';
import { saveInitialRelationalData } from './creation/saveInitialRelationalData';
import { populateInitialInventory } from './creation/populateInitialInventory';

export { createLocalCharacter, classTranslation, raceTranslation, CHAR_SELECT_WITH_ATTACKS, CHAR_SELECT_SAFE };

export async function createCharacter(characterData: any, session: any): Promise<any> {
  if (!isSupabaseConfigured) {
    return createLocalCharacter(characterData);
  }

  try {
    let userId = session?.user?.id;
    
    if (!userId) {
      const { data } = await supabase.auth.signInAnonymously().catch(() => ({ data: null, error: null }));
      userId = data?.user?.id;
    }

    if (!userId) {
      console.warn("Sem sessão de usuário no Supabase, salvando localmente.");
      return createLocalCharacter(characterData);
    }
  } catch (authErr) {
    console.warn("Falha de autenticação ao criar personagem no Supabase, usando local:", authErr);
    return createLocalCharacter(characterData);
  }

  const ids = await resolveCreationIds(characterData);

  let currentUserId = session?.user?.id;
  if (!currentUserId) {
    currentUserId = await getAuthUserId();
  }

  if (!currentUserId) {
    throw new Error('Usuário não autenticado. Faça login com sua conta para criar personagens.');
  }

  const characterRow = buildCharacterRow(characterData, currentUserId, ids);

  let insertedChar = null;
  let charError = null;

  try {
    const { data, error } = await (supabase
      .from('characters') as any)
      .insert(characterRow)
      .select('*, races(name), classes(name), backgrounds(name)')
      .single();
    insertedChar = data;
    charError = error;
  } catch (err) {
    const fallbackRow = { ...characterRow };
    delete fallbackRow.user_id;
    const { data, error } = await (supabase
      .from('characters') as any)
      .insert(fallbackRow)
      .select('*, races(name), classes(name), backgrounds(name)')
      .single();
    insertedChar = data;
    charError = error;
  }

  if (charError) {
    throw charError;
  }

  const charObj: any = insertedChar;

  if (characterData.originFeat) {
    charObj.originFeat = characterData.originFeat;
  }
  if (Array.isArray(characterData.feats)) {
    charObj.feats = characterData.feats;
  }
  
  // Salvar registros relacionais (classes, escolhas, talentos, magias)
  try {
    await saveInitialRelationalData(charObj, characterData, ids);
    return await populateInitialInventory(charObj, characterData);
  } catch (err) {
    console.error("Erro ao salvar relações em createCharacter:", err);
    return charObj;
  }
}
