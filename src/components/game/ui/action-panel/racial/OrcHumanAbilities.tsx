import React from 'react';
import { useGameContext } from '../../../context/GameContext';

export const OrcHumanAbilities: React.FC = () => {
  const {
    activeEntity,
    character,
    isBattleOver,
    isOrc,
    adrenalineRushUses,
    adrenalineRushMaxUses,
    handleAdrenalineRush,
    relentlessEnduranceUses,
    isHuman,
    hasHeroicInspiration,
  } = useGameContext();

  const inCombat = !isBattleOver;
  const isHeroTurn = !inCombat || (activeEntity?.type === 'hero' && !activeEntity?.isDead);

  return (
    <>
      {/* Orc: Pico de Adrenalina (Adrenaline Rush) */}
      {isOrc && (() => {
        const canAdrenaline = isHeroTurn && adrenalineRushUses > 0 && (!inCombat || activeEntity.hasBonusAction);
        const pb = character?.proficiencyBonus || (2 + Math.floor(((character?.level || 1) - 1) / 4));
        return (
          <button
            onClick={handleAdrenalineRush}
            disabled={!canAdrenaline}
            className={`py-1.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-between gap-1 shadow transition ${
              canAdrenaline
                ? 'bg-red-900/60 hover:bg-red-800/80 text-red-200 border-red-500/50 cursor-pointer'
                : 'bg-slate-950 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
            }`}
            title={`Pico de Adrenalina (Ação Bônus): Realiza a ação de Disparada (Dash) e ganha +${pb} PV Temporários (${adrenalineRushUses}/${adrenalineRushMaxUses} usos).`}
          >
            <span className="truncate">🏃 Pico de Adrenalina</span>
            <span className="text-[9px] px-1 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/30 shrink-0">
              {adrenalineRushUses}/{adrenalineRushMaxUses}
            </span>
          </button>
        );
      })()}

      {/* Orc: Resistência Implacável (Relentless Endurance) - AUTOMÁTICA */}
      {isOrc && (
        <div
          className="py-1.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-between gap-1 shadow bg-slate-950 border-slate-800 text-slate-500 opacity-70 cursor-help"
          title="Resistência Implacável (Automática): Ao ser reduzido a 0 PV, cai a 1 PV em vez de cair (1x por Descanso Longo)."
        >
          <span className="truncate">💪 Resistência Implacável</span>
          <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-700 shrink-0">
            {relentlessEnduranceUses}/1 (Automática)
          </span>
        </div>
      )}

      {/* Inspiração Heroica (Humano) - AUTOMÁTICA */}
      {isHuman && (
        <div
          className="py-1.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-between gap-1 shadow bg-slate-950 border-slate-800 text-slate-500 opacity-70 cursor-help"
          title={
            hasHeroicInspiration
              ? "Inspiração Heroica Ativa! Se falhar em qualquer teste de d20 (ataque, teste de resistência ou habilidade), você será perguntado se deseja usá-la para re-rolar."
              : "Inspiração Heroica Utilizada (Recarrega em um Descanso Longo)."
          }
        >
          <span className="truncate">✨ Inspiração Heroica</span>
          <span
            className={`text-[8px] font-mono px-1 py-0.5 rounded shrink-0 font-bold border ${
              hasHeroicInspiration
                ? 'bg-slate-900 text-amber-300 border-slate-700'
                : 'bg-slate-900 text-slate-600 border-slate-800'
            }`}
          >
            {hasHeroicInspiration ? '1/1 (Automática)' : '0/1 (Usada)'}
          </span>
        </div>
      )}
    </>
  );
};
