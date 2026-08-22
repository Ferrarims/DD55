import React from 'react';

export type InventoryCategoryType = 'all' | 'armaduras' | 'armas' | 'municoes' | 'consumiveis' | 'outros' | 'teste';

interface InventoryCategoryFilterProps {
  currentFilter: InventoryCategoryType;
  onSelectFilter: (filter: InventoryCategoryType) => void;
  counts: {
    all: number;
    armaduras: number;
    armas: number;
    municoes: number;
    consumiveis: number;
    outros: number;
    teste: number;
  };
}

export const InventoryCategoryFilter: React.FC<InventoryCategoryFilterProps> = ({
  currentFilter,
  onSelectFilter,
  counts
}) => {
  const filterOptions: { id: InventoryCategoryType; label: string; icon: string; activeColor: string; count: number }[] = [
    { id: 'all', label: 'Todos', icon: '📦', activeColor: 'bg-amber-500 text-slate-950', count: counts.all },
    { id: 'armaduras', label: 'Armaduras', icon: '🛡️', activeColor: 'bg-blue-600 text-white', count: counts.armaduras },
    { id: 'armas', label: 'Armas', icon: '⚔️', activeColor: 'bg-red-600 text-white', count: counts.armas },
    { id: 'municoes', label: 'Munições', icon: '🏹', activeColor: 'bg-emerald-600 text-white', count: counts.municoes },
    { id: 'consumiveis', label: 'Consumíveis', icon: '🧪', activeColor: 'bg-rose-600 text-white', count: counts.consumiveis },
    { id: 'outros', label: 'Outros Itens', icon: '🎒', activeColor: 'bg-purple-600 text-white', count: counts.outros },
    { id: 'teste', label: 'Teste', icon: '🧪', activeColor: 'bg-amber-600 text-white', count: counts.teste }
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
      {filterOptions.map(opt => {
        const isActive = currentFilter === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelectFilter(opt.id)}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              isActive
                ? `${opt.activeColor} shadow`
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>{opt.icon} {opt.label} ({opt.count})</span>
          </button>
        );
      })}
    </div>
  );
};
