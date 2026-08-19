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
}

export interface PlayerStats {
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
  fighting_style?: string;
  fighting_style_locked?: boolean;
  level_choices?: any[];
}
