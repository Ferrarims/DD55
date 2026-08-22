import React from 'react';
import { Search, Filter } from 'lucide-react';
import { CATEGORIES, StatusFilter } from './types';

export interface ImplementationsFilterBarProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  selectedStatus: StatusFilter;
  setSelectedStatus: (val: StatusFilter) => void;
}

export function ImplementationsFilterBar({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
}: ImplementationsFilterBarProps) {
  return (
    <div className="bg-slate-850 p-3 rounded-xl border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
      {/* Caixa de busca */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Buscar pelo nome ou descrição..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900/80 border border-slate-700 text-slate-200 rounded pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-amber-500 placeholder:text-slate-500 transition-colors"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Seletor de Categoria */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5">
          <Filter className="w-3.5 h-3.5 text-amber-500" />
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-slate-900 text-xs text-slate-300 focus:outline-none font-medium cursor-pointer"
          >
            <option value="Todas" className="bg-slate-900 text-slate-200">Todas Categorias</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat} className="bg-slate-900 text-slate-200">{cat}</option>
            ))}
          </select>
        </div>

        {/* Seletor de Status de Progresso */}
        <div className="flex bg-slate-900 border border-slate-700 rounded p-0.5">
          <button
            type="button"
            onClick={() => setSelectedStatus('all')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
              selectedStatus === 'all' 
                ? 'bg-amber-600 text-slate-950 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todas
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus('pending')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition flex items-center gap-1 ${
              selectedStatus === 'pending' 
                ? 'bg-slate-850 border border-slate-700 text-slate-300 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Apenas tarefas planejadas e não iniciadas"
          >
            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full"></span>
            Planejado
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus('started')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition flex items-center gap-1 ${
              selectedStatus === 'started' 
                ? 'bg-amber-600/25 border border-amber-500/40 text-amber-300 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Apenas tarefas que já foram iniciadas mas não concluídas"
          >
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
            Iniciado
          </button>
          <button
            type="button"
            onClick={() => setSelectedStatus('completed')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition flex items-center gap-1 ${
              selectedStatus === 'completed' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Apenas tarefas totalmente concluídas"
          >
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
            Feito
          </button>
        </div>
      </div>
    </div>
  );
}
