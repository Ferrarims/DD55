import { Json } from './json';

export interface SystemTables {
  app_users: {
    Row: {
      id: string;
      username: string;
      name: string;
      role: 'administrador' | 'jogador';
      created_at: string | null;
    };
    Insert: {
      id: string;
      username: string;
      name: string;
      role?: 'administrador' | 'jogador';
      created_at?: string | null;
    };
    Update: {
      id?: string;
      username?: string;
      name?: string;
      role?: 'administrador' | 'jogador';
      created_at?: string | null;
    };
  };
  game_rules: {
    Row: {
      id: string;
      title: string;
      description: string;
      category: string | null;
      created_at: string | null;
    };
    Insert: {
      id?: string;
      title: string;
      description: string;
      category?: string | null;
      created_at?: string | null;
    };
    Update: {
      id?: string;
      title?: string;
      description?: string;
      category?: string | null;
      created_at?: string | null;
    };
  };
  game_states: {
    Row: {
      id: string;
      character_id: string | null;
      biome: string | null;
      current_turn: number | null;
      combat_data: Json | null;
      is_active: boolean | null;
      updated_at: string | null;
    };
    Insert: {
      id?: string;
      character_id?: string | null;
      biome?: string | null;
      current_turn?: number | null;
      combat_data?: Json | null;
      is_active?: boolean | null;
      updated_at?: string | null;
    };
    Update: {
      id?: string;
      character_id?: string | null;
      biome?: string | null;
      current_turn?: number | null;
      combat_data?: Json | null;
      is_active?: boolean | null;
      updated_at?: string | null;
    };
  };
  implementations: {
    Row: {
      id: string;
      title: string;
      description: string | null;
      category: string;
      completed: boolean;
      display_order: number;
      created_at: string | null;
      started: boolean;
    };
    Insert: {
      id?: string;
      title: string;
      description?: string | null;
      category?: string;
      completed?: boolean;
      display_order?: number;
      created_at?: string | null;
      started?: boolean;
    };
    Update: {
      id?: string;
      title?: string;
      description?: string | null;
      category?: string;
      completed?: boolean;
      display_order?: number;
      created_at?: string | null;
      started?: boolean;
    };
  };
}
