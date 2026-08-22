import React, { useRef, useEffect } from 'react';
import { CombatEntity } from '../../../game/types';
import { isTwoHandedWeaponLocal, isLightWeapon } from '../../../game/combatEngine';
import { usePlatformHeroAndArena } from './platformState/usePlatformHeroAndArena';
import { usePlatformCoreServices } from './platformState/usePlatformCoreServices';
import { usePlatformCombatState } from './platformState/usePlatformCombatState';

export interface UseGamePlatformStateProps {
  character: any;
  onExitGame: () => void;
  onCharacterUpdated?: () => Promise<void> | void;
  difficulty?: 'easy' | 'medium' | 'hard';
}

/**
 * Hook orquestrador do estado da plataforma do jogo.
 * Agrega e delega responsabilidades para submódulos especializados em platformState/:
 * - usePlatformHeroAndArena (recursos de classe/raça, exploração de arena e capacidades heroicas)
 * - usePlatformCoreServices (serviços de áudio, viewport, câmera, logs, sobrevivência e ciclo dia/noite)
 * - usePlatformCombatState (alvejamento, modais de combate, talentos de armas, habilidades e processamento de dano)
 */
export function useGamePlatformState({
  character,
  onExitGame,
  onCharacterUpdated,
  difficulty = 'medium'
}: UseGamePlatformStateProps) {
  // 1. Herói, Recursos e Exploração da Arena
  const heroAndArena = usePlatformHeroAndArena({
    character,
    onCharacterUpdated,
    onExitGame,
    isSfxEnabled: true,
    addCombatLog: () => {},
    setFloatingTexts: () => {},
  });

  const { arenaExploration, heroCapabilities, resources, activeRevelation, setActiveRevelation } = heroAndArena;
  const { entities, activeEntityIndex } = arenaExploration;
  const activeEntity = entities[activeEntityIndex];

  // Ref de Entidades
  const entitiesRef = useRef<CombatEntity[]>(entities);
  useEffect(() => {
    entitiesRef.current = entities;
  }, [entities]);

  // 2. Serviços Globais, Áudio, Viewport e Sobrevivência
  const coreServices = usePlatformCoreServices({
    character,
    onCharacterUpdated,
    biome: arenaExploration.biome,
    weather: arenaExploration.weather,
    setWeather: arenaExploration.setWeather,
    isNightManual: arenaExploration.isNightManual,
    setIsNightManual: arenaExploration.setIsNightManual,
    totalGameTurns: arenaExploration.totalGameTurns,
    setTotalGameTurns: arenaExploration.setTotalGameTurns,
    setMovementStepsCount: arenaExploration.setMovementStepsCount,
    prevTurns: arenaExploration.prevTurns,
    lastMealTurn: arenaExploration.lastMealTurn,
    lastShortRestTurn: arenaExploration.lastShortRestTurn,
    lastLongRestTurn: arenaExploration.lastLongRestTurn,
    isBattleOver: arenaExploration.isBattleOver,
  });

  // 3. Combate, Alvejamento, Modais e Dano
  const combatState = usePlatformCombatState({
    character,
    entities,
    setEntities: arenaExploration.setEntities,
    entitiesRef,
    activeEntityIndex,
    activeRevelation,
    setActiveRevelation,
    activeDraconicFlight: resources.activeDraconicFlight,
    setActiveDraconicFlight: resources.setActiveDraconicFlight,
    setDraconicFlightRoundsLeft: resources.setDraconicFlightRoundsLeft,
    activeLargeForm: resources.activeLargeForm,
    isBattleOver: arenaExploration.isBattleOver,
    weather: arenaExploration.weather,
    mapStreak: arenaExploration.mapStreak,
    processedDeathIdsRef: arenaExploration.processedDeathIdsRef,
    setVictoryData: arenaExploration.setVictoryData,
    setDroppedLoot: arenaExploration.setDroppedLoot,
    addCombatLog: coreServices.addCombatLog,
    setFloatingTexts: coreServices.setFloatingTexts,
    getActiveFeats: heroCapabilities.getActiveFeats,
    shouldHideEntityDetails: heroCapabilities.shouldHideEntityDetails,
    isEntityVisible: heroCapabilities.isEntityVisible,
    isDragonborn: heroCapabilities.isDragonborn,
    breathWeaponMaxUses: heroCapabilities.breathWeaponMaxUses,
    isGoliath: heroCapabilities.isGoliath,
    goliathAncestryMaxUses: heroCapabilities.goliathAncestryMaxUses,
    goliathAncestryUses: resources.goliathAncestryUses,
    setGoliathAncestryUses: resources.setGoliathAncestryUses,
    isOrc: heroCapabilities.isOrc,
    adrenalineRushMaxUses: heroCapabilities.adrenalineRushMaxUses,
    setAdrenalineRushUses: resources.setAdrenalineRushUses,
    relentlessEnduranceMaxUses: heroCapabilities.relentlessEnduranceMaxUses,
    relentlessEnduranceUses: resources.relentlessEnduranceUses,
    setRelentlessEnduranceUses: resources.setRelentlessEnduranceUses,
    isHuman: heroCapabilities.isHuman,
    setHasHeroicInspiration: resources.setHasHeroicInspiration,
    luckyPoints: resources.luckyPoints,
    setLuckyPoints: resources.setLuckyPoints,
    luckyMaxPoints: heroCapabilities.luckyMaxPoints,
  });

  return {
    ...coreServices,
    ...arenaExploration,
    ...resources,
    ...heroCapabilities,
    ...combatState,
    activeRevelation,
    setActiveRevelation,
    activeEntity,
    entitiesRef,
    isTwoHandedWeaponLocal,
    isLightWeapon,
  };
}

export type GamePlatformState = ReturnType<typeof useGamePlatformState>;
