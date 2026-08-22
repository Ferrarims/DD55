import React from 'react';
import { useModalKeyboard } from '../../shared/ModalKeyboardHandler';

interface RelentlessModalProps {
  showRelentlessModal: boolean;
  setShowRelentlessModal: (v: boolean) => void;
  pendingRelentlessInfo: any;
  setPendingRelentlessInfo: (v: any) => void;
}

export const RelentlessModal: React.FC<RelentlessModalProps> = ({
  showRelentlessModal,
  setShowRelentlessModal,
  pendingRelentlessInfo,
  setPendingRelentlessInfo
}) => {
  useModalKeyboard({
    onCancel: () => setShowRelentlessModal(false),
    onClose: () => setShowRelentlessModal(false),
    onConfirm: () => setShowRelentlessModal(false),
    disabled: !showRelentlessModal || !pendingRelentlessInfo,
  });

  if (!showRelentlessModal || !pendingRelentlessInfo) return null;


  return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-fadeIn" onClick={() => setShowRelentlessModal(false)} />
          <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-red-500/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col p-6 text-slate-100 animate-scaleUp">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-red-950 border border-red-500/50 flex items-center justify-center text-2xl shadow-lg shadow-red-950/50">
                💪
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-500/40">
                  Habilidade Racial de Orc
                </span>
                <h3 className="text-xl font-black text-red-400 mt-1">Resistência Implacável Ativada!</h3>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Quando seu herói foi reduzido a <strong className="text-rose-400">0 Pontos de Vida</strong>, a fúria e determinação orc recusaram a derrota. 
              <br /><br />
              Sua habilidade <strong className="text-amber-300">Resistência Implacável</strong> foi acionada com sucesso, mantendo você consciente em combate com <strong className="text-emerald-400">1 Ponto de Vida (1 PV)</strong>!
            </p>

            <button
              onClick={() => setShowRelentlessModal(false)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 font-black text-sm text-white shadow-lg shadow-red-900/40 transition flex items-center justify-center gap-2"
            >
              <span>⚔️ Continuar Batalha</span>
            </button>
          </div>
        </div>
  );
};
