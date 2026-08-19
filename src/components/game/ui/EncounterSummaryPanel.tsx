import React from 'react';
import { useGameContext } from '../context/GameContext';

export const EncounterSummaryPanel: React.FC = () => {
  const context = useGameContext();
  if (!context) return null;

  const {
    combatSummary,
    shouldHideEntityDetails,
    shouldHideMonsterStats,
  } = context;

  return (
    <div id="encounter-summary-panel" className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2 shadow-xl">
      <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
        <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
          <span>⚔️</span> Encontro
        </span>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${combatSummary.diffColor}`}>
          {combatSummary.diffLabel}
        </span>
      </div>

      {/* Grid de Resumo */}
      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
        <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800/80">
          <span className="text-[9px] text-slate-400 block font-semibold">👹 Qtd. Monstros</span>
          <span className="text-[11px] font-black text-slate-100">
            {combatSummary.aliveMonsters} / {combatSummary.totalMonsters}{' '}
            <span className="text-[9px] text-slate-400 font-normal">vivos</span>
          </span>
        </div>

        <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800/80">
          <span className="text-[9px] text-slate-400 block font-semibold">🎯 Desafio (ND)</span>
          <span
            className="text-[11px] font-bold text-amber-300 truncate block"
            title={combatSummary.crFormatted}
          >
            {combatSummary.crFormatted}
          </span>
        </div>

        <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800/80 col-span-2">
          <span className="text-[9px] text-slate-400 block font-semibold">⭐ Recompensa XP do Encontro</span>
          <span className="text-[11px] font-black text-emerald-400">
            +{combatSummary.totalXp}
            {combatSummary.hasHiddenMonsters ? ' + ??' : ''} XP
          </span>
        </div>
      </div>

      {/* Lista dos Monstros Presentes no Encontro */}
      {combatSummary.monsters.length > 0 && (
        <div className="space-y-1 pt-1 border-t border-slate-800/60">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
            Inimigos em Campo:
          </span>
          <div className="space-y-1 max-h-[95px] overflow-y-auto pr-0.5">
            {combatSummary.monsters.map((m, idx) => {
              const hpPercent = Math.max(
                0,
                Math.min(100, Math.round((m.currentHp / m.maxHp) * 100))
              );
              const isHidden = shouldHideEntityDetails(m);
              const hideStats = shouldHideMonsterStats(m);
              const displayName = isHidden ? 'Inimigo Oculto' : m.name;
              const displayIcon = isHidden ? '❓' : m.icon;

              return (
                <div
                  key={`${m.id || 'monster'}-${idx}`}
                  className={`p-1 rounded-lg border text-[11px] flex items-center justify-between gap-1.5 ${
                    m.isDead
                      ? 'bg-slate-950/40 border-slate-800/50 text-slate-600'
                      : 'bg-slate-950/80 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-xs shrink-0">{displayIcon}</span>
                    <div className="min-w-0">
                      <div
                        className={`font-bold text-[10px] truncate ${
                          m.isDead ? 'line-through text-slate-500' : 'text-slate-200'
                        }`}
                      >
                        {displayName}
                      </div>
                      <div className="text-[8px] text-slate-400 flex gap-1 items-center">
                        {hideStats ? (
                          <>
                            <span className="text-amber-400 font-semibold">ND ??</span>
                            <span>•</span>
                            <span>+?? XP</span>
                            <span>•</span>
                            <span>CA ??</span>
                          </>
                        ) : (
                          <>
                            <span className="text-amber-400 font-semibold">ND {m.cr || '1/4'}</span>
                            <span>•</span>
                            <span>+{m.xpValue || 0} XP</span>
                            <span>•</span>
                            <span>CA {m.armor_class}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-[9px] font-mono font-bold block ${
                        m.isDead ? 'text-slate-600' : 'text-rose-400'
                      }`}
                    >
                      {m.isDead ? 'Morto' : hideStats ? '??/?? HP' : `${m.currentHp}/${m.maxHp} HP`}
                    </span>
                    {!m.isDead && !hideStats && (
                      <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden mt-0.5 ml-auto">
                        <div
                          className={`h-full transition-all duration-300 ${
                            hpPercent > 50
                              ? 'bg-emerald-500'
                              : hpPercent > 20
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${hpPercent}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
