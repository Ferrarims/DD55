import { PlayerStats, Character } from '../../types/character';
import { getProficiencyBonus } from './proficiencyUtils';
import { BACKGROUNDS_REFERENCE } from '../api/references';

export function mapDatabaseRowToPlayerStats(rawChar: any): PlayerStats {
  if (!rawChar) {
    throw new Error('Registro de personagem inválido');
  }

  const str = Number(rawChar.strength ?? 10);
  const dex = Number(rawChar.dexterity ?? 10);
  const con = Number(rawChar.constitution ?? 10);
  const int = Number(rawChar.intelligence ?? 10);
  const wis = Number(rawChar.wisdom ?? 10);
  const cha = Number(rawChar.charisma ?? 10);

  const level = Math.max(1, Number(rawChar.level ?? 1));
  const pb = getProficiencyBonus(level);

  let cp = Number(rawChar.cp ?? 0);
  let sp = Number(rawChar.sp ?? 0);
  let ep = Number(rawChar.ep ?? 0);
  let gp = Number(rawChar.gp ?? 0);
  let pp = Number(rawChar.pp ?? 0);

  let totalGoldPO = gp + sp * 0.1 + cp * 0.01 + ep * 0.5 + pp * 10;
  const coinsStr = `${totalGoldPO % 1 === 0 ? totalGoldPO : totalGoldPO.toFixed(2)} PO`;

  let conditions: string[] = [];
  if (rawChar.conditions) {
    if (typeof rawChar.conditions === 'string') {
      try {
        const parsed = JSON.parse(rawChar.conditions);
        conditions = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        conditions = [rawChar.conditions];
      }
    } else if (Array.isArray(rawChar.conditions)) {
      conditions = [...rawChar.conditions];
    }
  }

  let raceName = rawChar.race || rawChar.races?.name || 'Humano';
  let className = rawChar.class_name || rawChar.classes?.name || 'Guerreiro';
  let bgName = rawChar.background || rawChar.backgrounds?.name || 'Acólito';

  let subclass: string | null = rawChar.subclass || null;
  let hitDice = rawChar.hit_dice || 'd8';
  let hitDiceCount = Number(rawChar.hit_dice_current ?? level);

  if (rawChar.character_classes && Array.isArray(rawChar.character_classes) && rawChar.character_classes.length > 0) {
    const primaryClass = rawChar.character_classes[0];
    if (primaryClass.classes?.name && !rawChar.class_name) {
      className = primaryClass.classes.name;
    }
    if (primaryClass.subclass) {
      subclass = primaryClass.subclass;
    }
    if (primaryClass.hit_dice) {
      hitDice = primaryClass.hit_dice;
    }
    if (primaryClass.hit_dice_current !== undefined && primaryClass.hit_dice_current !== null) {
      hitDiceCount = Number(primaryClass.hit_dice_current);
    }
  }

  let draconicAncestry = rawChar.draconicAncestry || rawChar.draconic_ancestry;
  let giantAncestry = rawChar.giantAncestry || rawChar.giant_ancestry;
  let originFeat = rawChar.originFeat || rawChar.origin_feat;
  let fightingStyle = rawChar.fighting_style;
  let bgBonuses: { stat: string; value: number }[] = rawChar.bgBonuses ? [...rawChar.bgBonuses] : [];
  let levelChoices = rawChar.level_choices ? (Array.isArray(rawChar.level_choices) ? [...rawChar.level_choices] : [rawChar.level_choices]) : [];

  if (rawChar.character_choices && Array.isArray(rawChar.character_choices)) {
    rawChar.character_choices.forEach((choice: any) => {
      const featName = choice.feature_name || choice.choice_type;
      const val = choice.choice_value;
      if (!featName || !val) return;

      if (featName === 'draconic_ancestry') draconicAncestry = val;
      else if (featName === 'giant_ancestry') giantAncestry = val;
      else if (featName === 'origin_feat') originFeat = val;
      else if (featName === 'fighting_style') fightingStyle = val;
      else if (featName === 'subclass') subclass = val;
      else if (featName.startsWith('bgBonus_')) {
        bgBonuses.push({ stat: featName.replace('bgBonus_', ''), value: Number(val) });
      }
    });
  }

  if (!originFeat && bgName && BACKGROUNDS_REFERENCE[bgName]?.feat) {
    originFeat = BACKGROUNDS_REFERENCE[bgName].feat;
  }

  let feats: string[] = rawChar.feats ? (Array.isArray(rawChar.feats) ? [...rawChar.feats] : [rawChar.feats]) : [];
  if (rawChar.character_feats && Array.isArray(rawChar.character_feats)) {
    const dbFeats = rawChar.character_feats.map((f: any) => f.feats?.name || f.name).filter(Boolean);
    feats = Array.from(new Set([...feats, ...dbFeats]));
  }

  let spells: string[] = rawChar.spells ? (Array.isArray(rawChar.spells) ? [...rawChar.spells] : [rawChar.spells]) : [];
  if (rawChar.character_spells && Array.isArray(rawChar.character_spells)) {
    const dbSpells = rawChar.character_spells.map((s: any) => s.spells?.name || s.name).filter(Boolean);
    spells = Array.from(new Set([...spells, ...dbSpells]));
  }

  let equipment: string[] = rawChar.equipment ? (Array.isArray(rawChar.equipment) ? [...rawChar.equipment] : [rawChar.equipment]) : [];
  if (rawChar.character_inventory && Array.isArray(rawChar.character_inventory)) {
    const equipList: string[] = [];
    rawChar.character_inventory.forEach((inv: any) => {
      const name = inv.items?.name || inv.name;
      if (name) {
        const q = inv.quantity || 1;
        equipList.push(q > 1 ? `${q}x ${name}` : name);
      }
    });
    if (equipList.length > 0) {
      equipment = equipList;
    }
  }

  const strMod = Math.floor((str - 10) / 2);
  const dexMod = Math.floor((dex - 10) / 2);
  const wisMod = Math.floor((wis - 10) / 2);

  const initiative = dexMod;
  const passivePerception = 10 + wisMod;

  return {
    id: rawChar.id,
    name: rawChar.name || 'Herói sem Nome',
    charClass: className,
    class_name: className,
    race: raceName,
    background: bgName,
    originFeat: originFeat || 'Nenhum',
    icon: rawChar.icon || '⚔️',
    hp: Number(rawChar.current_hp ?? rawChar.max_hp ?? 10),
    maxHp: Number(rawChar.max_hp ?? 10),
    tempHP: Number(rawChar.temp_hp ?? 0),
    armor_class: Number(rawChar.armor_class ?? (10 + dexMod)),
    initiative,
    attackBonus: pb + strMod,
    damageDiceSides: 8,
    damageDiceCount: 1,
    damageBonus: strMod,
    str,
    dex,
    con,
    int,
    wis,
    cha,
    strength: str,
    dexterity: dex,
    constitution: con,
    intelligence: int,
    wisdom: wis,
    charisma: cha,
    alignment: rawChar.alignment || 'Neutro',
    speed: rawChar.speed || '9m',
    savingThrows: rawChar.savingThrows || [],
    level,
    proficiencyBonus: pb,
    passivePerception,
    hitDice,
    hitDiceCount,
    cp,
    sp,
    ep,
    gp,
    pp,
    coins: coinsStr,
    defeatedMonsters: rawChar.defeated_monsters || rawChar.defeatedMonsters || {},
    feats,
    spells,
    equipment,
    draconicAncestry,
    giantAncestry,
    subclass,
    subclass_locked: rawChar.subclass_locked ?? (subclass ? true : false),
    fighting_style: fightingStyle,
    fighting_style_locked: rawChar.fighting_style_locked ?? (fightingStyle ? true : false),
    bgBonuses,
    level_choices: levelChoices,
    exhaustionLevel: Number(rawChar.exhaustion_level ?? 0),
    character_classes: rawChar.character_classes,
    character_inventory: rawChar.character_inventory,
    character_spells: rawChar.character_spells,
    character_feats: rawChar.character_feats,
  };
}

