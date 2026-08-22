import React, { useState, useRef, useCallback } from 'react';
import { BiomeType, WeatherType, CombatLog } from '../../../../game/types';
import { useGameSettings } from '../useGameSettings';
import { useFloatingTexts } from '../useFloatingTexts';
import { useArenaViewport } from '../platform/useArenaViewport';
import { useDayNightCycle } from '../platform/useDayNightCycle';
import { useSurvivalNeeds } from '../useSurvivalNeeds';
import { useArenaAmbientSound } from '../platform/useArenaAmbientSound';
import { useArenaVisualFX } from '../platform/useArenaVisualFX';
import { useProceduralExplorationBridge } from '../../../../game/world/useProceduralExplorationBridge';

export interface UsePlatformCoreServicesProps {
  character: any;
  onCharacterUpdated?: () => Promise<void> | void;
  biome: BiomeType;
  weather: WeatherType;
  setWeather: (val: WeatherType) => void;
  isNightManual: boolean;
  setIsNightManual: (val: boolean) => void;
  totalGameTurns: number;
  setTotalGameTurns: React.Dispatch<React.SetStateAction<number>>;
  setMovementStepsCount: React.Dispatch<React.SetStateAction<number>>;
  prevTurns: React.MutableRefObject<number>;
  lastMealTurn: React.MutableRefObject<number>;
  lastShortRestTurn: React.MutableRefObject<number>;
  lastLongRestTurn: React.MutableRefObject<number>;
  isBattleOver: boolean;
}

export function usePlatformCoreServices({
  character,
  onCharacterUpdated,
  biome,
  weather,
  setWeather,
  isNightManual,
  setIsNightManual,
  totalGameTurns,
  setTotalGameTurns,
  setMovementStepsCount,
  prevTurns,
  lastMealTurn,
  lastShortRestTurn,
  lastLongRestTurn,
  isBattleOver,
}: UsePlatformCoreServicesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const minimapRef = useRef<HTMLCanvasElement | null>(null);
  const isInitialMount = useRef<boolean>(true);

  // Configurações Globais
  const gameSettings = useGameSettings();
  const {
    isAmbientSoundEnabled,
    isSfxEnabled,
    proceduralWorldEnabled,
  } = gameSettings;

  // Ponte Procedural
  const proceduralBridge = useProceduralExplorationBridge({
    enabled: proceduralWorldEnabled,
    character,
  });

  // Textos Flutuantes
  const { floatingTexts, setFloatingTexts } = useFloatingTexts();

  // Logs de Combate
  const [logs, setLogs] = useState<CombatLog[]>([]);
  const addCombatLog = useCallback((
    actorName: string,
    title: string,
    detail: string,
    type: CombatLog['type'] | 'spell' = 'roll'
  ) => {
    const entry: CombatLog = {
      id: Date.now().toString() + Math.random(),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      actorName,
      title,
      detail,
      type: (type === 'spell' ? 'system' : type) as CombatLog['type']
    };
    setLogs(prev => [entry, ...prev]);
  }, []);

  // Viewport, Câmera e Zoom
  const viewport = useArenaViewport();

  // Necessidades e Sobrevivência
  useSurvivalNeeds({
    totalGameTurns,
    prevTurns,
    biome,
    character,
    onCharacterUpdated,
    lastMealTurn,
    lastShortRestTurn,
    lastLongRestTurn,
    weather,
    addCombatLog,
  });

  // Ciclo Dia / Noite
  const dayNight = useDayNightCycle({
    totalGameTurns,
    isNightManual,
    setIsNightManual,
    biome,
    weather,
    setWeather,
    prevTurns,
    lastShortRestTurn,
    lastLongRestTurn,
    setTotalGameTurns,
    setMovementStepsCount
  });

  // Som Ambiente
  useArenaAmbientSound({
    biome,
    weather,
    isBattleOver,
    isAmbientSoundEnabled
  });

  // Efeitos Visuais
  const visualFX = useArenaVisualFX({
    isSfxEnabled,
    setFloatingTexts,
    weather,
    setWeatherTime: () => {}
  });

  return {
    canvasRef,
    minimapRef,
    isInitialMount,
    ...gameSettings,
    proceduralBridge,
    floatingTexts,
    setFloatingTexts,
    logs,
    setLogs,
    addCombatLog,
    ...viewport,
    ...dayNight,
    ...visualFX,
  };
}
