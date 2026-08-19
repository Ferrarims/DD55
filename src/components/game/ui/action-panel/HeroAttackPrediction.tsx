import React from 'react';
import { useGameContext } from '../../context/GameContext';

export const HeroAttackPrediction: React.FC = () => {
  const { impendingAttackDetails } = useGameContext();

  if (!impendingAttackDetails) return null;

  return (
    <div className={`p-2 rounded-xl border transition-all text-[11px] space-y-1.5 shadow-md ${
      impendingAttackDetails.state === 'advantage'
        ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
        : impendingAttackDetails.state === 'disadvantage'
          ? 'bg-rose-950/50 border-rose-500/40 text-rose-200'
          : 'bg-slate-950/80 border-slate-800 text-slate-300'
    }`}>
      <div className="flex items-center justify-between font-bold">
        <span className="text-[10px] uppercase tracking-wider text-slate-400">
          🎯 Previsão d20:
        </span>
        <div className="flex items-center gap-1.5">
          {impendingAttackDetails.state === 'advantage' && (
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              🟢 Vantagem
            </span>
          )}
          {impendingAttackDetails.state === 'disadvantage' && (
            <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1">
              🔴 Desvantagem
            </span>
          )}
          {impendingAttackDetails.state === 'normal' && (
            <span className="bg-slate-850 text-slate-400 border border-slate-700/60 px-2 py-0.5 rounded-full text-[10px] font-bold">
              ⚪ Normal
              {(impendingAttackDetails.advantageSources?.length || 0) > 0 && (impendingAttackDetails.disadvantageSources?.length || 0) > 0 && " (Anulado)"}
            </span>
          )}
        </div>
      </div>

      {/* Informações detalhadas do Alvo e Modificadores */}
      <div className="text-[10px] space-y-1 pt-0.5 border-t border-slate-800/50">
        {impendingAttackDetails.targetName && (
          <div className="text-slate-400 flex justify-between">
            <span>Inimigo mais próximo:</span>
            <strong className="text-amber-400">{impendingAttackDetails.targetName}</strong>
          </div>
        )}

        {/* Fontes de Vantagem */}
        {(impendingAttackDetails.advantageSources?.length || 0) > 0 && (
          <div className="flex items-start gap-1 text-emerald-400/90 text-[9px] leading-tight">
            <span className="shrink-0">✔</span>
            <span>
              <strong>Vantagem de:</strong> {impendingAttackDetails.advantageSources.join(', ')}
            </span>
          </div>
        )}

        {/* Fontes de Desvantagem */}
        {(impendingAttackDetails.disadvantageSources?.length || 0) > 0 && (
          <div className="flex items-start gap-1 text-rose-400/90 text-[9px] leading-tight">
            <span className="shrink-0">✖</span>
            <span>
              <strong>Desvantagem de:</strong> {impendingAttackDetails.disadvantageSources.join(', ')}
            </span>
          </div>
        )}

        {/* Alerta de Crítico Automático */}
        {impendingAttackDetails.autoCritPossible && (
          <div className="mt-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 px-1.5 py-1 rounded text-[9px] font-black animate-bounce flex items-center gap-1">
            💥 Crítico Automático no próximo acerto corpo-a-corpo! (Inimigo Paralisado/Inconsciente)
          </div>
        )}
      </div>
    </div>
  );
};
