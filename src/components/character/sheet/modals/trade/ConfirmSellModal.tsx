import React from 'react';
import { useModalKeyboard } from '../../../../shared/ModalKeyboardHandler';

interface ConfirmSellModalProps {
  itemToSellConfirm: any;
  setItemToSellConfirm: (item: any) => void;
  sellQuantity: number;
  setSellQuantity: (q: number) => void;
  confirmSellItem: () => void;
}

export const ConfirmSellModal: React.FC<ConfirmSellModalProps> = ({
  itemToSellConfirm,
  setItemToSellConfirm,
  sellQuantity,
  setSellQuantity,
  confirmSellItem,
}) => {
  useModalKeyboard({
    onCancel: () => setItemToSellConfirm(null),
    onClose: () => setItemToSellConfirm(null),
    onConfirm: confirmSellItem,
    disabled: !itemToSellConfirm,
  });

  if (!itemToSellConfirm) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
      onClick={() => setItemToSellConfirm(null)}
    >
      <div
        className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 cursor-default"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 text-emerald-400">
          <span className="text-3xl">💰</span>
          <h3 className="text-xl font-bold text-slate-100" style={{ fontFamily: 'Georgia, serif' }}>
            Confirmar Venda de Item
          </h3>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2.5">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400 font-medium">Item a vender:</span>
            <span className="font-extrabold text-amber-300 text-base">{itemToSellConfirm.name}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400 font-medium">Valor obtido (50%):</span>
            <span className="font-black text-emerald-400 text-base">
              +{itemToSellConfirm.sellPricePO * sellQuantity} PO
            </span>
          </div>
          {itemToSellConfirm.costStr && (
            <div className="flex justify-between items-center text-xs text-slate-500 pt-1 border-t border-slate-800/60">
              <span>Preço base de compra:</span>
              <span>{itemToSellConfirm.costStr}</span>
            </div>
          )}
        </div>

        {itemToSellConfirm.isEquipped && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>
              Este item está atualmente <strong>equipado</strong> e será desequipado automaticamente ao ser vendido.
            </span>
          </div>
        )}

        {itemToSellConfirm.quantityAvailable > 1 && (
          <div className="flex flex-col gap-2 bg-slate-900 border border-slate-700 p-3 rounded-xl">
            <label className="text-xs text-slate-400 font-bold uppercase">Quantidade a vender:</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max={itemToSellConfirm.quantityAvailable}
                value={sellQuantity}
                onChange={e => setSellQuantity(Number(e.target.value))}
                className="flex-1 accent-emerald-500"
              />
              <input
                type="number"
                min="1"
                max={itemToSellConfirm.quantityAvailable}
                value={sellQuantity}
                onChange={e =>
                  setSellQuantity(
                    Math.min(
                      Math.max(1, Number(e.target.value) || 1),
                      itemToSellConfirm.quantityAvailable
                    )
                  )
                }
                className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-sm font-bold text-slate-200 text-center focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="text-right text-[10px] text-slate-500">
              Total de unidades disponíveis: {itemToSellConfirm.quantityAvailable}
            </div>
          </div>
        )}

        <p className="text-slate-300 text-sm leading-relaxed">
          Deseja realmente vender{' '}
          <strong className="text-amber-300">
            {sellQuantity > 1 ? `${sellQuantity}x ` : ''}"{itemToSellConfirm.name}"
          </strong>{' '}
          por <strong className="text-emerald-400">+{itemToSellConfirm.sellPricePO * sellQuantity} PO</strong>? O valor será adicionado ao saldo de moedas do personagem.
        </p>
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
          <span className="text-[10px] text-slate-500 select-none hidden sm:inline">
            [Enter] Confirmar · [Esc] Cancelar
          </span>
          <div className="flex gap-3 ml-auto">
            <button
              type="button"
              onClick={() => setItemToSellConfirm(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-600 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmSellItem}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition active:scale-95 flex items-center gap-1.5"
            >
              <span>💰</span>
              <span>Confirmar Venda (+{itemToSellConfirm.sellPricePO * sellQuantity} PO)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
