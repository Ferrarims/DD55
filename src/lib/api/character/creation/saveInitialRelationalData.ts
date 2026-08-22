import { supabase } from '../../supabase';
import { saveChoiceToCharacter, addFeatToCharacter, addSpellToCharacter } from '../characterRelationalService';
import { ResolvedCreationIds } from './buildCharacterRowPayload';

export async function saveInitialRelationalData(
  charObj: any,
  characterData: any,
  ids: ResolvedCreationIds
): Promise<void> {
  // 1. Salvar classe na tabela character_classes para suporte a multiclasse
  if (ids.classId) {
    try {
      const hitPointDie = ids.classHitPointDie || characterData.hit_dice || characterData.hitDice || 'd8';
      await (supabase.from('character_classes') as any).insert({
        character_id: charObj.id,
        class_id: ids.classId,
        subclass: characterData.subclass || characterData.subclass_name || null,
        class_level: characterData.level || 1,
        hit_dice: hitPointDie,
        hit_dice_current: characterData.hit_dice_current || characterData.level || 1
      });
    } catch (errClasses) {
      console.warn("Erro ao salvar classe inicial em character_classes:", errClasses);
    }
  }

  // 2. Salvar escolhas na tabela character_choices
  try {
    if (characterData.draconicAncestry || characterData.draconic_ancestry) {
      await saveChoiceToCharacter(charObj.id, 'draconic_ancestry', characterData.draconicAncestry || characterData.draconic_ancestry, 'raça');
    }
    if (characterData.giantAncestry || characterData.giant_ancestry) {
      await saveChoiceToCharacter(charObj.id, 'giant_ancestry', characterData.giantAncestry || characterData.giant_ancestry, 'raça');
    }
    if (characterData.originFeat || characterData.origin_feat) {
      await saveChoiceToCharacter(charObj.id, 'origin_feat', characterData.originFeat || characterData.origin_feat, 'antecedente');
    }
    if (characterData.fightingStyle || characterData.fighting_style) {
      await saveChoiceToCharacter(charObj.id, 'fighting_style', characterData.fightingStyle || characterData.fighting_style, 'classe');
    }
    if (characterData.subclass || characterData.subclass_name) {
      await saveChoiceToCharacter(charObj.id, 'subclass', characterData.subclass || characterData.subclass_name, 'classe');
    }
    if (characterData.level_choices) {
      await saveChoiceToCharacter(charObj.id, 'level_choices', characterData.level_choices, 'criacao');
    }
    if (characterData.bgBonuses && Array.isArray(characterData.bgBonuses)) {
      for (const bonus of characterData.bgBonuses) {
        await saveChoiceToCharacter(charObj.id, `bgBonus_${bonus.stat}`, bonus.value, 'criacao');
      }
    }
  } catch (errChoices) {
    console.warn("Erro ao salvar escolhas iniciais em character_choices:", errChoices);
  }

  // 3. Salvar talentos
  if (characterData.feats && Array.isArray(characterData.feats)) {
    for (const feat of characterData.feats) {
      try {
        const { data: fData } = await (supabase.from('feats') as any).select('id').ilike('name', feat).limit(1);
        if (fData && fData.length > 0) {
          await addFeatToCharacter(charObj.id, fData[0].id, 'migrado');
        }
      } catch(e) { console.warn("Failed to add feat", feat, e); }
    }
  }
  
  // 4. Salvar magias
  if (characterData.spells && Array.isArray(characterData.spells)) {
    for (const spell of characterData.spells) {
      try {
        const spellName = typeof spell === 'string' ? spell : spell.name;
        if (spellName) {
           const { data: sData } = await (supabase.from('spells') as any).select('id').ilike('name', spellName).limit(1);
           if (sData && sData.length > 0) {
             await addSpellToCharacter(charObj.id, sData[0].id, true, false, 'migrado');
           }
        }
      } catch(e) { console.warn("Failed to add spell", spell, e); }
    }
  }
}
