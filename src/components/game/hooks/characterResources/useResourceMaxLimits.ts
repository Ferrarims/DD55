import { useMemo } from 'react';
import { getResourceMaxUses } from '../../utils/resourceUtils';

export function useResourceMaxLimits(character: any) {
  const isGoliath = useMemo(() => {
    if (!character) return false;
    const race = (character.race || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const traitsStr = JSON.stringify(character.racialTraits || character.traits || character.feats || []).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const gAncestry = (character.giant_ancestry || character.giantAncestry || '').toLowerCase();
    return race.includes('golias') || race.includes('goliath') ||
           traitsStr.includes('pedra') || traitsStr.includes('stone') ||
           gAncestry !== '';
  }, [character]);

  const secondWindMaxUses = useMemo(() => getResourceMaxUses(character, ['fôlego', 'folego', 'second wind'], 1), [character]);
  const healingHandsMaxUses = useMemo(() => getResourceMaxUses(character, ['mãos', 'maos', 'lay on hands', 'healing hands'], 1), [character]);
  const celestialRevelationMaxUses = useMemo(() => getResourceMaxUses(character, ['revelação', 'revelacao', 'celestial revelation'], 1), [character]);
  const draconicFlightMaxUses = useMemo(() => getResourceMaxUses(character, ['voo', 'flight', 'draconic flight'], 1), [character]);
  const largeFormMaxUses = useMemo(() => {
    if (!isGoliath || (Number(character?.level) || 1) < 5) return 0;
    return 1;
  }, [character, isGoliath]);
  const goliathAncestryMaxUses = useMemo(() => {
    if (!isGoliath) return 0;
    const pb = character?.proficiencyBonus || (2 + Math.floor(((Number(character?.level) || 1) - 1) / 4));
    return getResourceMaxUses(character, ['ancestralidade', 'ancestry', 'goliath ancestry', 'gigante', 'passo das nuvens', 'resistência da pedra', 'vigor da colina', 'trovão da tempestade', 'fogo'], pb);
  }, [character, isGoliath]);
  const adrenalineRushMaxUses = useMemo(() => getResourceMaxUses(character, ['adrenalina', 'adrenaline', 'adrenaline rush'], 1), [character]);
  const relentlessEnduranceMaxUses = useMemo(() => getResourceMaxUses(character, ['resistência', 'resistencia', 'relentless endurance'], 1), [character]);
  const isHuman = useMemo(() => !!(character?.race?.toLowerCase().includes('humano')), [character]);
  const actionSurgeMaxUses = useMemo(() => getResourceMaxUses(character, ['surto', 'action surge'], 1), [character]);
  const rageMaxUses = useMemo(() => getResourceMaxUses(character, ['fúria', 'furia', 'rage'], 2), [character]);
  const channelDivinityMaxUses = useMemo(() => getResourceMaxUses(character, ['canalizar', 'channel divinity'], 1), [character]);
  const spellSlotsMax = useMemo(() => getResourceMaxUses(character, ['magia', 'spell slot'], 2), [character]);
  const indomitableMaxUses = useMemo(() => getResourceMaxUses(character, ['indomável', 'indomavel', 'indomitable'], 1), [character]);
  const superiorityDiceMaxUses = useMemo(() => getResourceMaxUses(character, ['superioridade', 'superiority'], 4), [character]);
  const bardicInspirationMaxUses = useMemo(() => getResourceMaxUses(character, ['bardica', 'bardic inspiration'], 3), [character]);
  const layOnHandsMaxPool = useMemo(() => getResourceMaxUses(character, ['lay on hands pool', 'cura'], (character?.level || 1) * 5), [character]);
  const focusPointsMaxUses = useMemo(() => getResourceMaxUses(character, ['foco', 'focus point'], character?.level || 1), [character]);
  const wildShapeMaxUses = useMemo(() => getResourceMaxUses(character, ['forma selvagem', 'wild shape'], 2), [character]);
  const luckyMaxPoints = useMemo(() => getResourceMaxUses(character, ['sorte', 'lucky'], 3), [character]);

  return {
    isGoliath,
    isHuman,
    secondWindMaxUses,
    healingHandsMaxUses,
    celestialRevelationMaxUses,
    draconicFlightMaxUses,
    largeFormMaxUses,
    goliathAncestryMaxUses,
    adrenalineRushMaxUses,
    relentlessEnduranceMaxUses,
    actionSurgeMaxUses,
    rageMaxUses,
    channelDivinityMaxUses,
    spellSlotsMax,
    indomitableMaxUses,
    superiorityDiceMaxUses,
    bardicInspirationMaxUses,
    layOnHandsMaxPool,
    focusPointsMaxUses,
    wildShapeMaxUses,
    luckyMaxPoints,
  };
}
