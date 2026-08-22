import { supabase } from '../../supabase';
import { classTranslation, raceTranslation } from '../characterConstants';

export interface ResolvedCreationIds {
  raceId: string | null;
  classId: string | null;
  backgroundId: string | null;
  classHitPointDie: string | null;
}

export async function resolveCreationIds(characterData: any): Promise<ResolvedCreationIds> {
  let raceId = null;
  let classId = null;
  let backgroundId = null;
  let classHitPointDie: string | null = null;

  try {
    const raceSearchName = raceTranslation[characterData.race] || characterData.race;
    if (raceSearchName) {
      const { data: rData } = await (supabase
        .from('races') as any)
        .select('id')
        .ilike('name', raceSearchName)
        .limit(1);
      if (rData && rData.length > 0) raceId = rData[0].id;
    }

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

  return { raceId, classId, backgroundId, classHitPointDie };
}

export function buildCharacterRow(
  characterData: any,
  currentUserId: string,
  ids: ResolvedCreationIds
): any {
  return {
    user_id: currentUserId,
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
    race_id: ids.raceId,
    class_id: ids.classId,
    background_id: ids.backgroundId,
    conditions: characterData.conditions || []
  };
}
