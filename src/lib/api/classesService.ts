import { supabase, isSupabaseConfigured } from './supabase';
import {
  CLASS_REFERENCE,
  FIGHTER_LEVEL_FEATURES,
  FIGHTER_SUBCLASSES,
  SUBCLASSES_REFERENCE,
  ClassFeatureDetail,
  SubclassDetail,
  formatSubclassName,
} from '../../lib/api/references';

// Tradução reversa para atualizar as chaves corretas no CLASS_REFERENCE em memória
const PORTUGUESE_TO_ENGLISH_CLASS: Record<string, string> = {
  'Bárbaro': 'Barbarian',
  'Bardo': 'Bard',
  'Clérigo': 'Cleric',
  'Druida': 'Druid',
  'Guerreiro': 'Fighter',
  'Monge': 'Monk',
  'Paladino': 'Paladin',
  'Patrulheiro': 'Ranger',
  'Ladino': 'Rogue',
  'Feiticeiro': 'Sorcerer',
  'Bruxo': 'Warlock',
  'Mago': 'Wizard'
};

const ENGLISH_TO_PORTUGUESE_CLASS: Record<string, string> = {
  Barbarian: 'Bárbaro',
  Bard: 'Bardo',
  Cleric: 'Clérigo',
  Druid: 'Druida',
  Fighter: 'Guerreiro',
  Monk: 'Monge',
  Paladin: 'Paladino',
  Ranger: 'Patrulheiro',
  Rogue: 'Ladino',
  Sorcerer: 'Feiticeiro',
  Warlock: 'Bruxo',
  Wizard: 'Mago'
};

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

    // 2. Carregar class_level_features do banco
    const { data: dbFeatures, error: featureError } = await supabase.from('class_level_features').select('*');
    if (featureError) {
      console.warn('Aviso: Não foi possível carregar características das classes do banco:', featureError.message);
    }

    // 3. Carregar class_progressions do banco (progressão detalhada de 1 a 20)
    const { data: dbProgressions, error: progressionsError } = await supabase.from('class_progressions').select('*');
    if (progressionsError) {
      console.warn('Aviso: Não foi possível carregar a progressão das classes do banco:', progressionsError.message);
    }

    // 4. Carregar subclasses e subclass_features do banco
    const { data: dbSubclasses, error: subError } = await supabase.from('subclasses').select('*');
    if (subError) {
      console.warn('Aviso: Não foi possível carregar subclasses do banco:', subError.message);
    }

    const { data: dbSubFeatures, error: subFeatError } = await supabase.from('subclass_features').select('*');
    if (subFeatError) {
      console.warn('Aviso: Não foi possível carregar subclass_features do banco:', subFeatError.message);
    }

    const classesList = (dbClasses || []) as any[];
    const progressionsList = (dbProgressions || []) as any[];
    const featuresList = (dbFeatures || []) as any[];
    const subclassesList = (dbSubclasses || []) as any[];
    const subFeaturesList = (dbSubFeatures || []) as any[];

    // 5. Atualizar o cache em memória (CLASS_REFERENCE e FIGHTER_LEVEL_FEATURES)
    const classIdToName: Record<string, string> = {};
    for (const dbClass of classesList) {
      classIdToName[dbClass.id] = dbClass.name;
      const engName = PORTUGUESE_TO_ENGLISH_CLASS[dbClass.name];
      if (!engName) continue;

      let targetClassObj = (CLASS_REFERENCE as any)[engName];
      if (!targetClassObj) {
        targetClassObj = {};
        (CLASS_REFERENCE as any)[engName] = targetClassObj;
      }

      // Sincronizar propriedades base
      targetClassObj.id = dbClass.id;
      targetClassObj.name = dbClass.name;
      targetClassObj.icon = dbClass.icon;
      targetClassObj.primaryAbility = dbClass.primary_ability;
      targetClassObj.hitPointDie = dbClass.hit_point_die;
      targetClassObj.savingThrows = Array.isArray(dbClass.saving_throws) ? dbClass.saving_throws : [];
      targetClassObj.skills = dbClass.skills;
      targetClassObj.weapons = Array.isArray(dbClass.weapons) ? dbClass.weapons : [];
      targetClassObj.armor = Array.isArray(dbClass.armor) ? dbClass.armor : [];
      targetClassObj.tools = Array.isArray(dbClass.tools) ? dbClass.tools : [];
      targetClassObj.equipmentOptions = dbClass.equipment_options || { A: '', B: '' };

      // Atualizar chaves em Português no CLASS_REFERENCE também para maior robustez
      (CLASS_REFERENCE as any)[dbClass.name] = targetClassObj;
    }

    // Se carregamos a progressão de nível do banco de dados com sucesso, atualiza o CLASS_REFERENCE
    if (progressionsList.length > 0) {
      Object.entries(PORTUGUESE_TO_ENGLISH_CLASS).forEach(([ptClassName, engClassName]) => {
        const targetClassObj = (CLASS_REFERENCE as any)[engClassName];
        if (targetClassObj) {
          const classDbId = classesList.find((c: any) => c.name === ptClassName)?.id;
          if (classDbId) {
            const classProgs = progressionsList.filter((p: any) => p.class_id === classDbId);
            if (classProgs.length > 0) {
              classProgs.sort((a: any, b: any) => a.level - b.level);
              targetClassObj.progression = classProgs.map((p: any) => {
                const mappedObj: any = {
                  level: p.level,
                  prof: p.prof,
                  features: '—',
                  ...(p.metadata || {})
                };
                
                // Mapear colunas explícitas do banco para as chaves camelCase em memória
                if (p.cantrips_known !== null && p.cantrips_known !== undefined) mappedObj.cantrips = p.cantrips_known;
                if (p.prepared_spells !== null && p.prepared_spells !== undefined) mappedObj.preparedSpells = p.prepared_spells;
                if (p.spell_slots !== null && p.spell_slots !== undefined) {
                  if (engClassName === 'Warlock' && Array.isArray(p.spell_slots)) {
                    mappedObj.spellSlots = p.spell_slots[0];
                  } else {
                    mappedObj.spellSlots = p.spell_slots;
                  }
                }
                if (p.bardic_die !== null && p.bardic_die !== undefined) mappedObj.bardicDie = p.bardic_die;
                if (p.rages !== null && p.rages !== undefined) {
                  if (engClassName === 'Ranger') {
                    mappedObj.favoredEnemy = p.rages;
                  } else {
                    mappedObj.rages = p.rages;
                  }
                }
                if (p.rage_damage !== null && p.rage_damage !== undefined) mappedObj.rageDamage = p.rage_damage;
                if (p.weapon_mastery !== null && p.weapon_mastery !== undefined) mappedObj.weaponMastery = p.weapon_mastery;
                if (p.channel_divinity !== null && p.channel_divinity !== undefined) mappedObj.channelDivinity = p.channel_divinity;
                if (p.wild_shapes !== null && p.wild_shapes !== undefined) mappedObj.wildShape = p.wild_shapes;
                if (p.second_wind !== null && p.second_wind !== undefined) mappedObj.secondWind = p.second_wind;
                if (p.martial_arts_die !== null && p.martial_arts_die !== undefined) mappedObj.martialArts = p.martial_arts_die;
                if (p.focus_points !== null && p.focus_points !== undefined) mappedObj.focusPoints = p.focus_points;
                if (p.unarmored_movement !== null && p.unarmored_movement !== undefined) mappedObj.unarmoredMovement = p.unarmored_movement;
                if (p.sneak_attack_die !== null && p.sneak_attack_die !== undefined) mappedObj.sneakAttack = p.sneak_attack_die;
                if (p.sorcery_points !== null && p.sorcery_points !== undefined) mappedObj.sorceryPoints = p.sorcery_points;
                if (p.invocations_known !== null && p.invocations_known !== undefined) mappedObj.invocations = p.invocations_known;
                if (p.warlock_slot_level !== null && p.warlock_slot_level !== undefined) mappedObj.slotLevel = p.warlock_slot_level;
                
                return mappedObj;
              });
              // Sincroniza também a versão traduzida
              (CLASS_REFERENCE as any)[ptClassName] = targetClassObj;
            }
          }
        }
      });
    }

    // Se carregamos características de nível com sucesso, atualiza a progressão das classes e o FIGHTER_LEVEL_FEATURES
    if (featuresList.length > 0) {
      // Mapear class_id para o nome correspondente em cada característica
      const enrichedFeatures = featuresList.map((f: any) => ({
        ...f,
        class_name: classIdToName[f.class_id] || ''
      }));

      // Limpa e reconstrói o FIGHTER_LEVEL_FEATURES em memória caso haja dados ricos de guerreiro no banco
      const dbFighterFeatures = enrichedFeatures.filter(f => f.class_name === 'Guerreiro');
      if (dbFighterFeatures.length > 0) {
        FIGHTER_LEVEL_FEATURES.length = 0; // Limpa o array conservando a referência original
        dbFighterFeatures
          .sort((a, b) => a.level - b.level)
          .forEach(f => {
            FIGHTER_LEVEL_FEATURES.push({
              level: f.level,
              name: f.name,
              actionType: f.action_type as any,
              description: f.description,
              usageLimit: f.usage_limit || undefined
            });
          });
      }

      // Atualiza a progressão em cada classe para usar os nomes das características do banco de dados
      Object.entries(PORTUGUESE_TO_ENGLISH_CLASS).forEach(([ptClassName, engClassName]) => {
        const targetClassObj = (CLASS_REFERENCE as any)[engClassName];
        if (targetClassObj && Array.isArray(targetClassObj.progression)) {
          targetClassObj.progression = targetClassObj.progression.map((prog: any) => {
            const levelFeatures = enrichedFeatures
              .filter(f => f.class_name === ptClassName && f.level === prog.level)
              .map(f => f.name);

            return {
              ...prog,
              features: levelFeatures.length > 0 ? levelFeatures.join(', ') : (prog.features || '—')
            };
          });
          // Atualiza também a versão em português
          (CLASS_REFERENCE as any)[ptClassName] = targetClassObj;
        }
      });
    }

    // 6. Sincronizar subclasses e subclass_features do banco
    if (subclassesList.length > 0) {
      for (const dbSub of subclassesList) {
        const parentClassName = classIdToName[dbSub.class_id] || '';
        const matchingSubFeatures = subFeaturesList
          .filter((sf: any) => sf.subclass_id === dbSub.id)
          .sort((a: any, b: any) => a.level - b.level)
          .map((sf: any) => ({
            level: sf.level,
            name: sf.name,
            actionType: sf.action_type || 'Passiva',
            description: sf.description,
            usageLimit: sf.usage_limit || undefined
          }));

        const cleanSubName = formatSubclassName(dbSub.name);
        const subDetail: SubclassDetail = {
          id: dbSub.id,
          name: cleanSubName,
          description: dbSub.description || '',
          features: matchingSubFeatures
        };

        // Salva na referência global de subclasses
        SUBCLASSES_REFERENCE[dbSub.id] = subDetail;
        SUBCLASSES_REFERENCE[cleanSubName] = subDetail;
        SUBCLASSES_REFERENCE[dbSub.name] = subDetail;

        // Se for Guerreiro, sincroniza com FIGHTER_SUBCLASSES
        if (parentClassName === 'Guerreiro') {
          const normKey = cleanSubName.toLowerCase();
          if (normKey.includes('batalha') || normKey.includes('battle')) {
            FIGHTER_SUBCLASSES.BattleMaster = {
              ...FIGHTER_SUBCLASSES.BattleMaster,
              id: 'BattleMaster',
              name: cleanSubName,
              description: dbSub.description || FIGHTER_SUBCLASSES.BattleMaster.description,
              features: matchingSubFeatures.length > 0 ? matchingSubFeatures : FIGHTER_SUBCLASSES.BattleMaster.features
            };
          } else if (normKey.includes('campe') || normKey.includes('champion')) {
            FIGHTER_SUBCLASSES.Champion = {
              ...FIGHTER_SUBCLASSES.Champion,
              id: 'Champion',
              name: cleanSubName,
              description: dbSub.description || FIGHTER_SUBCLASSES.Champion.description,
              features: matchingSubFeatures.length > 0 ? matchingSubFeatures : FIGHTER_SUBCLASSES.Champion.features
            };
          } else if (normKey.includes('arcano') || normKey.includes('eldritch') || normKey.includes('místico') || normKey.includes('mistico')) {
            FIGHTER_SUBCLASSES.EldritchKnight = {
              ...FIGHTER_SUBCLASSES.EldritchKnight,
              id: 'EldritchKnight',
              name: cleanSubName,
              description: dbSub.description || FIGHTER_SUBCLASSES.EldritchKnight.description,
              features: matchingSubFeatures.length > 0 ? matchingSubFeatures : FIGHTER_SUBCLASSES.EldritchKnight.features
            };
          } else if (normKey.includes('psi') || normKey.includes('psíquico') || normKey.includes('psiquico')) {
            FIGHTER_SUBCLASSES.PsiWarrior = {
              ...FIGHTER_SUBCLASSES.PsiWarrior,
              id: 'PsiWarrior',
              name: cleanSubName,
              description: dbSub.description || FIGHTER_SUBCLASSES.PsiWarrior.description,
              features: matchingSubFeatures.length > 0 ? matchingSubFeatures : FIGHTER_SUBCLASSES.PsiWarrior.features
            };
          } else {
            // Nova subclasse de guerreiro cadastrada no banco (sem duplicar chaves)
            FIGHTER_SUBCLASSES[dbSub.id] = subDetail;
          }
        }

        // Anexar subclasses ao CLASS_REFERENCE
        const engParent = PORTUGUESE_TO_ENGLISH_CLASS[parentClassName];
        if (engParent && (CLASS_REFERENCE as any)[engParent]) {
          const target = (CLASS_REFERENCE as any)[engParent];
          if (!Array.isArray(target.subclasses)) {
            target.subclasses = [];
          }
          const existingIdx = target.subclasses.findIndex((s: any) => s.id === dbSub.id || s.name === cleanSubName);
          if (existingIdx >= 0) {
            target.subclasses[existingIdx] = subDetail;
          } else {
            target.subclasses.push(subDetail);
          }
        }
      }
    }
  } catch (err) {
    console.warn('Erro ao conectar ao banco de classes:', err);
  }
}
