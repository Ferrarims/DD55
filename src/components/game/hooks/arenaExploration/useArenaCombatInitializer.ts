import React from 'react';
import { BiomeType, WeatherType, CombatEntity, CellData, PowerUp } from '../../../../game/types';
import { initializeArenaMap, createHeroEntity } from '../../core/mapInitialization';
import { parseSpeedToGridCells } from '../../../../lib/api/references';
import { fetchMonstersFromDb } from '../../../../lib/api/monstersService';
import { UseArenaExplorationProps, VictoryData, DroppedLootData, ChestData, HazardData, RestPointData } from './types';
import { resetResourcesOnLongRest, restoreResourcesOnShortRest } from './combatRestResetHelper';

export interface UseArenaCombatInitializerProps extends UseArenaExplorationProps {
  combatDifficulty: 'easy' | 'medium' | 'hard';
  setCombatDifficulty: (val: 'easy' | 'medium' | 'hard') => void;
  setBiome: (val: BiomeType) => void;
  setGrid: React.Dispatch<React.SetStateAction<CellData[][]>>;
  setTorches: React.Dispatch<React.SetStateAction<{ x: number; y: number }[]>>;
  setEntities: React.Dispatch<React.SetStateAction<CombatEntity[]>>;
  entities: CombatEntity[];
  setActiveEntityIndex: (val: number) => void;
  setCurrentTurnRound: (val: number) => void;
  setWeather: (val: WeatherType) => void;
  setIsNightManual: (val: boolean) => void;
  setIsBattleOver: (val: boolean) => void;
  setDroppedLoot: React.Dispatch<React.SetStateAction<DroppedLootData[]>>;
  setChests: React.Dispatch<React.SetStateAction<ChestData[]>>;
  setHazards: React.Dispatch<React.SetStateAction<HazardData[]>>;
  setPowerUps: React.Dispatch<React.SetStateAction<PowerUp[]>>;
  setRestPoints: React.Dispatch<React.SetStateAction<RestPointData[]>>;
  setVictoryData: React.Dispatch<React.SetStateAction<VictoryData | null>>;
  setShowVictorySummaryModal: (val: boolean) => void;
  mapStreak: number;
  setMapStreak: React.Dispatch<React.SetStateAction<number>>;
  setTotalGameTurns: React.Dispatch<React.SetStateAction<number>>;
  totalGameTurns: number;
  setMovementStepsCount: React.Dispatch<React.SetStateAction<number>>;
  setLastEncounterPos: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  
  // Refs
  processedDeathIdsRef: React.MutableRefObject<Set<string>>;
  collectedLootIdsRef: React.MutableRefObject<Set<string>>;
  openedChestIdsRef: React.MutableRefObject<Set<string>>;
  exploredCellsRef: React.MutableRefObject<Set<string>>;
  worldTilesCacheRef: React.MutableRefObject<Map<string, CellData>>;
  victoryLogged: React.MutableRefObject<boolean>;
  prevHadVisibleMonstersRef: React.MutableRefObject<boolean>;
  hasSpawnedMonstersRef: React.MutableRefObject<boolean>;
  pendingMonstersRef: React.MutableRefObject<CombatEntity[]>;
  spawnStepsThresholdRef: React.MutableRefObject<number>;
  lastMealTurn: React.MutableRefObject<number>;
  lastShortRestTurn: React.MutableRefObject<number>;
  lastLongRestTurn: React.MutableRefObject<number>;
}

