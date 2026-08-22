import { supabase, isSupabaseConfigured } from './supabase';
import { GAME_RULES_REFERENCE, GameRuleItem } from './references/gameRulesRef';

export interface GameRule {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  category: string;
  appUsage?: string;
  icon?: string;
  tags?: string[];
  effects?: { title: string; description: string }[];
  highlight?: string;
}

export function normalizeCategoryName(rawCategory?: string): string {
  const cat = (rawCategory || '').trim().toLowerCase();
  if (cat === 'raça' || cat === 'raças' || cat === 'races' || cat.includes('raça') || cat.includes('espécie') || cat.includes('especie')) {
    return 'Raças & Espécies';
  }
  if (cat === 'descanso' || cat === 'descanso & recuperação' || cat.includes('recupera')) {
    return 'Descanso & Recuperação';
  }
  if (cat.includes('combate') || cat.includes('ações') || cat.includes('acoes')) {
    return 'Combate & Ações';
  }
  if (cat.includes('morte') || cat.includes('sobrevivência') || cat.includes('sobrevivencia')) {
    return 'Morte & Sobrevivência';
  }
  if (cat.includes('maestria')) {
    return 'Maestria com Armas';
  }
  if (cat.includes('cobertura') || cat.includes('posicionamento')) {
    return 'Posicionamento & Cobertura';
  }
  if (cat.includes('ilumina') || cat.includes('sentido')) {
    return 'Iluminação & Sentidos';
  }
  if (cat.includes('ambiente') || cat.includes('clima')) {
    return 'Ambiente & Clima';
  }
  if (cat.includes('magia') || cat.includes('conjura')) {
    return 'Magias & Conjuração';
  }
  if (cat.includes('perícia') || cat.includes('pericia') || cat.includes('atributo')) {
    return 'Perícias & Atributos';
  }
  if (cat.includes('condiç') || cat.includes('condic')) {
    return 'Condições de Status';
  }
  return rawCategory || 'Geral';
}

export async function fetchGameRulesFromDb(): Promise<GameRule[]> {
  if (!isSupabaseConfigured) {
    return GAME_RULES_REFERENCE;
  }
  try {
    const { data, error } = await supabase
      .from('game_rules')
      .select('*')
      .order('category', { ascending: true })
      .order('title', { ascending: true });

    if (error || !data || data.length === 0) {
      return GAME_RULES_REFERENCE;
    }

    // Mapa de referência local completa
    const localMap = new Map(GAME_RULES_REFERENCE.map(r => [r.title.toLowerCase().trim(), r]));

    // Filtrar itens fragmentados do banco de dados (ex: "Aasimar: Revelação Celestial", "Anão: Resiliência Anã")
    // e itens de raças individuais antigos do banco, substituindo-os pelas regras completas consolidadas
    const validDbRules = data.filter((dbRule: any) => {
      const title = (dbRule.title || '').trim();
      const cat = (dbRule.category || '').toLowerCase();
      
      // Remove regras fragmentadas no estilo "Raça: Habilidade"
      const isFragmentedRaceTrait = /^(aasimar|anão|anao|dwarf|draconato|dragonborn|elfo|elf|gnomo|gnome|golias|goliath|humano|human|orc|halfling|pequenino|tiferino|tiefling)\s*:/i.test(title);
      if (isFragmentedRaceTrait) return false;

      // Remove entradas antigas de raça do DB que não possuem appUsage ou traços completos
      const isLegacyRaceEntry = (cat === 'raça' || cat === 'raças' || cat === 'races');
      if (isLegacyRaceEntry) return false;

      // Remove entradas antigas duplicadas de descanso
      if (cat === 'descanso' && (title.toLowerCase().includes('descanso curto') || title.toLowerCase().includes('descanso longo'))) {
        return false;
      }

      return true;
    });

    const merged: GameRule[] = validDbRules.map((dbRule: any) => {
      const localMatch = localMap.get((dbRule.title || '').toLowerCase().trim());
      const normalizedCat = normalizeCategoryName(dbRule.category || localMatch?.category);

      return {
        id: dbRule.id || localMatch?.id || String(Math.random()),
        title: dbRule.title,
        subtitle: dbRule.subtitle || localMatch?.subtitle,
        description: dbRule.description || localMatch?.description || '',
        category: normalizedCat,
        appUsage: dbRule.app_usage || dbRule.appUsage || localMatch?.appUsage || '',
        icon: dbRule.icon || localMatch?.icon || '📜',
        tags: dbRule.tags || localMatch?.tags || [],
        effects: dbRule.effects || localMatch?.effects,
        highlight: dbRule.highlight || localMatch?.highlight,
      };
    });

    // Inserir todas as regras completas da referência local que não estão no merged
    const existingTitles = new Set(merged.map(r => r.title.toLowerCase().trim()));
    for (const ref of GAME_RULES_REFERENCE) {
      if (!existingTitles.has(ref.title.toLowerCase().trim())) {
        merged.push({
          ...ref,
          category: normalizeCategoryName(ref.category)
        });
      }
    }

    return merged;
  } catch (error) {
    console.warn('Erro na chamada fetchGameRulesFromDb, usando referência local consolidada:', error);
    return GAME_RULES_REFERENCE;
  }
}
