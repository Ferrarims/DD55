export interface Trait {
  name: string;
  description: string;
  type?: string;
  usageLimit?: string;
}

export interface RaceInfo {
  name: string;
  creatureType: string;
  size: string;
  speed: string;
  traits: Trait[];
  icon?: string;
  variants?: { name: string; description: string; metadata: any }[];
}

export const RACES_REFERENCE: Record<string, RaceInfo> = {};

export function getRaceInfo(raceKey?: string): RaceInfo | undefined {
  if (!raceKey) return undefined;
  const key = raceKey.trim();
  if (RACES_REFERENCE[key]) return RACES_REFERENCE[key];
  const lower = key.toLowerCase();
  if (lower === 'human' || lower === 'humano') return RACES_REFERENCE['Humano'];
  if (lower === 'dwarf' || lower === 'anão' || lower === 'anao') return RACES_REFERENCE['Anão'];
  if (lower === 'elf' || lower === 'elfo') return RACES_REFERENCE['Elfo'];
  if (lower === 'gnome' || lower === 'gnomo') return RACES_REFERENCE['Gnomo'];
  if (lower === 'goliath' || lower === 'golias') return RACES_REFERENCE['Golias'];
  if (lower === 'halfling' || lower === 'pequenino') return RACES_REFERENCE['Pequenino'];
  if (lower === 'tiefling' || lower === 'tiferino') return RACES_REFERENCE['Tiferino'];
  if (lower === 'dragonborn' || lower === 'draconato') return RACES_REFERENCE['Draconato'];
  if (lower === 'aasimar') return RACES_REFERENCE['Aasimar'];
  if (lower === 'orc') return RACES_REFERENCE['Orc'];
  return undefined;
}

export function getRaceIcon(raceName?: string, fallbackIcon?: string): string {
  if (!raceName) return fallbackIcon || '👤';
  const raceInfo = getRaceInfo(raceName);
  if (raceInfo?.icon && raceInfo.icon !== '👤') return raceInfo.icon;

  const raceKey = raceName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  if (raceKey.includes('aasimar')) return '👼';
  if (raceKey.includes('anao') || raceKey.includes('dwarf')) return '🧔';
  if (raceKey.includes('draconato') || raceKey.includes('dragonborn') || raceKey.includes('dragao')) return '🐉';
  if (raceKey.includes('elfo') || raceKey.includes('elf')) return '🧝';
  if (raceKey.includes('gnomo') || raceKey.includes('gnome')) return '🧙‍♂️';
  if (raceKey.includes('golias') || raceKey.includes('goliath')) return '🪨';
  if (raceKey.includes('humano') || raceKey.includes('human')) return '👤';
  if (raceKey.includes('orc')) return '👹';
  if (raceKey.includes('pequenino') || raceKey.includes('halfling')) return '🧒';
  if (raceKey.includes('tiferino') || raceKey.includes('tiefling')) return '😈';

  return fallbackIcon || '👤';
}

export interface SpellInfo {
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  classes: string[];
  description: string;
}

export const SPELLS_REFERENCE: Record<string, SpellInfo> = {};
