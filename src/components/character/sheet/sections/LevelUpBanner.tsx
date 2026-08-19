import React from 'react';

interface LevelUpBannerProps {
  canLevelUp: boolean;
  effectiveLevel: number;
  nextLevel: number;
  xp: number;
  onOpenLevelUpModal: () => void;
}

export const LevelUpBanner: React.FC<LevelUpBannerProps> = ({
  canLevelUp,
  effectiveLevel,
  nextLevel,
  xp,
  onOpenLevelUpModal,
}) => {
  if (!canLevelUp) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 border-2 border-amber-400/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl animate-pulse">
      <div className="flex items-center gap-3">
        <span className="text-4xl">🎉</span>
        <div>
          <h3 className="text-base font-black text-amber-300" style={{ fontFamily: 'Georgia, serif' }}>
            EVOLUÇÃO DISPONÍVEL! (Nível {effectiveLevel} ➔ Nível {nextLevel})
          </h3>
          <p className="text-xs text-slate-200">
            Você possui <strong>{xp || 0} XP</strong> acumulados! Clique no botão ao lado para rolar seu Dado de Vida e ativar as Habilidades do Nível {nextLevel}.
          </p>
        </div>
      </div>
      <button
        onClick={onOpenLevelUpModal}
        className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 hover:from-emerald-400 hover:to-amber-300 text-slate-950 font-black rounded-xl text-xs shadow-xl transition flex items-center justify-center gap-2 border border-emerald-300 transform hover:scale-105 active:scale-95 whitespace-nowrap"
      >
        <span>⚡ SUBIR PARA NÍVEL {nextLevel}</span>
      </button>
    </div>
  );
};
