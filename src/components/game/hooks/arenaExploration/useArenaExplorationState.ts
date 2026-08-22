import { useState, useRef } from 'react';
import { BiomeType, WeatherType, CombatEntity, CellData, PowerUp } from '../../../../game/types';
import {
  VictoryData,
  DroppedLootData,
  ChestData,
  HazardData,
  RestPointData,
} from './types';

export function useArenaExplorationState() {
  // Configurações do Cenário e Clima
  const [biome, setBiome] = useState<BiomeType>('Masmorra');
  const [grid, setGrid] = useState<CellData[][]>([]);
  const [torches, setTorches] = useState<{ x: number; y: number }[]>([]);
  const [entities, setEntities] = useState<CombatEntity[]>([]);
  const [activeEntityIndex, setActiveEntityIndex] = useState<number>(0);
  const [currentTurnRound, setCurrentTurnRound] = useState<number>(1);
  const [weather, setWeather] = useState<WeatherType>('clear');
  const [weatherTime, setWeatherTime] = useState<number>(0);
  const [isNightManual, setIsNightManual] = useState<boolean>(false);
  const [combatDifficulty, setCombatDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Estado do Jogo e Vitória
  const [isBattleOver, setIsBattleOver] = useState<boolean>(false);
  const [isVictoryScreenVisible, setIsVictoryScreenVisible] = useState<boolean>(false);
  const [showVictorySummaryModal, setShowVictorySummaryModal] = useState<boolean>(false);
  const [victoryData, setVictoryData] = useState<VictoryData | null>(null);

  // Espólios, Baús, Armadilhas e Acampamentos
  const [droppedLoot, setDroppedLoot] = useState<DroppedLootData[]>([]);
  const [chests, setChests] = useState<ChestData[]>([]);
  const [hazards, setHazards] = useState<HazardData[]>([]);
  const [powerups, setPowerUps] = useState<PowerUp[]>([]);
  const [restPoints, setRestPoints] = useState<RestPointData[]>([]);
  const [pendingRestPointId, setPendingRestPointId] = useState<string | null>(null);

  // Sistema de Tempo e Sobrevivência
  const [totalGameTurns, setTotalGameTurns] = useState<number>(0);
  const [movementStepsCount, setMovementStepsCount] = useState<number>(0);
  const lastMealTurn = useRef<number>(0);
  const lastShortRestTurn = useRef<number>(0);
  const lastLongRestTurn = useRef<number>(0);
  const prevTurns = useRef<number>(0);

  // Streak de Mapas
  const [mapStreak, setMapStreak] = useState<number>(1);
  const [lastEncounterPos, setLastEncounterPos] = useState<{ x: number; y: number }>({ x: 75, y: 75 });

  // Refs de Controle
  const processedDeathIdsRef = useRef<Set<string>>(new Set());
  const collectedLootIdsRef = useRef<Set<string>>(new Set());
  const openedChestIdsRef = useRef<Set<string>>(new Set());
  const exploredCellsRef = useRef<Set<string>>(new Set());
  const victoryLogged = useRef<boolean>(false);
  const prevHadVisibleMonstersRef = useRef<boolean>(false);
  const pendingMonstersRef = useRef<CombatEntity[]>([]);
  const hasSpawnedMonstersRef = useRef<boolean>(false);
  const spawnStepsThresholdRef = useRef<number>(5);
  const worldTilesCacheRef = useRef<Map<string, CellData>>(new Map());

  return {
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
  };
}
