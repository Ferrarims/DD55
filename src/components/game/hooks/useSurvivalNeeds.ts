import { useEffect, MutableRefObject } from 'react';
import { processWaterNeeds, processFoodNeeds } from './survival/processWaterAndFoodNeeds';
import { processRestAndFatigueNeeds } from './survival/processRestAndFatigueNeeds';
import { processExtremeWeatherNeeds } from './survival/processExtremeWeatherNeeds';

interface UseSurvivalNeedsProps {
  totalGameTurns: number;
  prevTurns: MutableRefObject<number>;
  biome: string;
  character: any;
  onCharacterUpdated?: () => Promise<void> | void;
  lastMealTurn: MutableRefObject<number>;
  lastShortRestTurn: MutableRefObject<number>;
  lastLongRestTurn: MutableRefObject<number>;
  weather: string;
  addCombatLog: (actorName: string, title: string, detail: string, type: 'roll' | 'damage' | 'heal' | 'system') => void;
}

export function useSurvivalNeeds({
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
}: UseSurvivalNeedsProps) {
  useEffect(() => {
    if (totalGameTurns === prevTurns.current) return;

    // 1. Água
    processWaterNeeds({
      character,
      biome,
      totalGameTurns,
      prevTurns,
      onCharacterUpdated,
      addCombatLog,
    });

    // 2. Comida (Ração)
    processFoodNeeds({
      character,
      totalGameTurns,
      lastMealTurn,
      onCharacterUpdated,
      addCombatLog,
    });

    // 3. Privação de Sono e Marcha Forçada
    processRestAndFatigueNeeds({
      character,
      totalGameTurns,
      lastLongRestTurn,
      lastShortRestTurn,
      addCombatLog,
    });

    // 4. Clima Extremo
    processExtremeWeatherNeeds({
      character,
      biome,
      weather,
      totalGameTurns,
      prevTurns,
      addCombatLog,
    });

    prevTurns.current = totalGameTurns;
  }, [totalGameTurns, character, onCharacterUpdated]);
}
