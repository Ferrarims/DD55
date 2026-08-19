import React, { useEffect } from 'react';

export interface VictorySummaryModalProps {
  showVictorySummaryModal: boolean;
  setShowVictorySummaryModal: (val: boolean) => void;
  victoryData: {
    totalXp: number;
    loot: any[];
    defeatedMonsters: Record<string, number>;
    totalDamageDealt?: number;
  } | null;
  mapStreak: number;
  initNewCombat?: (enemyCount?: number, incrementMapStreak?: boolean) => void;
  handleClaimLootAndSave?: () => void;
  isSaving?: boolean;
}

export const VictorySummaryModal: React.FC<VictorySummaryModalProps> = ({
  showVictorySummaryModal,
  setShowVictorySummaryModal,
  victoryData,
  mapStreak,
  initNewCombat,
  handleClaimLootAndSave,
  isSaving = false,
}) => {
  // Atalhos de teclado: Enter para Continuar no mesmo mapa, Esc para Salvar e Ir pra Ficha
  useEffect(() => {
    if (!showVictorySummaryModal || !victoryData) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        setShowVictorySummaryModal(false);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setShowVictorySummaryModal(false);
        if (handleClaimLootAndSave) {
          handleClaimLootAndSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [showVictorySummaryModal, victoryData, handleClaimLootAndSave, setShowVictorySummaryModal]);

  if (!showVictorySummaryModal || !victoryData) return null;

  const defeatedList = Object.entries(victoryData.defeatedMonsters || {});
  const totalMonstersDefeated = defeatedList.reduce((acc, [, count]) => acc + Number(count), 0);
  const totalDamage = victoryData.totalDamageDealt || 0;
  const totalXp = victoryData.totalXp || 0;
  const lootItems = victoryData.loot || [];

  const handleContinue = () => {
    setShowVictorySummaryModal(false);
  };

  const handleSaveAndExit = () => {
    setShowVictorySummaryModal(false);
    if (handleClaimLootAndSave) {
      handleClaimLootAndSave();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div 
        className="bg-slate-900 border border-amber-500/60 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-amber-900/40 pb-3">
          <div className="flex items-center gap-2.5 text-amber-400">
            <span className="text-3xl">🏆</span>
            <div>
              <h3 className="text-base font-black text-amber-300" style={{ fontFamily: 'Georgia, serif' }}>
                Resumo da Vitória!
              </h3>
              <p className="text-xs text-slate-300">
                Estatísticas do combate no Mapa #{mapStreak}
              </p>
            </div>
          </div>
        </div>

        {/* Três Cards Principais de Estatísticas */}
        <div className="grid grid-cols-3 gap-2">
          {/* Experiência */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-emerald-500/40 text-center space-y-0.5">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">XP Ganho</span>
            <span className="text-base font-black text-emerald-300 block truncate">
              +{totalXp}
            </span>
            <span className="text-[10px] text-slate-400 block">⭐ XP</span>
          </div>

          {/* Dano Causado */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-rose-500/40 text-center space-y-0.5">
            <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">Dano Total</span>
            <span className="text-base font-black text-rose-300 block truncate">
              {totalDamage}
            </span>
            <span className="text-[10px] text-slate-400 block">⚔️ causados</span>
          </div>

          {/* Monstros Derrotados */}
          <div className="bg-slate-950 p-2.5 rounded-xl border border-purple-500/40 text-center space-y-0.5">
            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">Derrotados</span>
            <span className="text-base font-black text-purple-300 block truncate">
              {totalMonstersDefeated}
            </span>
            <span className="text-[10px] text-slate-400 block">👾 criatura(s)</span>
          </div>
        </div>

        {/* Lista Detalhada de Monstros Derrotados */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 border-b border-slate-800 pb-1.5">
            <span className="flex items-center gap-1.5 text-purple-300">
              <span>👾</span> Criaturas Eliminadas ({defeatedList.length} espécies):
            </span>
          </div>
          <div className="max-h-32 overflow-y-auto pr-1 space-y-1.5">
            {defeatedList.length > 0 ? (
              defeatedList.map(([name, count]) => (
                <div 
                  key={name}
                  className="bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
                >
                  <span className="text-slate-200 font-medium truncate flex items-center gap-1.5">
                    <span className="text-purple-400">💀</span> {name}
                  </span>
                  <span className="bg-purple-950 text-purple-300 border border-purple-700/50 px-2 py-0.5 rounded-md font-bold text-[11px] shrink-0">
                    x{count}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center text-xs text-slate-500 py-2">
                Nenhum registro de criatura eliminada.
              </div>
            )}
          </div>
        </div>

        {/* Tesouros / Espólios Recompensas */}
        {lootItems.length > 0 && (
          <div className="bg-amber-950/20 border border-amber-500/30 p-2.5 rounded-xl flex items-center justify-between text-xs">
            <span className="text-amber-300 font-bold flex items-center gap-1.5">
              <span>🎒</span> Tesouros Acumulados:
            </span>
            <span className="text-amber-200 font-extrabold bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-lg">
              {lootItems.length} item(ns)
            </span>
          </div>
        )}

        {/* Botões de Ação (Empilhados Verticalmente) */}
        <div className="pt-2 border-t border-slate-800 flex flex-col w-full gap-2">
          <button
            onClick={handleContinue}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-emerald-400 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 border border-emerald-300 active:scale-98 cursor-pointer"
            title="Aperte ENTER para continuar no mapa atual"
          >
            <span>🗺️ Continuar (Enter)</span>
          </button>

          <button
            onClick={handleSaveAndExit}
            disabled={isSaving}
            className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 border border-amber-300 shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
            title="Aperte ESC para salvar no inventário/ficha e sair"
          >
            <span>{isSaving ? 'Salvando...' : '📥 Salvar e ir pra Ficha (Esc)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
