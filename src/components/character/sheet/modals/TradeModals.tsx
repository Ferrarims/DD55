import React from 'react';
import { useModalKeyboard } from '../../../../components/shared/ModalKeyboardHandler';

interface TradeModalsProps {
  itemToSellConfirm: any;
  setItemToSellConfirm: (item: any) => void;
  sellQuantity: number;
  setSellQuantity: (q: number) => void;
  confirmSellItem: () => void;

  itemToBuyConfirm: any;
  setItemToBuyConfirm: (item: any) => void;
  buyQuantity: number;
  setBuyQuantity: (q: number) => void;
  currentGoldNumber: number;
  formatGold: (g: number) => string;
  handleBuyItemConfirmed: (item: any, qty: number) => void;

  showGoldModal: boolean;
  setShowGoldModal: (show: boolean) => void;
  goldInput: string;
  setGoldInput: (g: string) => void;
  handleSaveGold: () => void;

  showCustomItemModal: boolean;
  setShowCustomItemModal: (show: boolean) => void;
  customItemInput: string;
  setCustomItemInput: (val: string) => void;
  handleAddCustomItem: () => void;
}

export const TradeModals: React.FC<TradeModalsProps> = ({
  itemToSellConfirm,
  setItemToSellConfirm,
  sellQuantity,
  setSellQuantity,
  confirmSellItem,

  itemToBuyConfirm,
  setItemToBuyConfirm,
  buyQuantity,
  setBuyQuantity,
  currentGoldNumber,
  formatGold,
  handleBuyItemConfirmed,

  showGoldModal,
  setShowGoldModal,
  goldInput,
  setGoldInput,
  handleSaveGold,

  showCustomItemModal,
  setShowCustomItemModal,
  customItemInput,
  setCustomItemInput,
  handleAddCustomItem,
}) => {
  // Modal de Venda
  useModalKeyboard({
    onCancel: () => setItemToSellConfirm(null),
    onClose: () => setItemToSellConfirm(null),
    onConfirm: confirmSellItem,
    disabled: !itemToSellConfirm,
  });

  // Modal de Compra
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

  // Modal de Ouro
  useModalKeyboard({
    onCancel: () => setShowGoldModal(false),
    onClose: () => setShowGoldModal(false),
    onConfirm: handleSaveGold,
    disabled: !showGoldModal,
  });

  // Modal de Item Personalizado
  useModalKeyboard({
    onCancel: () => setShowCustomItemModal(false),
    onClose: () => setShowCustomItemModal(false),
    onConfirm: handleAddCustomItem,
    disabled: !showCustomItemModal,
  });

  return (

    <>
      {/* Modal de Confirmação de Venda de Item */}
      {itemToSellConfirm && (
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
      )}

      {/* Modal de Confirmação de Compra de Item */}
      {itemToBuyConfirm && (
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
      )}

      {/* Modal para Editar Saldo de Ouro */}
      {showGoldModal && (
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
      )}

      {/* Modal para Adicionar Item Personalizado */}
      {showCustomItemModal && (
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
      )}
    </>
  );
};
