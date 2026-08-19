import { supabase, isSupabaseConfigured } from './supabase';
import { FEATS_REFERENCE, FeatInfo } from '../../lib/api/references';

export async function fetchFeatsFromDb(alreadyTriedSeeding = false): Promise<void> {
  if (!isSupabaseConfigured) {
    return;
  }

  try {
    const { data, error } = await supabase.from('feats').select('*');
    if (error) {
      console.warn('Aviso: Não foi possível carregar os talentos do banco, usando fallback local:', error.message);
      return;
    }

    if (data && data.length > 0) {
      // Limpa e reconstrói o FEATS_REFERENCE em memória
      // Para manter a reatividade e referências do restante do app, nós atualizamos o objeto existente
      
      // Remove chaves antigas e insere novas
      Object.keys(FEATS_REFERENCE).forEach(key => {
        delete FEATS_REFERENCE[key];
      });

      data.forEach((dbFeat: any) => {
        FEATS_REFERENCE[dbFeat.name] = {
          name: dbFeat.name,
          category: dbFeat.category,
          description: dbFeat.description
        };
      });
    } else {
      console.warn('Aviso: A tabela public.feats está vazia no banco de dados.');
      return;
    }
  } catch (err) {
    console.warn('Erro ao conectar ao banco de talentos (feats):', err);
  }
}
