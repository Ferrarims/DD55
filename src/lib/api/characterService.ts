import { supabase, isSupabaseConfigured } from './supabase';
import { calculateAC } from '../mechanics/acCalculator';
import { parseEquipmentToList } from '../mechanics/xpAndLootManager';
import { getItemIdByName, findOrFetchItemIdByName, getCachedEquipmentReference, getItemById } from './itemsService';
import { BACKGROUNDS_REFERENCE } from '../../lib/api/references';

const LOCAL_STORAGE_CHARS_KEY = 'dnd_local_characters';

export function getLocalCharacters(): any[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CHARS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveLocalCharacters(chars: any[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_CHARS_KEY, JSON.stringify(chars));
  } catch (e) {
    console.warn('Erro ao persistir personagens no localStorage:', e);
  }
}

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
      
      // Garantir que hit_dice_current não seja nulo ou indefinido e limite ao nível máximo da classe
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

  if (char.character_inventory && Array.isArray(char.character_inventory)) {
    const equipList: string[] = [];
    char.character_inventory.forEach((inv: any) => {
      const name = inv.items?.name;
      if (name) {
        const qty = inv.quantity || 1;
        if (qty > 1) {
          equipList.push(`${qty}x ${name}`);
        } else {
          equipList.push(name);
        }
      }
    });
    char.equipment = equipList;
  }
  if (char.character_feats && Array.isArray(char.character_feats)) {
    char.feats = char.character_feats.map((f: any) => f.feats?.name).filter(Boolean);
    const originFeatObj = char.character_feats.find((f: any) => f.source === "origem" || f.source === "migrado");
    if (originFeatObj && !char.originFeat) char.originFeat = originFeatObj.feats?.name;
  }
  if (char.character_spells && Array.isArray(char.character_spells)) {
    char.spells = char.character_spells.map((s: any) => s.spells?.name).filter(Boolean);
  }

  if (char.equipment_slots) {
    let slots: any = char.equipment_slots;
    if (typeof slots === 'string') {
      try { slots = JSON.parse(slots); } catch (e) { slots = {}; }
    }
    if (slots && typeof slots === 'object') {
      char.equipment_slots = slots;
    } else {
      char.equipment_slots = {};
    }
  } else {
    char.equipment_slots = {};
  }

  // Sincroniza equip_slot da tabela character_inventory com char.equipment_slots
  if (char.character_inventory && Array.isArray(char.character_inventory)) {
    const itemsRef = getCachedEquipmentReference();
    char.character_inventory.forEach((inv: any) => {
      const name = inv.items?.name || inv.name || (inv.item_id && itemsRef[inv.item_id] ? itemsRef[inv.item_id].name : null);
      if (inv.equip_slot && name) {
        char.equipment_slots[inv.equip_slot] = name;
      } else if (!inv.equip_slot && char.equipment_slots) {
        const invName = (name || '').toLowerCase().trim();
        if (invName) {
          for (const [sKey, sVal] of Object.entries(char.equipment_slots)) {
            if (sVal && typeof sVal === 'string' && sVal.toLowerCase().trim() === invName) {
              inv.equip_slot = sKey;
              break;
            }
          }
        }
      }
    });
  }

  if (char.character_attacks && Array.isArray(char.character_attacks)) {
    const itemsRef = getCachedEquipmentReference();
    char.character_attacks = char.character_attacks.map((atk: any) => {
      let updatedAtk = { ...atk };
      if (atk.item_id) {
        const matchedItem = Object.values(itemsRef).find((i: any) => i.id === atk.item_id);
        if (matchedItem) {
          updatedAtk = {
            ...updatedAtk,
            name: atk.name || matchedItem.name,
            properties: atk.properties || matchedItem.properties,
            damage: atk.damage || matchedItem.damage
          };
        }
      }
      return updatedAtk;
    });

    char.character_attacks.forEach((atk: any) => {
      if (atk.equip_slot && atk.name) {
        if (char.equipment_slots && !char.equipment_slots[atk.equip_slot]) {
          char.equipment_slots[atk.equip_slot] = atk.name;
        }
      } else if (!atk.equip_slot && char.equipment_slots) {
        const atkName = (atk.name || '').toLowerCase().trim();
        if (atkName) {
          for (const [sKey, sVal] of Object.entries(char.equipment_slots)) {
            if (sVal && typeof sVal === 'string' && sVal.toLowerCase().trim() === atkName) {
              atk.equip_slot = sKey;
              break;
            }
          }
        }
      }
    });
  }

  if (char.equipment_slots && typeof char.equipment_slots === 'object') {
    const slots = char.equipment_slots;
    if (!char.equipped_armor && slots.corpo_torso) char.equipped_armor = slots.corpo_torso;
    if (!char.equipped_shield && slots.empunhadura_2 && /escudo|shield/i.test(slots.empunhadura_2)) {
      char.equipped_shield = slots.empunhadura_2;
    }
    if (!char.equipped_ring) char.equipped_ring = slots.dedo_anel_1 || slots.dedo_anel_2 || null;
  }

  try {
    const equipmentList = parseEquipmentToList(char.equipment);
    const relationalItems: any[] = [];
    if (Array.isArray(char.character_inventory)) {
      char.character_inventory.forEach((inv: any) => {
        const itemName = inv.items?.name || inv.name;
        if (itemName) {
          const isEquipped = !!inv.equip_slot || inv.equipped === true;
          relationalItems.push({ name: itemName, equipped: isEquipped });
          if (inv.equip_slot === 'corpo_torso' && !char.equipped_armor) {
            char.equipped_armor = itemName;
          }
          if (inv.equip_slot && /escudo|shield/i.test(inv.equip_slot) && !char.equipped_shield) {
            char.equipped_shield = itemName;
          }
        }
      });
    }

    const combinedInventory = [...equipmentList, ...relationalItems];

    const acRes = calculateAC({
      charClass: char.class_name || char.charClass || '',
      stats: {
        dex: char.dexterity || 10,
        con: char.constitution || 10,
        wis: char.wisdom || 10,
      },
      equippedArmor: char.equipped_armor,
      equippedShield: char.equipped_shield,
      equippedRing: char.equipped_ring,
      fightingStyle: char.fighting_style,
      inventoryItems: combinedInventory,
      equipmentSlots: char.equipment_slots || char.equipmentSlots || {}
    });

    const calculatedAc = acRes.ac;
    const dbAc = typeof char.armor_class === 'number' ? char.armor_class : Number(char.armor_class) || 10;

    if (calculatedAc && char.id && dbAc !== calculatedAc) {
      char.armor_class = calculatedAc;
      (supabase.from('characters') as any)
        .update({ armor_class: calculatedAc, updated_at: new Date().toISOString() })
        .eq('id', char.id)
        .then(() => {})
        .catch((err: any) => console.warn('Erro ao sincronizar armor_class na tabela characters:', err));
    } else {
      char.armor_class = calculatedAc || dbAc;
    }
  } catch (e) {
    // fallback
  }

  // Auto-sincronização de Pontos de Vida (HP Máximo e Atual)
  try {
    const feats = Array.isArray(char.feats) ? [...char.feats] : [];
    if (char.background) {
      const bgKey = Object.keys(BACKGROUNDS_REFERENCE).find(
        k => k.toLowerCase() === String(char.background).trim().toLowerCase()
      );
      if (bgKey && BACKGROUNDS_REFERENCE[bgKey]?.feat) {
        const bgFeat = BACKGROUNDS_REFERENCE[bgKey].feat;
        if (!feats.includes(bgFeat)) feats.push(bgFeat);
      }
    }
    
    const matchHd = String(char.hit_dice || 'd8').match(/d(\d+)/i);
    const hitDieVal = matchHd && matchHd[1] ? parseInt(matchHd[1], 10) : 8;

    const level = char.level || 1;
    const conMod = Math.floor(((char.constitution || 10) - 10) / 2);
    const isDwarfRace = ['Anão', 'Dwarf'].includes(char.race);
    const hasTough = feats.some(f => /vigoroso|tough/i.test(f || ''));
    const fortitudeBonus = feats.some(f => /dádiva da fortitude/i.test(f || '')) ? 40 : 0;

    const choices = Array.isArray(char.level_choices) ? char.level_choices : [];
    let sumBaseHp = 0;

    for (let lvl = 1; lvl <= level; lvl++) {
      if (lvl === 1) {
        sumBaseHp += hitDieVal;
      } else {
        const choice = choices.find((c: any) => c.level === lvl);
        let baseHp = Math.floor(hitDieVal / 2) + 1;

        if (choice) {
          if (typeof choice.baseHp === 'number' && choice.baseHp > 0) {
            baseHp = choice.baseHp;
          } else if (choice.hpGain) {
            const match = String(choice.hpGain).match(/\+(\d+)/);
            if (match) {
              const totalGain = parseInt(match[1], 10);
              baseHp = Math.max(1, totalGain - conMod);
            }
          }
        }
        sumBaseHp += baseHp;
      }
    }

    const conBonusTotal = conMod * level;
    const dwarfBonus = isDwarfRace ? level : 0;
    const toughBonus = hasTough ? level * 2 : 0;
    const correctMaxHp = sumBaseHp + conBonusTotal + dwarfBonus + toughBonus + fortitudeBonus;

    const currentSavedMaxHp = typeof char.max_hp === 'number' ? char.max_hp : Number(char.max_hp) || 10;

    if (correctMaxHp && char.id && currentSavedMaxHp !== correctMaxHp) {
      const wasAtFullHp = char.current_hp >= currentSavedMaxHp || !char.current_hp;
      const newCurrentHp = wasAtFullHp ? correctMaxHp : Math.min(char.current_hp || correctMaxHp, correctMaxHp);

      char.max_hp = correctMaxHp;
      char.current_hp = newCurrentHp;

      (supabase.from('characters') as any)
        .update({ max_hp: correctMaxHp, current_hp: newCurrentHp, updated_at: new Date().toISOString() })
        .eq('id', char.id)
        .then(() => {})
        .catch((err: any) => console.warn('Erro ao sincronizar pontos de vida na tabela characters:', err));
    }
  } catch (hpErr) {
    console.warn("Erro ao auto-sincronizar HP do personagem:", hpErr);
  }

  return char;
}

