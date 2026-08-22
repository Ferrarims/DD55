import { Json } from './json';

export interface CharacterTables {
  characters: {
    Row: {
      id: string;
      name: string;
      player_name: string | null;
      class_name: string;
      subclass: string | null;
      level: number;
      experience_points: number;
      xp: number;
      race: string;
      background: string;
      alignment: string | null;
      strength: number;
      dexterity: number;
      constitution: number;
      intelligence: number;
      wisdom: number;
      charisma: number;
      max_hp: number;
      current_hp: number;
      temporary_hp: number;
      temp_hp: number;
      armor_class: number;
      speed: string;
      coins: string;
      platinum: number;
      gold: number;
      electrum: number;
      silver: number;
      copper: number;
      spell_slots: Json | null;
      equipment_slots: Json | null;
      class_resources: Json | null;
      conditions: Json | null;
      exhaustion_level: number;
      hit_dice_current: number;
      hit_dice_total: number;
      draconic_ancestry: string | null;
      giant_ancestry: string | null;
      notes: string | null;
      created_at: string | null;
      updated_at: string | null;
    };
    Insert: {
      id?: string;
      name: string;
      player_name?: string | null;
      class_name: string;
      subclass?: string | null;
      level?: number;
      experience_points?: number;
      xp?: number;
      race: string;
      background: string;
      alignment?: string | null;
      strength?: number;
      dexterity?: number;
      constitution?: number;
      intelligence?: number;
      wisdom?: number;
      charisma?: number;
      max_hp?: number;
      current_hp?: number;
      temporary_hp?: number;
      temp_hp?: number;
      armor_class?: number;
      speed?: string;
      coins?: string;
      platinum?: number;
      gold?: number;
      electrum?: number;
      silver?: number;
      copper?: number;
      spell_slots?: Json | null;
      equipment_slots?: Json | null;
      class_resources?: Json | null;
      conditions?: Json | null;
      exhaustion_level?: number;
      hit_dice_current?: number;
      hit_dice_total?: number;
      draconic_ancestry?: string | null;
      giant_ancestry?: string | null;
      notes?: string | null;
      created_at?: string | null;
      updated_at?: string | null;
    };
    Update: {
      id?: string;
      name?: string;
      player_name?: string | null;
      class_name?: string;
      subclass?: string | null;
      level?: number;
      experience_points?: number;
      xp?: number;
      race?: string;
      background?: string;
      alignment?: string | null;
      strength?: number;
      dexterity?: number;
      constitution?: number;
      intelligence?: number;
      wisdom?: number;
      charisma?: number;
      max_hp?: number;
      current_hp?: number;
      temporary_hp?: number;
      temp_hp?: number;
      armor_class?: number;
      speed?: string;
      coins?: string;
      platinum?: number;
      gold?: number;
      electrum?: number;
      silver?: number;
      copper?: number;
      spell_slots?: Json | null;
      equipment_slots?: Json | null;
      class_resources?: Json | null;
      conditions?: Json | null;
      exhaustion_level?: number;
      hit_dice_current?: number;
      hit_dice_total?: number;
      draconic_ancestry?: string | null;
      giant_ancestry?: string | null;
      notes?: string | null;
      created_at?: string | null;
      updated_at?: string | null;
    };
  };
  character_classes: {
    Row: {
      id: string;
      character_id: string;
      class_id: string;
      subclass: string | null;
      class_level: number;
      hit_dice: string | null;
      hit_dice_current: number;
    };
    Insert: {
      id?: string;
      character_id: string;
      class_id: string;
      subclass?: string | null;
      class_level?: number;
      hit_dice?: string | null;
      hit_dice_current?: number;
    };
    Update: {
      id?: string;
      character_id?: string;
      class_id?: string;
      subclass?: string | null;
      class_level?: number;
      hit_dice?: string | null;
      hit_dice_current?: number;
    };
  };
  character_feats: {
    Row: {
      id: string;
      character_id: string;
      feat_id: string;
      source: string | null;
      created_at: string | null;
    };
    Insert: {
      id?: string;
      character_id: string;
      feat_id: string;
      source?: string | null;
      created_at?: string | null;
    };
    Update: {
      id?: string;
      character_id?: string;
      feat_id?: string;
      source?: string | null;
      created_at?: string | null;
    };
  };
  character_inventory: {
    Row: {
      id: string;
      character_id: string;
      item_id: string;
      quantity: number;
      is_equipped: boolean;
      equip_slot: string | null;
      is_attuned: boolean;
      created_at: string | null;
    };
    Insert: {
      id?: string;
      character_id: string;
      item_id: string;
      quantity?: number;
      is_equipped?: boolean;
      equip_slot?: string | null;
      is_attuned?: boolean;
      created_at?: string | null;
    };
    Update: {
      id?: string;
      character_id?: string;
      item_id?: string;
      quantity?: number;
      is_equipped?: boolean;
      equip_slot?: string | null;
      is_attuned?: boolean;
      created_at?: string | null;
    };
  };
  character_spells: {
    Row: {
      id: string;
      character_id: string;
      spell_id: string;
      is_prepared: boolean;
      source: string | null;
      created_at: string | null;
    };
    Insert: {
      id?: string;
      character_id: string;
      spell_id: string;
      is_prepared?: boolean;
      source?: string | null;
      created_at?: string | null;
    };
    Update: {
      id?: string;
      character_id?: string;
      spell_id?: string;
      is_prepared?: boolean;
      source?: string | null;
      created_at?: string | null;
    };
  };
  character_choices: {
    Row: {
      id: string;
      character_id: string;
      feature_name: string;
      choice_value: string;
      source: string | null;
    };
    Insert: {
      id?: string;
      character_id: string;
      feature_name: string;
      choice_value: string;
      source?: string | null;
    };
    Update: {
      id?: string;
      character_id?: string;
      feature_name?: string;
      choice_value?: string;
      source?: string | null;
    };
  };
}
