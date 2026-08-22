import { useMemo } from 'react';
import { DRACONIC_ANCESTRIES } from '../../../../lib/api/references';

export interface UseRacialCapabilitiesProps {
  character: any;
  getActiveFeats: () => string[];
}

export function useRacialCapabilities({ character, getActiveFeats }: UseRacialCapabilitiesProps) {
  const isDragonborn = useMemo(() => {
    if (!character) return false;
    const race = (character.race || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return race.includes('draconato') || race.includes('dragonborn') || Boolean(character.draconic_ancestry);
  }, [character]);

  const breathWeaponMaxUses = useMemo(() => {
    if (!isDragonborn) return 0;
    const level = Number(character?.level) || 1;
    return character?.proficiencyBonus || (2 + Math.floor((level - 1) / 4));
  }, [isDragonborn, character]);

  const draconicFlightMaxUses = isDragonborn && (Number(character?.level) || 1) >= 5 ? 1 : 0;

  const isGoliath = useMemo(() => {
    if (!character) return false;
    const race = (character.race || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const traitsStr = JSON.stringify(character.racialTraits || character.traits || character.feats || []).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const gAncestry = (character.giant_ancestry || character.giantAncestry || '').toLowerCase();
    return race.includes('golias') || race.includes('goliath') ||
           traitsStr.includes('pedra') || traitsStr.includes('stone') ||
           gAncestry !== '';
  }, [character]);

  const largeFormMaxUses = isGoliath && (Number(character?.level) || 1) >= 5 ? 1 : 0;

  const breathWeaponDetails = useMemo(() => {
    if (!isDragonborn) return null;
    const level = Number(character?.level) || 1;
    const conMod = Math.floor(((character?.constitution || 10) - 10) / 2);
    const pb = character?.proficiencyBonus || (2 + Math.floor((level - 1) / 4));
    const dc = 8 + conMod + pb;

    let diceCount = 1;
    if (level >= 17) diceCount = 4;
    else if (level >= 11) diceCount = 3;
    else if (level >= 5) diceCount = 2;

    const draconicAncestryStr = (character?.draconic_ancestry || character?.draconicAncestry || '').toLowerCase();
    const ancestry = DRACONIC_ANCESTRIES.find(a => 
      a.name.toLowerCase() === draconicAncestryStr ||
      draconicAncestryStr.includes(a.name.toLowerCase()) ||
      a.name.toLowerCase().includes(draconicAncestryStr)
    );
    const damageType = ancestry?.damageType || 'Fogo';

    return {
      dc, conMod, pb, diceCount, diceSides: 10, damageDice: `${diceCount}d10`, damageType, maxUses: pb
    };
  }, [isDragonborn, character]);

  const luckyMaxPoints = useMemo(() => {
    if (!character) return 2;
    const level = Number(character.level) || 1;
    return character.proficiencyBonus || (2 + Math.floor((level - 1) / 4));
  }, [character]);

  const hasLuckyFeat = useMemo(() => {
    const activeFeats = getActiveFeats();
    return activeFeats.some(f => f.toLowerCase().includes('sortudo') || f.toLowerCase().includes('lucky'));
  }, [getActiveFeats]);

  const goliathAncestryMaxUses = useMemo(() => {
    if (!character) return 2;
    const level = Number(character.level) || 1;
    return character.proficiencyBonus || (2 + Math.floor((level - 1) / 4));
  }, [character]);

  const isHalfling = useMemo(() => {
    if (!character) return false;
    const race = (character.race || character.charRace || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const traitsStr = JSON.stringify(character.racialTraits || character.traits || character.feats || []).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return race.includes('pequenino') || race.includes('halfling') || traitsStr.includes('pequenino') || traitsStr.includes('halfling');
  }, [character]);

  const isHuman = useMemo(() => {
    if (!character) return false;
    const race = (character.race || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return race.includes('humano') || race.includes('human');
  }, [character]);

  const isOrc = useMemo(() => {
    if (!character) return false;
    const race = (character.race || character.charRace || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const traitsStr = JSON.stringify(character.racialTraits || character.traits || character.feats || []).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return race.includes('orc') || traitsStr.includes('orc');
  }, [character]);

  const adrenalineRushMaxUses = useMemo(() => {
    if (!isOrc) return 0;
    const level = Number(character?.level) || 1;
    return character?.proficiencyBonus || (2 + Math.floor((level - 1) / 4));
  }, [isOrc, character]);

  const relentlessEnduranceMaxUses = isOrc ? 1 : 0;

  const isAasimar = character?.race === 'Aasimar' || character?.race === 'Aasimar (Guia do Mestre)';
  const healingHandsMaxUses = isAasimar ? 1 : 0;
  const celestialRevelationMaxUses = isAasimar && (character?.level || 1) >= 3 ? 1 : 0;

  return {
    isDragonborn, breathWeaponMaxUses, draconicFlightMaxUses, isGoliath, largeFormMaxUses,
    breathWeaponDetails, luckyMaxPoints, hasLuckyFeat, goliathAncestryMaxUses, isHalfling,
    isHuman, isOrc, adrenalineRushMaxUses, relentlessEnduranceMaxUses, isAasimar,
    healingHandsMaxUses, celestialRevelationMaxUses
  };
}
