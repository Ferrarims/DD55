import React from 'react';
import { useModalKeyboard } from '../../../../shared/ModalKeyboardHandler';

interface AddCustomItemModalProps {
  showCustomItemModal: boolean;
  setShowCustomItemModal: (show: boolean) => void;
  customItemInput: string;
  setCustomItemInput: (val: string) => void;
  handleAddCustomItem: () => void;
}

export const AddCustomItemModal: React.FC<AddCustomItemModalProps> = ({
  showCustomItemModal,
  setShowCustomItemModal,
  customItemInput,
  setCustomItemInput,
  handleAddCustomItem,
}) => {
  useModalKeyboard({
    onCancel: () => setShowCustomItemModal(false),
    onClose: () => setShowCustomItemModal(false),
    onConfirm: handleAddCustomItem,
    disabled: !showCustomItemModal,
  });

  if (!showCustomItemModal) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => setShowCustomItemModal(false)}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in fade-in duration-200"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
          <span>📦</span> Adicionar Item ao Inventário
        </h3>
        <div>
          <label className="text-xs text-slate-300 block mb-1">Nome do Item:</label>
          <input
            type="text"
            value={customItemInput}
            onChange={e => setCustomItemInput(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
            placeholder="Ex: Amuleto da Sorte ou Poção Misteriosa"
            onKeyDown={e => e.key === 'Enter' && handleAddCustomItem()}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => setShowCustomItemModal(false)}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg bg-slate-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleAddCustomItem}
            className="px-3 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
};
