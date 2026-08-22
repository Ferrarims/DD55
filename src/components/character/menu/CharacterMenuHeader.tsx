import React from 'react';

interface CharacterMenuHeaderProps {
  charactersCount: number;
  loading: boolean;
  onCreateNew: () => void;
  onRefresh: () => void;
}

export const CharacterMenuHeader: React.FC<CharacterMenuHeaderProps> = ({
  charactersCount,
  loading,
  onCreateNew,
  onRefresh,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Card Criar Novo */}
      <div
        onClick={onCreateNew}
        className="group cursor-pointer bg-slate-800/90 hover:bg-slate-800 border border-dashed border-amber-500/50 hover:border-amber-500 rounded-xl p-3.5 flex items-center justify-between gap-3 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.005]"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 shrink-0 rounded-full bg-amber-500/10 group-hover:bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-black border border-amber-500/30 group-hover:scale-105 transition-transform">
            +
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-amber-400 group-hover:text-amber-300 transition-colors" style={{ fontFamily: 'Georgia, serif' }}>
              Criar Novo Personagem
            </h2>
            <p className="text-slate-400 text-xs">
              Forje seu aventureiro e prepare-se para a jornada.
            </p>
          </div>
        </div>
        <span className="shrink-0 px-3 py-1.5 bg-amber-600 group-hover:bg-amber-500 text-slate-950 font-black rounded-lg text-xs transition-all shadow uppercase tracking-wider">
          Iniciar →
        </span>
      </div>

      {/* Card Resumo do Banco de Dados */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3.5 flex flex-col justify-between shadow-md">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-bold text-slate-200 flex items-center gap-1.5" style={{ fontFamily: 'Georgia, serif' }}>
            <span>📜</span> Personagens Salvos
          </h2>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-2.5 py-1 rounded-md border border-slate-600 transition flex items-center gap-1 shrink-0"
            title="Atualizar lista"
          >
            🔄 {loading ? '...' : 'Atualizar'}
          </button>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-700/60 flex justify-end items-center text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Total cadastrado:</span>
            <span className="text-lg font-black text-amber-400">{charactersCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
