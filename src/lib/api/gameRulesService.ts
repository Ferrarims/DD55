import { supabase, isSupabaseConfigured } from './supabase';

export interface GameRule {
  id: string;
  title: string;
  description: string;
  category: string;
}

export async function fetchGameRulesFromDb(): Promise<GameRule[]> {
  if (!isSupabaseConfigured) {
    return [];
  }
  try {
    const { data, error } = await supabase
      .from('game_rules')
      .select('*')
      .order('category', { ascending: true })
      .order('title', { ascending: true });

    if (error) {
      console.warn('Erro ao buscar regras no Supabase, usando fallback local.', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.warn('Erro na chamada fetchGameRulesFromDb:', error);
    return [];
  }
}