export function mapPlayerStatsToDatabaseUpdate(stats: Partial<PlayerStats>): Partial<Character> {
  const update: Record<string, any> = {};

  if (stats.name !== undefined) update.name = stats.name;
  if (stats.alignment !== undefined) update.alignment = stats.alignment;
  if (stats.level !== undefined) update.level = stats.level;
  if (stats.str !== undefined || stats.strength !== undefined) update.strength = stats.str ?? stats.strength;
  if (stats.dex !== undefined || stats.dexterity !== undefined) update.dexterity = stats.dex ?? stats.dexterity;
  if (stats.con !== undefined || stats.constitution !== undefined) update.constitution = stats.con ?? stats.constitution;
  if (stats.int !== undefined || stats.intelligence !== undefined) update.intelligence = stats.int ?? stats.intelligence;
  if (stats.wis !== undefined || stats.wisdom !== undefined) update.wisdom = stats.wis ?? stats.wisdom;
  if (stats.cha !== undefined || stats.charisma !== undefined) update.charisma = stats.cha ?? stats.charisma;

  if (stats.armor_class !== undefined) update.armor_class = stats.armor_class;
  if (stats.speed !== undefined) update.speed = stats.speed;
  if (stats.maxHp !== undefined) update.max_hp = stats.maxHp;
  if (stats.hp !== undefined) update.current_hp = stats.hp;
  if (stats.tempHP !== undefined) update.temp_hp = stats.tempHP;
  if (stats.exhaustionLevel !== undefined) update.exhaustion_level = stats.exhaustionLevel;

  if (stats.cp !== undefined) update.cp = stats.cp;
  if (stats.sp !== undefined) update.sp = stats.sp;
  if (stats.ep !== undefined) update.ep = stats.ep;
  if (stats.gp !== undefined) update.gp = stats.gp;
  if (stats.pp !== undefined) update.pp = stats.pp;

  if (stats.defeatedMonsters !== undefined) update.defeated_monsters = stats.defeatedMonsters;

  update.updated_at = new Date().toISOString();

  return update;
}
