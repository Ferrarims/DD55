import { supabase, isSupabaseConfigured } from './supabase';
import { syncClassProgressions } from './classes/syncClassProgressions';
import { syncSubclassesAndFeatures } from './classes/syncSubclassesAndFeatures';

export {
  PORTUGUESE_TO_ENGLISH_CLASS,
  ENGLISH_TO_PORTUGUESE_CLASS,
} from './classes/classTranslations';

export async function fetchClassesFromDb(alreadyTriedSeeding = false): Promise<void> {
  if (!isSupabaseConfigured) {
    return;
  }

  try {
    // 1. Carregar classes do banco
    const { data: dbClasses, error: classError } = await supabase.from('classes').select('*');
    if (classError) {
      console.warn('Aviso: Não foi possível carregar as classes do banco, usando fallback local:', classError.message);
      return;
    }

    if (!dbClasses || dbClasses.length === 0) {
      console.warn('Aviso: A tabela public.classes está vazia no banco de dados.');
      return;
    }

    // 2. Carregar recursos adicionais em paralelo
    const [
      { data: dbFeatures, error: featureError },
      { data: dbProgressions, error: progressionsError },
      { data: dbSubclasses, error: subError },
      { data: dbSubFeatures, error: subFeatError }
    ] = await Promise.all([
      supabase.from('class_level_features').select('*'),
      supabase.from('class_progressions').select('*'),
      supabase.from('subclasses').select('*'),
      supabase.from('subclass_features').select('*')
    ]);

    if (featureError) console.warn('Aviso ao carregar características das classes:', featureError.message);
    if (progressionsError) console.warn('Aviso ao carregar progressão das classes:', progressionsError.message);
    if (subError) console.warn('Aviso ao carregar subclasses:', subError.message);
    if (subFeatError) console.warn('Aviso ao carregar subclass_features:', subFeatError.message);

    const classesList = (dbClasses || []) as any[];
    const progressionsList = (dbProgressions || []) as any[];
    const featuresList = (dbFeatures || []) as any[];
    const subclassesList = (dbSubclasses || []) as any[];
    const subFeaturesList = (dbSubFeatures || []) as any[];

    // 3. Sincronizar classes base e progressão (1 a 20)
    const classIdToName = syncClassProgressions(classesList, progressionsList);

    // 4. Sincronizar características de nível e subclasses
    syncSubclassesAndFeatures(classIdToName, featuresList, subclassesList, subFeaturesList);
  } catch (err) {
    console.warn('Erro ao conectar ao banco de classes:', err);
  }
}
