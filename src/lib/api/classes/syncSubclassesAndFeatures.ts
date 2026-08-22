import {
  CLASS_REFERENCE,
  FIGHTER_LEVEL_FEATURES,
  FIGHTER_SUBCLASSES,
  SUBCLASSES_REFERENCE,
  SubclassDetail,
  formatSubclassName,
} from '../../../lib/api/references';
import { PORTUGUESE_TO_ENGLISH_CLASS } from './classTranslations';

export function syncSubclassesAndFeatures(
  classIdToName: Record<string, string>,
  featuresList: any[],
  subclassesList: any[],
  subFeaturesList: any[]
): void {
  // 1. Sincronizar características de nível
  if (featuresList.length > 0) {
    const enrichedFeatures = featuresList.map((f: any) => ({
      ...f,
      class_name: classIdToName[f.class_id] || ''
    }));

    const dbFighterFeatures = enrichedFeatures.filter(f => f.class_name === 'Guerreiro');
    if (dbFighterFeatures.length > 0) {
      FIGHTER_LEVEL_FEATURES.length = 0;
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
        (CLASS_REFERENCE as any)[ptClassName] = targetClassObj;
      }
    });
  }

  // 2. Sincronizar subclasses e subclass_features
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

      SUBCLASSES_REFERENCE[dbSub.id] = subDetail;
      SUBCLASSES_REFERENCE[cleanSubName] = subDetail;
      SUBCLASSES_REFERENCE[dbSub.name] = subDetail;

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
          FIGHTER_SUBCLASSES[dbSub.id] = subDetail;
        }
      }

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
}
