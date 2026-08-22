import { useEffect } from 'react';
import { UseArenaExplorationProps } from './arenaExploration/types';
import { useArenaExplorationState } from './arenaExploration/useArenaExplorationState';
import { useArenaSpawning } from './arenaExploration/useArenaSpawning';
import { useArenaCombatInitializer } from './arenaExploration/useArenaCombatInitializer';
import { useArenaLoot } from './arenaExploration/useArenaLoot';
import { useArenaRestPoints } from './arenaExploration/useArenaRestPoints';
import { useArenaVictoryAndSave } from './arenaExploration/useArenaVictoryAndSave';

export type { UseArenaExplorationProps };

/**
 * Hook orquestrador de exploração da arena e mundo infinito.
 * Delega responsabilidades para submódulos especializados em arenaExploration/:
 * - useArenaExplorationState (estados de grid, clima, entidades e turnos)
 * - useArenaSpawning (expansão do grid e emboscadas por passos)
 * - useArenaCombatInitializer (inicialização, geração de mapa e descanso)
 * - useArenaLoot (coleta de espólios e baús)
 * - useArenaRestPoints (pontos de descanso curto e longo)
 * - useArenaVictoryAndSave (finalização e persistência de dados)
 */
export function useArenaExploration(props: UseArenaExplorationProps) {
  const state = useArenaExplorationState();

  const {
    biome, setBiome,
    grid, setGrid,
    torches, setTorches,
    entities, setEntities,
    activeEntityIndex, setActiveEntityIndex,
    currentTurnRound, setCurrentTurnRound,
    weather, setWeather,
    weatherTime, setWeatherTime,
    isNightManual, setIsNightManual,
    combatDifficulty, setCombatDifficulty,
    isBattleOver, setIsBattleOver,
    isVictoryScreenVisible, setIsVictoryScreenVisible,
    showVictorySummaryModal, setShowVictorySummaryModal,
    victoryData, setVictoryData,
    droppedLoot, setDroppedLoot,
    chests, setChests,
    hazards, setHazards,
    powerups, setPowerUps,
    restPoints, setRestPoints,
    pendingRestPointId, setPendingRestPointId,
    totalGameTurns, setTotalGameTurns,
    movementStepsCount, setMovementStepsCount,
    lastMealTurn,
    lastShortRestTurn,
    lastLongRestTurn,
    prevTurns,
    mapStreak, setMapStreak,
    lastEncounterPos, setLastEncounterPos,
    processedDeathIdsRef,
    collectedLootIdsRef,
    openedChestIdsRef,
    exploredCellsRef,
    victoryLogged,
    prevHadVisibleMonstersRef,
    pendingMonstersRef,
    hasSpawnedMonstersRef,
    spawnStepsThresholdRef,
    worldTilesCacheRef,
  } = state;

  // Sub-hooks especialistas
  const { expandMapIfNeeded } = useArenaSpawning({
    biome,
    grid,
    setGrid,
    entities,
    setEntities,
    movementStepsCount,
    chests,
    restPoints,
    character: props.character,
    setIsBattleOver,
    addCombatLog: props.addCombatLog,
    worldTilesCacheRef,
    hasSpawnedMonstersRef,
    spawnStepsThresholdRef,
    pendingMonstersRef,
  });

  const { initNewCombat } = useArenaCombatInitializer({
    ...props,
    combatDifficulty,
    setCombatDifficulty,
    setBiome,
    setGrid,
    setTorches,
    setEntities,
    entities,
    setActiveEntityIndex,
    setCurrentTurnRound,
    setWeather,
    setIsNightManual,
    setIsBattleOver,
    setDroppedLoot,
    setChests,
    setHazards,
    setPowerUps,
    setRestPoints,
    setVictoryData,
    setShowVictorySummaryModal,
    mapStreak,
    setMapStreak,
    setTotalGameTurns,
    totalGameTurns,
    setMovementStepsCount,
    setLastEncounterPos,
    processedDeathIdsRef,
    collectedLootIdsRef,
    openedChestIdsRef,
    exploredCellsRef,
    worldTilesCacheRef,
    victoryLogged,
    prevHadVisibleMonstersRef,
    hasSpawnedMonstersRef,
    pendingMonstersRef,
    spawnStepsThresholdRef,
    lastMealTurn,
    lastShortRestTurn,
    lastLongRestTurn,
  });

  const {
    addLootItemToInventory,
    collectLootItem,
    openChest,
  } = useArenaLoot({
    character: props.character,
    onCharacterUpdated: props.onCharacterUpdated,
    isSfxEnabled: props.isSfxEnabled,
    addCombatLog: props.addCombatLog,
    entities,
    droppedLoot,
    setDroppedLoot,
    chests,
    setChests,
    setVictoryData,
    collectedLootIdsRef,
    openedChestIdsRef,
  });

  const {
    useRestPoint,
    useShortRestPoint,
  } = useArenaRestPoints({
    ...props,
    entities,
    setEntities,
    restPoints,
    setRestPoints,
    totalGameTurns,
    setTotalGameTurns,
    setMovementStepsCount,
    lastMealTurn,
    lastShortRestTurn,
    lastLongRestTurn,
    prevTurns,
  });

  const {
    isSaving,
    setIsSaving,
    handleFinishExploration,
    handleClaimLootAndSave,
  } = useArenaVictoryAndSave({
    character: props.character,
    onCharacterUpdated: props.onCharacterUpdated,
    onExitGame: props.onExitGame,
    victoryData,
    setVictoryData,
    setIsBattleOver,
    setIsVictoryScreenVisible,
    setShowVictorySummaryModal,
    setMapStreak,
    addCombatLog: props.addCombatLog,
  });

  // Inicializar combate automaticamente ao montar o hook
  useEffect(() => {
    initNewCombat();
  }, []);

  return {
    biome,
    setBiome,
    grid,
    setGrid,
    torches,
    setTorches,
    entities,
    setEntities,
    activeEntityIndex,
    setActiveEntityIndex,
    currentTurnRound,
    setCurrentTurnRound,
    weather,
    setWeather,
    weatherTime,
    setWeatherTime,
    isNightManual,
    setIsNightManual,
    combatDifficulty,
    setCombatDifficulty,
    isBattleOver,
    setIsBattleOver,
    isVictoryScreenVisible,
    setIsVictoryScreenVisible,
    showVictorySummaryModal,
    setShowVictorySummaryModal,
    victoryData,
    setVictoryData,
    droppedLoot,
    setDroppedLoot,
    chests,
    setChests,
    hazards,
    setHazards,
    powerups,
    setPowerUps,
    restPoints,
    setRestPoints,
    pendingRestPointId,
    setPendingRestPointId,
    totalGameTurns,
    setTotalGameTurns,
    movementStepsCount,
    setMovementStepsCount,
    lastMealTurn,
    lastShortRestTurn,
    lastLongRestTurn,
    prevTurns,
    mapStreak,
    setMapStreak,
    isSaving,
    setIsSaving,
    lastEncounterPos,
    setLastEncounterPos,
    processedDeathIdsRef,
    collectedLootIdsRef,
    openedChestIdsRef,
    exploredCellsRef,
    victoryLogged,
    prevHadVisibleMonstersRef,
    initNewCombat,
    addLootItemToInventory,
    collectLootItem,
    openChest,
    useRestPoint,
    useShortRestPoint,
    handleFinishExploration,
    handleClaimLootAndSave,
    expandMapIfNeeded,
  };
}
