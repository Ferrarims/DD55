import { useState, useMemo, useEffect, useRef } from 'react';
import { getResourceMaxUses, getInitialResourceUses } from '../utils/resourceUtils';
import { updateCharacter } from '../../../lib/api/characterService';

export interface UseCharacterResourcesProps {
  character: any;
}

export function useCharacterResources({ character }: UseCharacterResourcesProps) {
  // Max use limits
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

  // Actual uses states
  const [secondWindUses, setSecondWindUses] = useState<number>(3);
  const [healingHandsUses, setHealingHandsUses] = useState<number>(1);
  const [celestialRevelationUses, setCelestialRevelationUses] = useState<number>(1);
  const [draconicFlightUses, setDraconicFlightUses] = useState<number>(1);
  const [activeDraconicFlight, setActiveDraconicFlight] = useState<boolean>(false);
  const [draconicFlightRoundsLeft, setDraconicFlightRoundsLeft] = useState<number>(100);
  const [largeFormUses, setLargeFormUses] = useState<number>(1);
  const [activeLargeForm, setActiveLargeForm] = useState<boolean>(false);
  const [largeFormRoundsLeft, setLargeFormRoundsLeft] = useState<number>(100);
  const [goliathAncestryUses, setGoliathAncestryUses] = useState<number>(1);
  const [adrenalineRushUses, setAdrenalineRushUses] = useState<number>(1);
  const [relentlessEnduranceUses, setRelentlessEnduranceUses] = useState<number>(1);
  const [hasHeroicInspiration, setHasHeroicInspiration] = useState<boolean>(false);
  const [actionSurgeUses, setActionSurgeUses] = useState<number>(1);
  const [rageUses, setRageUses] = useState<number>(2);
  const [channelDivinityUses, setChannelDivinityUses] = useState<number>(1);
  const [spellSlots, setSpellSlots] = useState<number>(2);
  const [indomitableUses, setIndomitableUses] = useState<number>(1);
  const [superiorityDiceUses, setSuperiorityDiceUses] = useState<number>(4);
  const [bardicInspirationUses, setBardicInspirationUses] = useState<number>(3);
  const [layOnHandsPool, setLayOnHandsPool] = useState<number>(5);
  const [focusPointsUses, setFocusPointsUses] = useState<number>(1);
  const [wildShapeUses, setWildShapeUses] = useState<number>(2);
  const [luckyPoints, setLuckyPoints] = useState<number>(3);

  // Synchronization refs and effects
  const prevSecondWindMax = useRef(secondWindMaxUses);
  const prevActionSurgeMax = useRef(actionSurgeMaxUses);
  const prevRageMax = useRef(rageMaxUses);
  const prevChannelDivinityMax = useRef(channelDivinityMaxUses);
  const prevSpellSlotsMax = useRef(spellSlotsMax);
  const prevIndomitableMax = useRef(indomitableMaxUses);
  const prevSuperiorityDiceMax = useRef(superiorityDiceMaxUses);
  const prevBardicInspirationMax = useRef(bardicInspirationMaxUses);
  const prevLayOnHandsMax = useRef(layOnHandsMaxPool);
  const prevFocusPointsMax = useRef(focusPointsMaxUses);
  const prevWildShapeMax = useRef(wildShapeMaxUses);

  const initialCharIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!character) return;
    const charId = character.id || 'local';
    if (initialCharIdRef.current !== charId) {
      initialCharIdRef.current = charId;

      setSecondWindUses(secondWindMaxUses);
      prevSecondWindMax.current = secondWindMaxUses;

      if (character && Array.isArray(character.class_resources)) {
        const updatedRes = character.class_resources.map((r: any) => {
          if (!r) return r;
          return { ...r, used: 0 };
        });
        character.class_resources = updatedRes;
        if (character.id) {
          updateCharacter(character.id, { class_resources: updatedRes }).catch(err => console.warn(err));
        }
      }

      setActionSurgeUses(actionSurgeMaxUses);
      prevActionSurgeMax.current = actionSurgeMaxUses;

      setRageUses(rageMaxUses);
      prevRageMax.current = rageMaxUses;

      setChannelDivinityUses(channelDivinityMaxUses);
      prevChannelDivinityMax.current = channelDivinityMaxUses;

      setSpellSlots(spellSlotsMax);
      prevSpellSlotsMax.current = spellSlotsMax;

      setIndomitableUses(indomitableMaxUses);
      prevIndomitableMax.current = indomitableMaxUses;

      setSuperiorityDiceUses(superiorityDiceMaxUses);
      prevSuperiorityDiceMax.current = superiorityDiceMaxUses;

      setBardicInspirationUses(bardicInspirationMaxUses);
      prevBardicInspirationMax.current = bardicInspirationMaxUses;

      setLayOnHandsPool(layOnHandsMaxPool);
      prevLayOnHandsMax.current = layOnHandsMaxPool;

      setFocusPointsUses(focusPointsMaxUses);
      prevFocusPointsMax.current = focusPointsMaxUses;

      setWildShapeUses(wildShapeMaxUses);
      prevWildShapeMax.current = wildShapeMaxUses;

      setLargeFormUses(largeFormMaxUses);
      setDraconicFlightUses(draconicFlightMaxUses);
      setGoliathAncestryUses(goliathAncestryMaxUses);
      setCelestialRevelationUses(celestialRevelationMaxUses);
    }
  }, [character?.id, secondWindMaxUses, actionSurgeMaxUses, rageMaxUses, channelDivinityMaxUses, spellSlotsMax, indomitableMaxUses, superiorityDiceMaxUses, bardicInspirationMaxUses, layOnHandsMaxPool, focusPointsMaxUses, wildShapeMaxUses, largeFormMaxUses, draconicFlightMaxUses, goliathAncestryMaxUses, celestialRevelationMaxUses]);

  useEffect(() => {
    setLargeFormUses(prev => Math.min(prev, largeFormMaxUses));
  }, [largeFormMaxUses]);

  useEffect(() => {
    setGoliathAncestryUses(prev => Math.min(prev, goliathAncestryMaxUses));
  }, [goliathAncestryMaxUses]);

  useEffect(() => {
    const swDiff = secondWindMaxUses - prevSecondWindMax.current;
    if (swDiff > 0) setSecondWindUses(prev => prev + swDiff);
    else setSecondWindUses(prev => Math.min(prev, secondWindMaxUses));
    prevSecondWindMax.current = secondWindMaxUses;
  }, [secondWindMaxUses]);

  useEffect(() => {
    const asDiff = actionSurgeMaxUses - prevActionSurgeMax.current;
    if (asDiff > 0) setActionSurgeUses(prev => prev + asDiff);
    else setActionSurgeUses(prev => Math.min(prev, actionSurgeMaxUses));
    prevActionSurgeMax.current = actionSurgeMaxUses;
  }, [actionSurgeMaxUses]);

  useEffect(() => {
    const rDiff = rageMaxUses - prevRageMax.current;
    if (rDiff > 0) setRageUses(prev => prev + rDiff);
    else setRageUses(prev => Math.min(prev, rageMaxUses));
    prevRageMax.current = rageMaxUses;
  }, [rageMaxUses]);

  useEffect(() => {
    const cdDiff = channelDivinityMaxUses - prevChannelDivinityMax.current;
    if (cdDiff > 0) setChannelDivinityUses(prev => prev + cdDiff);
    else setChannelDivinityUses(prev => Math.min(prev, channelDivinityMaxUses));
    prevChannelDivinityMax.current = channelDivinityMaxUses;
  }, [channelDivinityMaxUses]);

  useEffect(() => {
    const ssDiff = spellSlotsMax - prevSpellSlotsMax.current;
    if (ssDiff > 0) setSpellSlots(prev => prev + ssDiff);
    else setSpellSlots(prev => Math.min(prev, spellSlotsMax));
    prevSpellSlotsMax.current = spellSlotsMax;
  }, [spellSlotsMax]);

  useEffect(() => {
    const indDiff = indomitableMaxUses - prevIndomitableMax.current;
    if (indDiff > 0) setIndomitableUses(prev => prev + indDiff);
    else setIndomitableUses(prev => Math.min(prev, indomitableMaxUses));
    prevIndomitableMax.current = indomitableMaxUses;
  }, [indomitableMaxUses]);

  useEffect(() => {
    const supDiff = superiorityDiceMaxUses - prevSuperiorityDiceMax.current;
    if (supDiff > 0) setSuperiorityDiceUses(prev => prev + supDiff);
    else setSuperiorityDiceUses(prev => Math.min(prev, superiorityDiceMaxUses));
    prevSuperiorityDiceMax.current = superiorityDiceMaxUses;
  }, [superiorityDiceMaxUses]);

  useEffect(() => {
    const biDiff = bardicInspirationMaxUses - prevBardicInspirationMax.current;
    if (biDiff > 0) setBardicInspirationUses(prev => prev + biDiff);
    else setBardicInspirationUses(prev => Math.min(prev, bardicInspirationMaxUses));
    prevBardicInspirationMax.current = bardicInspirationMaxUses;
  }, [bardicInspirationMaxUses]);

  useEffect(() => {
    const lohDiff = layOnHandsMaxPool - prevLayOnHandsMax.current;
    if (lohDiff > 0) setLayOnHandsPool(prev => prev + lohDiff);
    else setLayOnHandsPool(prev => Math.min(prev, layOnHandsMaxPool));
    prevLayOnHandsMax.current = layOnHandsMaxPool;
  }, [layOnHandsMaxPool]);

  useEffect(() => {
    const fpDiff = focusPointsMaxUses - prevFocusPointsMax.current;
    if (fpDiff > 0) setFocusPointsUses(prev => prev + fpDiff);
    else setFocusPointsUses(prev => Math.min(prev, focusPointsMaxUses));
    prevFocusPointsMax.current = focusPointsMaxUses;
  }, [focusPointsMaxUses]);

  useEffect(() => {
    const wsDiff = wildShapeMaxUses - prevWildShapeMax.current;
    if (wsDiff > 0) setWildShapeUses(prev => prev + wsDiff);
    else setWildShapeUses(prev => Math.min(prev, wildShapeMaxUses));
    prevWildShapeMax.current = wildShapeMaxUses;
  }, [wildShapeMaxUses]);

  return {
    secondWindMaxUses,
    healingHandsMaxUses,
    celestialRevelationMaxUses,
    draconicFlightMaxUses,
    largeFormMaxUses,
    goliathAncestryMaxUses,
    adrenalineRushMaxUses,
    relentlessEnduranceMaxUses,
    isHuman,
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

    secondWindUses,
    setSecondWindUses,
    healingHandsUses,
    setHealingHandsUses,
    celestialRevelationUses,
    setCelestialRevelationUses,
    draconicFlightUses,
    setDraconicFlightUses,
    activeDraconicFlight,
    setActiveDraconicFlight,
    draconicFlightRoundsLeft,
    setDraconicFlightRoundsLeft,
    largeFormUses,
    setLargeFormUses,
    activeLargeForm,
    setActiveLargeForm,
    largeFormRoundsLeft,
    setLargeFormRoundsLeft,
    goliathAncestryUses,
    setGoliathAncestryUses,
    adrenalineRushUses,
    setAdrenalineRushUses,
    relentlessEnduranceUses,
    setRelentlessEnduranceUses,
    hasHeroicInspiration,
    setHasHeroicInspiration,
    actionSurgeUses,
    setActionSurgeUses,
    rageUses,
    setRageUses,
    channelDivinityUses,
    setChannelDivinityUses,
    spellSlots,
    setSpellSlots,
    indomitableUses,
    setIndomitableUses,
    superiorityDiceUses,
    setSuperiorityDiceUses,
    bardicInspirationUses,
    setBardicInspirationUses,
    layOnHandsPool,
    setLayOnHandsPool,
    focusPointsUses,
    setFocusPointsUses,
    wildShapeUses,
    setWildShapeUses,
    luckyPoints,
    setLuckyPoints,
  };
}
