import React from 'react';
import { useModalKeyboard } from '../../shared/ModalKeyboardHandler';

interface ShortRestArenaModalProps {
  showShortRestModal: boolean;
  setShowShortRestModal: (show: boolean) => void;
  character: any;
  pendingShortRestItem: any;
  hitDiceToSpend: number;
  setHitDiceToSpend: (val: number) => void;
  confirmGameShortRest: (dice: number) => void;
}

export const ShortRestArenaModal: React.FC<ShortRestArenaModalProps> = ({
  showShortRestModal,
  setShowShortRestModal,
  character,
  pendingShortRestItem,
  hitDiceToSpend,
  setHitDiceToSpend,
  confirmGameShortRest
}) => {
  const currentHitDice = character?.hit_dice_current ?? character?.level ?? 1;
  const maxHitDice = character?.level || 1;

  useModalKeyboard({
    onCancel: () => setShowShortRestModal(false),
    onClose: () => setShowShortRestModal(false),
    onConfirm: () => {
      if (currentHitDice >= 1) {
        confirmGameShortRest(hitDiceToSpend);
      } else {
        setShowShortRestModal(false);
      }
    },
    disabled: !showShortRestModal,
  });

  if (!showShortRestModal) return null;


  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[99999] animate-in fade-in cursor-pointer"
      onClick={() => setShowShortRestModal(false)}
    >
      <div 
        className="bg-slate-900 border border-amber-900/50 rounded-2xl max-w-sm w-full p-6 shadow-2xl flex flex-col gap-4 text-slate-100 relative cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShowShortRestModal(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition cursor-pointer"
        >
          ✕
        </button>
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-black text-xl mb-1">
            <span>🏕️</span>
            <h3>Descanso Curto</h3>
          </div>
          <p className="text-sm text-slate-400 leading-snug">
            Quantos Dados de Vida você deseja gastar ao acampar usando {pendingShortRestItem?.name || 'sua barraca'}?
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 mt-2">
          <div className="flex justify-between text-sm items-center">
            <span className="font-bold text-slate-300">Dados Disponíveis:</span>
            <span className="text-amber-300 font-bold">{currentHitDice} / {maxHitDice}</span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Quantos dados gastar?</label>
            <input 
              type="number"
              min={1}
              max={currentHitDice}
              value={hitDiceToSpend}
              onChange={(e) => setHitDiceToSpend(Math.min(currentHitDice, Math.max(1, parseInt(e.target.value) || 1)))}
              className="bg-slate-900 border border-slate-700 rounded p-2 text-white font-bold text-center w-full focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <button
          onClick={() => confirmGameShortRest(hitDiceToSpend)}
          disabled={currentHitDice < 1}
          className="mt-2 w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:hover:bg-amber-600 text-slate-950 font-black text-sm rounded-xl shadow-lg transition cursor-pointer disabled:cursor-not-allowed"
        >
          Confirmar Acampamento
        </button>

        {currentHitDice < 1 && (
          <p className="text-xs text-amber-400 text-center mt-2">Sem dados de vida disponíveis. Espere um Descanso Longo (concluir a área).</p>
        )}
      </div>
    </div>
  );
};
