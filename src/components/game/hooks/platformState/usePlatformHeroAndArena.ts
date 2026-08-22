import React, { useState } from 'react';
import { useCharacterResources } from '../useCharacterResources';
import { useArenaExploration } from '../useArenaExploration';
import { useHeroCapabilities } from '../useHeroCapabilities';

export interface UsePlatformHeroAndArenaProps {
  character: any;
  onCharacterUpdated?: () => Promise<void> | void;
  onExitGame: () => void;
  isSfxEnabled: boolean;
  addCombatLog: (speaker: string, title: string, detail: string, type?: any) => void;
  setFloatingTexts: React.Dispatch<React.SetStateAction<any[]>>;
}

export function usePlatformHeroAndArena({
  character,
  onCharacterUpdated,
  onExitGame,
  isSfxEnabled,
  addCombatLog,
  setFloatingTexts,
}: UsePlatformHeroAndArenaProps) {
  const [activeRevelation, setActiveRevelation] = useState<'Alma Radiante' | 'Consumo Radiante' | 'Mortalha Necrótica' | null>(null);

  // Recursos de Classe e Raça
  const resources = useCharacterResources({ character });
  const {
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
  } = resources;

  // Exploração da Arena
  const arenaExploration = useArenaExploration({
    character,
    onCharacterUpdated,
    onExitGame,
    isSfxEnabled,
    addCombatLog,
    setFloatingTexts,
    secondWindMaxUses: resources.secondWindMaxUses,
    healingHandsMaxUses: resources.healingHandsMaxUses,
    celestialRevelationMaxUses: resources.celestialRevelationMaxUses,
    draconicFlightMaxUses: resources.draconicFlightMaxUses,
    largeFormMaxUses: resources.largeFormMaxUses,
    goliathAncestryMaxUses: resources.goliathAncestryMaxUses,
    adrenalineRushMaxUses: resources.adrenalineRushMaxUses,
    relentlessEnduranceMaxUses: resources.relentlessEnduranceMaxUses,
    isHuman: resources.isHuman,
    actionSurgeMaxUses: resources.actionSurgeMaxUses,
    rageMaxUses: resources.rageMaxUses,
    channelDivinityMaxUses: resources.channelDivinityMaxUses,
    spellSlotsMax: resources.spellSlotsMax,
    indomitableMaxUses: resources.indomitableMaxUses,
    superiorityDiceMaxUses: resources.superiorityDiceMaxUses,
    bardicInspirationMaxUses: resources.bardicInspirationMaxUses,
    layOnHandsMaxPool: resources.layOnHandsMaxPool,
    focusPointsMaxUses: resources.focusPointsMaxUses,
    wildShapeMaxUses: resources.wildShapeMaxUses,
    luckyMaxPoints: resources.luckyMaxPoints,
    setSecondWindUses,
    setHealingHandsUses,
    setCelestialRevelationUses,
    setDraconicFlightUses,
    setActiveDraconicFlight,
    setDraconicFlightRoundsLeft,
    setLargeFormUses,
    setActiveLargeForm,
    setLargeFormRoundsLeft,
    setGoliathAncestryUses,
    setAdrenalineRushUses,
    setRelentlessEnduranceUses,
    setHasHeroicInspiration,
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
    setLuckyPoints,
    setActiveRevelation,
    activeRevelation,
    activeLargeForm,
  });

  // Capacidades Heroicas e Visão
  const heroCapabilities = useHeroCapabilities({
    character,
    entities: arenaExploration.entities,
    grid: arenaExploration.grid,
    torches: arenaExploration.torches,
    biome: arenaExploration.biome,
    isNight: arenaExploration.isNightManual,
    activeRevelation,
    onCharacterUpdated,
  });

  return {
    activeRevelation,
    setActiveRevelation,
    resources,
    arenaExploration,
    heroCapabilities,
  };
}
