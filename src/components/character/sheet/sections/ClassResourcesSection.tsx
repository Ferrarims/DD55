import React from 'react';

export const ClassResourcesSection: React.FC<{
  character: any;
  classResources: any[];
}> = ({
  character,
  classResources,
}) => {
  return (
    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
      <div className="border-b border-slate-800 pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <span>⚡</span> Recursos e Ações de Combate Funcionais
          </h3>
          <span className="text-[11px] text-slate-400 font-semibold bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
            Nível {character.level || 1} {character.class_name}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Habilidades ativas, usos limitados por descanso e ações de classe em combate.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {classResources.filter((res: any) => res.name !== 'Cantil de Água').map((res: any, idx: number) => {
          const resetLabel = res.reset === 'short' ? 'Descanso Curto' : res.reset === 'long' ? 'Descanso Longo' : res.reset === 'turn' ? 'A cada turno' : res.reset || 'Descanso Longo';
          const actionCost = res.action || (res.name.includes('Fúria') || res.name.includes('Fôlego') ? 'Ação Bônus' : 'Ação Principal');
          const usedCharges = res.used || 0;
          const remaining = Math.max(0, (res.max || 1) - usedCharges);

          return (
            <div key={res.id || `${res.name || 'res'}-${idx}`} className="bg-slate-900 border border-slate-800/90 hover:border-emerald-500/40 p-3 rounded-xl flex flex-col justify-between transition shadow-md gap-2">
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                    <span className="text-emerald-400">⚡</span>
                    <span>{res.name}</span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                    {actionCost}
                  </span>
                </div>

                {res.description && (
                  <p className="text-[11px] text-slate-300 leading-tight">
                    {res.description}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    Recarrega: <strong className="text-slate-200">{resetLabel}</strong>
                  </span>
                  <span className={`font-bold px-2 py-0.5 rounded border ${
                    remaining > 0 ? 'text-emerald-300 bg-emerald-950/40 border-emerald-500/30' : 'text-red-400 bg-red-950/40 border-red-500/30'
                  }`}>
                    Cargas: {remaining} / {res.max || 1}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
