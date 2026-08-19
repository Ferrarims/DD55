import { supabase, isSupabaseConfigured } from './supabase';
import { SPELLS_REFERENCE, SpellInfo } from '../../lib/api/references';

export async function fetchSpellsFromDb(alreadyTriedSeeding = false): Promise<void> {
  if (!isSupabaseConfigured) {
    return;
  }

  try {
    const { data, error } = await supabase.from('spells').select('*');
    if (error) {
      console.warn('Aviso: Não foi possível carregar as magias do banco, usando fallback local:', error.message);
      return;
    }

    if (data && data.length > 0) {
      // Limpa e reconstrói o SPELLS_REFERENCE em memória
      Object.keys(SPELLS_REFERENCE).forEach(key => {
        delete SPELLS_REFERENCE[key];
      });

      data.forEach((dbSpell: any) => {
        SPELLS_REFERENCE[dbSpell.name] = {
          name: dbSpell.name,
          level: Number(dbSpell.level),
          school: dbSpell.school,
          castingTime: dbSpell.casting_time,
          range: dbSpell.range,
          components: dbSpell.components,
          duration: dbSpell.duration,
          classes: Array.isArray(dbSpell.classes) ? dbSpell.classes : [],
          description: dbSpell.description
        };
      });
    } else {
      console.warn('Aviso: A tabela public.spells está vazia no banco de dados.');
      return;
    }
  } catch (err) {
    console.warn('Erro ao conectar ao banco de magias (spells):', err);
  }
}
