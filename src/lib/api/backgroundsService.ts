import { supabase, isSupabaseConfigured } from './supabase';
import { BACKGROUNDS_REFERENCE, BackgroundInfo } from '../../lib/api/references';

export async function fetchBackgrounds(): Promise<any[]> {
  const statMap: Record<string, string> = { "Força": "str", "Destreza": "dex", "Constituição": "con", "Inteligência": "int", "Sabedoria": "wis", "Carisma": "cha" };
  
  const fallbackData = Object.entries(BACKGROUNDS_REFERENCE).map(([id, bg]) => ({
      id,
      ...bg,
      ability_scores: bg.abilityScores.map(s => statMap[s] || s),
      skill_proficiencies: bg.skillProficiencies,
  }));

  if (!isSupabaseConfigured) {
    return fallbackData;
  }

  try {
    const { data, error } = await supabase.from('backgrounds').select('*, feats(name)');
    if (error) {
      console.error('Erro ao buscar antecedentes do Supabase:', error);
      return fallbackData;
    }
    // Normalize data
    return ((data as any[]) || []).map((bg: any) => ({
      ...bg,
      feat: bg.feats?.name || null // Map nested feat name to top-level 'feat'
    })).sort((a, b) => a.name.localeCompare(b.name));
  } catch (err) {
    console.error('Erro ao conectar ao banco de antecedentes:', err);
    return fallbackData;
  }
}

export async function fetchBackgroundsFromDb(alreadyTriedSeeding = false): Promise<void> {
  // ... existing implementation
  if (!isSupabaseConfigured) {
    return;
  }

  try {
    const { data, error } = await supabase.from('backgrounds').select('*, feats(name)');
    if (error) {
      console.warn('Aviso: Não foi possível carregar os antecedentes (backgrounds) do banco, usando fallback local:', error.message);
      return;
    }

    if (data && data.length > 0) {
      // Limpa e reconstrói o BACKGROUNDS_REFERENCE em memória
      Object.keys(BACKGROUNDS_REFERENCE).forEach(key => {
        delete BACKGROUNDS_REFERENCE[key];
      });

      data.forEach((dbBg: any) => {
        BACKGROUNDS_REFERENCE[dbBg.name] = {
          name: dbBg.name,
          icon: dbBg.icon || "👤",
          abilityScores: Array.isArray(dbBg.ability_scores) ? dbBg.ability_scores : [],
          feat: dbBg.feats?.name || '', // Usa o nome do talento vindo do join
          featId: dbBg.feat_id,
          featSubChoice: dbBg.feat_sub_choice,
          skillProficiencies: Array.isArray(dbBg.skill_proficiencies) ? dbBg.skill_proficiencies : [],
          toolProficiency: dbBg.tool_proficiency,
          equipment: dbBg.equipment || { A: '', B: '' }
        };
      });
    } else {
      console.warn('Aviso: A tabela public.backgrounds está vazia no banco de dados.');
      return;
    }
  } catch (err) {
    console.warn('Erro ao conectar ao banco de antecedentes (backgrounds):', err);
  }
}