function createLocalCharacter(characterData: any): any {
  const localId = crypto.randomUUID();
  const rawCoins = String(characterData.coins || "0");
  const match = rawCoins.match(/\d+(?:\.\d+)?/);
  const totalGold = match ? parseFloat(match[0]) : 0;
  const gp = Math.floor(totalGold);
  const sp = Math.round((totalGold - gp) * 10);

  const inventoryItems: any[] = [];
  const rawItems = Array.isArray(characterData.inventory) && characterData.inventory.length > 0
    ? characterData.inventory
    : (Array.isArray(characterData.equipment) ? characterData.equipment : []);
  const eqSlots = characterData.equipmentSlots || characterData.equipment_slots || {};

  rawItems.forEach((eq: any, idx: number) => {
    const rawName = typeof eq === 'string' ? eq : (eq?.name || '');
    let slot: string | null = null;
    if (rawName && eqSlots) {
      const cleanRawName = rawName.toLowerCase().trim();
      for (const [sKey, sVal] of Object.entries(eqSlots)) {
        if (sVal && typeof sVal === 'string') {
          const cleanSVal = sVal.toLowerCase().trim();
          if (cleanRawName === cleanSVal || (cleanRawName.length > 2 && cleanSVal.includes(cleanRawName))) {
            slot = sKey;
            break;
          }
        }
      }
    }
    inventoryItems.push({
      id: crypto.randomUUID(),
      character_id: localId,
      item_id: eq?.id || `local-item-${idx}`,
      quantity: eq?.quantity || 1,
      equip_slot: slot,
      items: typeof eq === 'object' ? eq : { name: eq }
    });
  });

  const localChar = {
    id: localId,
    name: characterData.name || 'Herói',
    alignment: characterData.alignment || 'Neutro',
    level: characterData.level || 1,
    strength: characterData.strength ?? characterData.str ?? 10,
    dexterity: characterData.dexterity ?? characterData.dex ?? 10,
    constitution: characterData.constitution ?? characterData.con ?? 10,
    intelligence: characterData.intelligence ?? characterData.int ?? 10,
    wisdom: characterData.wisdom ?? characterData.wis ?? 10,
    charisma: characterData.charisma ?? characterData.cha ?? 10,
    armor_class: Math.round(Number(characterData.armor_class ?? characterData.armorClass ?? characterData.ac ?? 10)) || 10,
    speed: characterData.speed || '9m',
    max_hp: characterData.max_hp ?? characterData.maxHp ?? 10,
    current_hp: characterData.current_hp ?? characterData.hp ?? characterData.maxHp ?? 10,
    gp,
    sp,
    cp: 0,
    ep: 0,
    pp: 0,
    race: characterData.race,
    class_name: characterData.charClass || characterData.class_name,
    background: characterData.background,
    races: { name: characterData.race },
    classes: { name: characterData.charClass || characterData.class_name },
    backgrounds: { name: characterData.background },
    character_inventory: inventoryItems,
    character_feats: (characterData.feats || []).map((f: any) => ({
      id: crypto.randomUUID(),
      character_id: localId,
      feats: typeof f === 'object' ? f : { name: f }
    })),
    character_spells: (characterData.spells || []).map((s: any) => ({
      id: crypto.randomUUID(),
      character_id: localId,
      is_prepared: true,
      spells: typeof s === 'object' ? s : { name: s }
    })),
    character_choices: [],
    character_classes: [
      {
        id: crypto.randomUUID(),
        character_id: localId,
        subclass: characterData.subclass || characterData.subclass_name || null,
        class_level: characterData.level || 1,
        hit_dice: characterData.hit_dice || characterData.hitDice || 'd8',
        hit_dice_current: characterData.level || 1,
        classes: { name: characterData.charClass || characterData.class_name }
      }
    ],
    character_attacks: [],
    conditions: characterData.conditions || [],
    originFeat: characterData.originFeat,
    feats: characterData.feats || [],
    equipmentSlots: eqSlots,
    equipment_slots: eqSlots,
    created_at: new Date().toISOString()
  };

  const list = getLocalCharacters();
  list.unshift(localChar);
  saveLocalCharacters(list);
  return processCharacterRow(localChar);
}

