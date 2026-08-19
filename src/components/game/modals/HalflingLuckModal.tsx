import React from 'react';
import { useModalKeyboard } from '../../shared/ModalKeyboardHandler';

interface HalflingLuckModalProps {
  pendingHalflingLuckInfo: any;
  setPendingHalflingLuckInfo: (info: any) => void;
  addCombatLog: (actorName: string, title: string, detail: string, type?: any) => void;
}

export const HalflingLuckModal: React.FC<HalflingLuckModalProps> = ({
  pendingHalflingLuckInfo,
  setPendingHalflingLuckInfo,
  addCombatLog
}) => {
  const handleReroll = () => {
    const info = pendingHalflingLuckInfo;
    setPendingHalflingLuckInfo(null);
    addCombatLog(
      'Mestre do Jogo',
      '🍀 SORTE DE PEQUENINO!',
      'Você usou sua Sorte para rerolar o 1 natural no d20!',
      'system'
    );
    info?.onReroll();
  };

  const handleDecline = () => {
    const info = pendingHalflingLuckInfo;
    setPendingHalflingLuckInfo(null);
    info?.onDecline();
  };

  useModalKeyboard({
    onCancel: handleDecline,
    onClose: handleDecline,
    onConfirm: handleReroll,
    disabled: !pendingHalflingLuckInfo,
  });

  if (!pendingHalflingLuckInfo) return null;


  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
        onClick={() => {
          const info = pendingHalflingLuckInfo;
          setPendingHalflingLuckInfo(null);
          info.onDecline();
        }}
      />
      <div className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/40 border-2 border-emerald-500/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col p-6 text-slate-100 animate-scaleUp">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center text-2xl shadow-lg shadow-emerald-950/50">
            🍀
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
              Sorte (Pequenino / Halfling)
            </span>
            <h3 className="text-xl font-black text-emerald-300 mt-1">{pendingHalflingLuckInfo.title}</h3>
          </div>
        </div>

        <p className="text-sm font-semibold text-slate-200 mb-2">
          {pendingHalflingLuckInfo.description}
        </p>

        {pendingHalflingLuckInfo.rollDetails && (
          <div className="p-3 rounded-xl bg-slate-950/90 border border-emerald-500/30 text-xs font-mono text-emerald-200/90 leading-relaxed mb-3 whitespace-pre-wrap">
            {pendingHalflingLuckInfo.rollDetails}
          </div>
        )}

        <p className="text-xs text-slate-400 italic mb-4">
          Graças à característica <strong className="text-emerald-300">Sorte</strong>, você pode rerolar um 1 natural no d20 (sem limites). Deseja rerolar o dado? (O segundo resultado será definitivo).
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => {
              const info = pendingHalflingLuckInfo;
              setPendingHalflingLuckInfo(null);
              addCombatLog(
                'Mestre do Jogo',
                '🍀 SORTE DE PEQUENINO!',
                'Você usou sua Sorte para rerolar o 1 natural no d20!',
                'system'
              );
              info.onReroll();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-green-400 font-black text-sm text-slate-950 shadow-lg shadow-emerald-950/50 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>🎲 Rolar d20 Novamente (Sorte)</span>
          </button>
          <button
            onClick={() => {
              const info = pendingHalflingLuckInfo;
              setPendingHalflingLuckInfo(null);
              info.onDecline();
            }}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-sm text-slate-300 border border-slate-700 transition cursor-pointer"
          >
            Manter o 1
          </button>
        </div>
      </div>
    </div>
  );
};
