import { InventoryItem } from './item';

export interface Attack {
  name: string;
  bonus: number;
  damage: string;
  type: string;
  mastery?: string;
  range?: string;
  properties?: string;
  isVersatileTwoHanded?: boolean;
}

export interface Resource {
  name: string;
  max: number;
  reset: string;
  action?: string;
  description?: string;
  current?: number;
}

export interface AbilityScores {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface CharacterClass {
  id?: string;
  character_id?: string;
  class_id: string;
  class_name?: string;
  subclass?: string | null;
  class_level: number;
  hit_dice?: string | null;
  hit_dice_current: number;
}

export interface CharacterInventoryItem extends InventoryItem {
  id?: string;
  character_id?: string;
  item_id?: string;
  quantity: number;
  equipped: boolean;
  equip_slot?: string | null;
  weight?: string | number;
  cost?: string;
  category?: string;
  damage?: string;
  armor_class?: string;
  properties?: string;
}

export interface CharacterSpell {
  id?: string;
  character_id?: string;
  spell_id: string;
  name?: string;
  level?: number;
  school?: string;
  casting_time?: string;
  range?: string;
  components?: string;
  duration?: string;
  description?: string;
  is_prepared: boolean;
  is_always_prepared: boolean;
  source?: string | null;
}

export interface CharacterFeat {
  id?: string;
  character_id?: string;
  feat_id: string;
  name?: string;
  category?: string;
  description?: string;
  source?: string | null;
}

export interface CharacterChoice {
  id?: string;
  character_id?: string;
  feature_name?: string;
  choice_value?: string;
  source?: string | null;
  level?: number;
  fightingStyle?: string | null;
  [key: string]: unknown;
}

/**
 * Representação completa do registro de Personagem persistido no Supabase
 */
export interface Character {
  id: string;
  name: string;
  alignment: string;
  level: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  armor_class: number;
  speed: string;
  max_hp: number;
  current_hp: number;
  temp_hp: number;
  exhaustion_level: number;
  death_save_successes: number;
  death_save_failures: number;
  conditions: string[] | string;
  class_resources?: Record<string, any> | null;
  xp: number;
  defeated_monsters?: Record<string, number> | null;
  race_id?: string | null;
  class_id?: string | null;
  background_id?: string | null;
  cp: number;
  sp: number;
  ep: number;
  gp: number;
  pp: number;
  created_at?: string | null;
  updated_at?: string | null;
}

/**
 * Interface estendida usada para o estado da ficha e UI em tempo de execução
 */
export interface PlayerStats {
  id?: string;
  name: string;
  charClass: string;
  race: string;
  draconicAncestry?: string;
  giantAncestry?: string;
  giant_ancestry?: string;
  background: string;
  originFeat: string;
  icon: string;
  hp: number;
  maxHp: number;
  tempHP?: number;
  armor_class: number;
  initiative: number;
  attacks?: Attack[];
  inventory?: InventoryItem[];
  cp?: number;
  sp?: number;
  ep?: number;
  gp?: number;
  pp?: number;
  attackBonus: number;
  damageDiceSides: number;
  damageDiceCount: number;
  damageBonus: number;
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  alignment?: string;
  equipment?: string[];
  spells?: string[];
  speed: string;
  savingThrows: string[];
  resources?: Resource[];
  level: number;
  proficiencyBonus: number;
  passivePerception: number;
  spellSaveDC?: number;
  hitDice: string;
  hitDiceCount: number;
  resistances?: string[];
  senses?: string[];
  defeatedMonsters?: Record<string, number>;
  feats?: string[];
  coins?: string;
  bgBonuses?: { stat: string; value: number }[];
  exhaustionLevel?: number;
  skillProficiencies?: string[];
  toolProficiencies?: string[];
  weaponProficiencies?: string[];
  weapon_proficiencies?: string[];
  fighting_style?: string;
  fighting_style_locked?: boolean;
  level_choices?: CharacterChoice[];
  character_classes?: CharacterClass[];
  character_inventory?: CharacterInventoryItem[];
  character_spells?: CharacterSpell[];
  character_feats?: CharacterFeat[];
  equipped_armor?: string | null;
  equipped_shield?: string | null;
  subclass?: string | null;
  subclass_locked?: boolean;
  class_name?: string;
  conditions?: string[];
}
