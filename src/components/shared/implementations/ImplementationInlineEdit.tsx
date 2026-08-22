import React from 'react';
import { Trash2 } from 'lucide-react';
import { ImplementationTask, CATEGORIES } from './types';

export interface ImplementationInlineEditProps {
  task: ImplementationTask;
  editTitle: string;
  setEditTitle: (val: string) => void;
  editDesc: string;
  setEditDesc: (val: string) => void;
  editCategory: string;
  setEditCategory: (val: string) => void;
  editOrder: number;
  setEditOrder: (val: number) => void;
  editStarted: boolean;
  setEditStarted: (val: boolean) => void;
  deletingId: string | null;
  setDeletingId: (val: string | null) => void;
  setEditingId: (val: string | null) => void;
  handleSaveEdit: (id: string) => void;
  handleDeleteTask: (id: string) => void;
}

export function ImplementationInlineEdit({
  task,
  editTitle,
  setEditTitle,
  editDesc,
  setEditDesc,
  editCategory,
  setEditCategory,
  editOrder,
  setEditOrder,
  editStarted,
  setEditStarted,
  deletingId,
  setDeletingId,
  setEditingId,
  handleSaveEdit,
  handleDeleteTask,
}: ImplementationInlineEditProps) {
  return (
    <div className="flex flex-col gap-2 mt-2 animate-fade-in">
      <div>
        <label className="text-[9px] uppercase font-bold text-slate-400">Título</label>
        <input 
          type="text" 
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-semibold"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-[9px] uppercase font-bold text-slate-400">Categoria</label>
          <select
            value={editCategory}
            onChange={e => setEditCategory(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat} className="bg-slate-900 text-slate-200">{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[9px] uppercase font-bold text-slate-400">Ordem</label>
          <input 
            type="number" 
            value={editOrder}
            onChange={e => setEditOrder(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-amber-500 text-center"
          />
        </div>

        <div className="flex flex-col justify-end pb-1 h-full select-none">
          <label className="flex items-center gap-1.5 text-slate-300 text-[10px] font-bold cursor-pointer h-8">
            <input
              type="checkbox"
              checked={editStarted}
              onChange={e => setEditStarted(e.target.checked)}
              className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-950 w-3.5 h-3.5 cursor-pointer"
            />
            <span>Iniciada</span>
          </label>
        </div>
      </div>

      <div>
        <label className="text-[9px] uppercase font-bold text-slate-400">Descrição</label>
        <textarea 
          rows={2}
          value={editDesc}
          onChange={e => setEditDesc(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
        />
      </div>

      <div className="flex justify-between items-center mt-1">
        {deletingId === task.id ? (
          <div className="flex items-center gap-1.5 bg-rose-950/90 border border-rose-500/60 px-2 py-0.5 rounded animate-fade-in">
            <span className="text-[10px] text-rose-200 font-bold whitespace-nowrap">Excluir?</span>
            <button
              type="button"
              onClick={() => handleDeleteTask(task.id)}
              className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded text-[10px] transition-colors"
            >
              Sim
            </button>
            <button
              type="button"
              onClick={() => setDeletingId(null)}
              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded text-[10px] transition-colors"
            >
              Não
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setDeletingId(task.id)}
            className="px-2 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/50 rounded text-[10px] font-bold flex items-center gap-1"
            title="Excluir item"
          >
            <Trash2 className="w-3 h-3" />
            <span>Excluir</span>
          </button>
        )}

        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setEditingId(null)}
            className="px-2 py-1 bg-slate-850 hover:bg-slate-800 text-slate-400 rounded text-[10px] font-bold"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => handleSaveEdit(task.id)}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
