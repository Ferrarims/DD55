import React from 'react';

interface BasicNeedsMetersProps {
  turnsUntilNextMeal: number;
  rationCount: number;
  hungerProgress: number;
  turnsUntilNextWater: number;
  waterCharges: number;
  waterMax: number;
  thirstProgress: number;
  totalGameTurns: number;
  lastLong: number;
  lastShort: number;
}

export const BasicNeedsMeters: React.FC<BasicNeedsMetersProps> = ({
  turnsUntilNextMeal,
  rationCount,
  hungerProgress,
  turnsUntilNextWater,
  waterCharges,
  waterMax,
  thirstProgress,
  totalGameTurns,
  lastLong,
  lastShort,
}) => {
  return (
    <>
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
    </>
  );
};