const CHAR_SELECT_WITH_ATTACKS = '*, character_inventory(*, items(*)), character_feats(*, feats(*)), character_spells(*, spells(*)), character_choices(*), character_classes(*, classes(*)), character_attacks(*, items(*)), races(name), classes(name), backgrounds(name)';
const CHAR_SELECT_SAFE = '*, character_inventory(*, items(*)), character_feats(*, feats(*)), character_spells(*, spells(*)), character_choices(*), character_classes(*, classes(*)), races(name), classes(name), backgrounds(name)';

export async function getCharacters(): Promise<any[]> {
  if (!isSupabaseConfigured) {
    return getLocalCharacters().map(processCharacterRow);
  }

  try {
    let res = await supabase
      .from('characters')
      .select(CHAR_SELECT_WITH_ATTACKS)
      .order('created_at', { ascending: false });

    if (res.error) {
      // Tenta sem a tabela character_attacks caso ela tenha sido excluída pelo usuário
      res = await supabase
        .from('characters')
        .select(CHAR_SELECT_SAFE)
        .order('created_at', { ascending: false });
    }

    if (res.error) {
      console.warn('Erro ao buscar personagens no Supabase, usando backup local:', res.error);
      return getLocalCharacters().map(processCharacterRow);
    }

    const processed = (res.data || []).map(processCharacterRow);
    const uniqueProcessed: any[] = [];
    const seenIds = new Set<string>();
    for (const item of processed) {
      if (item.id) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          uniqueProcessed.push(item);
        }
      } else {
        uniqueProcessed.push(item);
      }
    }
    if (uniqueProcessed.length > 0) {
      saveLocalCharacters(uniqueProcessed);
    }
    return uniqueProcessed;
  } catch (err) {
    console.warn('Falha de rede/Supabase em getCharacters, usando backup local:', err);
    return getLocalCharacters().map(processCharacterRow);
  }
}

