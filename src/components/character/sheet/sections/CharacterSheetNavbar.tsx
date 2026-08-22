import React from 'react';

export interface CharacterSheetNavbarProps {
  character: any;
  onBack: () => void;
  onEnterGame?: (character: any) => void;
  onDelete?: (id: string) => void;
  setShowDeleteConfirm: (val: boolean) => void;
  setShowBestiary: (val: boolean) => void;
  bestiaryStats: { uniqueCount: number; totalCount: number };
  saveMessage: string | null;
  setSaveMessage: (val: string | null) => void;
}

export const CharacterSheetNavbar: React.FC<CharacterSheetNavbarProps> = ({
  character,
  onBack,
  onEnterGame,
  onDelete,
  setShowDeleteConfirm,
  setShowBestiary,
  bestiaryStats,
  saveMessage,
  setSaveMessage,
}) => {
  return (
    <>
      {/* Notificação Flutuante de Mensagens */}
      {saveMessage && (
        <div className="fixed top-5 right-5 z-[9999] max-w-md w-[calc(100vw-2.5rem)] sm:w-auto bg-slate-950/95 backdrop-blur-md border-2 border-emerald-500/80 text-emerald-100 text-xs font-bold rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.85)] p-3.5 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ring-1 ring-emerald-400/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center text-base flex-shrink-0 animate-bounce">
              ✨
            </div>
            <span className="leading-snug text-emerald-200 font-semibold">{saveMessage}</span>
          </div>
          <button
            onClick={() => setSaveMessage(null)}
            className="text-emerald-400 hover:text-white bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 rounded-lg px-2 py-1 transition flex-shrink-0 text-xs"
            title="Fechar Notificação"
          >
            ✕
          </button>
        </div>
      )}

      {/* Barra Superior com Controles Rápidos e Navegação */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg border border-slate-700 transition text-xs flex items-center gap-1.5"
          >
            <span>←</span> Voltar
          </button>

          {onEnterGame && (
            <button
              onClick={() => onEnterGame(character)}
              className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-lg text-xs shadow-lg transition flex items-center gap-1.5 border border-amber-300"
            >
              <span>⚔️</span> Jogar Aventura
            </button>
          )}

          <div className="flex items-center gap-2 shrink-0">
            <div 
              className="flex items-center gap-1.5 bg-slate-900/90 border border-purple-800/60 rounded-lg px-2.5 py-1.5 text-xs shadow-inner"
              title={`Criaturas Derrotadas: ${bestiaryStats.uniqueCount} espécie(s) diferente(s), ${bestiaryStats.totalCount} no total`}
            >
              <span className="text-purple-300 font-medium whitespace-nowrap">
                👾 <strong className="text-purple-200 font-bold">{bestiaryStats.uniqueCount}</strong> dif.
              </span>
              <span className="text-slate-600 font-bold">•</span>
              <span className="text-amber-300 font-medium whitespace-nowrap">
                💀 <strong className="text-amber-200 font-bold">{bestiaryStats.totalCount}</strong> total
              </span>
            </div>

            <button
              onClick={() => setShowBestiary(true)}
              className="px-3.5 py-1.5 bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-700/60 font-bold rounded-lg transition text-xs flex items-center gap-1.5"
            >
              <span>📖</span> Bestiário
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-700/50 font-bold rounded-lg transition text-xs"
            >
              🗑️ Excluir
            </button>
          )}
        </div>
      </div>
    </>
  );
};
