import React from 'react';
import { useModalKeyboard } from '../../../../components/shared/ModalKeyboardHandler';

interface ShortRestModalProps {
  character: any;
  hitDiceToSpend: number;
  setHitDiceToSpend: (value: number) => void;
  currentHp: number;
  onClose: () => void;
  handleShortRest: (diceToSpend: number) => void;
}

export const ShortRestModal: React.FC<ShortRestModalProps> = ({
  character,
  hitDiceToSpend,
  setHitDiceToSpend,
  currentHp,
  onClose,
  handleShortRest,
}) => {
  const hasTentOrBedroll = character.character_inventory?.some((inv: any) => {
    const name = (inv.items?.name || '').toLowerCase();
    return name.includes('tenda') || name.includes('saco de dormir') || name.includes('bedroll') || name.includes('tent');
  });

  const canConfirm = !((character.hit_dice_current ?? character.level ?? 1) < 1 || currentHp < 1 || !hasTentOrBedroll);

  useModalKeyboard({
    onCancel: onClose,
    onClose,
    onConfirm: () => {
      if (canConfirm) {
        handleShortRest(hitDiceToSpend);
        onClose();
      } else {
        onClose();
      }
    },
  });

  return (

    <div 
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-amber-900/50 rounded-2xl max-w-sm w-full p-6 shadow-2xl flex flex-col gap-4 text-slate-100 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition"
        >
          ✕
        </button>

        <div>
          <div className="flex items-center gap-2 text-amber-400 font-black text-xl mb-1">
            <span>🏕️</span>
            <h3>Descanso Curto</h3>
          </div>
          <p className="text-sm text-slate-400 leading-snug">
            Um período de pelo menos 1 hora para recuperar forças. Você pode gastar Dados de Vida para recuperar Pontos de Vida.
          </p>
        </div>

        {!hasTentOrBedroll && (
          <div className="bg-red-950/50 border border-red-900 rounded p-3 text-red-200 text-sm">
            <strong>Equipamento Ausente:</strong> Você precisa ter uma <strong>Tenda</strong> ou <strong>Saco de Dormir</strong> no inventário para acampar e realizar um Descanso Curto.
          </div>
        )}

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 mt-2">
          <div className="flex justify-between text-sm items-center">
            <span className="font-bold text-slate-300">Dados Disponíveis:</span>
            <span className="text-amber-300 font-bold">{character.hit_dice_current ?? character.level ?? 1} / {character.level || 1}</span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Quantos dados gastar?</label>
            <input 
              type="number"
              min={1}
              max={character.hit_dice_current ?? character.level ?? 1}
              value={hitDiceToSpend}
              onChange={(e) => setHitDiceToSpend(Math.min(character.hit_dice_current ?? character.level ?? 1, Math.max(1, parseInt(e.target.value) || 1)))}
              className="bg-slate-900 border border-slate-700 rounded p-2 text-white font-bold text-center w-full focus:outline-none focus:border-amber-500"
              disabled={!hasTentOrBedroll}
            />
          </div>
        </div>

        <button
          onClick={() => {
            handleShortRest(hitDiceToSpend);
            onClose();
          }}
          disabled={(character.hit_dice_current ?? character.level ?? 1) < 1 || currentHp < 1 || !hasTentOrBedroll}
          className="mt-2 w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:hover:bg-amber-600 text-slate-950 font-black text-sm rounded-xl shadow-lg transition"
        >
          Confirmar Descanso Curto
        </button>
        {currentHp < 1 && (
          <p className="text-xs text-red-400 text-center font-bold">Personagem desmaiado (0 PV) não pode fazer descanso curto.</p>
        )}
      </div>
    </div>
  );
};
