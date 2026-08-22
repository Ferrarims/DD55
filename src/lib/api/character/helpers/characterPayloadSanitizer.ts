import { supabase } from '../../supabase';
import { saveChoiceToCharacter } from '../characterRelationalService';

export async function prepareAndSyncUpdatePayload(id: string, payload: any): Promise<any> {
  const cleanPayload = { ...payload };

  // Mapear propriedades camelCase para snake_case se presentes
  if (cleanPayload.armorClass !== undefined && cleanPayload.armor_class === undefined) {
    cleanPayload.armor_class = cleanPayload.armorClass;
  }
  if (cleanPayload.ac !== undefined && cleanPayload.armor_class === undefined) {
    cleanPayload.armor_class = cleanPayload.ac;
  }
  if (cleanPayload.maxHp !== undefined && cleanPayload.max_hp === undefined) {
    cleanPayload.max_hp = cleanPayload.maxHp;
  }
  if (cleanPayload.currentHp !== undefined && cleanPayload.current_hp === undefined) {
    cleanPayload.current_hp = cleanPayload.currentHp;
  }
  if (cleanPayload.hp !== undefined && cleanPayload.current_hp === undefined) {
    cleanPayload.current_hp = cleanPayload.hp;
  }
  if (cleanPayload.tempHp !== undefined && cleanPayload.temp_hp === undefined) {
    cleanPayload.temp_hp = cleanPayload.tempHp;
  }
  if (cleanPayload.hitDice !== undefined && cleanPayload.hit_dice === undefined) {
    cleanPayload.hit_dice = cleanPayload.hitDice;
  }
  if (cleanPayload.hitDiceCurrent !== undefined && cleanPayload.hit_dice_current === undefined) {
    cleanPayload.hit_dice_current = cleanPayload.hitDiceCurrent;
  }
  if ((cleanPayload.exhaustion !== undefined || cleanPayload.exhaustionLevel !== undefined) && cleanPayload.exhaustion_level === undefined) {
    cleanPayload.exhaustion_level = cleanPayload.exhaustion_level ?? cleanPayload.exhaustionLevel ?? cleanPayload.exhaustion;
  }
  if (cleanPayload.deathSaveSuccesses !== undefined && cleanPayload.death_save_successes === undefined) {
    cleanPayload.death_save_successes = cleanPayload.deathSaveSuccesses;
  }
  if (cleanPayload.deathSaveFailures !== undefined && cleanPayload.death_save_failures === undefined) {
    cleanPayload.death_save_failures = cleanPayload.deathSaveFailures;
  }
  if (cleanPayload.classResources !== undefined && cleanPayload.class_resources === undefined) {
    cleanPayload.class_resources = cleanPayload.classResources;
  }
  if (cleanPayload.defeatedMonsters !== undefined && cleanPayload.defeated_monsters === undefined) {
    cleanPayload.defeated_monsters = cleanPayload.defeatedMonsters;
  }
  if (cleanPayload.raceId !== undefined && cleanPayload.race_id === undefined) {
    cleanPayload.race_id = cleanPayload.raceId;
  }
  if (cleanPayload.classId !== undefined && cleanPayload.class_id === undefined) {
    cleanPayload.class_id = cleanPayload.classId;
  }
  if (cleanPayload.backgroundId !== undefined && cleanPayload.background_id === undefined) {
    cleanPayload.background_id = cleanPayload.backgroundId;
  }
  if (cleanPayload.str !== undefined && cleanPayload.strength === undefined) {
    cleanPayload.strength = cleanPayload.str;
  }
  if (cleanPayload.dex !== undefined && cleanPayload.dexterity === undefined) {
    cleanPayload.dexterity = cleanPayload.dex;
  }
  if (cleanPayload.con !== undefined && cleanPayload.constitution === undefined) {
    cleanPayload.constitution = cleanPayload.con;
  }
  if (cleanPayload.int !== undefined && cleanPayload.intelligence === undefined) {
    cleanPayload.intelligence = cleanPayload.int;
  }
  if (cleanPayload.wis !== undefined && cleanPayload.wisdom === undefined) {
    cleanPayload.wisdom = cleanPayload.wis;
  }
  if (cleanPayload.cha !== undefined && cleanPayload.charisma === undefined) {
    cleanPayload.charisma = cleanPayload.cha;
  }

  if (cleanPayload.armor_class !== undefined && cleanPayload.armor_class !== null) {
    const parsedAc = Number(cleanPayload.armor_class);
    if (!isNaN(parsedAc) && parsedAc > 0) {
      cleanPayload.armor_class = Math.round(parsedAc);
    }
  }

  if (cleanPayload.coins !== undefined) {
    const coinsStr = String(cleanPayload.coins);
    const match = coinsStr.match(/\d+(?:\.\d+)?/);
    if (match) {
      const totalGold = parseFloat(match[0]);
      cleanPayload.gp = Math.floor(totalGold);
      cleanPayload.sp = Math.round((totalGold - cleanPayload.gp) * 10);
    }
    delete cleanPayload.coins;
  }
  
  if (cleanPayload.conditions !== undefined && typeof cleanPayload.conditions === "string") {
    cleanPayload.conditions = cleanPayload.conditions ? [cleanPayload.conditions] : [];
  }

  // 3B: Salvar escolhas na tabela character_choices antes de limpar
  try {
    if (payload.draconic_ancestry || payload.draconicAncestry) {
      await saveChoiceToCharacter(id, 'draconic_ancestry', payload.draconic_ancestry || payload.draconicAncestry, 'raça');
    }
    if (payload.giant_ancestry || payload.giantAncestry) {
      await saveChoiceToCharacter(id, 'giant_ancestry', payload.giant_ancestry || payload.giantAncestry, 'raça');
    }
    if (payload.origin_feat || payload.originFeat) {
      await saveChoiceToCharacter(id, 'origin_feat', payload.origin_feat || payload.originFeat, 'antecedente');
    }
    if (payload.fighting_style || payload.fightingStyle) {
      await saveChoiceToCharacter(id, 'fighting_style', payload.fighting_style || payload.fightingStyle, 'classe');
    }
    if (payload.subclass || payload.subclass_name) {
      await saveChoiceToCharacter(id, 'subclass', payload.subclass || payload.subclass_name, 'classe');
    }

    // Sincronizar dados na tabela character_classes (subclass, class_level, hit_dice, hit_dice_current)
    const classUpdateObj: any = {};
    if (payload.subclass || payload.subclass_name) {
      classUpdateObj.subclass = payload.subclass || payload.subclass_name;
    }
    if (payload.level !== undefined || payload.class_level !== undefined) {
      classUpdateObj.class_level = payload.level ?? payload.class_level;
    }
    if (payload.hit_dice !== undefined || payload.hitDice !== undefined) {
      classUpdateObj.hit_dice = payload.hit_dice ?? payload.hitDice;
    }
    if (payload.hit_dice_current !== undefined || payload.hitDiceCurrent !== undefined) {
      classUpdateObj.hit_dice_current = payload.hit_dice_current ?? payload.hitDiceCurrent;
    } else if (payload.level !== undefined) {
      classUpdateObj.hit_dice_current = payload.level;
    }

    if (Object.keys(classUpdateObj).length > 0) {
      try {
        await (supabase.from('character_classes') as any)
          .update(classUpdateObj)
          .eq('character_id', id);
      } catch (e) {
        console.warn("Erro ao atualizar character_classes:", e);
      }
    }
    if (payload.level_choices) {
      await saveChoiceToCharacter(id, 'level_choices', payload.level_choices, 'nivelamento');
    }
    if (payload.equipment || payload.character_inventory || payload.inventory) {
      const invToSave = payload.character_inventory || payload.equipment || payload.inventory;
      await saveChoiceToCharacter(id, 'inventory_backup', JSON.stringify(invToSave), 'inventario');
    }
    if (payload.bgBonuses && Array.isArray(payload.bgBonuses)) {
      for (const bonus of payload.bgBonuses) {
        await saveChoiceToCharacter(id, `bgBonus_${bonus.stat}`, bonus.value, 'criacao');
      }
    }
  } catch (errChoices) {
    console.warn("Erro ao sincronizar escolhas em character_choices:", errChoices);
  }

  // Remover campos de relacionamento e propriedades migradas
  const keysToRemove = [
    'armorClass', 'ac', 'maxHp', 'hp', 'currentHp', 'tempHp', 'hitDice', 'hitDiceCurrent',
    'hit_dice', 'hit_dice_current',
    'exhaustion', 'exhaustionLevel', 'deathSaveSuccesses', 'deathSaveFailures', 'classResources', 'defeatedMonsters',
    'raceId', 'classId', 'backgroundId', 'str', 'dex', 'con', 'int', 'wis', 'cha',
    'races', 'classes', 'backgrounds', 'character_attacks', 'character_features',
    'race', 'class_name', 'background', 'charClass',
    'character_inventory', 'character_feats', 'character_spells', 'character_classes', 'character_choices', 'characterClasses',
    'originFeat', 'feats', 'spells', 'equipment',
    'equipped_armor', 'equipped_shield', 'equipped_ring',
    'equippedArmor', 'equippedShield', 'equippedRing', 'equipmentSlots', 'equipment_slots',
    'draconic_ancestry', 'draconicAncestry',
    'giant_ancestry', 'giantAncestry',
    'origin_feat', 'originFeat',
    'fighting_style', 'fightingStyle', 'fighting_style_locked',
    'subclass', 'subclass_name', 'subclass_locked',
    'level_choices'
  ];
  
  for (const key of keysToRemove) {
    delete cleanPayload[key];
  }

  try {
    if (payload.race && !payload.race_id) {
      const { data: rData } = await (supabase.from('races') as any).select('id').ilike('name', payload.race).limit(1);
      if (rData && rData.length > 0) cleanPayload.race_id = rData[0].id;
    }
    if (payload.class_name && !payload.class_id) {
      const { data: cData } = await (supabase.from('classes') as any).select('id').ilike('name', payload.class_name).limit(1);
      if (cData && cData.length > 0) cleanPayload.class_id = cData[0].id;
    }
    if (payload.charClass && !payload.class_id) {
      const { data: cData } = await (supabase.from('classes') as any).select('id').ilike('name', payload.charClass).limit(1);
      if (cData && cData.length > 0) cleanPayload.class_id = cData[0].id;
    }
    if (payload.background && !payload.background_id) {
      const { data: bData } = await (supabase.from('backgrounds') as any).select('id').ilike('name', payload.background).limit(1);
      if (bData && bData.length > 0) cleanPayload.background_id = bData[0].id;
    }
  } catch (err) {
    console.warn("Erro ao converter nomes de raça/classe/antecedente em IDs no update:", err);
  }

  return cleanPayload;
}
