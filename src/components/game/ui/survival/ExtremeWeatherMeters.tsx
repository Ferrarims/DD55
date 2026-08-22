import React from 'react';

interface ExtremeWeatherMetersProps {
  weather: string;
  biome: string;
  character: any;
  totalGameTurns: number;
  entities: any[];
  onCharacterUpdated?: () => void;
  forceR?: (fn: (p: number) => number) => void;
}

export const ExtremeWeatherMeters: React.FC<ExtremeWeatherMetersProps> = ({
  weather,
  biome,
  character,
  totalGameTurns,
  entities,
  onCharacterUpdated,
  forceR,
}) => {
  if (weather !== 'snow' && weather !== 'storm' && biome !== 'Deserto') {
    return null;
  }

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
                  type="button"
                  onClick={() => {
                    const updatedSlots = { ...(character.equipment_slots || {}) };
                    if (isEq) {
                      updatedSlots.roupa_clima = null;
                    } else {
                      updatedSlots.roupa_clima = name;
                    }
                    character.equipment_slots = updatedSlots;
                    if (forceR) forceR((p: number) => p + 1);
                    import('../../../../lib/api/characterService').then(({ updateCharacter }) => {
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
};
