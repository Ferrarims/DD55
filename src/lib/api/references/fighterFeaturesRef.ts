import {
  ClassFeatureDetail,
  SubclassDetail,
  FIGHTER_LEVEL_FEATURES,
  FIGHTER_SUBCLASSES,
  SUBCLASSES_REFERENCE,
  CLASS_REFERENCE,
} from './fighterClassesRef';

export const getFighterSubclass = (subclassIdentifier?: string): SubclassDetail | undefined => {
  if (!subclassIdentifier) return undefined;
  if (FIGHTER_SUBCLASSES[subclassIdentifier]) return FIGHTER_SUBCLASSES[subclassIdentifier];
  if (SUBCLASSES_REFERENCE[subclassIdentifier]) return SUBCLASSES_REFERENCE[subclassIdentifier];

  const normalized = subclassIdentifier.toLowerCase().trim();
  const allSubclasses = { ...FIGHTER_SUBCLASSES, ...SUBCLASSES_REFERENCE };

  return Object.values(allSubclasses).find(
    sub =>
      sub.id.toLowerCase() === normalized ||
      sub.name.toLowerCase() === normalized ||
      (normalized.includes('batalha') && (sub.id === 'BattleMaster' || sub.name.includes('Batalha'))) ||
      (normalized.includes('battle') && (sub.id === 'BattleMaster' || sub.name.includes('Batalha'))) ||
      (normalized.includes('campe') && (sub.id === 'Champion' || sub.name.includes('Campeão'))) ||
      (normalized.includes('champion') && (sub.id === 'Champion' || sub.name.includes('Campeão'))) ||
      (normalized.includes('arcano') && (sub.id === 'EldritchKnight' || sub.name.includes('Arcano'))) ||
      (normalized.includes('eldritch') && (sub.id === 'EldritchKnight' || sub.name.includes('Arcano'))) ||
      (normalized.includes('psi') && (sub.id === 'PsiWarrior' || sub.name.includes('Psíquico'))) ||
      (normalized.includes('psíquico') && (sub.id === 'PsiWarrior' || sub.name.includes('Psíquico'))) ||
      (normalized.includes('psiquico') && (sub.id === 'PsiWarrior' || sub.name.includes('Psíquico')))
  );
};

export const formatSubclassName = (subclassName?: string): string => {
  if (!subclassName) return '';
  const sub = getFighterSubclass(subclassName);
  if (sub) return sub.name;
  return subclassName.replace(/\s*\([^)]*\)/g, '').trim();
};

export const getFighterFeaturesForLevel = (level: number, subclassId?: string): ClassFeatureDetail[] => {
  const baseFeatures = FIGHTER_LEVEL_FEATURES.filter(f => f.level <= level);
  let subFeatures: ClassFeatureDetail[] = [];

  const sub = getFighterSubclass(subclassId);
  if (sub && Array.isArray(sub.features)) {
    subFeatures = sub.features
      .filter(f => f.level <= level)
      .map(f => ({
        level: f.level,
        name: f.name,
        actionType: f.actionType,
        description: f.description,
        usageLimit: f.usageLimit,
        subclassName: sub.name,
      }));
  }

  const all = [...baseFeatures, ...subFeatures];
  all.sort((a, b) => a.level - b.level);
  return all;
};

export const getClassFeaturesGainedAtLevel = (className: string, level: number, subclassId?: string): string[] => {
  const clsLower = (className || '').toLowerCase();

  if (clsLower.includes('guerreiro') || clsLower.includes('fighter')) {
    const levelFeatures = getFighterFeaturesForLevel(level, subclassId).filter(f => f.level === level);
    if (levelFeatures.length > 0) {
      return levelFeatures.map(f => f.name);
    }
  }

  const classMapping: Record<string, string> = {
    bárbaro: 'Barbarian',
    barbarian: 'Barbarian',
    bardo: 'Bard',
    bard: 'Bard',
    clérigo: 'Cleric',
    cleric: 'Cleric',
    druida: 'Druid',
    druid: 'Druid',
    guerreiro: 'Fighter',
    fighter: 'Fighter',
    monge: 'Monk',
    monk: 'Monk',
    paladino: 'Paladin',
    paladin: 'Paladin',
    patrulheiro: 'Ranger',
    ranger: 'Ranger',
    ladino: 'Rogue',
    rogue: 'Rogue',
    feiticeiro: 'Sorcerer',
    sorcerer: 'Sorcerer',
    bruxo: 'Warlock',
    warlock: 'Warlock',
    mago: 'Wizard',
    wizard: 'Wizard',
  };

  const key = classMapping[clsLower] || Object.keys(CLASS_REFERENCE).find(k => k.toLowerCase() === clsLower);
  let features: string[] = [];

  if (key && (CLASS_REFERENCE as any)[key]?.progression) {
    const prog = (CLASS_REFERENCE as any)[key].progression.find((p: any) => p.level === level);
    if (prog && prog.features && prog.features !== '—') {
      features = prog.features.split(',').map((f: string) => f.trim());
    }
  }

  // Também verificar se há características de subclasse para este nível
  const sub = getFighterSubclass(subclassId);
  if (sub && Array.isArray(sub.features)) {
    const subGains = sub.features.filter(f => f.level === level).map(f => f.name);
    if (subGains.length > 0) {
      features = Array.from(new Set([...features, ...subGains]));
    }
  }

  if (features.length > 0) {
    return features;
  }

  return ['Evolução de Classe'];
};
