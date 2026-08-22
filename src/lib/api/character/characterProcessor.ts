import { supabase } from '../supabase';
import { BACKGROUNDS_REFERENCE } from '../references';
import { normalizeCharacterInventoryAndSlots } from './helpers/characterInventoryNormalizer';
import { syncCharacterCalculatedAC, syncCharacterCalculatedHP } from './helpers/characterStatsCalculator';

export function processCharacterRow(char: any): any {
  let goldNumber = char.gp || 0;
  if (char.sp) goldNumber += char.sp / 10;
  if (char.cp) goldNumber += char.cp / 100;
  if (char.ep) goldNumber += char.ep / 2;
  if (char.pp) goldNumber += char.pp * 10;
  char.coins = `${goldNumber % 1 === 0 ? goldNumber : goldNumber.toFixed(2)} PO`;
  
  if (char.conditions) {
    if (typeof char.conditions === "string") {
      try { char.conditions = JSON.parse(char.conditions); } catch(e) { char.conditions = []; }
    }
  } else {
    char.conditions = [];
  }
  
  if (char.defeated_monsters) {
    char.defeatedMonsters = char.defeated_monsters;
  }
  if (char.giant_ancestry) {
    char.giantAncestry = char.giant_ancestry;
  }

  // Preencher campos de nomes a partir dos relacionamentos de tabelas caso as colunas diretas tenham sido removidas
  if (char.races) {
    char.race = char.races.name;
  }
  if (char.classes) {
    char.class_name = char.classes.name;
  }
  if (char.backgrounds) {
    char.background = char.backgrounds.name;
  }

  // Processar character_classes (3A - Suporte a classes e multiclasse)
  const charLevel = char.level || 1;
  char.class_level = charLevel;

  if (char.character_classes && Array.isArray(char.character_classes) && char.character_classes.length > 0) {
    char.characterClasses = char.character_classes;
    const primaryClass = char.character_classes[0];
    if (primaryClass) {
      if (primaryClass.classes?.name && !char.class_name) {
        char.class_name = primaryClass.classes.name;
      }
      if (primaryClass.subclass && !char.subclass) {
        char.subclass = primaryClass.subclass;
        char.subclass_name = primaryClass.subclass;
      }

      // Se o class_level, hit_dice ou hit_dice_current em character_classes estiver desatualizado, auto-sincronizar
      char.hit_dice = primaryClass.hit_dice || (primaryClass.classes?.hit_point_die ? primaryClass.classes.hit_point_die : 'd8');
      
      const currentLevelValue = Number(charLevel) || 1;
      const rawCurrentHD = primaryClass.hit_dice_current;
      char.hit_dice_current = (rawCurrentHD !== null && rawCurrentHD !== undefined)
        ? Math.min(rawCurrentHD, currentLevelValue)
        : currentLevelValue;

      const targetHitDice = char.hit_dice;
      const targetHitDiceCurrent = char.hit_dice_current;
      if (primaryClass.class_level !== currentLevelValue || primaryClass.hit_dice_current !== targetHitDiceCurrent || primaryClass.hit_dice !== targetHitDice) {
        primaryClass.class_level = currentLevelValue;
        primaryClass.hit_dice = targetHitDice;
        primaryClass.hit_dice_current = targetHitDiceCurrent;
        (supabase.from('character_classes') as any)
          .update({ class_level: currentLevelValue, hit_dice: targetHitDice, hit_dice_current: targetHitDiceCurrent })
          .eq('id', primaryClass.id)
          .then(() => {})
          .catch(() => {});
      }
    }
  } else {
    if (!char.hit_dice) char.hit_dice = 'd8';
    if (char.hit_dice_current === undefined || char.hit_dice_current === null) {
      char.hit_dice_current = charLevel;
    }
  }

  // Processar character_choices (3B - Migração de escolhas do personagem)
  if (char.character_choices && Array.isArray(char.character_choices)) {
    char.character_choices.forEach((choice: any) => {
      const featName = choice.feature_name || choice.choice_type;
      const val = choice.choice_value;
      if (!featName || !val) return;

      if (featName === 'draconic_ancestry') {
        char.draconic_ancestry = val;
        char.draconicAncestry = val;
      } else if (featName === 'giant_ancestry') {
        char.giant_ancestry = val;
        char.giantAncestry = val;
      } else if (featName === 'origin_feat') {
        char.origin_feat = val;
        char.originFeat = val;
      } else if (featName === 'fighting_style') {
        char.fighting_style = val;
        char.fighting_style_locked = true;
      } else if (featName === 'subclass') {
        char.subclass = val;
        char.subclass_name = val;
        char.subclass_locked = true;
      } else if (featName.startsWith('bgBonus_')) {
        if (!char.bgBonuses) char.bgBonuses = [];
        char.bgBonuses.push({ stat: featName.replace('bgBonus_', ''), value: Number(val) });
      } else if (featName === 'level_choices' || featName.endsWith('_choices')) {
        try {
          const parsed = typeof val === 'string' ? JSON.parse(val) : val;
          if (featName === 'level_choices') {
            char.level_choices = Array.isArray(parsed) ? parsed : [parsed];
          }
          if (Array.isArray(parsed)) {
            parsed.forEach((lc: any) => {
              if (lc.fightingStyle) {
                char.fighting_style = char.fighting_style || lc.fightingStyle;
                char.fighting_style_locked = true;
              }
              if (lc.subclass) {
                char.subclass = char.subclass || lc.subclass;
                char.subclass_name = char.subclass_name || lc.subclass;
                char.subclass_locked = true;
              }
            });
          } else if (parsed && typeof parsed === 'object') {
            if (parsed.fightingStyle) {
              char.fighting_style = char.fighting_style || parsed.fightingStyle;
              char.fighting_style_locked = true;
            }
            if (parsed.subclass) {
              char.subclass = char.subclass || parsed.subclass;
              char.subclass_name = char.subclass_name || parsed.subclass;
              char.subclass_locked = true;
            }
          }
        } catch (e) {
          if (featName === 'level_choices') char.level_choices = val;
        }
      }
    });
  }

  if (char.fighting_style) {
    char.fighting_style_locked = true;
  }
  if (char.subclass || char.subclass_name) {
    char.subclass_locked = true;
  }

  // Mapear originFeat fallback
  if (!char.originFeat && char.origin_feat) {
    char.originFeat = char.origin_feat;
  }
  if (!char.originFeat && Array.isArray(char.feats) && char.feats.length > 0) {
    char.originFeat = char.feats.join(', ');
  }
  if (!char.originFeat && char.background && BACKGROUNDS_REFERENCE[char.background]?.feat) {
    char.originFeat = BACKGROUNDS_REFERENCE[char.background].feat;
  }

  // Sincroniza e normaliza o inventário e equipamentos
  normalizeCharacterInventoryAndSlots(char);

  if (char.character_feats && Array.isArray(char.character_feats)) {
    char.feats = char.character_feats.map((f: any) => f.feats?.name).filter(Boolean);
    const originFeatObj = char.character_feats.find((f: any) => f.source === "origem" || f.source === "migrado");
    if (originFeatObj && !char.originFeat) char.originFeat = originFeatObj.feats?.name;
  }
  if (char.character_spells && Array.isArray(char.character_spells)) {
    char.spells = char.character_spells.map((s: any) => s.spells?.name).filter(Boolean);
  }

  // Sincroniza CA e HP calculados
  syncCharacterCalculatedAC(char);
  syncCharacterCalculatedHP(char);

  return char;
}
