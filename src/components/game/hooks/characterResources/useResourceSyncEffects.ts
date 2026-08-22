import React, { useEffect, useRef } from 'react';
import { updateCharacter } from '../../../../lib/api/characterService';

interface UseResourceSyncEffectsParams {
  character: any;
  limits: any;
  setters: {
    setSecondWindUses: React.Dispatch<React.SetStateAction<number>>;
    setHealingHandsUses: React.Dispatch<React.SetStateAction<number>>;
    setCelestialRevelationUses: React.Dispatch<React.SetStateAction<number>>;
    setDraconicFlightUses: React.Dispatch<React.SetStateAction<number>>;
    setLargeFormUses: React.Dispatch<React.SetStateAction<number>>;
    setGoliathAncestryUses: React.Dispatch<React.SetStateAction<number>>;
    setActionSurgeUses: React.Dispatch<React.SetStateAction<number>>;
    setRageUses: React.Dispatch<React.SetStateAction<number>>;
    setChannelDivinityUses: React.Dispatch<React.SetStateAction<number>>;
    setSpellSlots: React.Dispatch<React.SetStateAction<number>>;
    setIndomitableUses: React.Dispatch<React.SetStateAction<number>>;
    setSuperiorityDiceUses: React.Dispatch<React.SetStateAction<number>>;
    setBardicInspirationUses: React.Dispatch<React.SetStateAction<number>>;
    setLayOnHandsPool: React.Dispatch<React.SetStateAction<number>>;
    setFocusPointsUses: React.Dispatch<React.SetStateAction<number>>;
    setWildShapeUses: React.Dispatch<React.SetStateAction<number>>;
  };
}

export function useResourceSyncEffects({
  character,
  limits,
  setters,
}: UseResourceSyncEffectsParams) {
  const {
    secondWindMaxUses,
    healingHandsMaxUses,
    celestialRevelationMaxUses,
    draconicFlightMaxUses,
    largeFormMaxUses,
    goliathAncestryMaxUses,
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
  } = limits;

  const {
    setSecondWindUses,
    setHealingHandsUses,
    setCelestialRevelationUses,
    setDraconicFlightUses,
    setLargeFormUses,
    setGoliathAncestryUses,
    setActionSurgeUses,
    setRageUses,
    setChannelDivinityUses,
    setSpellSlots,
    setIndomitableUses,
    setSuperiorityDiceUses,
    setBardicInspirationUses,
    setLayOnHandsPool,
    setFocusPointsUses,
    setWildShapeUses,
  } = setters;

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
}
