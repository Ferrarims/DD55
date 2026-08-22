import React from 'react';
import { useModalKeyboard } from '../../../../components/shared/ModalKeyboardHandler';

interface AcCalculatorModalProps {
  acDetails: any;
  onClose: () => void;
}

export const AcCalculatorModal: React.FC<AcCalculatorModalProps> = ({
  acDetails,
  onClose,
}) => {
  useModalKeyboard({
    onClose,
  });

  return (

    <div 
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-5 text-slate-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition"
        >
          ✕
        </button>

        <div>
          <div className="flex items-center gap-2 text-amber-400 font-black text-lg">
            <span>🛡️</span>
            <h3>Motor de Resolução de CA</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Auditoria oficial do pipeline de cálculo de Classe de Armadura baseado estritamente nas regras do jogo.
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4 text-xs font-mono">
          <div className="space-y-1">
            <span className="text-amber-400 font-bold uppercase tracking-wider block">1. FÓRMULA BASE ESCOLHIDA</span>
            <div className="text-slate-300 bg-slate-900/80 p-2.5 rounded border border-slate-800">
              {acDetails.formulaBaseEscolhida}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-amber-400 font-bold uppercase tracking-wider block">2. ADITIVOS CONSTANTES</span>
            <div className="text-slate-300 bg-slate-900/80 p-2.5 rounded border border-slate-800 space-y-1">
              {acDetails.aditivosConstantes.length > 0 ? (
                acDetails.aditivosConstantes.map((add: string, idx: number) => (
                  <div key={`${add}-${idx}`}>• {add}</div>
                ))
              ) : (
                <div className="text-slate-500 italic">Nenhum aditivo constante adicional</div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-amber-400 font-bold uppercase tracking-wider block">3. CA FINAL</span>
            <div className="text-amber-300 font-black text-lg bg-amber-950/40 p-3 rounded border border-amber-500/30 text-center">
              {acDetails.finalAc}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-amber-400 font-bold uppercase tracking-wider block">4. ALERTAS DE CONFLITO</span>
            <div className="text-slate-300 bg-slate-900/80 p-2.5 rounded border border-slate-800">
              {acDetails.alertasDeConflito.length > 0 ? (
                acDetails.alertasDeConflito.map((alert: string, idx: number) => (
                  <div key={`${alert}-${idx}`} className="text-rose-400">⚠️ {alert}</div>
                ))
              ) : (
                <div className="text-emerald-400">Nenhum conflito de regras detectado. Pipeline 100% otimizado.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
