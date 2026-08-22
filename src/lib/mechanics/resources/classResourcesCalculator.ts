import { Resource } from '../../../types';
import { CLASS_REFERENCE } from '../../../lib/api/references';
import { appendMartialClassResources } from './calculators/martialClassResources';
import { appendCasterAndFeatResources } from './calculators/casterClassResources';

export const CLASS_NAME_MAP: Record<string, string> = {
  'Bárbaro': 'Barbarian', 'Barbarian': 'Barbarian',
  'Bardo': 'Bard', 'Bard': 'Bard',
  'Clérigo': 'Cleric', 'Cleric': 'Cleric',
  'Druida': 'Druid', 'Druid': 'Druid',
  'Guerreiro': 'Fighter', 'Fighter': 'Fighter',
  'Monge': 'Monk', 'Monk': 'Monk',
  'Paladino': 'Paladin', 'Paladin': 'Paladin',
  'Patrulheiro': 'Ranger', 'Ranger': 'Ranger',
  'Ladino': 'Rogue', 'Rogue': 'Rogue',
  'Feiticeiro': 'Sorcerer', 'Sorcerer': 'Sorcerer',
  'Bruxo': 'Warlock', 'Warlock': 'Warlock',
  'Mago': 'Wizard', 'Wizard': 'Wizard'
};

export const calculateResources = (
  charClass: string,
  level: number,
  stats: { str: number; dex: number; con: number; int: number; wis: number; cha: number },
  subclass?: string,
  feats?: string[],
  fightingStyle?: string
): Resource[] => {
  const resources: Resource[] = [];
  const classKey = CLASS_NAME_MAP[charClass] || charClass;
  const classData = CLASS_REFERENCE[classKey as keyof typeof CLASS_REFERENCE];
  const prog = classData?.progression[Math.min(20, Math.max(1, level)) - 1];

  appendCasterAndFeatResources({
    classKey,
    level,
    stats,
    prog,
    resources,
    feats,
    fightingStyle,
  });

  appendMartialClassResources({
    classKey,
    level,
    subclass,
    prog,
    resources,
  });

  return resources;
};
