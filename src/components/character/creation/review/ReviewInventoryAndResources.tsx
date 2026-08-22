import React from 'react';

interface ReviewInventoryAndResourcesProps {
  items: any[];
  coins: number;
  resourcesList: any[];
}

export const ReviewInventoryAndResources: React.FC<ReviewInventoryAndResourcesProps> = ({
  items,
  coins,
  resourcesList,
}) => {
  return (
    <div className="space-y-4">
      {/* Inventory Panel */}
      <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <span className="block text-[10px] text-slate-500 uppercase font-bold">Inventário</span>
          <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{coins}</span>
        </div>
        <ul className="text-sm text-slate-300 space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {items.map((item: any, idx: number) => {
            return (
              <li key={idx} className="flex justify-between items-center bg-slate-950 p-2 px-3 rounded border border-slate-800/50">
                <span className="flex-1 text-xs mr-2" title={item.name}>
                  {item.quantity && item.quantity > 1 ? `${item.quantity}x ` : ''}{item.name}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  {item.equipped && <span className="text-[9px] font-bold text-green-400 uppercase tracking-widest bg-green-950/40 px-1.5 py-0.5 rounded border border-green-800/40">Equipado</span>}
                </div>
              </li>
            );
          })}
          {items.length === 0 && <li className="italic text-slate-500 text-xs">Sem equipamento definido.</li>}
        </ul>
      </div>

      {/* Resources Panel */}
      {resourcesList.length > 0 && (
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
          <span className="block text-[10px] text-slate-500 uppercase font-bold mb-3">Recursos Consumíveis</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {resourcesList.map((res, idx) => (
              <div key={idx} className="bg-slate-950 p-3 rounded border border-slate-800 relative">
                {res.action && (
                  <span className={`absolute top-2 right-2 text-[8px] uppercase font-black px-1.5 py-0.5 rounded ${res.action === 'Ação Bônus' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                    {res.action}
                  </span>
                )}
                <span className="block text-xs font-bold text-slate-300 mb-2 pr-16">{res.name}</span>
                <div className="flex gap-1 flex-wrap">
                  <span className="text-sm font-bold text-blue-400">{res.max} Usos</span>
                </div>
                <span className="block text-[9px] text-slate-500 mt-2 uppercase">Restaura em Descanso {res.reset === 'long' ? 'Longo' : 'Curto/Longo'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Common Actions Panel */}
      <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
        <span className="block text-[10px] text-slate-500 uppercase font-bold mb-3">Ações Comuns em Combate</span>
        <div className="flex flex-wrap gap-1.5">
          {['Esquivar', 'Desengajar', 'Esconder', 'Disparada', 'Ajuda', 'Procurar', 'Usar Objeto'].map((action, idx) => (
            <div key={idx} className="bg-slate-950 border border-slate-800 px-2.5 py-1 rounded text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              {action}
              <span className="text-[7px] uppercase font-black px-1 py-0.2 rounded bg-blue-500/20 text-blue-400">Ação</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
