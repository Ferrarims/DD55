import React from 'react';
import { useModalKeyboard } from '../../../../components/shared/ModalKeyboardHandler';

export interface HpAuditModalProps {
  showHpAudit: boolean;
  setShowHpAudit: (show: boolean) => void;
  hpBreakdown: any;
  character?: any;
  currentHp?: number;
}

export const HpAuditModal: React.FC<HpAuditModalProps> = ({
  showHpAudit,
  setShowHpAudit,
  hpBreakdown,
  character,
  currentHp,
}) => {
  useModalKeyboard({
    onClose: () => setShowHpAudit(false),
    disabled: !showHpAudit,
  });

  if (!showHpAudit) return null;

  const totalMax = hpBreakdown?.totalMaxHp ?? hpBreakdown?.total ?? 10;
  const current = currentHp ?? character?.current_hp ?? totalMax;
  const tempHp = character?.temporary_hp || character?.temp_hp || 0;
  const hpPercent = Math.min(100, Math.max(0, Math.round((current / totalMax) * 100)));

  return (
    <div
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={() => setShowHpAudit(false)}
    >
      <div
        className="bg-slate-900 border border-red-900/50 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-5 text-slate-100 relative animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={() => setShowHpAudit(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition"
          title="Fechar"
        >
          ✕
        </button>

        {/* Cabeçalho */}
        <div>
          <div className="flex items-center gap-2 text-red-400 font-black text-lg">
            <span className="text-xl">❤️</span>
            <h3>Auditoria e Resolução de Pontos de Vida (PV)</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Detalhamento do cálculo de pontos de vida, incluindo evolução nível a nível, bônus de Constituição, raça e talentos.
          </p>
        </div>

        {/* Card de Estado Atual de PV */}
        <div className="bg-slate-950 border border-red-900/40 rounded-xl p-4 flex flex-col gap-3 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status Atual:</span>
              <span className="text-xl font-black text-white">{current} <span className="text-slate-500 text-sm font-semibold">/ {totalMax} PV</span></span>
              {tempHp > 0 && (
                <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-700/60 rounded text-[11px] font-bold">
                  +{tempHp} PV Temp
                </span>
              )}
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              hpPercent === 100 
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                : hpPercent > 50
                ? 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                : 'bg-red-950/80 text-red-300 border-red-700/60'
            }`}>
              {hpPercent}% de Saúde
            </span>
          </div>

          {/* Barra Visual de PV */}
          <div className="w-full bg-slate-850 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                hpPercent > 50 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : hpPercent > 25 ? 'bg-gradient-to-r from-amber-600 to-amber-400' : 'bg-gradient-to-r from-red-600 to-red-400'
              }`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>

          {current < totalMax && (
            <p className="text-[11px] text-slate-400 italic">
              ℹ️ O PV atual ({current}) é menor que o PV Máximo ({totalMax}) devido a dano recebido em aventura. Realize um Descanso Curto ou Longo para recuperar pontos de vida.
            </p>
          )}
        </div>

        {/* Detalhamento dos Cálculos */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4 text-xs font-mono">
          {/* Nível a Nível */}
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="text-red-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <span>1. PROGRESSÃO NÍVEL A NÍVEL</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">Nível atual: {hpBreakdown?.levelsBreakdown?.length || 1}</span>
            </div>

            <div className="text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs font-mono space-y-2 max-h-56 overflow-y-auto">
              {Array.isArray(hpBreakdown?.levelsBreakdown) && hpBreakdown.levelsBreakdown.length > 0 ? (
                hpBreakdown.levelsBreakdown.map((l: any) => (
                  <div key={l.level} className="flex items-center justify-between border-b border-slate-800/80 last:border-0 pb-1.5 last:pb-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-200 font-bold">Nível {l.level}:</span>
                      <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                        {l.method}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-right">
                      <span className="text-slate-300">
                        {l.baseHp} <span className="text-slate-500 text-[10px]">(Base)</span>
                        {' '}+ {l.conMod >= 0 ? `+${l.conMod}` : l.conMod} <span className="text-slate-500 text-[10px]">(CON)</span>
                        {l.dwarfBonusAtLevel > 0 && <span className="text-amber-400 text-[10px]"> +1 (Anão)</span>}
                        {l.toughBonusAtLevel > 0 && <span className="text-amber-400 text-[10px]"> +2 (Vigoroso)</span>}
                      </span>
                      <span className="text-slate-500 font-bold">=</span>
                      <span className="text-emerald-400 font-black">+{l.totalLevelHp} PV</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 text-center py-2">Nenhum detalhamento de nível disponível.</div>
              )}
            </div>
          </div>

          {/* Fórmula e Soma Total */}
          <div className="space-y-2">
            <span className="text-red-400 font-bold uppercase tracking-wider text-[11px] block border-b border-slate-800 pb-1.5">
              2. FÓRMULA FINAL DO PV MÁXIMO
            </span>
            <div className="text-red-300 font-black bg-red-950/40 p-3.5 rounded-lg border border-red-500/30 text-center flex flex-col items-center justify-center gap-1.5 shadow-inner">
              <div className="text-2xl text-red-200 font-black tracking-wide">
                {totalMax} Pontos de Vida Máximos
              </div>
              <div className="text-xs text-slate-300 font-medium flex flex-wrap items-center justify-center gap-1.5">
                <span className="bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700">
                  {hpBreakdown?.base ?? 0} (Dados de Vida)
                </span>
                <span>+</span>
                <span className="bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700">
                  {hpBreakdown?.conBonusTotal >= 0 ? `+${hpBreakdown?.conBonusTotal}` : hpBreakdown?.conBonusTotal} (Constituição)
                </span>
                {hpBreakdown?.dwarfBonus > 0 && (
                  <>
                    <span>+</span>
                    <span className="bg-slate-900/90 px-2 py-0.5 rounded border border-amber-700/60 text-amber-300">
                      +{hpBreakdown.dwarfBonus} (Vigor Anão)
                    </span>
                  </>
                )}
                {hpBreakdown?.toughBonus > 0 && (
                  <>
                    <span>+</span>
                    <span className="bg-slate-900/90 px-2 py-0.5 rounded border border-amber-700/60 text-amber-300">
                      +{hpBreakdown.toughBonus} (Vigoroso)
                    </span>
                  </>
                )}
                {hpBreakdown?.fortitudeBonus > 0 && (
                  <>
                    <span>+</span>
                    <span className="bg-slate-900/90 px-2 py-0.5 rounded border border-purple-700/60 text-purple-300">
                      +{hpBreakdown.fortitudeBonus} (Dádiva da Fortitude)
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
