import { supabase } from '../../supabase';
import { calculateAC } from '../../../mechanics/acCalculator';
import { parseEquipmentToList } from '../../../mechanics/xpAndLootManager';
import { BACKGROUNDS_REFERENCE } from '../../references';

export function syncCharacterCalculatedAC(char: any): void {
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
}

export function syncCharacterCalculatedHP(char: any): void {
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
}
