export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      app_users: {
        Row: {
          id: string
          username: string
          name: string
          role: 'administrador' | 'jogador'
          created_at: string | null
        }
        Insert: {
          id: string
          username: string
          name: string
          role?: 'administrador' | 'jogador'
          created_at?: string | null
        }
        Update: {
          id?: string
          username?: string
          name?: string
          role?: 'administrador' | 'jogador'
          created_at?: string | null
        }
      }
      backgrounds: {
        Row: {
          id: string
          name: string
          ability_scores: Json
          skill_proficiencies: Json
          tool_proficiency: string
          equipment: Json
          created_at: string | null
          feat_id: string | null
          feat_sub_choice: string | null
          icon: string | null
        }
        Insert: {
          id?: string
          name: string
          ability_scores?: Json
          skill_proficiencies?: Json
          tool_proficiency: string
          equipment?: Json
          created_at?: string | null
          feat_id?: string | null
          feat_sub_choice?: string | null
          icon?: string | null
        }
        Update: {
          id?: string
          name?: string
          ability_scores?: Json
          skill_proficiencies?: Json
          tool_proficiency?: string
          equipment?: Json
          created_at?: string | null
          feat_id?: string | null
          feat_sub_choice?: string | null
          icon?: string | null
        }
      }
      bestiary: {
        Row: {
          id: string
          name: string
          cr: number
          hp: number
          speed: Json
          xp: number
          icon: string | null
          created_at: string | null
          pb: number | null
          strength: number
          dexterity: number
          constitution: number
          intelligence: number
          wisdom: number
          charisma: number
          saving_throws: Json | null
          skills: Json | null
          senses: string | null
          languages: string | null
          damage_vulnerabilities: Json | null
          damage_resistances: Json | null
          damage_immunities: Json | null
          condition_immunities: Json | null
          special_traits: Json | null
          actions: Json | null
          bonus_actions: Json | null
          reactions: Json | null
          legendary_actions: Json | null
          armor_class: number | null
          size: string
        }
        Insert: {
          id?: string
          name: string
          cr?: number
          hp: number
          speed?: Json
          xp?: number
          icon?: string | null
          created_at?: string | null
          pb?: number | null
          strength?: number
          dexterity?: number
          constitution?: number
          intelligence?: number
          wisdom?: number
          charisma?: number
          saving_throws?: Json | null
          skills?: Json | null
          senses?: string | null
          languages?: string | null
          damage_vulnerabilities?: Json | null
          damage_resistances?: Json | null
          damage_immunities?: Json | null
          condition_immunities?: Json | null
          special_traits?: Json | null
          actions?: Json | null
          bonus_actions?: Json | null
          reactions?: Json | null
          legendary_actions?: Json | null
          armor_class?: number | null
          size?: string
        }
        Update: {
          id?: string
          name?: string
          cr?: number
          hp?: number
          speed?: Json
          xp?: number
          icon?: string | null
          created_at?: string | null
          pb?: number | null
          strength?: number
          dexterity?: number
          constitution?: number
          intelligence?: number
          wisdom?: number
          charisma?: number
          saving_throws?: Json | null
          skills?: Json | null
          senses?: string | null
          languages?: string | null
          damage_vulnerabilities?: Json | null
          damage_resistances?: Json | null
          damage_immunities?: Json | null
          condition_immunities?: Json | null
          special_traits?: Json | null
          actions?: Json | null
          bonus_actions?: Json | null
          reactions?: Json | null
          legendary_actions?: Json | null
          armor_class?: number | null
          size?: string
        }
      }
      character_choices: {
        Row: {
          id: string
          character_id: string
          feature_name: string
          choice_value: string
          source: string | null
        }
        Insert: {
          id?: string
          character_id: string
          feature_name: string
          choice_value: string
          source?: string | null
        }
        Update: {
          id?: string
          character_id?: string
          feature_name?: string
          choice_value?: string
          source?: string | null
        }
      }
      character_classes: {
        Row: {
          id: string
          character_id: string
          class_id: string
          subclass: string | null
          class_level: number
          hit_dice: string | null
          hit_dice_current: number
        }
        Insert: {
          id?: string
          character_id: string
          class_id: string
          subclass?: string | null
          class_level?: number
          hit_dice?: string | null
          hit_dice_current?: number
        }
        Update: {
          id?: string
          character_id?: string
          class_id?: string
          subclass?: string | null
          class_level?: number
          hit_dice?: string | null
          hit_dice_current?: number
        }
      }
      character_feats: {
        Row: {
          id: string
          character_id: string
          feat_id: string
          source: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          character_id: string
          feat_id: string
          source?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          character_id?: string
          feat_id?: string
          source?: string | null
          created_at?: string | null
        }
      }
      character_inventory: {
        Row: {
          id: string
          character_id: string
          item_id: string
          quantity: number
          created_at: string | null
          updated_at: string | null
          equip_slot: string | null
        }
        Insert: {
          id?: string
          character_id: string
          item_id: string
          quantity?: number
          created_at?: string | null
          updated_at?: string | null
          equip_slot?: string | null
        }
        Update: {
          id?: string
          character_id?: string
          item_id?: string
          quantity?: number
          created_at?: string | null
          updated_at?: string | null
          equip_slot?: string | null
        }
      }
      character_spells: {
        Row: {
          id: string
          character_id: string
          spell_id: string
          is_prepared: boolean
          is_always_prepared: boolean
          source: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          character_id: string
          spell_id: string
          is_prepared?: boolean
          is_always_prepared?: boolean
          source?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          character_id?: string
          spell_id?: string
          is_prepared?: boolean
          is_always_prepared?: boolean
          source?: string | null
          created_at?: string | null
        }
      }
      characters: {
        Row: {
          id: string
          name: string
          alignment: string
          level: number | null
          strength: number
          dexterity: number
          constitution: number
          intelligence: number
          wisdom: number
          charisma: number
          armor_class: number
          speed: string | null
          max_hp: number
          current_hp: number
          temp_hp: number | null
          exhaustion_level: number | null
          death_save_successes: number | null
          death_save_failures: number | null
          conditions: string | null
          class_resources: Json | null
          created_at: string | null
          updated_at: string | null
          xp: number | null
          defeated_monsters: Json | null
          race_id: string | null
          class_id: string | null
          background_id: string | null
          cp: number | null
          sp: number | null
          ep: number | null
          gp: number | null
          pp: number | null
        }
        Insert: {
          id?: string
          name: string
          alignment: string
          level?: number | null
          strength: number
          dexterity: number
          constitution: number
          intelligence: number
          wisdom: number
          charisma: number
          armor_class: number
          speed?: string | null
          max_hp: number
          current_hp: number
          temp_hp?: number | null
          exhaustion_level?: number | null
          death_save_successes?: number | null
          death_save_failures?: number | null
          conditions?: string | null
          class_resources?: Json | null
          created_at?: string | null
          updated_at?: string | null
          xp?: number | null
          defeated_monsters?: Json | null
          race_id?: string | null
          class_id?: string | null
          background_id?: string | null
          cp?: number | null
          sp?: number | null
          ep?: number | null
          gp?: number | null
          pp?: number | null
        }
        Update: {
          id?: string
          name?: string
          alignment?: string
          level?: number | null
          strength?: number
          dexterity?: number
          constitution?: number
          intelligence?: number
          wisdom?: number
          charisma?: number
          armor_class?: number
          speed?: string | null
          max_hp?: number
          current_hp?: number
          temp_hp?: number | null
          exhaustion_level?: number | null
          death_save_successes?: number | null
          death_save_failures?: number | null
          conditions?: string | null
          class_resources?: Json | null
          created_at?: string | null
          updated_at?: string | null
          xp?: number | null
          defeated_monsters?: Json | null
          race_id?: string | null
          class_id?: string | null
          background_id?: string | null
          cp?: number | null
          sp?: number | null
          ep?: number | null
          gp?: number | null
          pp?: number | null
        }
      }
      class_level_features: {
        Row: {
          id: string
          level: number
          name: string
          action_type: string
          description: string
          usage_limit: string | null
          created_at: string | null
          class_id: string
        }
        Insert: {
          id?: string
          level: number
          name: string
          action_type?: string
          description: string
          usage_limit?: string | null
          created_at?: string | null
          class_id: string
        }
        Update: {
          id?: string
          level?: number
          name?: string
          action_type?: string
          description?: string
          usage_limit?: string | null
          created_at?: string | null
          class_id?: string
        }
      }
      class_progressions: {
        Row: {
          id: string
          class_id: string
          level: number
          prof: string
          cantrips_known: number | null
          prepared_spells: number | null
          spell_slots: string[] | null
          bardic_die: string | null
          rages: number | null
          rage_damage: string | null
          weapon_mastery: number | null
          channel_divinity: number | null
          wild_shapes: number | null
          second_wind: number | null
          martial_arts_die: string | null
          focus_points: number | null
          unarmored_movement: string | null
          sneak_attack_die: string | null
          sorcery_points: number | null
          invocations_known: number | null
          warlock_slot_level: number | null
          metadata: Json
          created_at: string | null
        }
        Insert: {
          id?: string
          class_id: string
          level: number
          prof: string
          cantrips_known?: number | null
          prepared_spells?: number | null
          spell_slots?: string[] | null
          bardic_die?: string | null
          rages?: number | null
          rage_damage?: string | null
          weapon_mastery?: number | null
          channel_divinity?: number | null
          wild_shapes?: number | null
          second_wind?: number | null
          martial_arts_die?: string | null
          focus_points?: number | null
          unarmored_movement?: string | null
          sneak_attack_die?: string | null
          sorcery_points?: number | null
          invocations_known?: number | null
          warlock_slot_level?: number | null
          metadata?: Json
          created_at?: string | null
        }
        Update: {
          id?: string
          class_id?: string
          level?: number
          prof?: string
          cantrips_known?: number | null
          prepared_spells?: number | null
          spell_slots?: string[] | null
          bardic_die?: string | null
          rages?: number | null
          rage_damage?: string | null
          weapon_mastery?: number | null
          channel_divinity?: number | null
          wild_shapes?: number | null
          second_wind?: number | null
          martial_arts_die?: string | null
          focus_points?: number | null
          unarmored_movement?: string | null
          sneak_attack_die?: string | null
          sorcery_points?: number | null
          invocations_known?: number | null
          warlock_slot_level?: number | null
          metadata?: Json
          created_at?: string | null
        }
      }
      classes: {
        Row: {
          id: string
          name: string
          primary_ability: string
          hit_point_die: string
          saving_throws: Json
          skills: string
          weapons: Json
          armor: Json
          tools: Json | null
          equipment_options: Json
          icon?: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          primary_ability: string
          hit_point_die: string
          saving_throws?: Json
          skills: string
          weapons?: Json
          armor?: Json
          tools?: Json | null
          equipment_options?: Json
          icon?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          primary_ability?: string
          hit_point_die?: string
          saving_throws?: Json
          skills?: string
          weapons?: Json
          armor?: Json
          tools?: Json | null
          equipment_options?: Json
          icon?: string | null
          created_at?: string | null
        }
      }
      feats: {
        Row: {
          id: string
          name: string
          category: string
          description: string
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          category: string
          description: string
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          category?: string
          description?: string
          created_at?: string | null
        }
      }
      game_rules: {
        Row: {
          id: string
          title: string
          description: string
          category: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          category?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string | null
          created_at?: string | null
        }
      }
      game_states: {
        Row: {
          id: string
          character_id: string | null
          biome: string | null
          current_turn: number | null
          combat_data: Json | null
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          character_id?: string | null
          biome?: string | null
          current_turn?: number | null
          combat_data?: Json | null
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          character_id?: string | null
          biome?: string | null
          current_turn?: number | null
          combat_data?: Json | null
          is_active?: boolean | null
          updated_at?: string | null
        }
      }
      items: {
        Row: {
          id: string
          name: string
          category: string | null
          cost: string | null
          weight: string | null
          properties: string | null
          damage: string | null
          stealth: string | null
          usable_location: string | null
          created_at: string | null
          ammunition_type: string | null
          armor_class: string | null
        }
        Insert: {
          id?: string
          name: string
          category?: string | null
          cost?: string | null
          weight?: string | null
          properties?: string | null
          damage?: string | null
          stealth?: string | null
          usable_location?: string | null
          created_at?: string | null
          ammunition_type?: string | null
          armor_class?: string | null
        }
        Update: {
          id?: string
          name?: string
          category?: string | null
          cost?: string | null
          weight?: string | null
          properties?: string | null
          damage?: string | null
          stealth?: string | null
          usable_location?: string | null
          created_at?: string | null
          ammunition_type?: string | null
          armor_class?: string | null
        }
      }
      race_traits: {
        Row: {
          id: string
          race_id: string
          trait_name: string
          description: string
          created_at: string | null
        }
        Insert: {
          id?: string
          race_id: string
          trait_name: string
          description: string
          created_at?: string | null
        }
        Update: {
          id?: string
          race_id?: string
          trait_name?: string
          description?: string
          created_at?: string | null
        }
      }
      races: {
        Row: {
          id: string
          name: string
          creature_type: string
          size: string
          speed: string
          icon?: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          creature_type?: string
          size?: string
          speed: string
          icon?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          creature_type?: string
          size?: string
          speed?: string
          icon?: string | null
          created_at?: string | null
        }
      }
      spells: {
        Row: {
          id: string
          name: string
          level: number
          school: string
          casting_time: string
          range: string
          components: string
          duration: string
          classes: Json
          description: string
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          level?: number
          school: string
          casting_time: string
          range: string
          components: string
          duration: string
          classes?: Json
          description: string
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          level?: number
          school?: string
          casting_time?: string
          range?: string
          components?: string
          duration?: string
          classes?: Json
          description?: string
          created_at?: string | null
        }
      }
      subclass_features: {
        Row: {
          id: string
          subclass_id: string
          level: number
          name: string
          action_type: string
          description: string
          usage_limit: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          subclass_id: string
          level: number
          name: string
          action_type?: string
          description: string
          usage_limit?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          subclass_id?: string
          level?: number
          name?: string
          action_type?: string
          description?: string
          usage_limit?: string | null
          created_at?: string | null
        }
      }
      subclasses: {
        Row: {
          id: string
          class_id: string
          name: string
          description: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          class_id: string
          name: string
          description?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          class_id?: string
          name?: string
          description?: string | null
          created_at?: string | null
        }
      }
      implementations: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string
          completed: boolean
          display_order: number
          created_at: string | null
          started: boolean
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category?: string
          completed?: boolean
          display_order?: number
          created_at?: string | null
          started?: boolean
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: string
          completed?: boolean
          display_order?: number
          created_at?: string | null
          started?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
