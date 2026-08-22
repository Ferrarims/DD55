import { useMemo } from 'react';
import { calculateResources, calculateRaceResources } from '../../../../../lib/mechanics/resourcesParser';

export const useMergedClassResources = (character: any, effectiveLevel: number, selectedSubclass?: string) => {
  return useMemo(() => {
    const stats = {
      str: character.strength || 10,
      dex: character.dexterity || 10,
      con: character.constitution || 10,
      int: character.intelligence || 10,
      wis: character.wisdom || 10,
      cha: character.charisma || 10,
    };
    const freshResources = calculateResources(
      character.class_name || 'Guerreiro',
      effectiveLevel,
      stats,
      selectedSubclass || character.subclass || 'Champion'
    );
    const raceRes = calculateRaceResources(
      character.race || '',
      effectiveLevel,
      character.draconic_ancestry,
      character.giant_ancestry || character.giantAncestry
    );
    raceRes.forEach(rr => {
      if (!freshResources.some(cr => cr.name.toLowerCase() === rr.name.toLowerCase())) {
        freshResources.push(rr);
      }
    });

    const existingResources = Array.isArray(character.class_resources) ? character.class_resources : [];

    const merged = freshResources.map(fresh => {
      const existing = existingResources.find((e: any) => e && e.name && e.name.toLowerCase() === fresh.name.toLowerCase());
      const usedCount = existing && typeof existing.used === 'number' ? existing.used : 0;
      return {
        ...fresh,
        used: Math.min(fresh.max, Math.max(0, usedCount))
      };
    });

    existingResources.forEach((e: any) => {
      if (e && e.name && !merged.some(m => m.name.toLowerCase() === e.name.toLowerCase())) {
        merged.push({ ...e, used: typeof e.used === 'number' ? e.used : 0 });
      }
    });

    return merged;
  }, [character, effectiveLevel, selectedSubclass]);
};
