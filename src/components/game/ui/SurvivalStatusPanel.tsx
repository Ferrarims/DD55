import React from 'react';
import { useGameContext } from '../context/GameContext';
import { BasicNeedsMeters } from './survival/BasicNeedsMeters';
import { ExtremeWeatherMeters } from './survival/ExtremeWeatherMeters';

export const SurvivalStatusPanel: React.FC = () => {
  const context = useGameContext();
  if (!context) return null;

  const {
    character,
    totalGameTurns,
    lastMealTurn,
    lastLongRestTurn,
    lastShortRestTurn,
    biome,
    weather,
    entities,
    onCharacterUpdated,
    forceR,
  } = context;

  if (!character) return null;

  const lastMeal = lastMealTurn?.current ?? lastMealTurn ?? 0;
  const lastLong = lastLongRestTurn?.current ?? lastLongRestTurn ?? 0;
  const lastShort = lastShortRestTurn?.current ?? lastShortRestTurn ?? 0;

  // Fome
  const turnsSinceLastMeal = totalGameTurns - lastMeal;
  const turnsUntilNextMeal = Math.max(0, 400 - (turnsSinceLastMeal % 400));
  const rationItem = (character.character_inventory || []).find((inv: any) => {
    const name = (inv.item?.name || inv.items?.name || inv.name || '').toLowerCase();
    return (
      name.includes('ração') ||
      name.includes('racao') ||
      name.includes('ration') ||
      name.includes('marmita') ||
      name.includes('comida')
    );
  });
  const rationCount = rationItem ? rationItem.quantity || 1 : 0;
  const hungerProgress = ((400 - turnsUntilNextMeal) / 400) * 100;

  // Sede
  const waterInterval = biome === 'Deserto' ? 40 : 80;
  const turnsUntilNextWater = Math.max(0, waterInterval - (totalGameTurns % waterInterval));
  const waterResource = (character.class_resources || []).find(
    (r: any) => r.name === 'Cantil de Água'
  );
  const waterMax = waterResource?.max || 0;
  const waterUsed = waterResource?.used || 0;
  const waterCharges = Math.max(0, waterMax - waterUsed);
  const thirstProgress = ((waterInterval - turnsUntilNextWater) / waterInterval) * 100;

  // Exaustão
  const exhaustionLevel = character.exhaustion_level || 0;
  const exhaustionColor =
    exhaustionLevel === 0
      ? 'text-slate-400'
      : exhaustionLevel < 3
      ? 'text-amber-400'
      : exhaustionLevel < 5
      ? 'text-orange-500'
      : 'text-rose-500 font-bold';

  return (
    <div id="survival-status-panel" className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-3 shadow-xl mb-2.5">
      <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider block border-b border-slate-800 pb-1.5 flex justify-between items-center">
        <span>🏕️ Sobrevivência</span>
        <span className={exhaustionColor}>Exaustão {exhaustionLevel}/6</span>
      </span>

      <div className="space-y-3">
        <BasicNeedsMeters
          turnsUntilNextMeal={turnsUntilNextMeal}
          rationCount={rationCount}
          hungerProgress={hungerProgress}
          turnsUntilNextWater={turnsUntilNextWater}
          waterCharges={waterCharges}
          waterMax={waterMax}
          thirstProgress={thirstProgress}
          totalGameTurns={totalGameTurns}
          lastLong={lastLong}
          lastShort={lastShort}
        />

        <ExtremeWeatherMeters
          weather={weather}
          biome={biome}
          character={character}
          totalGameTurns={totalGameTurns}
          entities={entities}
          onCharacterUpdated={onCharacterUpdated}
          forceR={forceR}
        />
      </div>
    </div>
  );
};
