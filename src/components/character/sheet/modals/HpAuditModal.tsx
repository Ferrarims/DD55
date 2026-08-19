import React from 'react';
import { useModalKeyboard } from '../../../../components/shared/ModalKeyboardHandler';

interface HpAuditModalProps {
  showHpAudit: boolean;
  setShowHpAudit: (show: boolean) => void;
  hpBreakdown: any;
}

export const HpAuditModal: React.FC<HpAuditModalProps> = ({
  showHpAudit,
  setShowHpAudit,
  hpBreakdown,
}) => {
  useModalKeyboard({
    onClose: () => setShowHpAudit(false),
    disabled: !showHpAudit,
  });

  if (!showHpAudit) return null;


  return (
    <div
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={() => setShowHpAudit(false)}
    >
      <div
        className="bg-slate-900 border border-red-900/30 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-5 text-slate-100 relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={() => setShowHpAudit(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition"
        >
          ✕
        </button>

        <div>
          <div className="flex items-center gap-2 text-red-400 font-black text-lg">
            <span>❤️</span>
            <h3>Motor de Resolução de PV</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Auditoria de pontos de vida baseada no nível, constituição e bônus raciais/talentos.
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4 text-xs font-mono">
          <div className="space-y-1.5">
            <span className="text-red-400 font-bold uppercase tracking-wider block">1. PV POR NÍVEL</span>
            <div className="text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs font-mono space-y-1.5 max-h-60 overflow-y-auto">
              {Array.isArray(hpBreakdown.levelsBreakdown) && hpBreakdown.levelsBreakdown.length > 0 ? (
                hpBreakdown.levelsBreakdown.map((l: any) => (
                  <div key={l.level} className="flex items-center justify-between border-b border-slate-800/80 last:border-0 pb-1.5 last:pb-0">
                    <span className="text-slate-200 font-semibold">
                      Nível {l.level} <span className="text-[10px] text-slate-400">({l.method})</span>
                    </span>
                    <span className="text-emerald-400 font-bold">
                      {l.baseHp} <span className="text-slate-400 text-[10px]">(Base)</span> + {l.conMod >= 0 ? `+${l.conMod}` : l.conMod} <span className="text-slate-400 text-[10px]">(Con)</span>
                      {l.dwarfBonusAtLevel > 0 ? ` + ${l.dwarfBonusAtLevel} (Anão)` : ''}
                      {l.toughBonusAtLevel > 0 ? ` + ${l.toughBonusAtLevel} (Vigoroso)` : ''}
                      {' = '}
                      <span className="text-amber-300 font-black">{l.totalLevelHp} PV</span>
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 text-center py-2">Nenhum detalhamento de nível disponível.</div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-red-400 font-bold uppercase tracking-wider block">2. PV TOTAL</span>
            <div className="text-red-300 font-black text-lg bg-red-950/40 p-3 rounded-lg border border-red-500/30 text-center flex flex-col items-center justify-center gap-1 shadow-inner">
              <div className="text-xl text-red-200 font-black tracking-wide">{hpBreakdown.total} Pontos de Vida Máximos</div>
              <div className="text-[11px] text-slate-400 font-normal">
                {hpBreakdown.base} (Base dos Dados) + {hpBreakdown.conBonusTotal >= 0 ? `+${hpBreakdown.conBonusTotal}` : hpBreakdown.conBonusTotal} (Constituição)
                {hpBreakdown.dwarfBonus > 0 ? ` + ${hpBreakdown.dwarfBonus} (Vigor Anão)` : ''}
                {hpBreakdown.toughBonus > 0 ? ` + ${hpBreakdown.toughBonus} (Vigoroso)` : ''}
                {hpBreakdown.fortitudeBonus > 0 ? ` + ${hpBreakdown.fortitudeBonus} (Dádiva da Fortitude)` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
