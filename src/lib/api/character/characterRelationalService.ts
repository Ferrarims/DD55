import { supabase } from '../supabase';

// ==========================================
// SPELLS CRUD METHODS (Relational Tables)
// ==========================================

export async function addSpellToCharacter(
  characterId: string,
  spellId: string,
  isPrepared: boolean = false,
  isAlwaysPrepared: boolean = false,
  source: string | null = null
): Promise<any> {
  const { data, error } = await (supabase
    .from('character_spells') as any)
    .insert({
      character_id: characterId,
      spell_id: spellId,
      is_prepared: isPrepared,
      is_always_prepared: isAlwaysPrepared,
      source
    })
    .select('*, spells(*)')
    .single();

  if (error) throw error;
  return data;
}

export async function removeSpellFromCharacter(characterSpellId: string): Promise<void> {
  const { error } = await (supabase
    .from('character_spells') as any)
    .delete()
    .eq('id', characterSpellId);

  if (error) throw error;
}

export async function updateCharacterSpell(
  characterSpellId: string,
  updates: { is_prepared?: boolean; is_always_prepared?: boolean }
): Promise<void> {
  const { error } = await (supabase
    .from('character_spells') as any)
    .update(updates)
    .eq('id', characterSpellId);

  if (error) throw error;
}

// ==========================================
// FEATS CRUD METHODS (Relational Tables)
// ==========================================

export async function addFeatToCharacter(
  characterId: string,
  featId: string,
  source: string | null = null
): Promise<any> {
  const { data, error } = await (supabase
    .from('character_feats') as any)
    .insert({ character_id: characterId, feat_id: featId, source })
    .select('*, feats(*)')
    .single();

  if (error) throw error;
  return data;
}

export async function removeFeatFromCharacter(characterFeatId: string): Promise<void> {
  const { error } = await (supabase
    .from('character_feats') as any)
    .delete()
    .eq('id', characterFeatId);

  if (error) throw error;
}

// ==========================================
// CHOICES CRUD METHODS (Relational Tables)
// ==========================================

export async function saveChoiceToCharacter(
  characterId: string,
  featureName: string,
  choiceValue: any,
  source: string | null = null
): Promise<any> {
  if (!characterId || !featureName || choiceValue === undefined || choiceValue === null) return null;
  
  const valStr = typeof choiceValue === 'object' ? JSON.stringify(choiceValue) : String(choiceValue);

  try {
    const { data: existing } = await (supabase.from('character_choices') as any)
      .select('id')
      .eq('character_id', characterId)
      .eq('feature_name', featureName)
      .maybeSingle();

    if (existing?.id) {
      const { data, error } = await (supabase.from('character_choices') as any)
        .update({ choice_value: valStr, source })
        .eq('id', existing.id)
        .select('*')
        .maybeSingle();
      if (error) console.warn("Erro ao atualizar choice:", featureName, error);
      return data;
    } else {
      const { data, error } = await (supabase.from('character_choices') as any)
        .insert({ character_id: characterId, feature_name: featureName, choice_value: valStr, source })
        .select('*')
        .maybeSingle();
      if (error) console.warn("Erro ao inserir choice:", featureName, error);
      return data;
    }
  } catch (err) {
    console.warn("Falha ao salvar escolha em character_choices:", featureName, err);
    return null;
  }
}

export async function addChoiceToCharacter(
  characterId: string,
  featureName: string,
  choiceValue: string,
  source: string | null = null
): Promise<any> {
  return saveChoiceToCharacter(characterId, featureName, choiceValue, source);
}

export async function removeChoiceFromCharacter(choiceId: string): Promise<void> {
  const { error } = await (supabase
    .from('character_choices') as any)
    .delete()
    .eq('id', choiceId);

  if (error) throw error;
}


