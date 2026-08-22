import React from 'react';
import { useModalKeyboard } from '../../../../shared/ModalKeyboardHandler';

interface EditGoldModalProps {
  showGoldModal: boolean;
  setShowGoldModal: (show: boolean) => void;
  goldInput: string;
  setGoldInput: (g: string) => void;
  handleSaveGold: () => void;
}

export const EditGoldModal: React.FC<EditGoldModalProps> = ({
  showGoldModal,
  setShowGoldModal,
  goldInput,
  setGoldInput,
  handleSaveGold,
}) => {
  useModalKeyboard({
    onCancel: () => setShowGoldModal(false),
    onClose: () => setShowGoldModal(false),
    onConfirm: handleSaveGold,
    disabled: !showGoldModal,
  });

  if (!showGoldModal) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => setShowGoldModal(false)}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-xs w-full space-y-4 shadow-2xl animate-in fade-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>💰</span> Ajustar Saldo de Moedas (PO)
        </h3>
        <div>
          <label className="text-xs text-slate-300 block mb-1">Total de Peças de Ouro (PO):</label>
          <input
            type="number"
            step="0.5"
            value={goldInput}
            onChange={e => setGoldInput(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-amber-300 font-bold focus:outline-none focus:border-amber-400"
            placeholder="Ex: 150"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => setShowGoldModal(false)}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg bg-slate-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSaveGold}
            className="px-3 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow"
          >
            Salvar Saldo
          </button>
        </div>
      </div>
    </div>
  );
};
