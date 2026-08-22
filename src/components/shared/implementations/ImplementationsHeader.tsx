import React from 'react';
import { 
  Plus, 
  X, 
  ListOrdered, 
  Check, 
  Sparkles 
} from 'lucide-react';

export interface ImplementationsHeaderProps {
  tasksCount: number;
  completedCount: number;
  percentCompleted: number;
  isAdding: boolean;
  setIsAdding: (val: boolean) => void;
  isReorganizing: boolean;
  reorganizedFeedback: boolean;
  handleReorganizeOrders: () => void;
  loadData: () => void;
}

export function ImplementationsHeader({
  tasksCount,
  completedCount,
  percentCompleted,
  isAdding,
  setIsAdding,
  isReorganizing,
  reorganizedFeedback,
  handleReorganizeOrders,
  loadData,
}: ImplementationsHeaderProps) {
  return (
    <div className="p-4 border-b border-slate-700 bg-slate-800/80 sticky top-0 z-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <span className="text-amber-500">🛠️</span>
            Controle de Implementações
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Acompanhe as funcionalidades prontas e o que ainda está planejado para o sistema.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleReorganizeOrders}
            disabled={isReorganizing || tasksCount === 0}
            className={`font-semibold text-xs px-3 py-1.5 rounded flex items-center gap-1.5 transition-all shadow-sm border ${
              reorganizedFeedback
                ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300'
                : 'bg-indigo-600/20 hover:bg-indigo-600/35 border-indigo-500/40 hover:border-indigo-400 text-indigo-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Organizar sequência: apaga a ordem das tarefas já concluídas e renumera todas as pendentes iniciando do 1 em ordem crescente"
          >
            {reorganizedFeedback ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ordem Reorganizada!</span>
              </>
            ) : (
              <>
                <ListOrdered className={`w-3.5 h-3.5 ${isReorganizing ? 'animate-spin text-amber-400' : 'text-indigo-400'}`} />
                <span>{isReorganizing ? 'Organizando...' : 'Organizar Ordem (1..N)'}</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors"
          >
            {isAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{isAdding ? 'Fechar' : 'Nova Implementação'}</span>
          </button>
          
          <button
            onClick={loadData}
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs px-3 py-1.5 rounded transition-colors"
          >
            Recarregar
          </button>
        </div>
      </div>

      {/* Barra de Progresso do Dashboard */}
      <div className="mt-4 bg-slate-900/60 rounded-xl p-3 border border-slate-750">
        <div className="flex items-center justify-between mb-1.5 text-xs text-slate-350">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-amber-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Progresso do Desenvolvimento
          </span>
          <span className="font-bold text-slate-200">
            {completedCount} de {tasksCount} Concluído ({percentCompleted}%)
          </span>
        </div>
        <div className="w-full bg-slate-850 h-2.5 rounded-full overflow-hidden border border-slate-700">
          <div 
            className="h-full bg-gradient-to-r from-emerald-600 to-amber-500 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${percentCompleted}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
