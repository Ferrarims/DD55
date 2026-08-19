import React from 'react';
import { useGameContext } from '../context/GameContext';

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
        {/* Barra de Fome */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] font-bold">
            <span className="text-amber-300 flex items-center gap-1">
              🍗 Fome <span className="text-slate-500 font-normal ml-0.5">(-1 em {turnsUntilNextMeal}t)</span>
            </span>
            <span className="text-slate-400 bg-slate-950 border border-slate-800 px-1 rounded">
              Rações: {rationCount}
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${hungerProgress}%` }}
            />
          </div>
        </div>

        {/* Barra de Sede */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] font-bold">
            <span className="text-blue-300 flex items-center gap-1">
              💧 Sede <span className="text-slate-500 font-normal ml-0.5">(-1 em {turnsUntilNextWater}t)</span>
            </span>
            <span className="text-slate-400 bg-slate-950 border border-slate-800 px-1 rounded">
              Cantil: {waterCharges}/{waterMax}
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${thirstProgress}%` }}
            />
          </div>
        </div>

        {/* Barra de Sono */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] font-bold">
            <span className="text-indigo-300 flex items-center gap-1">
              🥱 Sono{' '}
              <span className="text-slate-500 font-normal ml-0.5">
                (Teste em {Math.max(0, 400 - ((totalGameTurns - lastLong) % 400))}t)
              </span>
            </span>
            <span className="text-slate-400 bg-slate-950 border border-slate-800 px-1 rounded">24h</span>
          </div>
          <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{
                width: `${((400 - Math.max(0, 400 - ((totalGameTurns - lastLong) % 400))) / 400) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Barra de Fadiga */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] font-bold">
            <span className="text-emerald-300 flex items-center gap-1">
              🏃 Fadiga{' '}
              <span className="text-slate-500 font-normal ml-0.5">
                (Teste em {Math.max(0, 133 - ((totalGameTurns - lastShort) % 133))}t)
              </span>
            </span>
            <span className="text-slate-400 bg-slate-950 border border-slate-800 px-1 rounded">8h</span>
          </div>
          <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{
                width: `${((133 - Math.max(0, 133 - ((totalGameTurns - lastShort) % 133))) / 133) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Clima Extremo */}
        {(weather === 'snow' || weather === 'storm' || biome === 'Deserto') && (() => {
          const isCold = weather === 'snow' || weather === 'storm';
          const isHeat = biome === 'Deserto';
          const equippedClothes = character.equipment_slots?.roupa_clima?.toLowerCase() || '';
          const hasWinterClothes = equippedClothes.includes('frio') || equippedClothes.includes('inverno');
          const hasTravelClothes = equippedClothes.includes('viagem') || equippedClothes.includes('fina');

          let statusColor = 'text-slate-400';
          let progressColor = 'bg-slate-600';
          let label = '';
          let isProtected = false;

          if (isCold) {
            label = '❄️ Frio Extremo';
            statusColor = 'text-cyan-300';
            progressColor = 'bg-cyan-500';
            isProtected = hasWinterClothes;
          } else if (isHeat) {
            label = '🔥 Calor Extremo';
            statusColor = 'text-orange-400';
            progressColor = 'bg-orange-500';
            if (hasWinterClothes) {
              isProtected = false;
            } else {
              isProtected = hasTravelClothes;
            }
          }

          const hasLivingMonstersForClothes = (entities || []).some(
            (e: any) => e.type === 'monster' && e.currentHp > 0 && !e.isDead
          );
          const clothingItems = (character.character_inventory || []).filter((inv: any) => {
            const name = (inv.item?.name || inv.items?.name || inv.name || '').toLowerCase();
            return /roupa|veste|traje|manto/.test(name);
          });

          return (
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className={`${statusColor} flex items-center gap-1`}>
                  {label}{' '}
                  {!isProtected && (
                    <span className="text-slate-500 font-normal ml-0.5">
                      (Teste em {Math.max(0, 17 - (totalGameTurns % 17))}t)
                    </span>
                  )}
                </span>
                <span
                  className={`text-slate-400 bg-slate-950 border px-1 rounded ${
                    isProtected
                      ? 'border-emerald-500/50 text-emerald-400'
                      : 'border-red-500/50 text-red-400'
                  }`}
                >
                  {isProtected ? 'Protegido' : 'Exposto'}
                </span>
              </div>
              {!isProtected && (
                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full ${progressColor} transition-all duration-300`}
                    style={{
                      width: `${((17 - Math.max(0, 17 - (totalGameTurns % 17))) / 17) * 100}%`,
                    }}
                  />
                </div>
              )}

              {!hasLivingMonstersForClothes && clothingItems.length > 0 && (
                <div className="pt-1 mt-1 border-t border-slate-800">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block mb-1">
                    Mochila (Trocar Roupa):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {clothingItems.map((inv: any) => {
                      const name = inv.item?.name || inv.items?.name || inv.name || 'Roupa';
                      const isEq = equippedClothes === name.toLowerCase();
                      return (
                        <button
                          key={inv.id || name}
                          onClick={() => {
                            const updatedSlots = { ...(character.equipment_slots || {}) };
                            if (isEq) {
                              updatedSlots.roupa_clima = null;
                            } else {
                              updatedSlots.roupa_clima = name;
                            }
                            character.equipment_slots = updatedSlots;
                            if (forceR) forceR((p: number) => p + 1);
                            import('../../../lib/api/characterService').then(({ updateCharacter }) => {
                              updateCharacter(character.id, { equipment_slots: updatedSlots })
                                .then(() => {
                                  if (onCharacterUpdated) onCharacterUpdated();
                                })
                                .catch((e) => console.warn(e));
                            });
                          }}
                          className={`text-[9px] px-1.5 py-0.5 rounded border transition cursor-pointer ${
                            isEq
                              ? 'bg-amber-900/50 border-amber-500/50 text-amber-200'
                              : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          {isEq ? '🛡️ ' : ''}
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
};
