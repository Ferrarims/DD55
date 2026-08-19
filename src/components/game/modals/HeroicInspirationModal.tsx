import React from 'react';
import { useModalKeyboard } from '../../shared/ModalKeyboardHandler';

interface HeroicInspirationModalProps {
  pendingHeroicInspirationInfo: any;
  setPendingHeroicInspirationInfo: (info: any) => void;
  setHasHeroicInspiration: (val: boolean) => void;
  addCombatLog: (actorName: string, title: string, detail: string, type?: any) => void;
}

export const HeroicInspirationModal: React.FC<HeroicInspirationModalProps> = ({
  pendingHeroicInspirationInfo,
  setPendingHeroicInspirationInfo,
  setHasHeroicInspiration,
  addCombatLog
}) => {
  const handleReroll = () => {
    const info = pendingHeroicInspirationInfo;
    setPendingHeroicInspirationInfo(null);
    setHasHeroicInspiration(false);
    addCombatLog(
      'Mestre do Jogo',
      '✨ INSPIRAÇÃO HEROICA!',
      'Você gastou sua Inspiração Heroica para rolar o d20 novamente!',
      'system'
    );
    info?.onReroll();
  };

  const handleDecline = () => {
    const info = pendingHeroicInspirationInfo;
    setPendingHeroicInspirationInfo(null);
    info?.onDecline();
  };

  useModalKeyboard({
    onCancel: handleDecline,
    onClose: handleDecline,
    onConfirm: handleReroll,
    disabled: !pendingHeroicInspirationInfo,
  });

  if (!pendingHeroicInspirationInfo) return null;


  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
        onClick={() => {
          const info = pendingHeroicInspirationInfo;
          setPendingHeroicInspirationInfo(null);
          info.onDecline();
        }}
      />
      <div className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/40 border-2 border-amber-500/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col p-6 text-slate-100 animate-scaleUp">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-500/60 flex items-center justify-center text-2xl shadow-lg shadow-amber-950/50">
            ✨
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40">
              Inspiração (Humano / Classe)
            </span>
            <h3 className="text-xl font-black text-amber-300 mt-1">{pendingHeroicInspirationInfo.title}</h3>
          </div>
        </div>

        <p className="text-sm font-semibold text-slate-200 mb-2">
          {pendingHeroicInspirationInfo.description}
        </p>

        {pendingHeroicInspirationInfo.rollDetails && (
          <div className="p-3 rounded-xl bg-slate-950/90 border border-amber-500/30 text-xs font-mono text-amber-200/90 leading-relaxed mb-3 whitespace-pre-wrap">
            {pendingHeroicInspirationInfo.rollDetails}
          </div>
        )}

        <p className="text-xs text-slate-400 italic mb-4">
          Você possui <strong className="text-amber-300">1 Inspiração Heroica</strong>! Deseja gastá-la para rolar o d20 novamente e tentar ter sucesso?
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => {
              const info = pendingHeroicInspirationInfo;
              setPendingHeroicInspirationInfo(null);
              setHasHeroicInspiration(false);
              addCombatLog(
                'Mestre do Jogo',
                '✨ INSPIRAÇÃO HEROICA!',
                'Você gastou sua Inspiração Heroica para rolar o d20 novamente!',
                'system'
              );
              info.onReroll();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 font-black text-sm text-slate-950 shadow-lg shadow-amber-950/50 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>🎲 Rolar d20 Novamente</span>
          </button>
          <button
            onClick={() => {
              const info = pendingHeroicInspirationInfo;
              setPendingHeroicInspirationInfo(null);
              info.onDecline();
            }}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-sm text-slate-300 border border-slate-700 transition cursor-pointer"
          >
            Manter Falha
          </button>
        </div>
      </div>
    </div>
  );
};
