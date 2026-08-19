import { supabase, isSupabaseConfigured } from './supabase';
import { RACES_REFERENCE, RaceInfo } from '../../lib/api/references';

export async function fetchRacesFromDb(alreadyTriedSeeding = false): Promise<any[]> {
  const fallbackData = Object.entries(RACES_REFERENCE).map(([id, race]) => ({ id, ...race }));

  if (!isSupabaseConfigured) {
    return fallbackData;
  }

  try {
    // 1. Carregar as raças do banco
    const { data: dbRaces, error: raceError } = await supabase.from('races').select('*');
    if (raceError) {
      console.warn('Aviso: Não foi possível carregar as raças do banco, usando fallback local:', raceError.message);
      return fallbackData;
    }

    if (!dbRaces || dbRaces.length === 0) {
      console.warn('Aviso: A tabela public.races está vazia no banco de dados.');
      return fallbackData;
    }

    // 2. Carregar todos os traços raciais do banco
    const { data: dbTraits, error: traitError } = await supabase.from('race_traits').select('*');
    if (traitError) {
      console.warn('Aviso: Não foi possível carregar os traços das raças do banco:', traitError.message);
    }

    // 3. Carregar todos os variantes raciais do banco
    const { data: dbVariants, error: variantError } = await supabase.from('race_variants').select('*');
    if (variantError) {
      console.warn('Aviso: Não foi possível carregar as variantes das raças do banco:', variantError.message);
    }

    // 4. Atualizar o RACES_REFERENCE em memória de maneira retrocompatível
    // Limpa o objeto mantendo as referências originais de memória para reatividade
    Object.keys(RACES_REFERENCE).forEach(key => {
      delete RACES_REFERENCE[key];
    });

    dbRaces.forEach((dbRace: any) => {
      let traitsList = dbTraits 
        ? dbTraits
            .filter((t: any) => t.race_id === dbRace.id)
            .map((t: any) => {
              const nameLower = (t.trait_name || '').toLowerCase();
              let traitType = t.type || t.trait_type || "Automática";
              let traitDesc = t.description;
              if (nameLower.includes('sopro') || nameLower.includes('breath')) {
                traitType = "Ataque";
              } else if (nameLower.includes('voo') || nameLower.includes('flight') || nameLower.includes('forma grande') || nameLower.includes('large form')) {
                traitType = "Ação Bônus";
              } else if (nameLower.includes('mãos curativas') || nameLower.includes('healing hands') || nameLower.includes('revelação celestial') || nameLower.includes('celestial revelation')) {
                traitType = "Ação";
              } else if (nameLower.includes('corajoso') || nameLower.includes('agilidade pequenina')) {
                traitType = "Passiva";
                if (nameLower.includes('corajoso')) traitDesc = "Vantagem em salvaguardas contra ser Amedrontado.";
                if (nameLower.includes('agilidade')) traitDesc = "Pode se mover pelo espaço de qualquer criatura que seja de tamanho maior que o seu.";
              } else if (nameLower.includes('furtividade natural')) {
                traitType = "Ação";
                traitDesc = "Pode tentar se esconder de dia usando obstáculos como cobertura.";
              } else if (nameLower.includes('sorte')) {
                traitType = "Automática";
                traitDesc = "Ao rolar um 1 natural em um d20, pode rerolar e usar o novo resultado.";
              } else if (nameLower.includes('ancestralidade gigante')) {
                traitType = "Automática";
              }
              return {
                name: t.trait_name,
                description: traitDesc,
                type: traitType
              };
            })
        : [];

      const isHalfling = /pequenino|halfling/i.test(dbRace.name || '');
      if (isHalfling) {
        traitsList = [
          { name: "Sorte", description: "Ao rolar um 1 natural em um d20, pode rerolar e usar o novo resultado.", type: "Automática" },
          { name: "Corajoso", description: "Vantagem em salvaguardas contra ser Amedrontado.", type: "Passiva" },
          { name: "Agilidade Pequenina", description: "Pode se mover pelo espaço de qualquer criatura que seja de tamanho maior que o seu.", type: "Passiva" },
          { name: "Furtividade Natural", description: "Pode tentar se esconder de dia usando obstáculos como cobertura.", type: "Ação" }
        ];
      }

      // D&D 2024 Humano oficial: Engenhoso (Resourceful), Hábil (Skillful), Versátil (Versatile)
      const isHuman = /humano|human/i.test(dbRace.name || '');
      if (isHuman) {
        traitsList = [
          {
            name: "Engenhoso (Resourceful)",
            description: "Você ganha Inspiração Heroica sempre que finalizar um Descanso Longo. Ao falhar em qualquer teste de d20, você pode gastá-la para rolar o d20 novamente.",
            type: "Automático"
          },
          {
            name: "Hábil (Skillful)",
            description: "Você recebe proficiência em uma perícia à sua escolha.",
            type: "Automática"
          },
          {
            name: "Versátil (Versatile)",
            description: "Você recebe um Talento de Origem à sua escolha.",
            type: "Automática"
          }
        ];
      }

      let variantsList = dbVariants
        ? dbVariants
            .filter((v: any) => v.race_id === dbRace.id)
            .map((v: any) => ({
              name: v.name,
              description: v.description,
              metadata: v.metadata
            }))
        : [];

      RACES_REFERENCE[dbRace.name] = {
        name: dbRace.name,
        icon: dbRace.icon || "👤",
        creatureType: dbRace.creature_type,
        size: dbRace.size,
        speed: dbRace.speed,
        traits: traitsList,
        variants: variantsList
      };
    });
    return Object.entries(RACES_REFERENCE).map(([id, race]) => ({ id, ...race }));
  } catch (err) {
    console.warn('Erro ao conectar ao banco de raças:', err);
    return fallbackData;
  }
}
