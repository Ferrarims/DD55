import { CLASS_REFERENCE } from '../../../lib/api/references';
import { PORTUGUESE_TO_ENGLISH_CLASS } from './classTranslations';

export function syncClassProgressions(
  classesList: any[],
  progressionsList: any[]
): Record<string, string> {
  const classIdToName: Record<string, string> = {};

  for (const dbClass of classesList) {
    classIdToName[dbClass.id] = dbClass.name;
    const engName = PORTUGUESE_TO_ENGLISH_CLASS[dbClass.name];
    if (!engName) continue;

    let targetClassObj = (CLASS_REFERENCE as any)[engName];
    if (!targetClassObj) {
      targetClassObj = {};
      (CLASS_REFERENCE as any)[engName] = targetClassObj;
    }

    targetClassObj.id = dbClass.id;
    targetClassObj.name = dbClass.name;
    targetClassObj.icon = dbClass.icon;
    targetClassObj.primaryAbility = dbClass.primary_ability;
    targetClassObj.hitPointDie = dbClass.hit_point_die;
    targetClassObj.savingThrows = Array.isArray(dbClass.saving_throws) ? dbClass.saving_throws : [];
    targetClassObj.skills = dbClass.skills;
    targetClassObj.weapons = Array.isArray(dbClass.weapons) ? dbClass.weapons : [];
    targetClassObj.armor = Array.isArray(dbClass.armor) ? dbClass.armor : [];
    targetClassObj.tools = Array.isArray(dbClass.tools) ? dbClass.tools : [];
    targetClassObj.equipmentOptions = dbClass.equipment_options || { A: '', B: '' };

    (CLASS_REFERENCE as any)[dbClass.name] = targetClassObj;
  }

  if (progressionsList.length > 0) {
    Object.entries(PORTUGUESE_TO_ENGLISH_CLASS).forEach(([ptClassName, engClassName]) => {
      const targetClassObj = (CLASS_REFERENCE as any)[engClassName];
      if (targetClassObj) {
        const classDbId = classesList.find((c: any) => c.name === ptClassName)?.id;
        if (classDbId) {
          const classProgs = progressionsList.filter((p: any) => p.class_id === classDbId);
          if (classProgs.length > 0) {
            classProgs.sort((a: any, b: any) => a.level - b.level);
            targetClassObj.progression = classProgs.map((p: any) => {
              const mappedObj: any = {
                level: p.level,
                prof: p.prof,
                features: '—',
                ...(p.metadata || {})
              };
              
              if (p.cantrips_known !== null && p.cantrips_known !== undefined) mappedObj.cantrips = p.cantrips_known;
              if (p.prepared_spells !== null && p.prepared_spells !== undefined) mappedObj.preparedSpells = p.prepared_spells;
              if (p.spell_slots !== null && p.spell_slots !== undefined) {
                if (engClassName === 'Warlock' && Array.isArray(p.spell_slots)) {
                  mappedObj.spellSlots = p.spell_slots[0];
                } else {
                  mappedObj.spellSlots = p.spell_slots;
                }
              }
              if (p.bardic_die !== null && p.bardic_die !== undefined) mappedObj.bardicDie = p.bardic_die;
              if (p.rages !== null && p.rages !== undefined) {
                if (engClassName === 'Ranger') {
                  mappedObj.favoredEnemy = p.rages;
                } else {
                  mappedObj.rages = p.rages;
                }
              }
              if (p.rage_damage !== null && p.rage_damage !== undefined) mappedObj.rageDamage = p.rage_damage;
              if (p.weapon_mastery !== null && p.weapon_mastery !== undefined) mappedObj.weaponMastery = p.weapon_mastery;
              if (p.channel_divinity !== null && p.channel_divinity !== undefined) mappedObj.channelDivinity = p.channel_divinity;
              if (p.wild_shapes !== null && p.wild_shapes !== undefined) mappedObj.wildShape = p.wild_shapes;
              if (p.second_wind !== null && p.second_wind !== undefined) mappedObj.secondWind = p.second_wind;
              if (p.martial_arts_die !== null && p.martial_arts_die !== undefined) mappedObj.martialArts = p.martial_arts_die;
              if (p.focus_points !== null && p.focus_points !== undefined) mappedObj.focusPoints = p.focus_points;
              if (p.unarmored_movement !== null && p.unarmored_movement !== undefined) mappedObj.unarmoredMovement = p.unarmored_movement;
              if (p.sneak_attack_die !== null && p.sneak_attack_die !== undefined) mappedObj.sneakAttack = p.sneak_attack_die;
              if (p.sorcery_points !== null && p.sorcery_points !== undefined) mappedObj.sorceryPoints = p.sorcery_points;
              if (p.invocations_known !== null && p.invocations_known !== undefined) mappedObj.invocations = p.invocations_known;
              if (p.warlock_slot_level !== null && p.warlock_slot_level !== undefined) mappedObj.slotLevel = p.warlock_slot_level;
              
              return mappedObj;
            });
            (CLASS_REFERENCE as any)[ptClassName] = targetClassObj;
          }
        }
      }
    });
  }

  return classIdToName;
}