export function useArenaCombatInitializer(props: UseArenaCombatInitializerProps) {
  const {
    character,
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
    addCombatLog,
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
  } = props;

  const initNewCombat = async (
    selectedBiome?: BiomeType,
    keepUnsavedData: boolean = false,
    overrideDifficulty?: 'easy' | 'medium' | 'hard'
  ) => {
    setGrid([]);
    setEntities([]);

    fetchMonstersFromDb().catch(e => {
      console.warn('Erro ao atualizar monstros do banco:', e);
    });

    setIsBattleOver(false);
    victoryLogged.current = false;
    setDroppedLoot([]);
    setHazards([]);
    setPowerUps([]);
    setRestPoints([]);
    processedDeathIdsRef.current?.clear();
    collectedLootIdsRef.current?.clear();
    openedChestIdsRef.current?.clear();
    exploredCellsRef.current?.clear();
    worldTilesCacheRef.current?.clear();
    prevHadVisibleMonstersRef.current = false;
    hasSpawnedMonstersRef.current = false;
    pendingMonstersRef.current = [];
    spawnStepsThresholdRef.current = Math.floor(Math.random() * 6) + 5;
    
    const biomes: BiomeType[] = ['Caverna', 'Masmorra', 'Floresta', 'Pântano', 'Deserto'];
    const weathers: WeatherType[] = ['clear', 'rain', 'snow', 'wind', 'storm', 'fog'];

    const chosenBiome = selectedBiome || biomes[Math.floor(Math.random() * biomes.length)];
    setBiome(chosenBiome);
    setTotalGameTurns(0);
    setMovementStepsCount(0);
    lastMealTurn.current = 0;
    if (!keepUnsavedData) {
      lastLongRestTurn.current = 0;
      lastShortRestTurn.current = 0;
    } else {
      lastShortRestTurn.current = totalGameTurns;
    }

    if (chosenBiome === 'Caverna' || chosenBiome === 'Masmorra') {
      setWeather('clear');
      setIsNightManual(true);
    } else if (chosenBiome === 'Deserto') {
      const desertWeathers: WeatherType[] = ['clear', 'wind'];
      setWeather(desertWeathers[Math.floor(Math.random() * desertWeathers.length)]);
      setIsNightManual(false);
    } else {
      const chosenWeather = weathers[Math.floor(Math.random() * weathers.length)];
      setWeather(chosenWeather);
      setIsNightManual(false);
    }

    const heroMaxHp = character.max_hp || 20;
    let currentMapNumber = 1;
    let heroCurrentHp = heroMaxHp;
    let heroTempHp = 0;

    if (!keepUnsavedData) {
      // ===== DESCANSO LONGO =====
      setVictoryData({ totalXp: 0, loot: [], defeatedMonsters: {}, totalDamageDealt: 0 });
      setShowVictorySummaryModal(false);
      setMapStreak(1);
      currentMapNumber = 1;
      resetResourcesOnLongRest(props);
      heroCurrentHp = heroMaxHp;
      heroTempHp = 0;
    } else {
      // ===== DESCANSO CURTO =====
      const nextStreak = mapStreak + 1;
      setMapStreak(nextStreak);
      currentMapNumber = nextStreak;
      const res = restoreResourcesOnShortRest(props, entities, heroMaxHp);
      heroCurrentHp = res.heroCurrentHp;
      heroTempHp = res.heroTempHp;
    }

    const heroLevel = character.level || 1;
    const activeDifficulty = overrideDifficulty || combatDifficulty;
    if (overrideDifficulty) setCombatDifficulty(overrideDifficulty);

    const initMapResult = initializeArenaMap(chosenBiome, heroLevel, activeDifficulty, 150, 150);

    setGrid(initMapResult.grid);
    setTorches(initMapResult.torches);
    setChests(initMapResult.chests);
    setHazards(initMapResult.hazards);
    setPowerUps(initMapResult.powerups);
    setRestPoints(initMapResult.restPoints);
    setLastEncounterPos(initMapResult.heroSpawn);

    const heroSpeedGridCells = parseSpeedToGridCells(character.speed || '9m');
    const heroEntity = createHeroEntity(
      character,
      initMapResult.heroSpawn,
      heroMaxHp,
      heroCurrentHp,
      heroTempHp,
      heroSpeedGridCells
    );

    if (chosenBiome === 'Arena de Testes') {
      pendingMonstersRef.current = [];
      hasSpawnedMonstersRef.current = true;
    } else {
      pendingMonstersRef.current = initMapResult.monsters;
    }

    setEntities([heroEntity]);
    setActiveEntityIndex(0);
    setCurrentTurnRound(1);

    addCombatLog(
      'Mestre da Arena',
      `🗺️ MAPA #${currentMapNumber}: ${chosenBiome.toUpperCase()} (Dificuldade: ${activeDifficulty.toUpperCase()})`,
      chosenBiome === 'Arena de Testes'
        ? `Bem-vindo à Arena de Testes Pacífica. Nenhum monstro surgirá neste mapa. Aproveite para testar comandos, feitiços e movimentação.`
        : `Você entrou na área. O terreno começa silencioso... Avance alguns passos para explorar o território e encontrar inimigos.`,
      'system'
    );
  };

  return { initNewCombat };
}
