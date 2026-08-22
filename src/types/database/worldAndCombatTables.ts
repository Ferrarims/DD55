import { Json } from './json';

export interface WorldAndCombatTables {
  bestiary: {
    Row: {
      id: string;
      name: string;
      cr: number;
      hp: number;
      speed: Json;
      xp: number;
      icon: string | null;
      created_at: string | null;
      pb: number | null;
      strength: number;
      dexterity: number;
      constitution: number;
      intelligence: number;
      wisdom: number;
      charisma: number;
      saving_throws: Json | null;
      skills: Json | null;
      senses: string | null;
      languages: string | null;
      damage_vulnerabilities: Json | null;
      damage_resistances: Json | null;
      damage_immunities: Json | null;
      condition_immunities: Json | null;
      special_traits: Json | null;
      actions: Json | null;
      bonus_actions: Json | null;
      reactions: Json | null;
      legendary_actions: Json | null;
      armor_class: number | null;
      size: string;
    };
    Insert: {
      id?: string;
      name: string;
      cr?: number;
      hp: number;
      speed?: Json;
      xp?: number;
      icon?: string | null;
      created_at?: string | null;
      pb?: number | null;
      strength?: number;
      dexterity?: number;
      constitution?: number;
      intelligence?: number;
      wisdom?: number;
      charisma?: number;
      saving_throws?: Json | null;
      skills?: Json | null;
      senses?: string | null;
      languages?: string | null;
      damage_vulnerabilities?: Json | null;
      damage_resistances?: Json | null;
      damage_immunities?: Json | null;
      condition_immunities?: Json | null;
      special_traits?: Json | null;
      actions?: Json | null;
      bonus_actions?: Json | null;
      reactions?: Json | null;
      legendary_actions?: Json | null;
      armor_class?: number | null;
      size?: string;
    };
    Update: {
      id?: string;
      name?: string;
      cr?: number;
      hp?: number;
      speed?: Json;
      xp?: number;
      icon?: string | null;
      created_at?: string | null;
      pb?: number | null;
      strength?: number;
      dexterity?: number;
      constitution?: number;
      intelligence?: number;
      wisdom?: number;
      charisma?: number;
      saving_throws?: Json | null;
      skills?: Json | null;
      senses?: string | null;
      languages?: string | null;
      damage_vulnerabilities?: Json | null;
      damage_resistances?: Json | null;
      damage_immunities?: Json | null;
      condition_immunities?: Json | null;
      special_traits?: Json | null;
      actions?: Json | null;
      bonus_actions?: Json | null;
      reactions?: Json | null;
      legendary_actions?: Json | null;
      armor_class?: number | null;
      size?: string;
    };
  };
  races: {
    Row: {
      id: string;
      name: string;
      creature_type: string;
      size: string;
      speed: string;
      icon?: string | null;
      created_at: string | null;
    };
    Insert: {
      id?: string;
      name: string;
      creature_type?: string;
      size?: string;
      speed: string;
      icon?: string | null;
      created_at?: string | null;
    };
    Update: {
      id?: string;
      name?: string;
      creature_type?: string;
      size?: string;
      speed?: string;
      icon?: string | null;
      created_at?: string | null;
    };
  };
  race_traits: {
    Row: {
      id: string;
      race_id: string;
      trait_name: string;
      description: string;
      created_at: string | null;
    };
    Insert: {
      id?: string;
      race_id: string;
      trait_name: string;
      description: string;
      created_at?: string | null;
    };
    Update: {
      id?: string;
      race_id?: string;
      trait_name?: string;
      description?: string;
      created_at?: string | null;
    };
  };
  spells: {
    Row: {
      id: string;
      name: string;
      level: number;
      school: string;
      casting_time: string;
      range: string;
      components: string;
      duration: string;
      classes: Json;
      description: string;
      created_at: string | null;
    };
    Insert: {
      id?: string;
      name: string;
      level?: number;
      school: string;
      casting_time: string;
      range: string;
      components: string;
      duration: string;
      classes?: Json;
      description: string;
      created_at?: string | null;
    };
    Update: {
      id?: string;
      name?: string;
      level?: number;
      school?: string;
      casting_time?: string;
      range?: string;
      components?: string;
      duration?: string;
      classes?: Json;
      description?: string;
      created_at?: string | null;
    };
  };
  items: {
    Row: {
      id: string;
      name: string;
      category: string | null;
      cost: string | null;
      weight: string | null;
      properties: string | null;
      damage: string | null;
      stealth: string | null;
      usable_location: string | null;
      created_at: string | null;
      ammunition_type: string | null;
      armor_class: string | null;
    };
    Insert: {
      id?: string;
      name: string;
      category?: string | null;
      cost?: string | null;
      weight?: string | null;
      properties?: string | null;
      damage?: string | null;
      stealth?: string | null;
      usable_location?: string | null;
      created_at?: string | null;
      ammunition_type?: string | null;
      armor_class?: string | null;
    };
    Update: {
      id?: string;
      name?: string;
      category?: string | null;
      cost?: string | null;
      weight?: string | null;
      properties?: string | null;
      damage?: string | null;
      stealth?: string | null;
      usable_location?: string | null;
      created_at?: string | null;
      ammunition_type?: string | null;
      armor_class?: string | null;
    };
  };
}
