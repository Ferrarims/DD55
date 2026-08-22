import { CombatEntity } from '../../types';
import { RACES_REFERENCE } from '../../../lib/api/references';

export function sortInitiativeOrder<T extends { id: string; initiative: number; stats?: { dex: number } }>(
  entities: T[]
): T[] {
  return [...entities].sort((a, b) => {
    if (b.initiative !== a.initiative) {
      return b.initiative - a.initiative;
    }
    const aDex = a.stats?.dex ?? 10;
    const bDex = b.stats?.dex ?? 10;
    return bDex - aDex;
  });
}

export const getEntitySizeInSquares = (sizeStr?: string): number => {
  if (!sizeStr) return 1;
  const s = sizeStr.toLowerCase();
  if (s.includes('tiny') || s.includes('miudo') || s.includes('miúdo') || s.includes('diminuto')) return 1;
  if (s.includes('small') || s.includes('pequeno')) return 1;
  if (s.includes('medium') || s.includes('médio') || s.includes('medio')) return 1;
  if (s.includes('large') || s.includes('grande')) return 2;
  if (s.includes('huge') || s.includes('enorme')) return 3;
  if (s.includes('gargantuan') || s.includes('imenso') || s.includes('colossal')) return 4;
  return 1;
};

export const determineMonsterSize = (name: string, traits?: { name: string; text: string }[]): string => {
  const n = name.toLowerCase();
  if (n.includes('ancião') || n.includes('anciao') || n.includes('ancient') || n.includes('tarrasque') || n.includes('kraken') || n.includes('colossal') || n.includes('imenso') || n.includes('gargantuan')) {
    return 'Gargantuan';
  }
  if (n.includes('adulto') || n.includes('adult') || n.includes('gigante') || n.includes('giant') || n.includes('enorme') || n.includes('huge') || n.includes('treant') || n.includes('hydra') || n.includes('behir') || n.includes('remorhaz') || n.includes('mamute') || n.includes('mammoth')) {
    return 'Huge';
  }
  if (n.includes('jovem') || n.includes('young') || n.includes('ogro') || n.includes('ogre') || n.includes('troll') || n.includes('minotaur') || n.includes('minotauro') || n.includes('owlbear') || n.includes('urso coruja') || n.includes('manticora') || n.includes('manticore') || n.includes('quimera') || n.includes('chimera') || n.includes('grifo') || n.includes('griffin') || n.includes('pegaso') || n.includes('pegasus') || n.includes('centauro') || n.includes('centaur') || n.includes('gorgon') || n.includes('wyvern') || n.includes('bulette') || n.includes('golem') || n.includes('lobo atroz') || n.includes('dire wolf') || n.includes('aranha gigante') || n.includes('giant spider') || n.includes('unicorn') || n.includes('unicórnio') || n.includes('beholder') || n.includes('grande') || n.includes('large')) {
    return 'Large';
  }
  if (n.includes('goblin') || n.includes('kobold') || n.includes('halfling') || n.includes('gnomo') || n.includes('gnome') || n.includes('pixie') || n.includes('sprite') || n.includes('imp') || n.includes('pequeno') || n.includes('small')) {
    return 'Small';
  }
  if (n.includes('rato') || n.includes('rat') || n.includes('morcego') || n.includes('bat') || n.includes('homunculus') || n.includes('homúnculo') || n.includes('pseudodragon') || n.includes('pseudodragão') || n.includes('miúdo') || n.includes('miudo') || n.includes('tiny')) {
    return 'Tiny';
  }
  if (traits && traits.length > 0) {
    for (const t of traits) {
      const txt = (t.name + ' ' + t.text).toLowerCase();
      if (txt.includes('gargantuan') || txt.includes('imenso') || txt.includes('colossal')) return 'Gargantuan';
      if (txt.includes('huge') || txt.includes('enorme')) return 'Huge';
      if (txt.includes('large') || txt.includes('grande')) return 'Large';
      if (txt.includes('small') || txt.includes('pequeno')) return 'Small';
      if (txt.includes('tiny') || txt.includes('miúdo') || txt.includes('miudo')) return 'Tiny';
    }
  }
  return 'Medium';
};

export const getDistanceBetweenEntities = (
  e1: CombatEntity,
  e2: CombatEntity,
  charRace?: string,
  isLargeForm?: boolean
): number => {
  const getSizeStr = (e: CombatEntity) => {
    if (e.type === 'hero' && isLargeForm) return 'Grande';
    if (e.size) return e.size;
    if (e.type === 'hero') {
      return (charRace ? RACES_REFERENCE[charRace]?.size : 'Médio');
    }
    return 'Médio';
  };
  const s1 = getEntitySizeInSquares(getSizeStr(e1));
  const s2 = getEntitySizeInSquares(getSizeStr(e2));

  let minDist = Infinity;
  for (let x1 = e1.x; x1 < e1.x + s1; x1++) {
    for (let y1 = e1.y; y1 < e1.y + s1; y1++) {
      for (let x2 = e2.x; x2 < e2.x + s2; x2++) {
        for (let y2 = e2.y; y2 < e2.y + s2; y2++) {
          const d = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
          if (d < minDist) {
            minDist = d;
          }
        }
      }
    }
  }
  return minDist;
};

export function getAttacksPerAction(character: any): number {
  if (!character) return 1;
  const level = Number(character.level || character.charLevel || character.lvl || 1);
  const className = (character.class_name || character.charClass || character.class || '').toLowerCase().trim();

  if (className.includes('guerreiro') || className.includes('fighter')) {
    if (level >= 20) return 4;
    if (level >= 11) return 3;
    if (level >= 5) return 2;
  } else if (
    className.includes('bárbaro') || className.includes('barbarian') ||
    className.includes('paladino') || className.includes('paladin') ||
    className.includes('patrulheiro') || className.includes('ranger') ||
    className.includes('monge') || className.includes('monk') ||
    className.includes('bardo') || className.includes('bard')
  ) {
    if (level >= 5) return 2;
  }
  return 1;
}
