import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  ListOrdered 
} from 'lucide-react';
import { ImplementationTask } from './types';
import { ImplementationInlineEdit } from './ImplementationInlineEdit';

export interface ImplementationCardProps {
  task: ImplementationTask;
  index: number;
  isEditing: boolean;
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
  startEditing: (task: ImplementationTask) => void;
  handleSaveEdit: (id: string) => void;
  handleToggleStarted: (task: ImplementationTask) => void;
  handleToggleComplete: (task: ImplementationTask) => void;
  handleMakeFirst: (task: ImplementationTask) => void;
  handleMoveUp: (task: ImplementationTask) => void;
  handleMoveDown: (task: ImplementationTask) => void;
  handleDeleteTask: (id: string) => void;
}

export const ImplementationCard: React.FC<ImplementationCardProps> = (props) => {
  const {
    task,
    isEditing,
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
    startEditing,
    handleSaveEdit,
    handleToggleStarted,
    handleToggleComplete,
    handleMakeFirst,
    handleMoveUp,
    handleMoveDown,
    handleDeleteTask,
  } = props;

  return (
    <div 
      className={`border rounded-xl p-4 transition-all duration-200 flex flex-col justify-between ${
        task.completed 
          ? 'bg-slate-900/30 border-emerald-950/40 hover:border-emerald-900/50 opacity-80' 
          : 'bg-slate-800/40 border-slate-700/70 hover:border-slate-600'
      } ${isEditing ? 'ring-2 ring-amber-500 border-transparent bg-slate-900/50' : ''}`}
    >
      <div>
        {/* Linha Superior (Categoria, Ordem, Status) */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className={`text-[9px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded ${
              task.completed 
                ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/30' 
                : 'bg-slate-900/80 text-amber-500 border border-slate-700'
            }`}>
              {task.category}
            </span>
            
            {/* Indicador de Ordem */}
            <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border flex items-center gap-1 ${
              task.completed || task.display_order <= 0
                ? 'bg-slate-900/40 text-slate-500 border-slate-800'
                : 'bg-slate-900/80 text-amber-400/90 border-slate-750'
            }`}>
              <ListOrdered className="w-3 h-3 text-slate-500" />
              <span>{task.completed || task.display_order <= 0 ? 'Ordem: -' : `Ordem: ${task.display_order}`}</span>
            </span>
          </div>

          {/* Status de Progresso (Iniciar e Concluir) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleToggleStarted(task)}
              disabled={task.completed}
              className={`flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md border transition-colors ${
                task.started
                  ? 'bg-amber-950/60 border-amber-600/50 text-amber-300'
                  : 'bg-slate-900 hover:bg-slate-850 border-slate-750 text-slate-450 hover:text-slate-350'
              } ${task.completed ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={task.completed ? "Já concluído" : task.started ? "Marcar como não iniciado" : "Marcar como iniciado (Em Progresso)"}
            >
              <Clock className="w-3 h-3" />
              <span>{task.started ? 'Iniciado' : 'Iniciar'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleToggleComplete(task)}
              className={`flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md border transition-colors ${
                task.completed
                  ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300'
                  : 'bg-slate-900 hover:bg-slate-850 border-slate-750 text-slate-450 hover:text-slate-350'
              }`}
              title={task.completed ? "Marcar como pendente" : "Marcar como concluído"}
            >
              {task.completed ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Feito</span>
                </>
              ) : (
                <>
                  <Circle className="w-3 h-3" />
                  <span>Concluir</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Formulário de Edição Inline ou Visualização */}
        {isEditing ? (
          <ImplementationInlineEdit
            task={task}
            editTitle={editTitle}
            setEditTitle={setEditTitle}
            editDesc={editDesc}
            setEditDesc={setEditDesc}
            editCategory={editCategory}
            setEditCategory={setEditCategory}
            editOrder={editOrder}
            setEditOrder={setEditOrder}
            editStarted={editStarted}
            setEditStarted={setEditStarted}
            deletingId={deletingId}
            setDeletingId={setDeletingId}
            setEditingId={setEditingId}
            handleSaveEdit={handleSaveEdit}
            handleDeleteTask={handleDeleteTask}
          />
        ) : (
          <div className="mt-2">
            <h4 className={`text-base font-bold tracking-tight ${
              task.completed ? 'text-slate-350 line-through decoration-emerald-500/50' : 'text-slate-100'
            }`}>
              {task.title}
            </h4>
            <p className={`text-xs mt-1 leading-relaxed ${
              task.completed ? 'text-slate-450' : 'text-slate-350'
            }`}>
              {task.description || "Nenhuma descrição fornecida."}
            </p>
          </div>
        )}
      </div>

      {/* Barra de Ações do Card (Mudar Ordem, Editar, Excluir) */}
      {!isEditing && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-slate-400">
          {!task.completed && task.display_order > 0 ? (
            <div className="flex items-center gap-1 bg-slate-900/40 p-0.5 rounded border border-slate-850">
              {task.display_order > 1 && (
                <button
                  type="button"
                  onClick={() => handleMakeFirst(task)}
                  className="p-1 hover:bg-slate-850 rounded hover:text-amber-500 text-amber-500/80 text-[10px] font-extrabold px-1.5 transition-all"
                  title="Tornar este item o primeiro (muda a sequência dos outros em +1)"
                >
                  1º
                </button>
              )}
              
              <button
                type="button"
                onClick={() => handleMoveUp(task)}
                className="p-1 hover:bg-slate-800 rounded hover:text-amber-500 transition-all text-slate-500"
                title="Subir na lista"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              
              <span className="text-[9px] font-mono text-slate-500 font-bold px-1 select-none">
                Ordem
              </span>

              <button
                type="button"
                onClick={() => handleMoveDown(task)}
                className="p-1 hover:bg-slate-800 rounded hover:text-amber-500 transition-all text-slate-500"
                title="Descer na lista"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="text-[11px] text-slate-500 italic flex items-center gap-1 select-none">
              {task.completed ? 'Tarefa Concluída' : 'Sem ordem'}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => startEditing(task)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded transition-all text-xs font-semibold flex items-center gap-1"
              title="Editar detalhes"
            >
              <span>Editar</span>
            </button>

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
                className="px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200 border border-rose-900/50 rounded transition-all text-xs font-semibold flex items-center gap-1"
                title="Excluir item"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