export async function getCharacterById(charId: string): Promise<any> {
  if (!isSupabaseConfigured) {
    const local = getLocalCharacters().find(c => c.id === charId);
    return local ? processCharacterRow(local) : null;
  }

  try {
    let queryRes = await supabase
      .from('characters')
      .select(CHAR_SELECT_WITH_ATTACKS)
      .eq('id', charId)
      .maybeSingle();

    if (queryRes.error) {
      // Tenta sem a tabela character_attacks caso ela tenha sido excluída pelo usuário
      queryRes = await supabase
        .from('characters')
        .select(CHAR_SELECT_SAFE)
        .eq('id', charId)
        .maybeSingle();
    }

    const resObj: any = queryRes;
    if (resObj.error) {
      console.warn('Erro ao buscar personagem por ID no Supabase, buscando local:', resObj.error);
      const local = getLocalCharacters().find(c => c.id === charId);
      return local ? processCharacterRow(local) : null;
    }

    if (resObj.data) {
      return processCharacterRow(resObj.data);
    }
    const local = getLocalCharacters().find(c => c.id === charId);
    return local ? processCharacterRow(local) : null;
  } catch (err) {
    console.warn('Falha de rede/Supabase em getCharacterById, usando backup local:', err);
    const local = getLocalCharacters().find(c => c.id === charId);
    return local ? processCharacterRow(local) : null;
  }
}

