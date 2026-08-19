import React, { useEffect, useCallback } from 'react';
import { BiomeType, WeatherType } from '../../../../game/types';

export interface UseDayNightCycleProps {
  totalGameTurns: number;
  isNightManual: boolean | null;
  setIsNightManual: (val: boolean | null | ((prev: boolean | null) => boolean | null)) => void;
  biome: BiomeType;
  weather: WeatherType;
  setWeather: (val: WeatherType | ((prev: WeatherType) => WeatherType)) => void;
  prevTurns: React.MutableRefObject<number>;
  lastShortRestTurn: React.MutableRefObject<number>;
  lastLongRestTurn: React.MutableRefObject<number>;
  setTotalGameTurns: (val: number | ((prev: number) => number)) => void;
  setMovementStepsCount: (val: number | ((prev: number) => number)) => void;
}

export function useDayNightCycle({
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
}: UseDayNightCycleProps) {
  // Indica se o ambiente atual é subterrâneo / fechado (Caverna ou Masmorra) ou Deserto
  const isIndoor = biome === 'Caverna' || biome === 'Masmorra';
  const isDesert = biome === 'Deserto';

  // Ciclo de Dia e Noite Gradativo: Cada fase dura 200 turnos (12h de dia, 12h de noite).
  const cycleIndex = Math.floor(totalGameTurns / 200);
  const isNightCycle = cycleIndex % 2 === 1;

  // Cálculo da hora do dia proporcional aos 200 turnos (12 horas por fase)
  const phaseTurn = totalGameTurns % 200;
  const totalMinutesElapsed = phaseTurn * 3.6; // 720 minutos / 200 turnos = 3.6 min por turno
  const baseHour = isNightCycle ? 18 : 6;
  const totalMinutesFromMidnight = baseHour * 60 + totalMinutesElapsed;
  const normalizedMinutes = totalMinutesFromMidnight % (24 * 60);
  const currentHour = Math.floor(normalizedMinutes / 60);
  const currentMinute = Math.floor(normalizedMinutes % 60);
  const timeFormatted = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

  let nightProgress = 0;
  if (normalizedMinutes >= 420 && normalizedMinutes < 1020) {
    nightProgress = 0; // Dia pleno (07:00 - 17:00)
  } else if (normalizedMinutes >= 1140 || normalizedMinutes < 300) {
    nightProgress = 1; // Noite plena (19:00 - 05:00)
  } else if (normalizedMinutes >= 1020 && normalizedMinutes < 1140) {
    nightProgress = (normalizedMinutes - 1020) / (1140 - 1020); // Entardecer (17:00 - 19:00)
  } else if (normalizedMinutes >= 300 && normalizedMinutes < 420) {
    nightProgress = 1 - (normalizedMinutes - 300) / (420 - 300); // Amanhecer (05:00 - 07:00)
  }

  const isNight = isIndoor ? true : (isNightManual !== null ? isNightManual : (nightProgress >= 0.5));

  const setIsNight = useCallback((val: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof val === 'function' ? val(isNight) : val;
    setIsNightManual(nextVal);
    const targetCycle = nextVal ? (cycleIndex % 2 === 0 ? cycleIndex + 1 : cycleIndex) : (cycleIndex % 2 === 1 ? cycleIndex + 1 : cycleIndex);
    const targetTurns = targetCycle * 200;
    prevTurns.current = targetTurns;
    lastShortRestTurn.current = targetTurns;
    lastLongRestTurn.current = targetTurns;
    setTotalGameTurns(targetTurns);
    setMovementStepsCount(0);
  }, [isNight, cycleIndex, setIsNightManual, prevTurns, lastShortRestTurn, lastLongRestTurn, setTotalGameTurns, setMovementStepsCount]);

  let timePhaseLabel = 'Dia';
  let timePhaseIcon = '☀️';
  let timePhaseColor = 'text-amber-300';

  if (isIndoor) {
    timePhaseLabel = 'Escuro (Interior)';
    timePhaseIcon = '🔒';
    timePhaseColor = 'text-slate-400';
  } else if (normalizedMinutes >= 1140 || normalizedMinutes < 300) {
    timePhaseLabel = 'Noite';
    timePhaseIcon = '🌙';
    timePhaseColor = 'text-indigo-300';
  } else if (normalizedMinutes >= 1020 && normalizedMinutes < 1140) {
    timePhaseLabel = 'Entardecer';
    timePhaseIcon = '🌇';
    timePhaseColor = 'text-orange-300';
  } else if (normalizedMinutes >= 300 && normalizedMinutes < 420) {
    timePhaseLabel = 'Amanhecer';
    timePhaseIcon = '🌅';
    timePhaseColor = 'text-pink-300';
  } else {
    timePhaseLabel = 'Dia';
    timePhaseIcon = '☀️';
    timePhaseColor = 'text-amber-300';
  }

  useEffect(() => {
    if (biome === 'Arena de Testes') {
      if (weather !== 'clear') setWeather('clear');
      if (isNight) setIsNight(false);
    } else if (isIndoor) {
      if (weather !== 'clear') setWeather('clear');
      if (!isNight) setIsNight(true);
    } else if (isDesert) {
      if (['rain', 'snow', 'storm', 'fog'].includes(weather)) {
        setWeather('clear');
      }
    }
  }, [biome, weather, isNight, isIndoor, isDesert, setWeather, setIsNight]);

  return {
    isIndoor,
    isDesert,
    cycleIndex,
    isNightCycle,
    phaseTurn,
    totalMinutesElapsed,
    baseHour,
    totalMinutesFromMidnight,
    normalizedMinutes,
    currentHour,
    currentMinute,
    timeFormatted,
    nightProgress,
    isNight,
    setIsNight,
    timePhaseLabel,
    timePhaseIcon,
    timePhaseColor
  };
}
