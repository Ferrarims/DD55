import { Json } from './json';

export interface SubclassAndFeatTables {
  subclasses: {
    Row: {
      id: string;
      class_id: string;
      name: string;
      description: string | null;
      created_at: string | null;
    };
    Insert: {
      id?: string;
      class_id: string;
      name: string;
      description?: string | null;
      created_at?: string | null;
    };
    Update: {
      id?: string;
      class_id?: string;
      name?: string;
      description?: string | null;
      created_at?: string | null;
    };
  };
  subclass_features: {
    Row: {
      id: string;
      subclass_id: string;
      level: number;
      name: string;
      action_type: string;
      description: string;
      usage_limit: string | null;
      created_at: string | null;
    };
    Insert: {
      id?: string;
      subclass_id: string;
      level: number;
      name: string;
      action_type?: string;
      description: string;
      usage_limit?: string | null;
      created_at?: string | null;
    };
    Update: {
      id?: string;
      subclass_id?: string;
      level?: number;
      name?: string;
      action_type?: string;
      description?: string;
      usage_limit?: string | null;
      created_at?: string | null;
    };
  };
  feats: {
    Row: {
      id: string;
      name: string;
      category: string;
      description: string;
      created_at: string | null;
    };
    Insert: {
      id?: string;
      name: string;
      category: string;
      description: string;
      created_at?: string | null;
    };
    Update: {
      id?: string;
      name?: string;
      category?: string;
      description?: string;
      created_at?: string | null;
    };
  };
  backgrounds: {
    Row: {
      id: string;
      name: string;
      ability_scores: Json;
      skill_proficiencies: Json;
      tool_proficiency: string;
      equipment: Json;
      created_at: string | null;
      feat_id: string | null;
      feat_sub_choice: string | null;
      icon: string | null;
    };
    Insert: {
      id?: string;
      name: string;
      ability_scores?: Json;
      skill_proficiencies?: Json;
      tool_proficiency: string;
      equipment?: Json;
      created_at?: string | null;
      feat_id?: string | null;
      feat_sub_choice?: string | null;
      icon?: string | null;
    };
    Update: {
      id?: string;
      name?: string;
      ability_scores?: Json;
      skill_proficiencies?: Json;
      tool_proficiency?: string;
      equipment?: Json;
      created_at?: string | null;
      feat_id?: string | null;
      feat_sub_choice?: string | null;
      icon?: string | null;
    };
  };
}
