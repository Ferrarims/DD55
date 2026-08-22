import React from 'react';
import { Plus } from 'lucide-react';
import { CATEGORIES } from './types';

export interface ImplementationAddFormProps {
  newTitle: string;
  setNewTitle: (val: string) => void;
  newDesc: string;
  setNewDesc: (val: string) => void;
  newCategory: string;
  setNewCategory: (val: string) => void;
  newOrder: number;
  setNewOrder: (val: number) => void;
  newStarted: boolean;
  setNewStarted: (val: boolean) => void;
  setIsAdding: (val: boolean) => void;
  handleAddSubmit: (e: React.FormEvent) => void;
}

export function ImplementationAddForm({
  newTitle,
  setNewTitle,
  newDesc,
  setNewDesc,
  newCategory,
  setNewCategory,
  newOrder,
  setNewOrder,
  newStarted,
  setNewStarted,
  setIsAdding,
  handleAddSubmit,
}: ImplementationAddFormProps) {
  return (
    <form onSubmit={handleAddSubmit} className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-4 animate-fade-in flex flex-col gap-3">
      <h3 className="text-sm font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
        <Plus className="w-4 h-4" /> Cadastrar Nova Implementação
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Título / Nome</label>
          <input
            type="text"
            required
            placeholder="Ex: Sistema de Multiclasse"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="w-full bg-slate-850 border border-slate-700 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Categoria</label>
          <select
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            className="w-full bg-slate-850 border border-slate-700 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat} className="bg-slate-900 text-slate-200">{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Descrição</label>
        <textarea
          rows={2}
          placeholder="Descreva o que faz ou o escopo planejado desta funcionalidade..."
          value={newDesc}
          onChange={e => setNewDesc(e.target.value)}
          className="w-full bg-slate-850 border border-slate-700 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500"
        />
      </div>

      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-[10px] uppercase font-bold text-slate-400">Ordem de Exibição (display_order):</label>
            <input
              type="number"
              required
              value={newOrder}
              onChange={e => setNewOrder(Number(e.target.value))}
              className="w-16 bg-slate-850 border border-slate-700 text-slate-200 rounded px-2 py-0.5 text-sm focus:outline-none text-center"
            />
          </div>

          <label className="flex items-center gap-1.5 text-slate-300 text-xs font-semibold cursor-pointer select-none">
            <input
              type="checkbox"
              checked={newStarted}
              onChange={e => setNewStarted(e.target.checked)}
              className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-850 w-4 h-4 cursor-pointer"
            />
            <span>Já Iniciada (Em Progresso)</span>
          </label>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Salvar Item
          </button>
        </div>
      </div>
    </form>
  );
}
