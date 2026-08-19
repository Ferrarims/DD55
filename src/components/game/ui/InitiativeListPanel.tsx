import React from 'react';
import { CoverResult } from '../../../game/coverMechanics';
import { useGameContext } from '../context/GameContext';

function formatTurnsToHours(turns: number): string {
  const totalMinutes = Math.round(turns * 3.6);
  if (totalMinutes < 60) {
    return `${totalMinutes}min`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

export const InitiativeListPanel: React.FC = () => {
  const context = useGameContext();
  if (!context) return null;

  const {
    character,
    totalGameTurns = 0,
    lastMealTurn,
    lastLongRestTurn,
    lastShortRestTurn,
    biome,
    weather,
    entities,
    activeEntityIndex,
    shouldHideEntityDetails,
    shouldHideMonsterStats,
    setSelectedEntityForPopup,
    getEntityCover,
  } = context;

  // Cálculo de Exaustão, Fome, Sede, Descanso Curto, Descanso Longo e Clima (Frio/Calor)
  const exhaustionLevel = character?.exhaustion_level || 0;
  const exhaustionColor =
    exhaustionLevel === 0
      ? 'text-emerald-400 font-bold'
      : exhaustionLevel < 3
      ? 'text-amber-400 font-bold'
      : exhaustionLevel < 5
      ? 'text-orange-400 font-black'
      : 'text-rose-500 font-black animate-pulse';

  const lastMeal = lastMealTurn?.current ?? lastMealTurn ?? 0;
  const lastLong = lastLongRestTurn?.current ?? lastLongRestTurn ?? 0;
  const lastShort = lastShortRestTurn?.current ?? lastShortRestTurn ?? 0;

  // Fome
  const turnsSinceLastMeal = totalGameTurns - lastMeal;
  const turnsUntilNextMeal = Math.max(0, 400 - (turnsSinceLastMeal % 400));
  const mealTimeFormatted = formatTurnsToHours(turnsUntilNextMeal);

  const rationItem = (character?.character_inventory || []).find((inv: any) => {
    const name = (inv.item?.name || inv.items?.name || inv.name || '').toLowerCase();
    return name.includes('ração') || name.includes('racao') || name.includes('ration') || name.includes('marmita') || name.includes('comida');
  });
  const rationCount = rationItem ? rationItem.quantity || 1 : 0;

  // Sede
  const waterInterval = biome === 'Deserto' ? 40 : 80;
  const turnsUntilNextWater = Math.max(0, waterInterval - (totalGameTurns % waterInterval));
  const waterTimeFormatted = formatTurnsToHours(turnsUntilNextWater);

  const waterResource = (character?.class_resources || []).find((r: any) => r.name === 'Cantil de Água');
  const waterMax = waterResource?.max || 0;
  const waterUsed = waterResource?.used || 0;
  const waterCharges = Math.max(0, waterMax - waterUsed);

  // Descanso Longo (Sono)
  const turnsUntilLongRest = Math.max(0, 400 - ((totalGameTurns - lastLong) % 400));
  const longRestTimeFormatted = formatTurnsToHours(turnsUntilLongRest);

  // Descanso Curto (Fadiga)
  const turnsUntilShortRest = Math.max(0, 133 - ((totalGameTurns - lastShort) % 133));
  const shortRestTimeFormatted = formatTurnsToHours(turnsUntilShortRest);

  // Clima (Frio / Calor)
  const isCold = weather === 'snow' || weather === 'storm';
  const isHeat = biome === 'Deserto';
  const equippedClothes = character?.equipment_slots?.roupa_clima?.toLowerCase() || '';
  const hasWinterClothes = equippedClothes.includes('frio') || equippedClothes.includes('inverno');
  const hasTravelClothes = equippedClothes.includes('viagem') || equippedClothes.includes('fina');

  const climateIntervalTurns = Math.max(0, 17 - (totalGameTurns % 17));
  const climateTimeFormatted = formatTurnsToHours(climateIntervalTurns);

  let climateInfo: { label: string; status: string; isOk: boolean } | null = null;
  if (isCold) {
    climateInfo = {
      label: '❄️ Frio Extremo',
      status: hasWinterClothes ? 'Protegido' : `Teste em ${climateTimeFormatted}`,
      isOk: hasWinterClothes
    };
  } else if (isHeat) {
    const isProtected = !hasWinterClothes && hasTravelClothes;
    climateInfo = {
      label: '🔥 Calor Extremo',
      status: isProtected ? 'Protegido' : hasWinterClothes ? 'Aquecido Demais!' : `Teste em ${climateTimeFormatted}`,
      isOk: isProtected
    };
  }

  return (
    <div id="initiative-order-panel" className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2.5 shadow-xl">
      {/* Informações de Sobrevivência (Exaustão, Fome, Sede, Descansos e Frio/Calor) Acima da Iniciativa */}
      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-2 text-[11px] shadow-inner">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
          <span className="font-extrabold text-slate-200 flex items-center gap-1.5">
            <span>🏕️</span> Sobrevivência
          </span>
          <span className={`px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] ${exhaustionColor}`}>
            Exaustão {exhaustionLevel}/6
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
          {/* Fome */}
          <div className="flex items-center justify-between bg-slate-900 px-2 py-1 rounded-lg border border-slate-800" title={`Rações disponíveis: ${rationCount}`}>
            <span className="text-amber-300 font-bold flex items-center gap-1">🍗 Fome</span>
            <span className="text-slate-300 font-semibold">{mealTimeFormatted}</span>
          </div>

          {/* Sede */}
          <div className="flex items-center justify-between bg-slate-900 px-2 py-1 rounded-lg border border-slate-800" title={`Cantil de Água: ${waterCharges}/${waterMax}`}>
            <span className="text-blue-300 font-bold flex items-center gap-1">💧 Sede</span>
            <span className="text-slate-300 font-semibold">{waterTimeFormatted}</span>
          </div>

          {/* Descanso Curto */}
          <div className="flex items-center justify-between bg-slate-900 px-2 py-1 rounded-lg border border-slate-800" title="Tempo restante até necessidade/teste de Descanso Curto">
            <span className="text-emerald-300 font-bold flex items-center gap-1">☕ Desc. Curto</span>
            <span className="text-slate-300 font-semibold">{shortRestTimeFormatted}</span>
          </div>

          {/* Descanso Longo */}
          <div className="flex items-center justify-between bg-slate-900 px-2 py-1 rounded-lg border border-slate-800" title="Tempo restante até necessidade/teste de Descanso Longo (Sono)">
            <span className="text-indigo-300 font-bold flex items-center gap-1">🛌 Desc. Longo</span>
            <span className="text-slate-300 font-semibold">{longRestTimeFormatted}</span>
          </div>
        </div>

        {/* Frio / Calor Extremo */}
        {climateInfo && (
          <div className="flex items-center justify-between bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 text-[10px]">
            <span className="font-bold flex items-center gap-1 text-cyan-300">
              {climateInfo.label}
            </span>
            <span className={`font-semibold ${climateInfo.isOk ? 'text-emerald-400' : 'text-amber-400'}`}>
              {climateInfo.status}
            </span>
          </div>
        )}
      </div>

      <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider block border-b border-slate-800 pb-1.5 pt-0.5">
        📊 Ordem de Iniciativa
      </span>
      <div className="space-y-1 max-h-[120px] overflow-y-auto pr-0.5 custom-scrollbar">
        {entities.map((ent, idx) => {
          const isActive = idx === activeEntityIndex;
          const isHidden = shouldHideEntityDetails(ent);
          const hideStats = shouldHideMonsterStats(ent);
          const displayName = isHidden ? 'Inimigo Oculto' : ent.name;
          const displayIcon = isHidden ? '❓' : ent.icon;
          const displayStats = hideStats
            ? 'HP: ??/?? • CA: ??'
            : `HP: ${ent.currentHp}/${ent.maxHp} • CA: ${ent.ac ?? ent.armor_class}`;

          return (
            <div
              key={`${ent.id || 'ent'}-${idx}`}
              onClick={() => setSelectedEntityForPopup(ent)}
              title={isHidden ? 'Aparência desconhecida' : 'Clique para ver o resumo da ficha'}
              className={`p-1.5 rounded-lg border flex items-center justify-between text-[11px] transition cursor-pointer hover:border-amber-400/80 hover:bg-slate-900/80 hover:scale-[1.01] active:scale-95 ${
                ent.isDead
                  ? 'bg-slate-950/40 border-slate-800 text-slate-600 line-through'
                  : isActive
                  ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm shrink-0">{displayIcon}</span>
                <div className="min-w-0">
                  <div className="font-bold truncate flex items-center gap-1">
                    <span>{displayName}</span>
                    {ent.type === 'monster' && !ent.isDead && (() => {
                      const coverRes = getEntityCover(ent);
                      if (coverRes.acBonus > 0) {
                        return (
                          <span className="text-[9px] text-amber-400 font-bold bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/30 ml-1">
                            🛡️ +{coverRes.acBonus}
                          </span>
                        );
                      }
                      return null;
                    })()}
                    {!isHidden && (
                      <span className="text-[9px] text-amber-400 opacity-0 group-hover:opacity-100 font-normal shrink-0">
                        🔍
                      </span>
                    )}
                  </div>
                  <div className="text-[9px] text-slate-400">{displayStats}</div>
                  {ent.conditions && ent.conditions.length > 0 && !isHidden && (
                    <div className="text-[8px] text-rose-400 mt-0.5 truncate">
                      {ent.conditions.join(', ')}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-400 shrink-0">
                Inic: {ent.initiative}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
