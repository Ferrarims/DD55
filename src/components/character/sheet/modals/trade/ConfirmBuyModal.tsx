import React from 'react';
import { useModalKeyboard } from '../../../../shared/ModalKeyboardHandler';

interface ConfirmBuyModalProps {
  itemToBuyConfirm: any;
  setItemToBuyConfirm: (item: any) => void;
  buyQuantity: number;
  setBuyQuantity: (q: number) => void;
  currentGoldNumber: number;
  formatGold: (g: number) => string;
  handleBuyItemConfirmed: (item: any, qty: number) => void;
}

export const ConfirmBuyModal: React.FC<ConfirmBuyModalProps> = ({
  itemToBuyConfirm,
  setItemToBuyConfirm,
  buyQuantity,
  setBuyQuantity,
  currentGoldNumber,
  formatGold,
  handleBuyItemConfirmed,
}) => {
  useModalKeyboard({
    onCancel: () => setItemToBuyConfirm(null),
    onClose: () => setItemToBuyConfirm(null),
    onConfirm: () => {
      if (itemToBuyConfirm && currentGoldNumber >= itemToBuyConfirm.pricePO * buyQuantity) {
        handleBuyItemConfirmed(itemToBuyConfirm, buyQuantity);
        setItemToBuyConfirm(null);
      }
    },
    disabled: !itemToBuyConfirm,
  });

  if (!itemToBuyConfirm) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
      onClick={() => setItemToBuyConfirm(null)}
    >
      <div
        className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 cursor-default"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 text-amber-400">
          <span className="text-3xl">🛒</span>
          <h3 className="text-xl font-bold text-slate-100" style={{ fontFamily: 'Georgia, serif' }}>
            Confirmar Compra de Item
          </h3>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2.5">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400 font-medium">Item:</span>
            <span className="font-extrabold text-amber-300 text-base">{itemToBuyConfirm.name}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400 font-medium">Preço unitário:</span>
            <span className="font-black text-amber-400 text-base">{itemToBuyConfirm.cost}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400 font-medium">Custo Total:</span>
            <span className="font-black text-rose-400 text-base">
              -{itemToBuyConfirm.pricePO * buyQuantity} PO
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-500 pt-1 border-t border-slate-800/60">
            <span>Seu ouro atual:</span>
            <span className="text-amber-300 font-bold">{formatGold(currentGoldNumber)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 bg-slate-900 border border-slate-700 p-3 rounded-xl">
          <label className="text-xs text-slate-400 font-bold uppercase">Quantidade a comprar:</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max={Math.max(
                1,
                Math.min(50, Math.floor(currentGoldNumber / (itemToBuyConfirm.pricePO || 1)) || 1)
              )}
              value={buyQuantity}
              onChange={e => setBuyQuantity(Number(e.target.value))}
              className="flex-1 accent-amber-500"
            />
            <input
              type="number"
              min="1"
              max={Math.max(
                1,
                Math.floor(currentGoldNumber / (itemToBuyConfirm.pricePO || 1)) || 1
              )}
              value={buyQuantity}
              onChange={e => setBuyQuantity(Math.max(1, Number(e.target.value) || 1))}
              className="w-16 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-sm font-bold text-slate-200 text-center focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="text-right text-[10px] text-slate-500">
            Máximo acessível:{' '}
            {Math.max(1, Math.floor(currentGoldNumber / (itemToBuyConfirm.pricePO || 1)) || 1)}{' '}
            unidades
          </div>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed">
          Deseja realmente comprar{' '}
          <strong className="text-amber-300">
            {buyQuantity > 1 ? `${buyQuantity}x ` : ''}"{itemToBuyConfirm.name}"
          </strong>{' '}
          por <strong className="text-rose-400">-{itemToBuyConfirm.pricePO * buyQuantity} PO</strong>? O valor será debitado do seu ouro.
        </p>
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
          <span className="text-[10px] text-slate-500 select-none hidden sm:inline">
            [Enter] Confirmar · [Esc] Cancelar
          </span>
          <div className="flex gap-3 ml-auto">
            <button
              type="button"
              onClick={() => setItemToBuyConfirm(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-600 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                handleBuyItemConfirmed(itemToBuyConfirm, buyQuantity);
                setItemToBuyConfirm(null);
              }}
              disabled={currentGoldNumber < itemToBuyConfirm.pricePO * buyQuantity}
              className={`px-4 py-2 font-black text-xs rounded-xl shadow-lg transition active:scale-95 flex items-center gap-1.5 ${
                currentGoldNumber >= itemToBuyConfirm.pricePO * buyQuantity
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>🛒</span>
              <span>Confirmar Compra (-{itemToBuyConfirm.pricePO * buyQuantity} PO)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