export async function createCharacter(characterData: any, session: any): Promise<any> {
  if (!isSupabaseConfigured) {
    return createLocalCharacter(characterData);
  }

  try {
    let userId = session?.user?.id;
    
    if (!userId) {
      const { data, error } = await supabase.auth.signInAnonymously().catch(() => ({ data: null, error: null }));
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

  // Dicionários para converter chaves em Inglês para Português, conforme cadastrado no Supabase
  const classTranslation: Record<string, string> = {
    'Barbarian': 'Bárbaro',
    'Bard': 'Bardo',
    'Cleric': 'Clérigo',
    'Druid': 'Druida',
    'Fighter': 'Guerreiro',
    'Monk': 'Monge',
    'Paladin': 'Paladino',
    'Ranger': 'Patrulheiro',
    'Rogue': 'Ladino',
    'Sorcerer': 'Feiticeiro',
    'Warlock': 'Bruxo',
    'Wizard': 'Mago'
  };

  const raceTranslation: Record<string, string> = {
    'Aasimar': 'Aasimar',
    'Dragonborn': 'Draconato',
    'Dwarf': 'Anão',
    'Elf': 'Elfo',
    'Gnome': 'Gnomo',
    'Goliath': 'Golias',
    'Human': 'Humano',
    'Orc': 'Orc',
    'Halfling': 'Pequenino',
    'Tiefling': 'Tiferino'
  };

  let raceId = null;
  let classId = null;
  let backgroundId = null;
  let classHitPointDie: string | null = null;

  try {
    // 1. Resolver raça
    const raceSearchName = raceTranslation[characterData.race] || characterData.race;
    if (raceSearchName) {
      const { data: rData } = await (supabase
        .from('races') as any)
        .select('id')
        .ilike('name', raceSearchName)
        .limit(1);
      if (rData && rData.length > 0) raceId = rData[0].id;
    }

    // 2. Resolver classe
    const classSearchName = classTranslation[characterData.charClass] || characterData.charClass;
    if (classSearchName) {
      const { data: cData } = await (supabase
        .from('classes') as any)
        .select('id, hit_point_die')
        .ilike('name', classSearchName)
        .limit(1);
      if (cData && cData.length > 0) {
        classId = cData[0].id;
        classHitPointDie = cData[0].hit_point_die;
      }
    }

    // 3. Resolver antecedente
    if (characterData.background) {
      const { data: bData } = await (supabase
        .from('backgrounds') as any)
        .select('id')
        .ilike('name', characterData.background)
        .limit(1);
      if (bData && bData.length > 0) backgroundId = bData[0].id;
    }
  } catch (err) {
    console.warn("Erro ao converter nomes de raça/classe/antecedente em IDs:", err);
  }

  const characterRow = {
    name: characterData.name,
    alignment: characterData.alignment,
    level: characterData.level || 1,
    strength: characterData.strength ?? characterData.str ?? 10,
    dexterity: characterData.dexterity ?? characterData.dex ?? 10,
    constitution: characterData.constitution ?? characterData.con ?? 10,
    intelligence: characterData.intelligence ?? characterData.int ?? 10,
    wisdom: characterData.wisdom ?? characterData.wis ?? 10,
    charisma: characterData.charisma ?? characterData.cha ?? 10,
    armor_class: Math.round(Number(characterData.armor_class ?? characterData.armorClass ?? characterData.ac ?? 10)) || 10,
    speed: characterData.speed || '9m',
    max_hp: characterData.max_hp ?? characterData.maxHp ?? 10,
    current_hp: characterData.current_hp ?? characterData.hp ?? characterData.maxHp ?? 10,
    gp: (() => {
      const match = String(characterData.coins || "0").match(/\d+(?:\.\d+)?/);
      return match ? Math.floor(parseFloat(match[0])) : 0;
    })(),
    sp: (() => {
      const match = String(characterData.coins || "0").match(/\d+(?:\.\d+)?/);
      if (match) {
        const total = parseFloat(match[0]);
        return Math.round((total - Math.floor(total)) * 10);
      }
      return 0;
    })(),
    cp: 0,
    ep: 0,
    pp: 0,
    race_id: raceId,
    class_id: classId,
    background_id: backgroundId,
    conditions: characterData.conditions || []
  };

  const { data: insertedChar, error: charError } = await (supabase
    .from('characters') as any)
    .insert(characterRow)
    .select('*, races(name), classes(name), backgrounds(name)')
    .single();

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
  
  // Create relational records
  try {
    // 3A: Salvar classe na tabela character_classes para suporte a multiclasse
    if (classId) {
      try {
        const hitPointDie = classHitPointDie || characterData.hit_dice || characterData.hitDice || 'd8';
        await (supabase.from('character_classes') as any).insert({
          character_id: charObj.id,
          class_id: classId,
          subclass: characterData.subclass || characterData.subclass_name || null,
          class_level: characterData.level || 1,
          hit_dice: hitPointDie,
          hit_dice_current: characterData.hit_dice_current || characterData.level || 1
        });
      } catch (errClasses) {
        console.warn("Erro ao salvar classe inicial em character_classes:", errClasses);
      }
    }

    // 3B: Salvar escolhas na tabela character_choices
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
    
    // Re-fetch character com todas as relações
    let { data: refetched } = await (supabase
       .from('characters') as any)
       .select(CHAR_SELECT_WITH_ATTACKS)
       .eq('id', charObj.id)
       .maybeSingle();

    if (!refetched) {
      const fallbackRes = await (supabase
        .from('characters') as any)
        .select(CHAR_SELECT_SAFE)
        .eq('id', charObj.id)
        .maybeSingle();
      refetched = fallbackRes.data;
    }

    if (refetched) {
      if (refetched.character_inventory) {
        await syncInventoryEquipSlots(refetched.id, refetched.character_inventory, characterData.equipmentSlots || characterData.equipment_slots || {});
      }
      return processCharacterRow(refetched);
    }
    
  } catch (err) {
    console.error("Erro ao salvar relações em createCharacter:", err);
  }

  return processCharacterRow(charObj);
}

export async function deleteCharacter(id: string): Promise<void> {
  const localList = getLocalCharacters().filter(c => c.id !== id);
  saveLocalCharacters(localList);

  if (!isSupabaseConfigured) {
    return;
  }

  try {
    const { data: authData } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));
    if (!authData?.session) {
      await supabase.auth.signInAnonymously().catch(() => {});
    }

    try {
      await supabase.from('character_inventory').delete().eq('character_id', id);
      await supabase.from('character_feats').delete().eq('character_id', id);
      await supabase.from('character_spells').delete().eq('character_id', id);
      await supabase.from('character_classes').delete().eq('character_id', id);
      await supabase.from('character_choices').delete().eq('character_id', id);
      await supabase.from('character_attacks').delete().eq('character_id', id);
    } catch (e) {}

    // 2. Excluir o personagem
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

  // Criar uma cópia limpa do payload para evitar tentar salvar colunas inexistentes ou relacionais
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

  // Garantir que armor_class é um inteiro numérico se presente
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
    if (payload.bgBonuses && Array.isArray(payload.bgBonuses)) {
      for (const bonus of payload.bgBonuses) {
        await saveChoiceToCharacter(id, `bgBonus_${bonus.stat}`, bonus.value, 'criacao');
      }
    }
  } catch (errChoices) {
    console.warn("Erro ao sincronizar escolhas em character_choices:", errChoices);
  }

  // Remover campos de relacionamento e propriedades migradas que não precisam ou não devem ser salvas na tabela characters
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
    // Colunas migradas para character_choices / character_classes
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

  // Sincronizar equip_slot na tabela character_inventory se equipment_slots estiver presente no payload
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

// ==========================================
// INVENTORY CRUD METHODS (Relational Tables)
// ==========================================

export async function addItemToInventory(characterId: string, itemIdOrName: string, quantity: number = 1, equipSlot: string | null = null): Promise<any> {
  let itemId = itemIdOrName;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(itemIdOrName);
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
}

export async function removeItemFromInventory(inventoryId: string): Promise<void> {
  const { error } = await (supabase
    .from('character_inventory') as any)
    .delete()
    .eq('id', inventoryId);

  if (error) throw error;
}

export async function updateItemQuantity(inventoryId: string, quantity: number): Promise<void> {
  if (quantity <= 0) {
    await removeItemFromInventory(inventoryId);
    return;
  }

  const { error } = await (supabase
    .from('character_inventory') as any)
    .update({ quantity, updated_at: new Date().toISOString() })
    .eq('id', inventoryId);

  if (error) throw error;
}

export async function updateItemEquipSlot(inventoryId: string, equipSlot: string | null): Promise<void> {
  const { error } = await (supabase
    .from('character_inventory') as any)
    .update({ equip_slot: equipSlot, updated_at: new Date().toISOString() })
    .eq('id', inventoryId);

  if (error) throw error;
}

export async function syncInventoryEquipSlots(
  characterId: string,
  characterInventory: any[],
  equipmentSlots: Record<string, string | null>
): Promise<void> {
  if (!characterId) return;

  if (Array.isArray(characterInventory) && characterInventory.length > 0) {
    for (const inv of characterInventory) {
      if (inv && inv.id) {
        try {
          await updateItemEquipSlot(inv.id, inv.equip_slot ?? null);
        } catch (e) {
          console.warn(`Erro ao atualizar equip_slot para inv.id=${inv.id}:`, e);
        }
      }
    }
  }

  const { data: invData, error } = await (supabase
    .from('character_inventory') as any)
    .select('id, item_id, equip_slot, items(name)')
    .eq('character_id', characterId);

  if (error || !invData) return;

  const itemsRef = getCachedEquipmentReference();
  const invRows = invData as any[];
  const slotEntries = Object.entries(equipmentSlots || {}).filter(([_, name]) => name && typeof name === 'string');
  const assignedInvIds = new Set<string>();

  // 1. Sincronizar equip_slot na tabela character_inventory
  for (const [slotKey, itemName] of slotEntries) {
    if (!itemName) continue;
    const cleanSlotItemName = String(itemName).toLowerCase().trim();

    const matchedInv = invRows.find((inv: any) => {
      if (assignedInvIds.has(inv.id)) return false;
      const rName = String(inv.items?.name || inv.name || (inv.item_id && itemsRef[inv.item_id] ? itemsRef[inv.item_id].name : '')).toLowerCase().trim();
      return rName === cleanSlotItemName || (cleanSlotItemName.length > 2 && rName.includes(cleanSlotItemName)) || (rName.length > 2 && cleanSlotItemName.includes(rName));
    });

    if (matchedInv) {
      assignedInvIds.add(matchedInv.id);
      if (matchedInv.equip_slot !== slotKey) {
        matchedInv.equip_slot = slotKey;
        await updateItemEquipSlot(matchedInv.id, slotKey);
      }
    }
  }

  for (const inv of invRows) {
    if (!assignedInvIds.has(inv.id) && inv.equip_slot !== null) {
      const memMatch = Array.isArray(characterInventory) ? characterInventory.find(i => i.id === inv.id) : null;
      if (!memMatch || !memMatch.equip_slot) {
        inv.equip_slot = null;
        await updateItemEquipSlot(inv.id, null);
      }
    }
  }

  if (Array.isArray(characterInventory)) {
    characterInventory.forEach((inv: any) => {
      const rowMatch = invRows.find(r => r.id === inv.id);
      if (rowMatch) {
        inv.equip_slot = rowMatch.equip_slot;
      }
    });
  }

  // 2. Sincronizar equip_slot na tabela character_attacks
  try {
    const { data: atkData } = await (supabase
      .from('character_attacks') as any)
      .select('id, item_id, name, equip_slot')
      .eq('character_id', characterId);

    const existingAtks = (atkData || []) as any[];
    const assignedAtkIds = new Set<string>();

    for (const [slotKey, itemName] of slotEntries) {
      if (!itemName) continue;
      const cleanSlotItemName = String(itemName).toLowerCase().trim();

      let matchedAtk = existingAtks.find((atk: any) => {
        if (assignedAtkIds.has(atk.id)) return false;
        const atkName = String(atk.name || '').toLowerCase().trim();
        return atkName === cleanSlotItemName || (cleanSlotItemName.length > 2 && atkName.includes(cleanSlotItemName)) || (atkName.length > 2 && cleanSlotItemName.includes(atkName));
      });

      if (!matchedAtk) {
        const invMatch = invRows.find((inv: any) => {
          const rName = String(inv.items?.name || inv.name || '').toLowerCase().trim();
          return rName === cleanSlotItemName || (cleanSlotItemName.length > 2 && rName.includes(cleanSlotItemName)) || (rName.length > 2 && cleanSlotItemName.includes(rName));
        });
        if (invMatch?.item_id) {
          matchedAtk = existingAtks.find((atk: any) => !assignedAtkIds.has(atk.id) && atk.item_id === invMatch.item_id);
        }
      }

      if (matchedAtk) {
        assignedAtkIds.add(matchedAtk.id);
        if (matchedAtk.equip_slot !== slotKey) {
          matchedAtk.equip_slot = slotKey;
          await updateCharacterAttack(matchedAtk.id, { equip_slot: slotKey });
        }
      }
    }

    for (const atk of existingAtks) {
      if (!assignedAtkIds.has(atk.id) && atk.equip_slot) {
        atk.equip_slot = null;
        await updateCharacterAttack(atk.id, { equip_slot: null });
      }
    }
  } catch (atkErr) {
    console.warn("Erro ao sincronizar equip_slot em character_attacks:", atkErr);
  }
}

// ==========================================
// SPELLS CRUD METHODS (Relational Tables)
// ==========================================

export async function addSpellToCharacter(characterId: string, spellId: string, isPrepared: boolean = false, isAlwaysPrepared: boolean = false, source: string | null = null): Promise<any> {
  const { data, error } = await (supabase
    .from('character_spells') as any)
    .insert({ character_id: characterId, spell_id: spellId, is_prepared: isPrepared, is_always_prepared: isAlwaysPrepared, source })
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

export async function updateCharacterSpell(characterSpellId: string, updates: { is_prepared?: boolean; is_always_prepared?: boolean }): Promise<void> {
  const { error } = await (supabase
    .from('character_spells') as any)
    .update(updates)
    .eq('id', characterSpellId);

  if (error) throw error;
}

// ==========================================
// FEATS CRUD METHODS (Relational Tables)
// ==========================================

export async function addFeatToCharacter(characterId: string, featId: string, source: string | null = null): Promise<any> {
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

export async function saveChoiceToCharacter(characterId: string, featureName: string, choiceValue: any, source: string | null = null): Promise<any> {
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

export async function addChoiceToCharacter(characterId: string, featureName: string, choiceValue: string, source: string | null = null): Promise<any> {
  return saveChoiceToCharacter(characterId, featureName, choiceValue, source);
}

export async function removeChoiceFromCharacter(choiceId: string): Promise<void> {
  const { error } = await (supabase
    .from('character_choices') as any)
    .delete()
    .eq('id', choiceId);

  if (error) throw error;
}

// ==========================================
// ATTACKS CRUD METHODS (Relational Tables)
// ==========================================

export async function addAttackToCharacter(characterId: string, attackData: any): Promise<any> {
  const { data, error } = await (supabase
    .from('character_attacks') as any)
    .insert({ character_id: characterId, ...attackData })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function updateCharacterAttack(attackId: string, updates: any): Promise<void> {
  const { error } = await (supabase
    .from('character_attacks') as any)
    .update(updates)
    .eq('id', attackId);

  if (error) throw error;
}

export async function removeAttackFromCharacter(attackId: string): Promise<void> {
  const { error } = await (supabase
    .from('character_attacks') as any)
    .delete()
    .eq('id', attackId);

  if (error) throw error;
}
