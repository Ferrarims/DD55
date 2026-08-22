import { useState } from 'react';
import { useResourceMaxLimits } from './characterResources/useResourceMaxLimits';
import { useResourceSyncEffects } from './characterResources/useResourceSyncEffects';

export interface UseCharacterResourcesProps {
  character: any;
}

export function useCharacterResources({ character }: UseCharacterResourcesProps) {
  const limits = useResourceMaxLimits(character);

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

  useResourceSyncEffects({
    character,
    limits,
    setters: {
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
    },
  });

  return {
    ...limits,

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
