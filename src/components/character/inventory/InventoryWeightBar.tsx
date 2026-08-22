import React from 'react';

interface InventoryWeightBarProps {
  character: any;
  totalInventoryWeight: number;
  maxWeightCapacity: number;
  isOverburdened: boolean;
}

export const InventoryWeightBar: React.FC<InventoryWeightBarProps> = ({
  character,
  totalInventoryWeight,
  maxWeightCapacity,
  isOverburdened
}) => {
  const strengthScore = character.strength || 10;
  const isPowerfulBuild = maxWeightCapacity >= strengthScore * 30;
  const multiplier = isPowerfulBuild ? '30' : '15';

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl space-y-2.5 shadow-inner">
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-base">🏋️‍♂️</span>
          <div>
            <span className="font-bold text-slate-300">Capacidade de Carga</span>
            <p className="text-[10px] text-slate-500">
              Baseado em sua Força ({strengthScore} × {multiplier} kg{isPowerfulBuild ? ' • Porte Poderoso 🪨' : ''})
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-slate-100 font-mono font-bold text-sm">
            {totalInventoryWeight.toFixed(1)} <span className="text-slate-400 font-normal text-xs">/ {maxWeightCapacity} kg</span>
          </span>
          {isOverburdened ? (
            <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded animate-pulse">
              ⚠️ Sobrecarregado
            </span>
          ) : totalInventoryWeight > maxWeightCapacity * 0.8 ? (
            <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded">
              Carga Pesada
            </span>
          ) : totalInventoryWeight > maxWeightCapacity * 0.5 ? (
            <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
              Carga Média
            </span>
          ) : (
            <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
              Carga Leve
            </span>
          )}
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="relative w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/60">
        <div
          style={{ width: `${Math.min(100, (totalInventoryWeight / maxWeightCapacity) * 100)}%` }}
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            isOverburdened
              ? 'bg-gradient-to-r from-red-600 to-rose-500 animate-pulse'
              : totalInventoryWeight > maxWeightCapacity * 0.8
              ? 'bg-gradient-to-r from-orange-500 to-amber-500'
              : totalInventoryWeight > maxWeightCapacity * 0.5
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
              : 'bg-gradient-to-r from-emerald-500 to-teal-400'
          }`}
        />
      </div>
      
      {/* Mensagem de alerta */}
      {isOverburdened && (
        <p className="text-[10px] text-rose-400/90 font-medium flex items-center gap-1">
          <span>⚠️</span> <strong>Limite Excedido!</strong> O peso total dos itens excede a capacidade de carga recomendada. O personagem pode sofrer penalidades de movimentação.
        </p>
      )}
    </div>
  );
};
