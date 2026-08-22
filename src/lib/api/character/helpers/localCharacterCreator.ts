import { getLocalCharacters, saveLocalCharacters } from '../storage';
import { processCharacterRow } from '../characterProcessor';

export function createLocalCharacter(characterData: any): any {
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
    user_id: null,
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
